import { CheckCircle2, Github, Users, XCircle } from "lucide-react";

import { Text } from "@/components/Atoms/Text";
import { Badge } from "@/components/ui/badge";
import type { GoogleResponseAnswer } from "@/services/googleForms";
import type {
  CodeReviewExamResult,
  ExamResult,
  GoogleFormExamResult,
  IExam,
  IGoogleFormExam,
} from "@/types";

type QuestionSnapshotItem = {
  itemId?: string;
  title?: string;
  questionItem?: {
    question?: {
      questionId?: string;
      grading?: {
        pointValue?: number;
        correctAnswers?: {
          answers?: Array<{ value?: string }>;
        };
      };
      choiceQuestion?: {
        options?: Array<{ value?: string }>;
      };
    };
  };
};

function scoreLabel(score?: number, points?: number): string {
  if (score === undefined && points === undefined) return "Ungraded";
  if (score === undefined) return `0 / ${points}`;
  if (points === undefined) return `${score}`;
  return `${score} / ${points}`;
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

function normalize(value?: string): string {
  return value?.replace(/\u00a0/g, " ").trim().toLocaleLowerCase("en-US") ?? "";
}

function questionKey(item: QuestionSnapshotItem): string | undefined {
  return item.questionItem?.question?.questionId ?? item.itemId;
}

function questionItem(exam: IGoogleFormExam | undefined, answerId: string) {
  return exam?.questionSnapshot.find((entry) => {
    const question = entry as QuestionSnapshotItem;
    return questionKey(question) === answerId;
  }) as QuestionSnapshotItem | undefined;
}

function orderedAnswers(
  exam: IGoogleFormExam | undefined,
  answersSnapshot: Record<string, GoogleResponseAnswer>,
) {
  const entries = new Map(Object.entries(answersSnapshot));
  const ordered: Array<[string, GoogleResponseAnswer]> = [];

  for (const rawItem of exam?.questionSnapshot ?? []) {
    const item = rawItem as QuestionSnapshotItem;
    const key = questionKey(item);
    if (!key) continue;
    const answer = entries.get(key);
    if (!answer) continue;
    ordered.push([key, answer]);
    entries.delete(key);
  }

  return [...ordered, ...entries.entries()];
}

function optionClass({
  option,
  selected,
  correct,
}: {
  option: string;
  selected: Set<string>;
  correct: Set<string>;
}): string {
  const key = normalize(option);
  const isSelected = selected.has(key);
  const isCorrect = correct.has(key);

  if (isCorrect) return "border-emerald-300 bg-emerald-50 text-emerald-800";
  if (isSelected && !isCorrect) return "border-red-300 bg-red-50 text-red-800";
  return "border-blue-200 bg-blue-50 text-blue-800";
}

function FreeformAnswers({ values }: { values: string[] }) {
  return (
    <div className="mt-4 space-y-2">
      {values.map((value, index) => (
        <div
          className="whitespace-pre-wrap rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-900"
          key={`${value}-${index}`}
        >
          {value}
        </div>
      ))}
    </div>
  );
}

function GoogleFormSubmissionReview({
  exam,
  result,
}: {
  exam?: IGoogleFormExam;
  result: GoogleFormExamResult;
}) {
  const answers = orderedAnswers(exam, result.answersSnapshot);

  return (
    <div className="space-y-3">
      {answers.map(([answerId, answer]) => {
        const item = questionItem(exam, answerId);
        const question = item?.questionItem?.question;
        const options =
          question?.choiceQuestion?.options
            ?.map((option) => option.value?.trim())
            .filter((value): value is string => Boolean(value)) ?? [];
        const selectedValues = answerValues(answer);
        const selected = new Set(selectedValues.map(normalize));
        const correct = new Set(
          question?.grading?.correctAnswers?.answers
            ?.map((entry) => normalize(entry.value))
            .filter(Boolean) ?? [],
        );
        const hasChoiceOptions = options.length > 0;
        const isCorrect = answer.grade?.correct;

        return (
          <div className="rounded-md border border-gray-200 bg-white p-4" key={answerId}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <Text className="font-semibold">
                  {item?.title ?? `Question ${answerId}`}
                </Text>
                <Text variant="caption" color="muted" className="mt-1">
                  {answerId}
                </Text>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                  {scoreLabel(answer.grade?.score, question?.grading?.pointValue)}
                </Badge>
                {isCorrect === true ? (
                  <Badge className="bg-emerald-600 text-white">
                    <CheckCircle2 className="h-3 w-3" />
                    Correct
                  </Badge>
                ) : isCorrect === false ? (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3" />
                    Incorrect
                  </Badge>
                ) : null}
              </div>
            </div>

            {hasChoiceOptions ? (
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {options.map((option) => {
                  const key = normalize(option);
                  const isSelected = selected.has(key);
                  const isAnswerCorrect = correct.has(key);
                  return (
                    <div
                      className={`rounded-md border px-3 py-2 text-sm ${optionClass({
                        option,
                        selected,
                        correct,
                      })}`}
                      key={option}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span>{option}</span>
                        <div className="flex shrink-0 gap-1">
                          {isSelected ? <Badge variant="outline">Selected</Badge> : null}
                          {isAnswerCorrect ? (
                            <Badge className="bg-emerald-600 text-white">
                              Correct
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <FreeformAnswers values={selectedValues} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CodeReviewSubmissionReview({ result }: { result: CodeReviewExamResult }) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-gray-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-600" />
          <Text className="font-semibold">Group</Text>
        </div>
        <div className="flex flex-wrap gap-2">
          {result.students.map((student) => (
            <Badge
              key={student._id ?? student.id ?? student.studentId}
              variant="outline"
            >
              {student.englishName}
            </Badge>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-gray-200 bg-white p-4">
        <Text className="mb-2 font-semibold">Instructor review</Text>
        <div className="whitespace-pre-wrap rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-900">
          {result.reviewText}
        </div>
      </div>

      {result.githubUrl ? (
        <div className="rounded-md border border-gray-200 bg-white p-4">
          <Text className="mb-2 font-semibold">Repository</Text>
          <a
            href={result.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <Github className="h-4 w-4" />
            {result.githubUrl}
          </a>
        </div>
      ) : null}
    </div>
  );
}

export function ExamSubmissionReview({
  exam,
  result,
}: {
  exam?: IExam;
  result: ExamResult;
}) {
  if (result.type === "code_review") {
    return <CodeReviewSubmissionReview result={result} />;
  }
  const googleExam =
    exam && exam.type === "google_form" ? exam : undefined;
  return <GoogleFormSubmissionReview exam={googleExam} result={result} />;
}
