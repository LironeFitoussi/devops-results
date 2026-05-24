const countByType = db.exams
    .aggregate([{ $group: { _id: "$type", n: { $sum: 1 } } }])
    .toArray();
const sampleLocal = db.exams.findOne(
    { type: "local" },
    { title: 1, type: 1, googleFormId: 1 },
);
print(JSON.stringify({ countByType, sampleLocal }));
