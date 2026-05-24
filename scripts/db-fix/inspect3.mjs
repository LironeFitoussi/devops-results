import { MongoClient, ObjectId } from "mongodb";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db = client.db("test");

const examResults = db.collection("examresults");

const eliStudentId = ObjectId.createFromHexString("6a0c1ea00b074f3655115572");
const davidStudentId = ObjectId.createFromHexString("6a0c1ea00b074f365511557b");

const eliResults = await examResults.find({ student: eliStudentId }).toArray();
const davidResults = await examResults.find({ student: davidStudentId }).toArray();

console.log(`Exam results pointing to ELI student (${eliStudentId}): ${eliResults.length}`);
for (const r of eliResults) {
    console.log(`  _id=${r._id} extractedIdentity=${JSON.stringify(r.extractedIdentity)} score=${r.score}`);
}

console.log(`\nExam results pointing to DAVID student (${davidStudentId}): ${davidResults.length}`);
for (const r of davidResults) {
    console.log(`  _id=${r._id} extractedIdentity=${JSON.stringify(r.extractedIdentity)} score=${r.score}`);
}

// Also: search exam results whose extractedIdentity mentions Rubin/רובין or Haimov/חיימוב
console.log("\n=== Results by extractedIdentity name match ===");
const byName = await examResults.find({
    $or: [
        { "extractedIdentity.firstName": { $regex: /rubin|david|רובין|דוד|elih|haym|haim|חיימוב|אלי/i } },
        { "extractedIdentity.lastName":  { $regex: /rubin|david|רובין|דוד|elih|haym|haim|חיימוב|אלי/i } },
    ],
}).toArray();
for (const r of byName) {
    console.log(`  _id=${r._id} extractedIdentity=${JSON.stringify(r.extractedIdentity)} student=${r.student} score=${r.score}`);
}

await client.close();
