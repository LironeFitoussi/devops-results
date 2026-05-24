print(
    JSON.stringify({
        nullGoogleFormId: db.exams.countDocuments({ googleFormId: null }),
        missingGoogleFormId: db.exams.countDocuments({
            googleFormId: { $exists: false },
        }),
        existsGoogleFormId: db.exams.countDocuments({
            googleFormId: { $exists: true },
        }),
    }),
);
