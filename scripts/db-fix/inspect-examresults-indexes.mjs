import { MongoClient } from "mongodb";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const uri = process.env.MONGO_URI;
if (!uri) throw new Error("MONGO_URI not set");

const client = new MongoClient(uri);
await client.connect();

const dbInfo = await client.db().admin().listDatabases();

for (const d of dbInfo.databases) {
    if (["admin", "local", "config"].includes(d.name)) continue;
    const db = client.db(d.name);
    const cols = (await db.listCollections().toArray()).map((c) => c.name);
    if (!cols.includes("examresults")) continue;

    console.log(`\n=== DB: ${d.name} — examresults indexes ===`);
    const indexes = await db.collection("examresults").indexes();
    for (const idx of indexes) {
        console.log(JSON.stringify(idx));
    }
}

await client.close();
