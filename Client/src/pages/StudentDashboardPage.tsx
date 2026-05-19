import { useCallback } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import {
  BadgeCheck,
  GraduationCap,
  IdCard,
  Link as LinkIcon,
  Mail,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/Atoms";
import { getMyExamResults } from "@/services/exams";
import { getCurrentStudent } from "@/services/students";
import type { IExam, StudentStatus } from "@/types";

const statusStyles: Record<StudentStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  graduated: "bg-slate-100 text-slate-700 border-slate-200",
};

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof GraduationCap;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <Icon className="size-4" />
        {label}
      </div>
      <p className="mt-2 break-words text-lg font-semibold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function resultKey(result: { _id?: string; id?: string }): string {
  return result._id ?? result.id ?? "";
}

function examTitle(exam: string | IExam): string {
  return typeof exam === "string" ? "Exam" : exam.title;
}

function scoreLabel(score?: number, points?: number): string {
  if (score === undefined && points === undefined) return "Ungraded";
  if (score === undefined) return `0 / ${points}`;
  if (points === undefined) return `${score}`;
  return `${score} / ${points}`;
}

export default function StudentDashboardPage() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const getToken = useCallback(
    () =>
      getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: "openid profile email",
        },
      }),
    [getAccessTokenSilently],
  );

  const profileQuery = useQuery({
    queryKey: ["student-profile"],
    queryFn: async () => getCurrentStudent(await getToken()),
    enabled: isAuthenticated,
  });

  const examResultsQuery = useQuery({
    queryKey: ["student-exam-results"],
    queryFn: async () => getMyExamResults(await getToken()),
    enabled: isAuthenticated,
    retry: false,
  });

  if (profileQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" text="Loading student dashboard..." />
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-4xl rounded-md border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-xl font-semibold text-slate-950">
            Student profile not found
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Your account is authenticated, but it is not linked to a student
            profile yet.
          </p>
        </div>
      </div>
    );
  }

  const { student, linked } = profileQuery.data;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-12 items-center justify-center rounded-md bg-blue-600 text-white">
                <GraduationCap className="size-7" />
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-blue-700">
                  Student Dashboard
                </p>
                <h1 className="mt-1 text-3xl font-semibold text-slate-950">
                  {student.englishName}
                </h1>
                <p className="mt-2 text-right text-lg font-medium text-slate-700" dir="rtl">
                  {student.hebrewName}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className={statusStyles[student.status]} variant="outline">
                <BadgeCheck className="size-3" />
                {student.status}
              </Badge>
              <Badge variant={linked ? "secondary" : "outline"}>
                <LinkIcon className="size-3" />
                {linked ? "Account linked" : "Not linked"}
              </Badge>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <DetailItem icon={IdCard} label="Student ID" value={student.studentId} />
          <DetailItem icon={Mail} label="Email" value={student.email || "No email"} />
          <DetailItem icon={UserRound} label="English name" value={student.englishName} />
          <DetailItem icon={GraduationCap} label="Hebrew name" value={student.hebrewName} />
        </section>

        <section className="mt-6 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Recent exams</h2>
              <p className="text-sm text-slate-500">Quick review of your latest saved results.</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/student-exams">View all</Link>
            </Button>
          </div>

          {examResultsQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : examResultsQuery.isError ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-slate-600">
              Could not load exam results.
            </p>
          ) : (examResultsQuery.data ?? []).length === 0 ? (
            <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              No exam results are available yet.
            </p>
          ) : (
            <div className="space-y-2">
              {(examResultsQuery.data ?? []).slice(0, 3).map((result) => {
                const id = resultKey(result);
                return (
                  <div
                    className="flex flex-col gap-3 rounded-md border border-slate-200 p-3 md:flex-row md:items-center md:justify-between"
                    key={id || result.googleResponseId}
                  >
                    <div>
                      <p className="font-medium text-slate-950">
                        {examTitle(result.exam)}
                      </p>
                      <p className="text-sm text-slate-500">
                        {scoreLabel(result.score, result.maxScore)}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild disabled={!id}>
                      <Link to={`/student-exams/${id}`}>Quick review</Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
