import { Router } from "express";
import { asyncHandler } from "../utils/errorHandler.js";
import { adminOnly } from "../middleware/adminOnly.js";
import { auth0Middleware } from "../middleware/auth0Mdw.js";
import ExamsController from "../controllers/examsController.js";

const router = Router();
const ctrl = new ExamsController();

router.get("/me", auth0Middleware, asyncHandler(ctrl.getMyExamResults.bind(ctrl)));
router.get(
    "/me/:id",
    auth0Middleware,
    asyncHandler(ctrl.getMyExamResult.bind(ctrl)),
);
router.get(
    "/local/assigned",
    auth0Middleware,
    asyncHandler(ctrl.getAssignedLocalExams.bind(ctrl)),
);
router.get(
    "/local/:id/take",
    auth0Middleware,
    asyncHandler(ctrl.startLocalExam.bind(ctrl)),
);
router.post(
    "/local/:id/submit",
    auth0Middleware,
    asyncHandler(ctrl.submitLocalExam.bind(ctrl)),
);
router.get("/", adminOnly, asyncHandler(ctrl.getExams.bind(ctrl)));
router.get(
    "/by-google-form/:formId",
    adminOnly,
    asyncHandler(ctrl.getExamByGoogleForm.bind(ctrl)),
);
router.patch(
    "/results/:resultId/grade",
    adminOnly,
    asyncHandler(ctrl.gradeLocalExamResult.bind(ctrl)),
);
router.post(
    "/results/:resultId/reopen",
    adminOnly,
    asyncHandler(ctrl.reopenLocalExamResult.bind(ctrl)),
);
router.get("/:id/results", adminOnly, asyncHandler(ctrl.getExamResults.bind(ctrl)));
router.post(
    "/import-google",
    adminOnly,
    asyncHandler(ctrl.importGoogleExam.bind(ctrl)),
);
router.post(
    "/local",
    adminOnly,
    asyncHandler(ctrl.createLocalExam.bind(ctrl)),
);
router.patch(
    "/local/:id",
    adminOnly,
    asyncHandler(ctrl.updateLocalExam.bind(ctrl)),
);
router.post(
    "/local/:id/assign",
    adminOnly,
    asyncHandler(ctrl.assignLocalExamStudents.bind(ctrl)),
);
router.post(
    "/local/:id/publish",
    adminOnly,
    asyncHandler(ctrl.publishLocalExam.bind(ctrl)),
);
router.post(
    "/local/:id/close",
    adminOnly,
    asyncHandler(ctrl.closeLocalExam.bind(ctrl)),
);
router.delete(
    "/local/:id",
    adminOnly,
    asyncHandler(ctrl.deleteLocalExam.bind(ctrl)),
);
router.post(
    "/code-review",
    adminOnly,
    asyncHandler(ctrl.createCodeReviewExam.bind(ctrl)),
);

export default router;
