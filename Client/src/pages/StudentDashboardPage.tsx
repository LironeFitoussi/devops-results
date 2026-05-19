import { useCallback } from "react";
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
import { LoadingSpinner } from "@/components/Atoms";
import { getCurrentStudent } from "@/services/students";
import type { StudentStatus } from "@/types";

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
      </div>
    </div>
  );
}
