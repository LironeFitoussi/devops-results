import { MongoClient } from "mongodb";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const resultId = process.argv[2];
if (!resultId) {
    console.error("Usage: node check-result.mjs <resultId>");
    process.exit(1);
}

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

    const { ObjectId } = await import("mongodb");
    const doc = await db.collection("examresults").findOne({ _id: new ObjectId(resultId) });
    if (!doc) {
        console.log(`No result in db ${d.name}`);
        continue;
    }
    console.log(`=== examresults @ ${d.name} ===`);
    console.log(JSON.stringify(doc, null, 2));
}

await client.close();
