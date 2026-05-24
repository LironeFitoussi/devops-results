import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, ClipboardList, Plus, Trash2 } from "lucide-react";

import { Heading } from "@/components/Atoms/Heading";
import { Icon } from "@/components/Atoms/Icon";
import { LoadingSpinner } from "@/components/Atoms/LoadingSpinner";
import { Text } from "@/components/Atoms/Text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createCodeReviewExam } from "@/services/exams";
import { getStudents } from "@/services/students";
import type { CreateCodeReviewExamInput, IStudent } from "@/types";

interface GroupRow {
  studentIds: string[];
  reviewText: string;
  githubUrl: string;
}

function emptyRow(): GroupRow {
  return { studentIds: [], reviewText: "", githubUrl: "" };
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

function studentKey(student: IStudent): string {
  return student._id ?? student.id ?? "";
}

export default function CodeReviewCreatePage() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rows, setRows] = useState<GroupRow[]>([emptyRow()]);

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

  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: async () => getStudents(await getToken()),
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (studentsQuery.isError) {
      toast.error(`Students: ${errMessage(studentsQuery.error)}`);
    }
  }, [studentsQuery.isError, studentsQuery.error]);

  const mutation = useMutation({
    mutationFn: async (payload: CreateCodeReviewExamInput) =>
      createCodeReviewExam(await getToken(), payload),
    onSuccess: ({ exam }) => {
      toast.success("Code review created");
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      const id = exam._id ?? exam.id;
      if (id) {
        navigate(`/exams/${id}`);
      } else {
        navigate("/exams");
      }
    },
    onError: (error) => {
      toast.error(`Create failed: ${errMessage(error)}`);
    },
  });

  const students = studentsQuery.data ?? [];

  const updateRow = (index: number, patch: Partial<GroupRow>) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  };

  const toggleStudent = (index: number, id: string) => {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const has = row.studentIds.includes(id);
        return {
          ...row,
          studentIds: has
            ? row.studentIds.filter((sid) => sid !== id)
            : [...row.studentIds, id],
        };
      }),
    );
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (index: number) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (rows.length === 0) {
      toast.error("Add at least one group");
      return;
    }
    for (const [i, row] of rows.entries()) {
      if (row.studentIds.length === 0) {
        toast.error(`Group ${i + 1}: pick at least one student`);
        return;
      }
      if (!row.reviewText.trim()) {
        toast.error(`Group ${i + 1}: review text is required`);
        return;
      }
    }

    const payload: CreateCodeReviewExamInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      results: rows.map((row) => ({
        studentIds: row.studentIds,
        reviewText: row.reviewText.trim(),
        githubUrl: row.githubUrl.trim() || undefined,
      })),
    };

    mutation.mutate(payload);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/exams">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to exams
        </Link>
      </Button>

      <div className="mb-6 flex items-center gap-3">
        <Icon icon={ClipboardList} size="lg" className="text-blue-600" />
        <Heading level={1} className="text-3xl md:text-4xl">
          New Code Review
        </Heading>
      </div>
      <Text color="muted" className="mb-6">
        Write a single review per group. A group may contain one or more students.
      </Text>

      {studentsQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-6">
          <div className="space-y-2 rounded-md border border-gray-200 bg-white p-4">
            <label className="block text-sm font-medium" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <label className="block pt-2 text-sm font-medium" htmlFor="desc">
              Description (optional)
            </label>
            <textarea
              id="desc"
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {rows.map((row, index) => (
            <div
              key={index}
              className="space-y-3 rounded-md border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <Heading level={3} className="text-lg">
                  Group {index + 1}
                </Heading>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRow(index)}
                  disabled={rows.length === 1}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Remove
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium">Students</label>
                <div className="mt-2 flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-md border border-gray-200 p-2">
                  {students.map((student) => {
                    const id = studentKey(student);
                    const selected = row.studentIds.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleStudent(index, id)}
                        className={`rounded-full border px-3 py-1 text-xs transition ${
                          selected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {student.englishName}
                      </button>
                    );
                  })}
                </div>
                {row.studentIds.length > 0 ? (
                  <Badge variant="secondary" className="mt-2">
                    {row.studentIds.length} selected
                  </Badge>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-medium">Review text</label>
                <textarea
                  rows={5}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={row.reviewText}
                  onChange={(e) =>
                    updateRow(index, { reviewText: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  GitHub URL (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/owner/repo"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={row.githubUrl}
                  onChange={(e) =>
                    updateRow(index, { githubUrl: e.target.value })
                  }
                />
              </div>
            </div>
          ))}

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={addRow}>
              <Plus className="mr-2 h-4 w-4" />
              Add group
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Create code review"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
