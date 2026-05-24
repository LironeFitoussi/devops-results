import { useCallback, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { ClipboardList, ExternalLink } from "lucide-react";

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
import { getMyExamResults } from "@/services/exams";
import type { ExamResult, IExam } from "@/types";

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

function resultKey(result: { _id?: string; id?: string }): string {
  return result._id ?? result.id ?? "";
}

function fallbackKey(result: ExamResult): string {
  return result.type === "google_form" ? result.googleResponseId : "";
}

function examTitle(exam: string | IExam): string {
  return typeof exam === "string" ? "Exam" : exam.title;
}

function examMaxScore(exam: string | IExam, fallback?: number): number | undefined {
  if (typeof exam === "string") return fallback;
  if (exam.type === "google_form") return exam.maxScore ?? fallback;
  return fallback;
}

function typeBadge(result: ExamResult) {
  return result.type === "google_form" ? (
    <Badge variant="outline">Google Form</Badge>
  ) : (
    <Badge className="bg-purple-600 text-white">Code Review</Badge>
  );
}

function scoreLabel(score?: number, points?: number): string {
  if (score === undefined && points === undefined) return "Ungraded";
  if (score === undefined) return `0 / ${points}`;
  if (points === undefined) return `${score}`;
  return `${score} / ${points}`;
}

function formatDate(value?: string): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

export default function StudentExamsPage() {
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
    queryKey: ["student-exam-results"],
    queryFn: async () => getMyExamResults(await getToken()),
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (resultsQuery.isError) {
      toast.error(`Exams: ${errMessage(resultsQuery.error)}`);
    }
  }, [resultsQuery.isError, resultsQuery.error]);

  const results = resultsQuery.data ?? [];
  const average = useMemo(() => {
    const scores = results
      .map((result) => result.score)
      .filter((score): score is number => typeof score === "number");
    if (scores.length === 0) return undefined;
    return scores.reduce((total, score) => total + score, 0) / scores.length;
  }, [results]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Icon icon={ClipboardList} size="lg" className="text-blue-600" />
            <Heading level={1} className="text-3xl md:text-4xl">
              My Exams
            </Heading>
          </div>
          <Text color="muted" className="mt-2">
            Your saved exam results and quick reviews.
          </Text>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{results.length} exams</Badge>
          <Badge variant="outline">
            Average {average === undefined ? "-" : average.toFixed(1)}
          </Badge>
        </div>
      </div>

      {resultsQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : resultsQuery.isError ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <Text color="muted">Could not load your exams.</Text>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Saved</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => {
                const id = resultKey(result);
                return (
                  <TableRow
                    className={id ? "cursor-pointer hover:bg-blue-50" : undefined}
                    key={id || fallbackKey(result)}
                    onClick={() => {
                      if (id) {
                        navigate(`/student-exams/${id}`);
                      }
                    }}
                  >
                    <TableCell className="font-medium">
                      {examTitle(result.exam)}
                    </TableCell>
                    <TableCell>{typeBadge(result)}</TableCell>
                    <TableCell>
                      {scoreLabel(result.score, examMaxScore(result.exam, result.maxScore))}
                    </TableCell>
                    <TableCell>{formatDate(result.confirmedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild disabled={!id}>
                        <Link
                          to={`/student-exams/${id}`}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Review
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Text color="muted">No exam results are available yet.</Text>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
