import { useCallback, useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { ArrowLeft, ClipboardList, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

import { Heading } from "@/components/Atoms/Heading";
import { Icon } from "@/components/Atoms/Icon";
import { LoadingSpinner } from "@/components/Atoms/LoadingSpinner";
import { Text } from "@/components/Atoms/Text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getExamResults } from "@/services/exams";
import type { ExamResult, IExam, IStudent } from "@/types";

function errMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.error ??
      error.response?.data?.message ??
      error.message
    );
  }
  return error instanceof Error ? error.message : "Unknown error";
}

function scoreLabel(score?: number, points?: number): string {
  if (score === undefined && points === undefined) return "Ungraded";
  if (score === undefined) return `0 / ${points}`;
  if (points === undefined) return `${score}`;
  return `${score} / ${points}`;
}

function identityLabel(identity: {
  firstName?: string;
  lastName?: string;
  fullName?: string;
}): string {
  return (
    identity.fullName ??
    [identity.firstName, identity.lastName].filter(Boolean).join(" ") ??
    "-"
  );
}

function rowId(row: ExamResult): string {
  if (row._id) return row._id;
  if (row.id) return row.id;
  if (row.type === "google_form") return row.googleResponseId;
  return "";
}

function rowStudents(row: ExamResult): IStudent[] {
  if (row.type === "code_review") return row.students ?? [];
  return row.student ? [row.student] : [];
}

function sourceLabel(exam: IExam): string | undefined {
  if (exam.type === "google_form") return exam.googleFormId;
  if (exam.type === "local") return `${exam.questions.length} questions`;
  return undefined;
}

function detailsLabel(row: ExamResult): string {
  if (row.type === "google_form") return identityLabel(row.extractedIdentity);
  if (row.type === "local") return row.status;
  return row.githubUrl ?? "-";
}

function confidenceLabel(row: ExamResult): string {
  if (row.type === "google_form") {
    return `${Math.round(row.matchConfidence * 100)}%`;
  }
  return "-";
}

export default function ExamResultsPage() {
  const { examId = "" } = useParams();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

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

  const resultsQuery = useQuery({
    queryKey: ["exam-results", examId],
    queryFn: async () => getExamResults(await getToken(), examId),
    enabled: isAuthenticated && examId.length > 0,
    retry: false,
  });

  useEffect(() => {
    if (resultsQuery.isError) {
      toast.error(`Exam: ${errMessage(resultsQuery.error)}`);
    }
  }, [resultsQuery.isError, resultsQuery.error]);

  const exam = resultsQuery.data?.exam;
  const rows = useMemo(
    () => resultsQuery.data?.results ?? [],
    [resultsQuery.data?.results],
  );
  const average = useMemo(() => {
    const scores = rows
      .map((row) =>
        row.type === "code_review" ? row.grade : row.score,
      )
      .filter((score): score is number => typeof score === "number");
    if (scores.length === 0) return undefined;
    return scores.reduce((total, score) => total + score, 0) / scores.length;
  }, [rows]);

  const backTo = exam?.type === "google_form" ? "/google-forms" : "/exams";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to={backTo}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </Button>

      {resultsQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : resultsQuery.isError || !exam ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <Text color="muted">Could not load this exam.</Text>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Icon icon={ClipboardList} size="lg" className="text-blue-600" />
                <Heading level={1} className="text-3xl md:text-4xl">
                  {exam.title}
                </Heading>
              </div>
              {sourceLabel(exam) ? (
                <Text color="muted" className="mt-2 break-all">
                  {sourceLabel(exam)}
                </Text>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{rows.length} results</Badge>
              <Badge variant="outline">
                Average {average === undefined ? "-" : average.toFixed(1)}
              </Badge>
              {exam.type === "code_review" ? (
                <Button asChild size="sm" variant="outline">
                  <Link to={`/exams/code-review/${examId}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const id = rowId(row);
                  const students = rowStudents(row);
                  return (
                    <TableRow
                      className="cursor-pointer hover:bg-blue-50"
                      key={id}
                      onClick={() => navigate(`/exams/${examId}/review/${id}`)}
                    >
                      <TableCell>
                        <div className="font-medium">
                          {students.map((s) => s.englishName).join(", ")}
                        </div>
                        <div className="text-sm text-gray-500">
                          {students.map((s) => s.hebrewName).join(", ")}
                        </div>
                      </TableCell>
                      <TableCell>{detailsLabel(row)}</TableCell>
                      <TableCell>{scoreLabel(row.score, row.maxScore)}</TableCell>
                      <TableCell>{confidenceLabel(row)}</TableCell>
                    </TableRow>
                  );
                })}
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Text color="muted">No results were saved for this exam.</Text>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
