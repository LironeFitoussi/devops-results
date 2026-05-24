import { MongoClient, ObjectId } from "mongodb";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const uri = process.env.MONGO_URI;
if (!uri) throw new Error("MONGO_URI not set");

const client = new MongoClient(uri);
await client.connect();
const examresults = client.db("test").collection("examresults");

const before = await examresults.indexes();
const target = before.find((i) => i.name === "exam_1_googleResponseId_1");
console.log("Before:", JSON.stringify(target));

if (target) {
    await examresults.dropIndex("exam_1_googleResponseId_1");
    console.log("Dropped exam_1_googleResponseId_1");
}

await examresults.createIndex(
    { exam: 1, googleResponseId: 1 },
    { unique: true, partialFilterExpression: { type: "google_form" } },
);
console.log("Recreated as partial filter on type=google_form");

const after = await examresults.indexes();
const newOne = after.find((i) => i.name === "exam_1_googleResponseId_1");
console.log("After:", JSON.stringify(newOne));

console.log("\n=== Simulating Daniel's start ===");
const examOid = new ObjectId("6a12d998058bb45b55736297");
const studentOid = new ObjectId("6a0c1e9f0b074f3655115570");
try {
    const r = await examresults.findOneAndUpdate(
        { exam: examOid, student: studentOid },
        {
            $setOnInsert: {
                type: "local",
                exam: examOid,
                student: studentOid,
                answers: [],
                status: "in_progress",
                autoGradedScore: 0,
                maxScore: 100,
                confirmedAt: new Date(),
            },
        },
        { upsert: true, returnDocument: "after" },
    );
    console.log("OK _id:", String(r._id), "student:", String(r.student));
} catch (err) {
    console.log("STILL FAILING:", err.message);
    console.log("keyPattern:", JSON.stringify(err.keyPattern));
    console.log("keyValue:", JSON.stringify(err.keyValue));
}

await client.close();
