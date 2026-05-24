const examId = ObjectId("6a12e20a24d3b40e94abc114");
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
                lastQuestionPrompt: { $arrayElemAt: ["$questions.prompt", -1] },
            },
        },
    ])
    .toArray()[0];
print(JSON.stringify(doc));
