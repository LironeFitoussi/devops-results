import { useCallback, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, ClipboardList } from "lucide-react";

import { Heading } from "@/components/Atoms/Heading";
import { Icon } from "@/components/Atoms/Icon";
import { LoadingSpinner } from "@/components/Atoms/LoadingSpinner";
import { Text } from "@/components/Atoms/Text";
import { Button } from "@/components/ui/button";
import LocalExamForm, {
  type LocalExamFormInitialValues,
} from "@/components/LocalExamForm";
import { getExams, updateLocalExam } from "@/services/exams";
import type { IExam, ILocalExam, UpdateLocalExamInput } from "@/types";

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

function examIdOf(exam: IExam): string {
  return exam._id ?? exam.id ?? "";
}

function toDatetimeLocal(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function LocalExamEditPage() {
  const { examId } = useParams<{ examId: string }>();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const exam = useMemo<ILocalExam | undefined>(() => {
    if (!examId || !examsQuery.data) return undefined;
    const match = examsQuery.data.find((candidate) => examIdOf(candidate) === examId);
    return match?.type === "local" ? match : undefined;
  }, [examId, examsQuery.data]);

  const mutation = useMutation({
    mutationFn: async (payload: UpdateLocalExamInput) => {
      if (!examId) throw new Error("Missing exam id");
      return updateLocalExam(await getToken(), examId, payload);
    },
    onSuccess: () => {
      toast.success("Exam updated");
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      navigate("/exams");
    },
    onError: (error) => toast.error(`Update failed: ${errMessage(error)}`),
  });

  if (examsQuery.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (examsQuery.isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Text color="muted">Could not load exam.</Text>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/exams">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to exams
          </Link>
        </Button>
        <Text color="muted">Local exam not found.</Text>
      </div>
    );
  }

  if (exam.status !== "draft") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/exams">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to exams
          </Link>
        </Button>
        <Text color="muted">
          Only draft exams can be edited. Current status: {exam.status}.
        </Text>
      </div>
    );
  }

  const initialValues: LocalExamFormInitialValues = {
    title: exam.title,
    description: exam.description ?? "",
    dueAt: toDatetimeLocal(exam.dueAt),
    questions: exam.questions,
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
              Edit Local Exam
            </Heading>
          </div>
          <Text color="muted" className="mt-2">
            Edit questions, options, and metadata. Only draft exams are editable.
          </Text>
        </div>
      </div>

      <LocalExamForm
        initialValues={initialValues}
        isSubmitting={mutation.isPending}
        primaryLabel="Save and publish"
        secondaryLabel="Save changes"
        onSubmit={(payload, action) =>
          mutation.mutate({
            ...payload,
            status: action === "primary" ? "published" : "draft",
          })
        }
      />
    </div>
  );
}
