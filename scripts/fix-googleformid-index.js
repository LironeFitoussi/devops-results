const before = db.exams.getIndexes().find((i) => i.name === "googleFormId_1");
print("BEFORE: " + JSON.stringify(before));

db.exams.dropIndex("googleFormId_1");
db.exams.createIndex(
    { googleFormId: 1 },
    { unique: true, sparse: true, background: true, name: "googleFormId_1" },
);

const after = db.exams.getIndexes().find((i) => i.name === "googleFormId_1");
print("AFTER: " + JSON.stringify(after));
