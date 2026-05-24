import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, ClipboardList, Send } from "lucide-react";

import { Heading } from "@/components/Atoms/Heading";
import { Icon } from "@/components/Atoms/Icon";
import { LoadingSpinner } from "@/components/Atoms/LoadingSpinner";
import { Text } from "@/components/Atoms/Text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { startLocalExam, submitLocalExam } from "@/services/exams";
import type { ILocalExamQuestion, SubmitLocalExamInput } from "@/types";

type AnswerState = Record<
  string,
  { selectedOptionIds?: string[]; textAnswer?: string }
>;

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

export default function LocalExamTakePage() {
  const { examId = "" } = useParams();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<AnswerState>({});

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

  const examQuery = useQuery({
    queryKey: ["local-exam-take", examId],
    queryFn: async () => startLocalExam(await getToken(), examId),
    enabled: isAuthenticated && examId.length > 0,
    retry: false,
  });

  useEffect(() => {
    if (examQuery.data?.result.answers) {
      const next: AnswerState = {};
      for (const answer of examQuery.data.result.answers) {
        next[answer.questionId] = {
          selectedOptionIds: answer.selectedOptionIds,
          textAnswer: answer.textAnswer,
        };
      }
      setAnswers(next);
    }
  }, [examQuery.data]);

  useEffect(() => {
    if (examQuery.isError) {
      toast.error(`Exam: ${errMessage(examQuery.error)}`);
    }
  }, [examQuery.isError, examQuery.error]);

  const mutation = useMutation({
    mutationFn: async (payload: SubmitLocalExamInput) =>
      submitLocalExam(await getToken(), examId, payload),
    onSuccess: ({ result }) => {
      toast.success("Exam submitted");
      const resultId = result._id ?? result.id;
      navigate(resultId ? `/student-exams/${resultId}` : "/student-exams");
    },
    onError: (error) => toast.error(`Submit failed: ${errMessage(error)}`),
  });

  const setSingleChoice = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { selectedOptionIds: [optionId] },
    }));
  };

  const toggleMultiChoice = (questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const current = prev[questionId]?.selectedOptionIds ?? [];
      const selectedOptionIds = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [questionId]: { selectedOptionIds } };
    });
  };

  const setText = (questionId: string, textAnswer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { textAnswer } }));
  };

  const renderQuestion = (question: ILocalExamQuestion, index: number) => {
    const current = answers[question.id] ?? {};
    return (
      <div
        key={question.id}
        className="space-y-3 rounded-md border border-gray-200 bg-white p-4"
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <Heading level={3} className="text-lg">
            {index + 1}. {question.prompt}
          </Heading>
          <Badge variant="outline">{question.points} pts</Badge>
        </div>

        {question.type === "single_choice" || question.type === "multi_choice" ? (
          <div className="space-y-2">
            {(question.options ?? []).map((option) => {
              const checked = current.selectedOptionIds?.includes(option.id) ?? false;
              return (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 px-3 py-2 hover:bg-blue-50"
                >
                  <input
                    type={question.type === "single_choice" ? "radio" : "checkbox"}
                    checked={checked}
                    onChange={() =>
                      question.type === "single_choice"
                        ? setSingleChoice(question.id, option.id)
                        : toggleMultiChoice(question.id, option.id)
                    }
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        ) : question.type === "short_text" ? (
          <input
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={current.textAnswer ?? ""}
            onChange={(event) => setText(question.id, event.target.value)}
          />
        ) : (
          <textarea
            rows={6}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={current.textAnswer ?? ""}
            onChange={(event) => setText(question.id, event.target.value)}
          />
        )}
      </div>
    );
  };

  const exam = examQuery.data?.exam;
  const result = examQuery.data?.result;
  const locked = result?.status === "submitted" || result?.status === "graded";

  const submit = () => {
    if (!exam) return;
    const payload: SubmitLocalExamInput = {
      answers: exam.questions.map((question) => ({
        questionId: question.id,
        selectedOptionIds: answers[question.id]?.selectedOptionIds,
        textAnswer: answers[question.id]?.textAnswer,
      })),
    };
    mutation.mutate(payload);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/student-exams">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to my exams
        </Link>
      </Button>

      {examQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : examQuery.isError || !exam ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <Text color="muted">Could not load this exam.</Text>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Icon icon={ClipboardList} size="lg" className="text-blue-600" />
                <Heading level={1} className="text-3xl md:text-4xl">
                  {exam.title}
                </Heading>
              </div>
              {exam.description ? (
                <Text color="muted" className="mt-2">
                  {exam.description}
                </Text>
              ) : null}
            </div>
            <Badge variant="secondary">{exam.totalPoints} points</Badge>
          </div>

          {locked ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
              <Text color="muted">This exam was already submitted.</Text>
            </div>
          ) : null}

          <div className={locked ? "pointer-events-none opacity-70" : "space-y-4"}>
            {exam.questions.map(renderQuestion)}
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              disabled={locked || mutation.isPending}
              onClick={submit}
            >
              <Send className="mr-2 h-4 w-4" />
              Submit exam
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
