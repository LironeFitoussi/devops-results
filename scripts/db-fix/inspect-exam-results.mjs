import { MongoClient, ObjectId } from "mongodb";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const uri = process.env.MONGO_URI;
if (!uri) throw new Error("MONGO_URI not set");

const EXAM_ID = "6a12d998058bb45b55736297";
const STUDENT_EMAIL = "danielyacc123@gmail.com";

const client = new MongoClient(uri);
await client.connect();

const dbInfo = await client.db().admin().listDatabases();

for (const d of dbInfo.databases) {
    if (["admin", "local", "config"].includes(d.name)) continue;
    const db = client.db(d.name);
    const cols = (await db.listCollections().toArray()).map((c) => c.name);
    if (!cols.includes("examresults")) continue;

    console.log(`\n=== DB: ${d.name} ===`);

    let examOid;
    try {
        examOid = new ObjectId(EXAM_ID);
    } catch {
        console.log("Bad exam id");
        continue;
    }

    const examresults = db.collection("examresults");
    const forExam = await examresults.find({ exam: examOid }).toArray();
    console.log(`examresults for exam ${EXAM_ID}: ${forExam.length}`);
    for (const r of forExam) {
        console.log(JSON.stringify(r, null, 2));
    }

    if (cols.includes("users")) {
        const u = await db.collection("users").findOne({ email: STUDENT_EMAIL });
        console.log(`\nuser by email ${STUDENT_EMAIL}:`);
        console.log(JSON.stringify(u, null, 2));
    }

    if (cols.includes("students")) {
        const ss = await db
            .collection("students")
            .find({
                $or: [
                    { email: STUDENT_EMAIL },
                    { normalizedEmail: STUDENT_EMAIL },
                ],
            })
            .toArray();
        console.log(`\nstudents by email ${STUDENT_EMAIL}: ${ss.length}`);
        for (const s of ss) {
            console.log(JSON.stringify(s, null, 2));
        }
    }

    if (cols.includes("exams")) {
        const e = await db.collection("exams").findOne({ _id: examOid });
        console.log(`\nexam ${EXAM_ID}:`);
        console.log(JSON.stringify(e, null, 2));
    }
}

await client.close();
