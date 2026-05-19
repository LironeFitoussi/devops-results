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
router.get("/", adminOnly, asyncHandler(ctrl.getExams.bind(ctrl)));
router.get(
    "/by-google-form/:formId",
    adminOnly,
    asyncHandler(ctrl.getExamByGoogleForm.bind(ctrl)),
);
router.get("/:id/results", adminOnly, asyncHandler(ctrl.getExamResults.bind(ctrl)));
router.post(
    "/import-google",
    adminOnly,
    asyncHandler(ctrl.importGoogleExam.bind(ctrl)),
);

export default router;
