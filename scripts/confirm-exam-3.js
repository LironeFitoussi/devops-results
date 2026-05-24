const examId = ObjectId("6a12e42f8d90970666abc114");
const doc = db.exams
    .aggregate([
        { $match: { _id: examId } },
        {
            $project: {
                title: 1,
                type: 1,
                status: 1,
                totalPoints: 1,
                createdBy: 1,
                questionsCount: { $size: "$questions" },
                questionIds: "$questions.id",
                pointsPerQuestion: "$questions.points",
                optionCounts: {
                    $map: {
                        input: "$questions",
                        as: "q",
                        in: { id: "$$q.id", n: { $size: "$$q.options" } },
                    },
                },
            },
        },
    ])
    .toArray()[0];
print(JSON.stringify(doc));
