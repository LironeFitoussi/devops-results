import { useCallback, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  Clock,
  GraduationCap,
  Mail,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSpinner } from "@/components/Atoms";
import {
  createStudent,
  deleteStudent,
  getStudents,
  updateStudent,
} from "@/services/students";
import type { IStudent, StudentStatus } from "@/types";

const statusStyles: Record<StudentStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  graduated: "bg-slate-100 text-slate-700 border-slate-200",
};

const EMPTY_STUDENTS: IStudent[] = [];

function studentKey(student: IStudent): string {
  return student._id ?? student.id ?? student.studentId;
}

function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : "Student action failed";
}

export default function StudentsPage() {
  const [hebrewName, setHebrewName] = useState("");
  const [englishName, setEnglishName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<IStudent | null>(null);
  const [editHebrewName, setEditHebrewName] = useState("");
  const [editEnglishName, setEditEnglishName] = useState("");
  const [editStudentId, setEditStudentId] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editStatus, setEditStatus] = useState<StudentStatus>("active");
  const [editError, setEditError] = useState("");
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
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

  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: async () => getStudents(await getToken()),
    enabled: isAuthenticated,
  });

  const refreshStudents = () => {
    queryClient.invalidateQueries({ queryKey: ["students"] });
  };

  const createMutation = useMutation({
    mutationFn: async () =>
      createStudent(await getToken(), {
        hebrewName: hebrewName.trim(),
        englishName: englishName.trim(),
        studentId: studentId.trim(),
        email: email.trim(),
      }),
    onSuccess: () => {
      closeAddDialog();
      refreshStudents();
      toast.success("Student added");
    },
    onError: (mutationError) => {
      toast.error(messageFromError(mutationError));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: StudentStatus;
    }) => updateStudent(await getToken(), id, { status }),
    onSuccess: refreshStudents,
    onError: (mutationError) => {
      toast.error(messageFromError(mutationError));
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: async () => {
      if (!editingStudent) {
        throw new Error("No student selected");
      }

      return updateStudent(await getToken(), studentKey(editingStudent), {
        hebrewName: editHebrewName.trim(),
        englishName: editEnglishName.trim(),
        studentId: editStudentId.trim(),
        email: editEmail.trim(),
        status: editStatus,
      });
    },
    onSuccess: () => {
      closeEditDialog();
      refreshStudents();
      toast.success("Student updated");
    },
    onError: (mutationError) => {
      toast.error(messageFromError(mutationError));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => deleteStudent(await getToken(), id),
    onSuccess: () => {
      refreshStudents();
      toast.success("Student deleted");
    },
    onError: (mutationError) => {
      toast.error(messageFromError(mutationError));
    },
  });

  const students = studentsQuery.data ?? EMPTY_STUDENTS;

  const visibleStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return students;
    }

    return students.filter((student) =>
      [
        student.hebrewName,
        student.englishName,
        student.studentId,
        student.email ?? "",
        student.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, students]);

  const activeCount = useMemo(
    () => students.filter((student) => student.status === "active").length,
    [students],
  );

  const pendingCount = useMemo(
    () => students.filter((student) => student.status === "pending").length,
    [students],
  );

  const missingEmailCount = useMemo(
    () => students.filter((student) => !student.email).length,
    [students],
  );

  const resetForm = () => {
    setHebrewName("");
    setEnglishName("");
    setStudentId("");
    setEmail("");
    setError("");
  };

  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
    resetForm();
  };

  const openEditDialog = (student: IStudent) => {
    setEditingStudent(student);
    setEditHebrewName(student.hebrewName);
    setEditEnglishName(student.englishName);
    setEditStudentId(student.studentId);
    setEditEmail(student.email ?? "");
    setEditStatus(student.status);
    setEditError("");
  };

  const closeEditDialog = () => {
    setEditingStudent(null);
    setEditHebrewName("");
    setEditEnglishName("");
    setEditStudentId("");
    setEditEmail("");
    setEditStatus("active");
    setEditError("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hebrewName.trim() || !englishName.trim() || !studentId.trim()) {
      setError("Fill in Hebrew name, English name, and ID.");
      return;
    }

    setError("");
    createMutation.mutate();
  };

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editHebrewName.trim() || !editEnglishName.trim() || !editStudentId.trim()) {
      setEditError("Fill in Hebrew name, English name, and ID.");
      return;
    }

    setEditError("");
    updateStudentMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-md bg-blue-600 text-white">
                <GraduationCap className="size-6" />
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-blue-700">
                  Student Management
                </p>
                <h1 className="text-3xl font-semibold text-slate-950">
                  Students registry
                </h1>
              </div>
            </div>
            <p className="max-w-2xl text-sm text-slate-600">
              Manage each student with Hebrew name, English name, ID, and email.
            </p>
            <Button
              type="button"
              className="mt-5"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="size-4" />
              Add student
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <Users className="size-4" />
                <span className="text-xs font-medium">Students</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {students.length}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="size-4" />
                <span className="text-xs font-medium">Active</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {activeCount}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-amber-600">
                <Clock className="size-4" />
                <span className="text-xs font-medium">Pending</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {pendingCount}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-red-600">
                <Mail className="size-4" />
                <span className="text-xs font-medium">No email</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {missingEmailCount}
              </p>
            </div>
          </div>
        </header>

        <section>
          <div className="rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Student directory
                </h2>
                <p className="text-sm text-slate-500">
                  Search by Hebrew name, English name, ID, email, or status.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="relative block md:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="pl-9"
                    placeholder="Search students"
                  />
                </label>
              </div>
            </div>

            {studentsQuery.isLoading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" />
              </div>
            ) : studentsQuery.isError ? (
              <div className="p-6 text-sm text-red-600">
                Could not load students.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead className="text-right">Hebrew name</TableHead>
                    <TableHead>English name</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
	                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleStudents.map((student, index) => {
                    const key = studentKey(student);
                    return (
                      <TableRow key={key}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell
                          className="text-right font-medium text-slate-950"
                          dir="rtl"
                        >
                          {student.hebrewName}
                        </TableCell>
                        <TableCell className="font-medium text-slate-950">
                          {student.englishName}
                        </TableCell>
                        <TableCell>{student.studentId}</TableCell>
                        <TableCell>
                          {student.email ? (
                            <a
                              href={`mailto:${student.email}`}
                              className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900"
                            >
                              <Mail className="size-4" />
                              {student.email}
                            </a>
                          ) : (
                            <span className="text-slate-400">No email</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={statusStyles[student.status]}
                              variant="outline"
                            >
                              <ShieldCheck className="size-3" />
                              {student.status}
                            </Badge>
                            <select
                              value={student.status}
                              onChange={(event) =>
                                updateStatusMutation.mutate({
                                  id: key,
                                  status: event.target.value as StudentStatus,
                                })
                              }
                              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 shadow-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              aria-label={`Update ${student.englishName} status`}
                            >
                              <option value="active">Active</option>
                              <option value="pending">Pending</option>
                              <option value="graduated">Graduated</option>
                            </select>
                          </div>
                        </TableCell>
	                        <TableCell className="text-right">
	                          <div className="flex justify-end gap-1">
	                            <Button
	                              type="button"
	                              variant="ghost"
	                              size="icon"
	                              onClick={() => openEditDialog(student)}
	                              aria-label={`Edit ${student.englishName}`}
	                            >
	                              <Pencil className="size-4 text-blue-700" />
	                            </Button>
	                            <Button
	                              type="button"
	                              variant="ghost"
	                              size="icon"
	                              onClick={() => deleteMutation.mutate(key)}
	                              aria-label={`Delete ${student.englishName}`}
	                            >
	                              <Trash2 className="size-4 text-red-600" />
	                            </Button>
	                          </div>
	                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {visibleStudents.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-32 text-center text-slate-500"
                      >
                        No students match your search.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            )}
          </div>
        </section>

	        {isAddDialogOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-student-title"
          >
            <div className="w-full max-w-md rounded-md border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2
                    id="add-student-title"
                    className="text-lg font-semibold text-slate-950"
                  >
                    Add student
                  </h2>
                  <p className="text-sm text-slate-500">
                    Use the real registry fields.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={closeAddDialog}
                  aria-label="Close add student dialog"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-5">
                <label className="block text-sm font-medium text-slate-700">
                  Hebrew name
                  <Input
                    value={hebrewName}
                    onChange={(event) => setHebrewName(event.target.value)}
                    className="mt-1 text-right"
                    dir="rtl"
                    placeholder="Hebrew name"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  English name
                  <Input
                    value={englishName}
                    onChange={(event) => setEnglishName(event.target.value)}
                    className="mt-1"
                    placeholder="Guy Peres"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  ID
                  <Input
                    value={studentId}
                    onChange={(event) => setStudentId(event.target.value)}
                    className="mt-1"
                    inputMode="numeric"
                    placeholder="326077229"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Email
                  <Input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-1"
                    placeholder="student@example.com"
                    type="email"
                  />
                </label>

                {error ? (
                  <p className="text-sm font-medium text-red-600">{error}</p>
                ) : null}

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeAddDialog}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    <Plus className="size-4" />
                    Add student
                  </Button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {editingStudent ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-student-title"
          >
            <div className="w-full max-w-md rounded-md border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2
                    id="edit-student-title"
                    className="text-lg font-semibold text-slate-950"
                  >
                    Edit student
                  </h2>
                  <p className="text-sm text-slate-500">
                    {editingStudent.englishName}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={closeEditDialog}
                  aria-label="Close edit student dialog"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 p-5">
                <label className="block text-sm font-medium text-slate-700">
                  Hebrew name
                  <Input
                    value={editHebrewName}
                    onChange={(event) => setEditHebrewName(event.target.value)}
                    className="mt-1 text-right"
                    dir="rtl"
                    placeholder="Hebrew name"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  English name
                  <Input
                    value={editEnglishName}
                    onChange={(event) => setEditEnglishName(event.target.value)}
                    className="mt-1"
                    placeholder="Guy Peres"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  ID
                  <Input
                    value={editStudentId}
                    onChange={(event) => setEditStudentId(event.target.value)}
                    className="mt-1"
                    inputMode="numeric"
                    placeholder="326077229"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Email
                  <Input
                    value={editEmail}
                    onChange={(event) => setEditEmail(event.target.value)}
                    className="mt-1"
                    placeholder="student@example.com"
                    type="email"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Status
                  <select
                    value={editStatus}
                    onChange={(event) =>
                      setEditStatus(event.target.value as StudentStatus)
                    }
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="graduated">Graduated</option>
                  </select>
                </label>

                {editError ? (
                  <p className="text-sm font-medium text-red-600">
                    {editError}
                  </p>
                ) : null}

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeEditDialog}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateStudentMutation.isPending}>
                    <Pencil className="size-4" />
                    Save changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
