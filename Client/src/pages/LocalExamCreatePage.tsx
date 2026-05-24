import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, ClipboardList, Plus, Trash2 } from "lucide-react";

import { Heading } from "@/components/Atoms/Heading";
import { Icon } from "@/components/Atoms/Icon";
import { Text } from "@/components/Atoms/Text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createLocalExam } from "@/services/exams";
import type {
  CreateLocalExamInput,
  ILocalExamOption,
  ILocalExamQuestion,
  LocalExamQuestionType,
} from "@/types";

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

function id(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

function emptyOption(isCorrect = false): ILocalExamOption {
  return { id: id("opt"), label: "", isCorrect };
}

function emptyQuestion(type: LocalExamQuestionType = "single_choice"): ILocalExamQuestion {
  return {
    id: id("q"),
    type,
    prompt: "",
    points: 1,
    options:
      type === "single_choice" || type === "multi_choice"
        ? [emptyOption(true), emptyOption(false)]
        : undefined,
  };
}

function needsOptions(type: LocalExamQuestionType): boolean {
  return type === "single_choice" || type === "multi_choice";
}

export default function LocalExamCreatePage() {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [questions, setQuestions] = useState<ILocalExamQuestion[]>([
    emptyQuestion(),
  ]);

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

  const totalPoints = useMemo(
    () => questions.reduce((total, question) => total + Number(question.points || 0), 0),
    [questions],
  );

  const mutation = useMutation({
    mutationFn: async (payload: CreateLocalExamInput) =>
      createLocalExam(await getToken(), payload),
    onSuccess: ({ exam }) => {
      toast.success("Local exam saved");
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      const examId = exam._id ?? exam.id;
      navigate(examId ? `/exams/local/${examId}/assign` : "/exams");
    },
    onError: (error) => toast.error(`Create failed: ${errMessage(error)}`),
  });

  const updateQuestion = (index: number, patch: Partial<ILocalExamQuestion>) => {
    setQuestions((prev) =>
      prev.map((question, i) => (i === index ? { ...question, ...patch } : question)),
    );
  };

  const changeType = (index: number, type: LocalExamQuestionType) => {
    updateQuestion(index, {
      type,
      options: needsOptions(type) ? [emptyOption(true), emptyOption(false)] : undefined,
      correctText: needsOptions(type) ? undefined : "",
    });
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    patch: Partial<ILocalExamOption>,
  ) => {
    setQuestions((prev) =>
      prev.map((question, i) => {
        if (i !== questionIndex) return question;
        const options = (question.options ?? []).map((option, j) =>
          j === optionIndex ? { ...option, ...patch } : option,
        );
        return { ...question, options };
      }),
    );
  };

  const setCorrectOption = (questionIndex: number, optionIndex: number) => {
    setQuestions((prev) =>
      prev.map((question, i) => {
        if (i !== questionIndex || !question.options) return question;
        const options = question.options.map((option, j) => ({
          ...option,
          isCorrect:
            question.type === "single_choice"
              ? j === optionIndex
              : j === optionIndex
                ? !option.isCorrect
                : option.isCorrect,
        }));
        return { ...question, options };
      }),
    );
  };

  const submit = (event: React.FormEvent, status: "draft" | "published") => {
    event.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    for (const [index, question] of questions.entries()) {
      if (!question.prompt.trim()) {
        toast.error(`Question ${index + 1}: prompt is required`);
        return;
      }
      if (needsOptions(question.type)) {
        const options = question.options ?? [];
        if (options.some((option) => !option.label.trim())) {
          toast.error(`Question ${index + 1}: all options need text`);
          return;
        }
        if (!options.some((option) => option.isCorrect)) {
          toast.error(`Question ${index + 1}: mark at least one correct answer`);
          return;
        }
      }
    }

    mutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      dueAt: dueAt || undefined,
      status,
      questions: questions.map((question) => ({
        ...question,
        prompt: question.prompt.trim(),
        points: Number(question.points || 0),
        correctText: question.correctText?.trim() || undefined,
        options: question.options?.map((option) => ({
          ...option,
          label: option.label.trim(),
          isCorrect: Boolean(option.isCorrect),
        })),
      })),
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/exams">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to exams
        </Link>
      </Button>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Icon icon={ClipboardList} size="lg" className="text-blue-600" />
            <Heading level={1} className="text-3xl md:text-4xl">
              New Local Exam
            </Heading>
          </div>
          <Text color="muted" className="mt-2">
            Build an in-app exam with automatic grading where answer keys exist.
          </Text>
        </div>
        <Badge variant="secondary">{totalPoints} points</Badge>
      </div>

      <form className="space-y-6">
        <div className="space-y-3 rounded-md border border-gray-200 bg-white p-4">
          <label className="block text-sm font-medium" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <label className="block text-sm font-medium" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <label className="block text-sm font-medium" htmlFor="dueAt">
            Due date
          </label>
          <input
            id="dueAt"
            type="datetime-local"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm md:w-72"
            value={dueAt}
            onChange={(event) => setDueAt(event.target.value)}
          />
        </div>

        {questions.map((question, questionIndex) => (
          <div
            key={question.id}
            className="space-y-3 rounded-md border border-gray-200 bg-white p-4"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <Heading level={3} className="text-lg">
                Question {questionIndex + 1}
              </Heading>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={question.type}
                  onChange={(event) =>
                    changeType(questionIndex, event.target.value as LocalExamQuestionType)
                  }
                >
                  <option value="single_choice">Single choice</option>
                  <option value="multi_choice">Multiple answers</option>
                  <option value="short_text">Short text</option>
                  <option value="long_text">Long text</option>
                </select>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={questions.length === 1}
                  onClick={() =>
                    setQuestions((prev) =>
                      prev.length > 1
                        ? prev.filter((_, index) => index !== questionIndex)
                        : prev,
                    )
                  }
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>

            <textarea
              rows={2}
              placeholder="Question prompt"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={question.prompt}
              onChange={(event) =>
                updateQuestion(questionIndex, { prompt: event.target.value })
              }
            />
            <input
              type="number"
              min={0}
              className="w-28 rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={question.points}
              onChange={(event) =>
                updateQuestion(questionIndex, { points: Number(event.target.value) })
              }
            />

            {needsOptions(question.type) ? (
              <div className="space-y-2">
                {(question.options ?? []).map((option, optionIndex) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <input
                      type={question.type === "single_choice" ? "radio" : "checkbox"}
                      checked={Boolean(option.isCorrect)}
                      onChange={() => setCorrectOption(questionIndex, optionIndex)}
                    />
                    <input
                      className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                      placeholder={`Option ${optionIndex + 1}`}
                      value={option.label}
                      onChange={(event) =>
                        updateOption(questionIndex, optionIndex, {
                          label: event.target.value,
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={(question.options ?? []).length <= 2}
                      onClick={() =>
                        updateQuestion(questionIndex, {
                          options: question.options?.filter(
                            (_, index) => index !== optionIndex,
                          ),
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateQuestion(questionIndex, {
                      options: [...(question.options ?? []), emptyOption(false)],
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add option
                </Button>
              </div>
            ) : (
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Optional exact answer for auto-grading"
                value={question.correctText ?? ""}
                onChange={(event) =>
                  updateQuestion(questionIndex, { correctText: event.target.value })
                }
              />
            )}
          </div>
        ))}

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add question
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
              onClick={(event) => submit(event, "draft")}
            >
              Save draft
            </Button>
            <Button
              type="button"
              disabled={mutation.isPending}
              onClick={(event) => submit(event, "published")}
            >
              Save and publish
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
