import { useMemo, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { Heading } from "@/components/Atoms/Heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  CreateLocalExamInput,
  ILocalExamOption,
  ILocalExamQuestion,
  LocalExamQuestionType,
} from "@/types";

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

export interface LocalExamFormInitialValues {
  title: string;
  description: string;
  dueAt: string;
  questions: ILocalExamQuestion[];
}

export interface LocalExamFormProps {
  initialValues?: LocalExamFormInitialValues;
  isSubmitting: boolean;
  primaryLabel: string;
  secondaryLabel?: string;
  onSubmit: (
    payload: Omit<CreateLocalExamInput, "status">,
    action: "primary" | "secondary",
  ) => void;
}

function defaultInitialValues(): LocalExamFormInitialValues {
  return {
    title: "",
    description: "",
    dueAt: "",
    questions: [emptyQuestion()],
  };
}

export default function LocalExamForm({
  initialValues,
  isSubmitting,
  primaryLabel,
  secondaryLabel,
  onSubmit,
}: LocalExamFormProps) {
  const seed = initialValues ?? defaultInitialValues();
  const [title, setTitle] = useState(seed.title);
  const [description, setDescription] = useState(seed.description);
  const [dueAt, setDueAt] = useState(seed.dueAt);
  const [questions, setQuestions] = useState<ILocalExamQuestion[]>(seed.questions);

  const totalPoints = useMemo(
    () => questions.reduce((total, question) => total + Number(question.points || 0), 0),
    [questions],
  );

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

  const validateAndBuild = ():
    | { ok: true; payload: Omit<CreateLocalExamInput, "status"> }
    | { ok: false } => {
    if (!title.trim()) {
      toast.error("Title is required");
      return { ok: false };
    }
    for (const [index, question] of questions.entries()) {
      if (!question.prompt.trim()) {
        toast.error(`Question ${index + 1}: prompt is required`);
        return { ok: false };
      }
      if (needsOptions(question.type)) {
        const options = question.options ?? [];
        if (options.some((option) => !option.label.trim())) {
          toast.error(`Question ${index + 1}: all options need text`);
          return { ok: false };
        }
        if (!options.some((option) => option.isCorrect)) {
          toast.error(`Question ${index + 1}: mark at least one correct answer`);
          return { ok: false };
        }
      }
    }

    return {
      ok: true,
      payload: {
        title: title.trim(),
        description: description.trim() || undefined,
        dueAt: dueAt || undefined,
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
      },
    };
  };

  const submit = (event: FormEvent, action: "primary" | "secondary") => {
    event.preventDefault();
    const result = validateAndBuild();
    if (!result.ok) return;
    onSubmit(result.payload, action);
  };

  return (
    <form className="space-y-6">
      <div className="flex justify-end">
        <Badge variant="secondary">{totalPoints} points</Badge>
      </div>
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
          {secondaryLabel ? (
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={(event) => submit(event, "secondary")}
            >
              {secondaryLabel}
            </Button>
          ) : null}
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={(event) => submit(event, "primary")}
          >
            {primaryLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
