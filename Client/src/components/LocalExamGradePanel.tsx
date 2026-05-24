import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { CheckCircle2, HelpCircle, RotateCcw, Save, XCircle } from "lucide-react";

import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { gradeLocalExamResult, reopenLocalExamResult } from "@/services/exams";
import { useAppSelector } from "@/redux/hooks";
import type {
  GradeLocalExamResultInput,
  ILocalExam,
  ILocalExamQuestion,
  LocalExamResult,
} from "@/types";

type Verdict = "correct" | "wrong" | "unsure";

interface QuestionEdit {
  awardedPoints: number;
  verdict: Verdict;
}

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

function resultIdOf(result: LocalExamResult): string {
  return result._id ?? result.id ?? "";
}

function verdictFromAnswer(isCorrect: boolean | undefined): Verdict {
  if (isCorrect === true) return "correct";
  if (isCorrect === false) return "wrong";
  return "unsure";
}

function isCorrectFromVerdict(verdict: Verdict): boolean | undefined {
  if (verdict === "correct") return true;
  if (verdict === "wrong") return false;
  return undefined;
}

function buildInitial(
  exam: ILocalExam,
  result: LocalExamResult,
): Map<string, QuestionEdit> {
  const byQid = new Map(result.answers.map((answer) => [answer.questionId, answer]));
  const initial = new Map<string, QuestionEdit>();
  for (const question of exam.questions) {
    const answer = byQid.get(question.id);
    initial.set(question.id, {
      awardedPoints: answer?.awardedPoints ?? 0,
      verdict: verdictFromAnswer(answer?.isCorrect),
    });
  }
  return initial;
}

export function LocalExamGradePanel({
  exam,
  result,
}: {
  exam: ILocalExam;
  result: LocalExamResult;
}) {
  const { user } = useAppSelector((state) => state.user);
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();
  const resultId = resultIdOf(result);

  const initial = useMemo(() => buildInitial(exam, result), [exam, result]);
  const [edits, setEdits] = useState<Map<string, QuestionEdit>>(initial);
  useEffect(() => {
    setEdits(initial);
  }, [initial]);

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

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ["exam-results", exam._id ?? exam.id],
    });
    queryClient.invalidateQueries({ queryKey: ["exam-results"] });
  };

  const gradeMutation = useMutation({
    mutationFn: async (payload: GradeLocalExamResultInput) =>
      gradeLocalExamResult(await getToken(), resultId, payload),
    onSuccess: () => {
      toast.success("Grades saved");
      invalidate();
    },
    onError: (error) => toast.error(`Save failed: ${errMessage(error)}`),
  });

  const reopenMutation = useMutation({
    mutationFn: async () => reopenLocalExamResult(await getToken(), resultId),
    onSuccess: () => {
      toast.success("Exam reopened");
      invalidate();
    },
    onError: (error) => toast.error(`Reopen failed: ${errMessage(error)}`),
  });

  if (user?.role !== "admin") return null;
  if (result.status === "in_progress") {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
        <Text color="muted">Grading unlocks after the student submits.</Text>
      </div>
    );
  }

  const computed = Array.from(edits.values()).reduce(
    (total, edit) => total + edit.awardedPoints,
    0,
  );

  const dirty = exam.questions.some((question) => {
    const edit = edits.get(question.id);
    const original = result.answers.find((answer) => answer.questionId === question.id);
    if (!edit) return false;
    return (
      edit.awardedPoints !== (original?.awardedPoints ?? 0) ||
      isCorrectFromVerdict(edit.verdict) !== original?.isCorrect
    );
  });

  const setEdit = (questionId: string, patch: Partial<QuestionEdit>) => {
    setEdits((prev) => {
      const next = new Map(prev);
      const current = next.get(questionId) ?? { awardedPoints: 0, verdict: "unsure" };
      next.set(questionId, { ...current, ...patch });
      return next;
    });
  };

  const markCorrect = (question: ILocalExamQuestion) => {
    setEdit(question.id, { verdict: "correct", awardedPoints: question.points });
  };

  const markWrong = (question: ILocalExamQuestion) => {
    setEdit(question.id, { verdict: "wrong", awardedPoints: 0 });
  };

  const save = () => {
    gradeMutation.mutate({
      answers: exam.questions.map((question) => {
        const edit = edits.get(question.id) ?? { awardedPoints: 0, verdict: "unsure" as Verdict };
        const isCorrect = isCorrectFromVerdict(edit.verdict);
        return {
          questionId: question.id,
          awardedPoints: edit.awardedPoints,
          ...(isCorrect !== undefined ? { isCorrect } : {}),
        };
      }),
    });
  };

  const reopen = () => {
    if (
      !window.confirm(
        "Reopen this exam? The student will be able to resubmit. Prior answers are preserved.",
      )
    ) {
      return;
    }
    reopenMutation.mutate();
  };

  return (
    <div className="space-y-4 rounded-md border border-blue-200 bg-blue-50/40 p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <Heading level={3} className="text-lg">
            Grading
          </Heading>
          <Text color="muted" className="mt-1 text-sm">
            Mark each answer correct or wrong. Score recalculates from the totals.
          </Text>
        </div>
        <Badge variant="secondary" className="text-base">
          {computed} / {exam.totalPoints}
        </Badge>
      </div>

      <div className="space-y-2">
        {exam.questions.map((question, index) => {
          const edit = edits.get(question.id) ?? {
            awardedPoints: 0,
            verdict: "unsure" as Verdict,
          };
          return (
            <div
              key={question.id}
              className="rounded-md border border-gray-200 bg-white p-3"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="font-medium">
                    {index + 1}. {question.prompt}
                  </div>
                  <div className="text-xs text-gray-500">Max {question.points} pts</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={edit.verdict === "correct" ? "default" : "outline"}
                    className={
                      edit.verdict === "correct" ? "bg-emerald-600 hover:bg-emerald-700" : ""
                    }
                    onClick={() => markCorrect(question)}
                  >
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Correct
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={edit.verdict === "wrong" ? "destructive" : "outline"}
                    onClick={() => markWrong(question)}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Wrong
                  </Button>
                  <input
                    type="number"
                    min={0}
                    max={question.points}
                    step="0.5"
                    value={edit.awardedPoints}
                    aria-label={`Points for question ${index + 1}`}
                    title={`Points (0–${question.points})`}
                    onChange={(event) => {
                      const value = Math.max(
                        0,
                        Math.min(question.points, Number(event.target.value) || 0),
                      );
                      setEdit(question.id, { awardedPoints: value });
                    }}
                    className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
                  />
                  {edit.verdict === "unsure" ? (
                    <Badge variant="outline" className="text-gray-500">
                      <HelpCircle className="mr-1 h-3 w-3" />
                      Unset
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={reopenMutation.isPending}
          onClick={reopen}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reopen for student
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={!dirty || gradeMutation.isPending}
          onClick={save}
        >
          <Save className="mr-2 h-4 w-4" />
          Save grades
        </Button>
      </div>
    </div>
  );
}
