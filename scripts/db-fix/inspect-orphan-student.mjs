import { MongoClient, ObjectId } from "mongodb";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const uri = process.env.MONGO_URI;
if (!uri) throw new Error("MONGO_URI not set");

const client = new MongoClient(uri);
await client.connect();
const db = client.db("test");

const orphanStudentId = new ObjectId("6a0c1ea00b074f3655115572");
const linkedStudentId = new ObjectId("6a0c1e9f0b074f3655115570");

console.log("=== Student in the existing examresult ===");
const s1 = await db.collection("students").findOne({ _id: orphanStudentId });
console.log(JSON.stringify(s1, null, 2));

console.log("\n=== Student linked to Daniel's user ===");
const s2 = await db.collection("students").findOne({ _id: linkedStudentId });
console.log(JSON.stringify(s2, null, 2));

console.log("\n=== All examresults containing exam ...297 OR student ...570 OR student ...572 ===");
const docs = await db
    .collection("examresults")
    .find({
        $or: [
            { exam: new ObjectId("6a12d998058bb45b55736297") },
            { student: linkedStudentId },
            { student: orphanStudentId },
        ],
    })
    .toArray();
for (const d of docs) {
    console.log(JSON.stringify(d, null, 2));
}

console.log("\n=== Current indexes on examresults ===");
for (const idx of await db.collection("examresults").indexes()) {
    console.log(JSON.stringify(idx));
}

await client.close();
