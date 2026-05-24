import { useCallback, useEffect } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { ClipboardList, ExternalLink, Plus } from "lucide-react";

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
import { getExams } from "@/services/exams";
import type { IExam } from "@/types";

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

function examKey(exam: { _id?: string; id?: string }): string {
  return exam._id ?? exam.id ?? "";
}

function formatDate(value?: string): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function typeBadge(exam: IExam) {
  return exam.type === "google_form" ? (
    <Badge variant="outline">Google Form</Badge>
  ) : (
    <Badge className="bg-purple-600 text-white">Code Review</Badge>
  );
}

function subtitle(exam: IExam): string {
  if (exam.type === "google_form") {
    return exam.identityConfig.mode === "fullName"
      ? "Full name"
      : "First + last name";
  }
  return exam.description ?? "Instructor code review";
}

function sourceLabel(exam: IExam): string {
  return exam.type === "google_form" ? exam.googleFormId : "—";
}

function maxScoreLabel(exam: IExam): string {
  if (exam.type === "google_form" && exam.maxScore !== undefined) {
    return String(exam.maxScore);
  }
  return "-";
}

export default function ExamsPage() {
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

  const examsQuery = useQuery({
    queryKey: ["exams"],
    queryFn: async () => getExams(await getToken()),
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (examsQuery.isError) {
      toast.error(`Exams: ${errMessage(examsQuery.error)}`);
    }
  }, [examsQuery.isError, examsQuery.error]);

  const exams = examsQuery.data ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Icon icon={ClipboardList} size="lg" className="text-blue-600" />
            <Heading level={1} className="text-3xl md:text-4xl">
              Exams
            </Heading>
          </div>
          <Text color="muted" className="mt-2">
            Imported exams and instructor code reviews.
          </Text>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">{exams.length} exams</Badge>
          <Button asChild size="sm">
            <Link to="/exams/code-review/new">
              <Plus className="mr-2 h-4 w-4" />
              New code review
            </Link>
          </Button>
        </div>
      </div>

      {examsQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : examsQuery.isError ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <Text color="muted">Could not load exams.</Text>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => {
                const id = examKey(exam);
                const fallbackKey =
                  exam.type === "google_form" ? exam.googleFormId : id;
                return (
                  <TableRow key={id || fallbackKey}>
                    <TableCell>
                      <div className="font-medium">{exam.title}</div>
                      <div className="text-sm text-gray-500">{subtitle(exam)}</div>
                    </TableCell>
                    <TableCell>{typeBadge(exam)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {sourceLabel(exam)}
                    </TableCell>
                    <TableCell>{maxScoreLabel(exam)}</TableCell>
                    <TableCell>{formatDate(exam.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild disabled={!id}>
                        <Link to={`/exams/${id}`}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {exams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Text color="muted">No exams yet.</Text>
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
