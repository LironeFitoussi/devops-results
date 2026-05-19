import { useCallback, useEffect } from "react";
import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, ClipboardList } from "lucide-react";

import { Heading } from "@/components/Atoms/Heading";
import { Icon } from "@/components/Atoms/Icon";
import { LoadingSpinner } from "@/components/Atoms/LoadingSpinner";
import { Text } from "@/components/Atoms/Text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExamSubmissionReview } from "@/components/ExamSubmissionReview";
import { getMyExamResult } from "@/services/exams";
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

function examValue(exam: string | IExam): IExam | undefined {
  return typeof exam === "string" ? undefined : exam;
}

function scoreLabel(score?: number, points?: number): string {
  if (score === undefined && points === undefined) return "Ungraded";
  if (score === undefined) return `0 / ${points}`;
  if (points === undefined) return `${score}`;
  return `${score} / ${points}`;
}

export default function StudentExamReviewPage() {
  const { resultId = "" } = useParams();
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

  const resultQuery = useQuery({
    queryKey: ["student-exam-result", resultId],
    queryFn: async () => getMyExamResult(await getToken(), resultId),
    enabled: isAuthenticated && resultId.length > 0,
    retry: false,
  });

  useEffect(() => {
    if (resultQuery.isError) {
      toast.error(`Exam review: ${errMessage(resultQuery.error)}`);
    }
  }, [resultQuery.isError, resultQuery.error]);

  const exam = examValue(resultQuery.data?.exam ?? "");
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/student-exams">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </Button>

      {resultQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : resultQuery.isError || !resultQuery.data ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <Text color="muted">Could not load this exam review.</Text>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Icon icon={ClipboardList} size="lg" className="text-blue-600" />
                <Heading level={1} className="text-3xl md:text-4xl">
                  {exam?.title ?? "Exam Review"}
                </Heading>
              </div>
              <Text color="muted" className="mt-2">
                Quick review of your saved answers and grades.
              </Text>
            </div>
            <Badge variant="secondary">
              {scoreLabel(resultQuery.data.score, resultQuery.data.maxScore ?? exam?.maxScore)}
            </Badge>
          </div>

          <ExamSubmissionReview
            exam={exam}
            answersSnapshot={resultQuery.data.answersSnapshot}
          />
        </>
      )}
    </div>
  );
}
