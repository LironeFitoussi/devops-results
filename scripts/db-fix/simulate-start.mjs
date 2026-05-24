import { MongoClient, ObjectId } from "mongodb";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const uri = process.env.MONGO_URI;
if (!uri) throw new Error("MONGO_URI not set");

const client = new MongoClient(uri);
await client.connect();
const examresults = client.db("test").collection("examresults");

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
    console.log("OK:", JSON.stringify(r, null, 2));
} catch (err) {
    console.log("ERR name:", err.name);
    console.log("ERR code:", err.code);
    console.log("ERR message:", err.message);
    console.log("ERR keyPattern:", JSON.stringify(err.keyPattern));
    console.log("ERR keyValue:", JSON.stringify(err.keyValue));
    console.log("ERR errInfo:", JSON.stringify(err.errInfo));
}

await client.close();
