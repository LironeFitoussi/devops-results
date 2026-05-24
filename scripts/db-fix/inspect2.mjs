import { MongoClient, ObjectId } from "mongodb";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db = client.db("test");

const users = db.collection("users");
const students = db.collection("students");
const examResults = db.collection("examresults");
const exams = db.collection("exams");

console.log("=== ALL USERS ===");
const allUsers = await users.find({}).toArray();
for (const u of allUsers) console.log(JSON.stringify(u));

console.log("\n=== ALL STUDENTS ===");
const allStudents = await students.find({}).toArray();
for (const s of allStudents) console.log(JSON.stringify(s));

// Look up the student referenced by David Rubin's user record
const davidRubinUser = allUsers.find(u => u.firstName === "David" && u.lastName === "Rubin");
if (davidRubinUser?.student) {
    const refStudent = await students.findOne({ _id: davidRubinUser.student });
    console.log("\n=== Student referenced by David Rubin user ===");
    console.log(JSON.stringify(refStudent));
}

console.log("\n=== Total counts ===");
console.log("users:", await users.countDocuments());
console.log("students:", await students.countDocuments());
console.log("examresults:", await examResults.countDocuments());
console.log("exams:", await exams.countDocuments());

// Find exam results referencing either student
console.log("\n=== ExamResults sample (first 5) ===");
const erSample = await examResults.find({}).limit(5).toArray();
for (const e of erSample) console.log(JSON.stringify(e));

await client.close();
