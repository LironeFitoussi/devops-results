import { useCallback, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileText,
  XCircle,
} from "lucide-react";

import { Heading } from "@/components/Atoms/Heading";
import { Icon } from "@/components/Atoms/Icon";
import { LoadingSpinner } from "@/components/Atoms/LoadingSpinner";
import { Text } from "@/components/Atoms/Text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getForm,
  getFormResponses,
  type GoogleFormDetail,
  type GoogleFormItem,
  type GoogleFormResponse,
  type GoogleResponseAnswer,
} from "@/services/googleForms";

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

function formatDate(value?: string): string {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function formTitle(form?: GoogleFormDetail, fallback?: string): string {
  return form?.info?.title ?? form?.info?.documentTitle ?? fallback ?? "Form";
}

function answerValues(answer?: GoogleResponseAnswer): string[] {
  const textValues =
    answer?.textAnswers?.answers
      ?.map((entry) => entry.value?.trim())
      .filter((value): value is string => Boolean(value)) ?? [];
  const fileValues =
    answer?.fileUploadAnswers?.answers
      ?.map((entry) => entry.fileName ?? entry.fileId)
      .filter((value): value is string => Boolean(value)) ?? [];
  const values = [...textValues, ...fileValues];
  return values.length > 0 ? values : ["No answer"];
}

function questionKey(item: GoogleFormItem): string | undefined {
  return item.questionItem?.question?.questionId ?? item.itemId;
}

function buildQuestionMap(items: GoogleFormItem[] = []) {
  return new Map(
    items
      .map((item) => {
        const key = questionKey(item);
        return key ? [key, item] : undefined;
      })
      .filter((entry): entry is [string, GoogleFormItem] => Boolean(entry)),
  );
}

function scoreLabel(score?: number, points?: number): string {
  if (score === undefined && points === undefined) return "Ungraded";
  if (score === undefined) return `0 / ${points}`;
  if (points === undefined) return `${score}`;
  return `${score} / ${points}`;
}

function responseScore(response: GoogleFormResponse): number | undefined {
  if (typeof response.totalScore === "number") return response.totalScore;
  const scores = Object.values(response.answers ?? {})
    .map((answer) => answer.grade?.score)
    .filter((score): score is number => typeof score === "number");
  if (scores.length === 0) return undefined;
  return scores.reduce((total, score) => total + score, 0);
}

function possibleScore(items: GoogleFormItem[] = []): number | undefined {
  const scores = items
    .map((item) => item.questionItem?.question?.grading?.pointValue)
    .filter((score): score is number => typeof score === "number");
  if (scores.length === 0) return undefined;
  return scores.reduce((total, score) => total + score, 0);
}

function AnswerRow({
  question,
  answer,
  answerId,
}: {
  question?: GoogleFormItem;
  answer?: GoogleResponseAnswer;
  answerId: string;
}) {
  const points = question?.questionItem?.question?.grading?.pointValue;
  const correct = answer?.grade?.correct;

  return (
    <div className="rounded-md border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <Text className="font-semibold">
            {question?.title ?? `Question ${answerId}`}
          </Text>
          <Text variant="caption" color="muted" className="mt-1">
            {answerId}
          </Text>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{scoreLabel(answer?.grade?.score, points)}</Badge>
          {correct === true ? (
            <Badge className="bg-emerald-600 text-white">
              <CheckCircle2 className="h-3 w-3" />
              Correct
            </Badge>
          ) : correct === false ? (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3" />
              Incorrect
            </Badge>
          ) : null}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {answerValues(answer).map((value, index) => (
          <div
            className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-900"
            key={`${answerId}-${index}`}
          >
            {value}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GoogleFormResultsPage() {
  const { formId = "" } = useParams();
  const decodedFormId = decodeURIComponent(formId);
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
    queryKey: ["google-form-results", decodedFormId],
    queryFn: async () => {
      const token = await getToken();
      const [form, responses] = await Promise.all([
        getForm(token, decodedFormId),
        getFormResponses(token, decodedFormId),
      ]);
      return { form, responses };
    },
    enabled: isAuthenticated && decodedFormId.length > 0,
    retry: false,
  });

  useEffect(() => {
    if (resultsQuery.isError) {
      toast.error(`Results: ${errMessage(resultsQuery.error)}`);
    }
  }, [resultsQuery.isError, resultsQuery.error]);

  const responses = resultsQuery.data?.responses.responses ?? [];
  const questionMap = useMemo(
    () => buildQuestionMap(resultsQuery.data?.form.items),
    [resultsQuery.data?.form.items],
  );
  const maxScore = possibleScore(resultsQuery.data?.form.items);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/google-forms">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Icon icon={ClipboardList} size="lg" className="text-blue-600" />
            <Heading level={1} className="text-3xl md:text-4xl">
              {formTitle(resultsQuery.data?.form, decodedFormId)}
            </Heading>
          </div>
          <Text color="muted" className="mt-2 break-all">
            {decodedFormId}
          </Text>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{responses.length} responses</Badge>
          <Badge variant="outline">
            {maxScore === undefined ? "No points" : `${maxScore} points`}
          </Badge>
        </div>
      </div>

      {resultsQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : resultsQuery.isError ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <Text color="muted">Could not load this form.</Text>
        </div>
      ) : responses.length === 0 ? (
        <div className="rounded-md border border-gray-200 bg-white p-6">
          <Text color="muted">No responses found.</Text>
        </div>
      ) : (
        <div className="space-y-3">
          {responses.map((response, index) => {
            const answers = Object.entries(response.answers ?? {});
            const score = responseScore(response);

            return (
              <details
                className="group rounded-md border border-gray-200 bg-white"
                key={response.responseId ?? index}
                open={index === 0}
              >
                <summary className="flex cursor-pointer list-none flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    <FileText className="mt-1 h-5 w-5 text-blue-600" />
                    <div>
                      <Text className="font-semibold">
                        {response.respondentEmail ?? `Submission ${index + 1}`}
                      </Text>
                      <Text variant="small" color="muted">
                        Submitted{" "}
                        {formatDate(
                          response.lastSubmittedTime ?? response.createTime,
                        )}
                      </Text>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{answers.length} answers</Badge>
                    <Badge variant="secondary">{scoreLabel(score, maxScore)}</Badge>
                  </div>
                </summary>
                <div className="border-t border-gray-200 bg-gray-50 p-5">
                  <div className="mb-4 grid gap-3 md:grid-cols-3">
                    <div>
                      <Text variant="caption" color="muted">
                        Response ID
                      </Text>
                      <Text variant="small" className="break-all">
                        {response.responseId ?? "-"}
                      </Text>
                    </div>
                    <div>
                      <Text variant="caption" color="muted">
                        Created
                      </Text>
                      <Text variant="small">{formatDate(response.createTime)}</Text>
                    </div>
                    <div>
                      <Text variant="caption" color="muted">
                        Submitted
                      </Text>
                      <Text variant="small">
                        {formatDate(response.lastSubmittedTime)}
                      </Text>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {answers.map(([answerId, answer]) => (
                      <AnswerRow
                        answer={answer}
                        answerId={answerId}
                        key={answerId}
                        question={questionMap.get(answer.questionId ?? answerId)}
                      />
                    ))}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
