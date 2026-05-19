import { useCallback, useEffect, useMemo } from "react";
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
import { getExamResults } from "@/services/exams";

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

export default function ExamSubmissionReviewPage() {
  const { examId = "", resultId = "" } = useParams();
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

  const resultsQuery = useQuery({
    queryKey: ["exam-results", examId],
    queryFn: async () => getExamResults(await getToken(), examId),
    enabled: isAuthenticated && examId.length > 0,
    retry: false,
  });

  useEffect(() => {
    if (resultsQuery.isError) {
      toast.error(`Exam review: ${errMessage(resultsQuery.error)}`);
    }
  }, [resultsQuery.isError, resultsQuery.error]);

  const result = useMemo(
    () =>
      (resultsQuery.data?.results ?? []).find(
        (row) => (row._id ?? row.id ?? row.googleResponseId) === resultId,
      ),
    [resultId, resultsQuery.data?.results],
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to={`/exams/${examId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </Button>

      {resultsQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : resultsQuery.isError || !resultsQuery.data ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <Text color="muted">Could not load this exam review.</Text>
        </div>
      ) : !result ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <Text color="muted">Submission not found for this exam.</Text>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Icon icon={ClipboardList} size="lg" className="text-blue-600" />
                <Heading level={1} className="text-3xl md:text-4xl">
                  {result.student.englishName}
                </Heading>
              </div>
              <Text color="muted" className="mt-2">
                {resultsQuery.data.exam.title} full submission review
              </Text>
            </div>
            <Badge variant="secondary">
              {scoreLabel(result.score, result.maxScore)}
            </Badge>
          </div>

          <ExamSubmissionReview
            exam={resultsQuery.data.exam}
            answersSnapshot={result.answersSnapshot}
          />
        </>
      )}
    </div>
  );
}
