import { MongoClient } from "mongodb";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const uri = process.env.MONGO_URI;
if (!uri) throw new Error("MONGO_URI not set");

const client = new MongoClient(uri);
await client.connect();

const dbInfo = await client.db().admin().listDatabases();
console.log("DATABASES:", JSON.stringify(dbInfo.databases.map(d => d.name)));

// Try the likely DB name — connection string has no /dbname, default is "test"
// We'll probe all non-system DBs that have a "users" collection
for (const d of dbInfo.databases) {
    if (["admin", "local", "config"].includes(d.name)) continue;
    const db = client.db(d.name);
    const cols = (await db.listCollections().toArray()).map(c => c.name);
    if (!cols.includes("users")) continue;
    console.log(`\n=== DB: ${d.name} ===`);
    console.log("Collections:", cols.join(", "));

    const users = db.collection("users");
    const students = cols.includes("students") ? db.collection("students") : null;

    const matches = await users.find({
        $or: [
            { firstName: { $regex: /rub|elih|david/i } },
            { lastName: { $regex: /rub|elih|david/i } },
            { email: { $regex: /rub|elih|idf/i } },
        ],
    }).toArray();

    console.log(`\nUsers matched (${matches.length}):`);
    for (const u of matches) {
        console.log(JSON.stringify(u, null, 2));
    }

    if (students) {
        const sMatches = await students.find({
            $or: [
                { hebrewName: { $regex: /rub|elih|david|דוד|רובי|אליחי/i } },
                { englishName: { $regex: /rub|elih|david/i } },
                { email: { $regex: /rub|elih|idf/i } },
                { normalizedEmail: { $regex: /rub|elih|idf/i } },
            ],
        }).toArray();
        console.log(`\nStudents matched (${sMatches.length}):`);
        for (const s of sMatches) {
            console.log(JSON.stringify(s, null, 2));
        }
    }
}

await client.close();
