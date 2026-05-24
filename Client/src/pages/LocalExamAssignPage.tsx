import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { assignLocalExamStudents, getExams } from "@/services/exams";
import { getStudents } from "@/services/students";
import type { ILocalExam, IStudent } from "@/types";

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

function assignedIds(exam?: ILocalExam): string[] {
  if (!exam) return [];
  return exam.assignedStudents
    .map((student) => (typeof student === "string" ? student : studentKey(student)))
    .filter(Boolean);
}

export default function LocalExamAssignPage() {
  const { examId = "" } = useParams();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

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

  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: async () => getStudents(await getToken()),
    enabled: isAuthenticated,
    retry: false,
  });

  const exam = examsQuery.data?.find((item) => item.type === "local" && (item._id ?? item.id) === examId) as
    | ILocalExam
    | undefined;

  useEffect(() => {
    if (exam) {
      setSelected(assignedIds(exam));
    }
  }, [exam]);

  useEffect(() => {
    if (examsQuery.isError) toast.error(`Exam: ${errMessage(examsQuery.error)}`);
    if (studentsQuery.isError) toast.error(`Students: ${errMessage(studentsQuery.error)}`);
  }, [
    examsQuery.isError,
    examsQuery.error,
    studentsQuery.isError,
    studentsQuery.error,
  ]);

  const mutation = useMutation({
    mutationFn: async () => assignLocalExamStudents(await getToken(), examId, selected),
    onSuccess: () => {
      toast.success("Students assigned");
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      navigate(`/exams/${examId}`);
    },
    onError: (error) => toast.error(`Assign failed: ${errMessage(error)}`),
  });

  const students = studentsQuery.data ?? [];
  const filteredStudents = useMemo(() => {
    const term = query.trim().toLowerCase();
    return students
      .filter((student) => student.status === "active")
      .filter((student) => {
        if (!term) return true;
        return [student.englishName, student.hebrewName, student.email, student.studentId]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(term));
      });
  }, [query, students]);

  const toggleStudent = (studentId: string) => {
    setSelected((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const loading = examsQuery.isLoading || studentsQuery.isLoading;

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
              Assign Exam
            </Heading>
          </div>
          <Text color="muted" className="mt-2">
            {exam?.title ?? "Select students who should receive this exam."}
          </Text>
        </div>
        <Badge variant="secondary">{selected.length} selected</Badge>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : !exam ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <Text color="muted">Could not find this local exam.</Text>
        </div>
      ) : (
        <div className="space-y-4">
          <input
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Search active students"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <div className="max-h-[32rem] overflow-y-auto rounded-md border border-gray-200 bg-white">
            {filteredStudents.map((student) => {
              const id = studentKey(student);
              const checked = selected.includes(id);
              return (
                <label
                  key={id}
                  className="flex cursor-pointer items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0 hover:bg-blue-50"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleStudent(id)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{student.englishName}</span>
                    <span className="block truncate text-sm text-gray-500">
                      {student.hebrewName} · {student.email || student.studentId}
                    </span>
                  </span>
                </label>
              );
            })}
            {filteredStudents.length === 0 ? (
              <div className="p-4">
                <Text color="muted">No active students match this search.</Text>
              </div>
            ) : null}
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              disabled={mutation.isPending || selected.length === 0}
              onClick={() => mutation.mutate()}
            >
              <Send className="mr-2 h-4 w-4" />
              Assign selected
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
