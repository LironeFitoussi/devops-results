import { useMemo, useState } from "react";
import type { FormEvent } from "react";
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

type StudentStatus = "active" | "pending" | "graduated";

type Student = {
  id: string;
  hebrewName: string;
  englishName: string;
  studentId: string;
  email: string;
  status: StudentStatus;
};

const STORAGE_KEY = "students-management:v2";

const starterStudents: Student[] = [
  {
    id: "student-1",
    hebrewName: "×’×™× ×¤×¨×¡",
    englishName: "Guy Peres",
    studentId: "326077229",
    email: "GuyguyPeres@gmail.com",
    status: "active",
  },
  {
    id: "student-2",
    hebrewName: "××œ×›×¡× ×“×¨ ×¦×œ×™×“×•× ×•×‘×™×¥",
    englishName: "Alexander Chalidunovych",
    studentId: "321351769",
    email: "Sania1199.9966@gmail.com",
    status: "active",
  },
  {
    id: "student-3",
    hebrewName: "×™×•×ª× ×ž×™×›××œ ×‘×˜×©",
    englishName: "Yotam Michael Betash",
    studentId: "212481394",
    email: "yotambt1@gmail.com",
    status: "active",
  },
  {
    id: "student-4",
    hebrewName: "×©×•×Ÿ ×©×ž×™×œ×•×‘",
    englishName: "Sean Shmilov",
    studentId: "214509440",
    email: "Sean.Shmelyov@gmail.com",
    status: "active",
  },
  {
    id: "student-6",
    hebrewName: "×ž×™×›××œ × ×•×’×¨×™××Ÿ",
    englishName: "Michael Noghryan",
    studentId: "322709825",
    email: "MichaelNogh@gmail.com",
    status: "active",
  },
  {
    id: "student-7",
    hebrewName: "×™×•×‘×œ ×“×¨",
    englishName: "Yuval Dar",
    studentId: "203248091",
    email: "yuvaldar@gmail.com",
    status: "active",
  },
  {
    id: "student-8",
    hebrewName: "×œ×™××œ ×—×–×Ÿ",
    englishName: "Liel Hazzan",
    studentId: "324955079",
    email: "leal.hazzan@gmail.com",
    status: "active",
  },
  {
    id: "student-9",
    hebrewName: "×¤×™×œ×™×¤ ××™×‘×—×™×‘",
    englishName: "Philip Ivahiv",
    studentId: "212648893",
    email: "IvahivPhilipusik@gmail.com",
    status: "active",
  },
  {
    id: "student-10",
    hebrewName: "×™×•×‘×œ ×¤×¨×§×©",
    englishName: "Yuval Farkash",
    studentId: "328130810",
    email: "yuvalfarkash85@gmail.com",
    status: "active",
  },
  {
    id: "student-11",
    hebrewName: "×™×”×•×“×” ×¤×“×¨",
    englishName: "Yehuda Feder",
    studentId: "322218843",
    email: "yhodafeder@gmail.com",
    status: "active",
  },
  {
    id: "student-12",
    hebrewName: "×ž×§×¡×™× ×¨×™×™×§× ×™×š",
    englishName: "Maxim Raikinakh",
    studentId: "212511653",
    email: "maximri2411@gmail.com",
    status: "active",
  },
  {
    id: "student-13",
    hebrewName: "×“× ×™××œ ×™×¢×§×‘",
    englishName: "Daniel Yacov",
    studentId: "324181965",
    email: "danielyacc123@gmail.com",
    status: "active",
  },
  {
    id: "student-14",
    hebrewName: "×× ×˜×•× ×™×• (×˜×•× ×™) ×•×¨×™×Ÿ",
    englishName: "Antony Verin",
    studentId: "214789307",
    email: "toniv7891@gmail.com",
    status: "active",
  },
  {
    id: "student-15",
    hebrewName: "××œ×™ ××œ×™×”×• ×—×™×™×ž×•×‘",
    englishName: "Eli Eliyaho Haymov",
    studentId: "314651340",
    email: "idf775@gmail.com",
    status: "active",
  },
  {
    id: "student-16",
    hebrewName: "×”×¨××œ ×•×œ×¤×™×©",
    englishName: "Harel Valfish",
    studentId: "326256096",
    email: "harelvalfish@gmail.com",
    status: "active",
  },
  {
    id: "student-17",
    hebrewName: "×™×•× ×™ ×‘× ××¨×•×¡",
    englishName: "Yoni Benarrous",
    studentId: "345787196",
    email: "contact.yonibena@gmail.com",
    status: "active",
  },
  {
    id: "student-18",
    hebrewName: "×“× ×™××œ ×¨×•×¡×ž×Ÿ",
    englishName: "Daniel Rosman",
    studentId: "211765565",
    email: "danielros883@gmail.com",
    status: "active",
  },
  {
    id: "student-19",
    hebrewName: "×¢×•×ž×¨ ×œ×•×™",
    englishName: "Omer Levi",
    studentId: "323078907",
    email: "01omerlevi@gmail.com",
    status: "active",
  },
  {
    id: "student-20",
    hebrewName: "××ž×™×¨ ×©×—×",
    englishName: "Amir Shacham",
    studentId: "209164433",
    email: "shacham.amir@gmail.com",
    status: "active",
  },
  {
    id: "student-21",
    hebrewName: "×“×•×“ ×©× ×™×¨",
    englishName: "David Snir",
    studentId: "322453986",
    email: "david.snir@gmail.com",
    status: "active",
  },
  {
    id: "student-22",
    hebrewName: "× ×™×‘ ×‘×¨",
    englishName: "Niv Bar",
    studentId: "211604186",
    email: "bar.niv2000@gmail.com",
    status: "active",
  },
  {
    id: "student-23",
    hebrewName: "×“×•×“ ×¨×•×‘×™×Ÿ",
    englishName: "David Rubin",
    studentId: "205",
    email: "",
    status: "pending",
  },
];

