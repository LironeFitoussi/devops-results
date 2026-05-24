---
name: add-local-exam
description: Generate step-by-step mongosh queries for creating and assigning local in-app exams in this devops-results MongoDB schema. Use when the user describes an exam, wants exact MongoDB insert/update/find queries, wants student assignment queries, or asks for local exam documents compatible with the app's local exam type.
---

# Add Local Exam

## Goal

Output step-by-step MongoDB queries only. Never run the queries. Build documents that match the app's `local` exam schema exactly.

## Schema

Create documents in `db.exams` with:

```js
{
  type: "local",
  title: String,
  description: String,
  questions: [
    {
      id: String,
      type: "single_choice" | "multi_choice" | "short_text" | "long_text",
      prompt: String,
      points: Number,
      options: [{ id: String, label: String, isCorrect: Boolean }],
      correctText: String
    }
  ],
  totalPoints: Number,
  assignedStudents: [ObjectId],
  status: "draft" | "published" | "closed",
  dueAt: ISODate,
  createdBy: ObjectId,
  importedBy: ObjectId,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

Choice questions must include `options`. Text questions must omit `options`. `correctText` is optional for text questions and enables exact-match auto-grading.

## Workflow

1. Restate any assumptions that affect data, such as missing admin user id, due date, or student criteria.
2. Generate stable ids for questions and options with readable prefixes like `q_...` and `opt_...`.
3. Compute `totalPoints` from all question points.
4. Output a verification query for the admin user when `createdBy` is not explicitly provided:

```js
db.users.find({ role: "admin" }, { firstName: 1, lastName: 1, email: 1, role: 1 })
```

5. Output the `db.exams.insertOne(...)` query with `status: "draft"` unless the user explicitly asks to publish.
6. Output a verification query to resolve students. Prefer the user's criteria:

```js
db.students.find(
  { status: "active", email: { $in: ["student@example.com"] } },
  { englishName: 1, hebrewName: 1, email: 1, studentId: 1, status: 1 }
)
```

7. Output an assignment update using the inserted exam id:

```js
db.exams.updateOne(
  { _id: ObjectId("<examId>"), type: "local" },
  { $addToSet: { assignedStudents: { $each: [ObjectId("<studentId>")] } }, $set: { updatedAt: new Date() } }
)
```

8. If requested, output a final publish query:

```js
db.exams.updateOne(
  { _id: ObjectId("<examId>"), type: "local" },
  { $set: { status: "published", updatedAt: new Date() } }
)
```

## Guardrails

- Use `ObjectId(...)` for `_id`, `createdBy`, `importedBy`, and `assignedStudents`.
- Use `new Date()` for timestamps and `ISODate(...)` for fixed due dates.
- Do not invent fields outside the schema.
- Do not include `isCorrect` or `correctText` in any student-facing query output.
- For single choice questions, mark exactly one option as `isCorrect: true`.
- For multi choice questions, mark at least one option as `isCorrect: true`.
- Keep the output step-by-step with intermediate verification, not one giant script.
