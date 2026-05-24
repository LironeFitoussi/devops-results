import { useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, ClipboardList } from "lucide-react";

import { Heading } from "@/components/Atoms/Heading";
import { Icon } from "@/components/Atoms/Icon";
import { Text } from "@/components/Atoms/Text";
import { Button } from "@/components/ui/button";
import LocalExamForm from "@/components/LocalExamForm";
import { createLocalExam } from "@/services/exams";
import type { CreateLocalExamInput } from "@/types";

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

export default function LocalExamCreatePage() {
  const { getAccessTokenSilently } = useAuth0();
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
      </div>

      <LocalExamForm
        isSubmitting={mutation.isPending}
        primaryLabel="Save and publish"
        secondaryLabel="Save draft"
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