const statusStyles: Record<StudentStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  graduated: "bg-slate-100 text-slate-700 border-slate-200",
};

const loadStudents = () => {
  if (typeof window === "undefined") {
    return starterStudents;
  }

  const storedStudents = window.localStorage.getItem(STORAGE_KEY);
  if (!storedStudents) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(starterStudents));
    return starterStudents;
  }

  try {
    const parsedStudents = JSON.parse(storedStudents) as Student[];
    return Array.isArray(parsedStudents) ? parsedStudents : starterStudents;
  } catch {
    return starterStudents;
  }
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(loadStudents);
  const [hebrewName, setHebrewName] = useState("");
  const [englishName, setEnglishName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmailStudent, setEditingEmailStudent] = useState<Student | null>(null);
  const [editingEmail, setEditingEmail] = useState("");
  const [emailError, setEmailError] = useState("");

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
        student.email,
        student.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [query, students]);

  const activeCount = useMemo(
    () => students.filter((student) => student.status === "active").length,
    [students]
  );

  const pendingCount = useMemo(
    () => students.filter((student) => student.status === "pending").length,
    [students]
  );

  const missingEmailCount = useMemo(
    () => students.filter((student) => !student.email).length,
    [students]
  );

  const persistStudents = (nextStudents: Student[]) => {
    setStudents(nextStudents);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStudents));
  };

  const resetForm = () => {
    setHebrewName("");
    setEnglishName("");
    setStudentId("");
    setEmail("");
    setError("");
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    resetForm();
  };

  const openEditEmailModal = (student: Student) => {
    setEditingEmailStudent(student);
    setEditingEmail(student.email);
    setEmailError("");
  };

  const closeEditEmailModal = () => {
    setEditingEmailStudent(null);
    setEditingEmail("");
    setEmailError("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedStudentId = studentId.trim();
    if (!hebrewName.trim() || !englishName.trim() || !normalizedStudentId) {
      setError("Fill in Hebrew name, English name, and ID.");
      return;
    }

    const idExists = students.some((student) => student.studentId === normalizedStudentId);
    if (idExists) {
      setError("A student with this ID already exists.");
      return;
    }

    const nextStudents: Student[] = [
      {
        id: crypto.randomUUID(),
        hebrewName: hebrewName.trim(),
        englishName: englishName.trim(),
        studentId: normalizedStudentId,
        email: email.trim(),
        status: email.trim() ? "active" : "pending",
      },
      ...students,
    ];

    persistStudents(nextStudents);
    closeAddModal();
  };

  const updateStatus = (studentRecordId: string, status: StudentStatus) => {
    persistStudents(
      students.map((student) =>
        student.id === studentRecordId ? { ...student, status } : student
      )
    );
  };

  const deleteStudent = (studentRecordId: string) => {
    persistStudents(students.filter((student) => student.id !== studentRecordId));
  };

  const handleEmailUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingEmailStudent) {
      return;
    }

    const normalizedEmail = editingEmail.trim();
    const emailExists = students.some(
      (student) =>
        student.id !== editingEmailStudent.id &&
        student.email.toLowerCase() === normalizedEmail.toLowerCase() &&
        normalizedEmail
    );

    if (emailExists) {
      setEmailError("That email is already assigned to another student.");
      return;
    }

    persistStudents(
      students.map((student) =>
        student.id === editingEmailStudent.id
          ? {
              ...student,
              email: normalizedEmail,
              status: normalizedEmail && student.status === "pending" ? "active" : student.status,
            }
          : student
      )
    );
    closeEditEmailModal();
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
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <Users className="size-4" />
                <span className="text-xs font-medium">Students</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{students.length}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="size-4" />
                <span className="text-xs font-medium">Active</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{activeCount}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-amber-600">
                <Clock className="size-4" />
                <span className="text-xs font-medium">Pending</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{pendingCount}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-red-600">
                <Mail className="size-4" />
                <span className="text-xs font-medium">No email</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{missingEmailCount}</p>
            </div>
          </div>
        </header>

        <section>

          <div className="rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Student directory</h2>
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
                <Button type="button" size="sm" onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="size-4" />
                  Add
                </Button>
              </div>
            </div>

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
                {visibleStudents.map((student, index) => (
                  <TableRow key={student.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="text-right font-medium text-slate-950" dir="rtl">
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
                        <Badge className={statusStyles[student.status]} variant="outline">
                          <ShieldCheck className="size-3" />
                          {student.status}
                        </Badge>
                        <select
                          value={student.status}
                          onChange={(event) =>
                            updateStatus(student.id, event.target.value as StudentStatus)
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
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditEmailModal(student)}
                          aria-label={`Edit ${student.englishName} email`}
                        >
                          <Pencil className="size-4 text-blue-700" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteStudent(student.id)}
                          aria-label={`Delete ${student.englishName}`}
                        >
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {visibleStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                      No students match your search.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </section>

        {isAddModalOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-student-title"
          >
            <div className="w-full max-w-md rounded-md border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 id="add-student-title" className="text-lg font-semibold text-slate-950">
                    Add student
                  </h2>
                  <p className="text-sm text-slate-500">Use the real registry fields.</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={closeAddModal}
                  aria-label="Close add student modal"
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

                {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={closeAddModal}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Plus className="size-4" />
                    Add student
                  </Button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {editingEmailStudent ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-email-title"
          >
            <div className="w-full max-w-md rounded-md border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 id="edit-email-title" className="text-lg font-semibold text-slate-950">
                    Edit email
                  </h2>
                  <p className="text-sm text-slate-500">
                    {editingEmailStudent.englishName}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={closeEditEmailModal}
                  aria-label="Close edit email modal"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <form onSubmit={handleEmailUpdate} className="space-y-4 p-5">
                <label className="block text-sm font-medium text-slate-700">
                  Email
                  <Input
                    value={editingEmail}
                    onChange={(event) => setEditingEmail(event.target.value)}
                    className="mt-1"
                    placeholder="student@example.com"
                    type="email"
                  />
                </label>

                {emailError ? (
                  <p className="text-sm font-medium text-red-600">{emailError}</p>
                ) : null}

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={closeEditEmailModal}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Mail className="size-4" />
                    Save email
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
