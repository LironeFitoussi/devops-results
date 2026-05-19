import { Router } from "express";
import { asyncHandler } from "../utils/errorHandler.js";
import StudentsController from "../controllers/studentsController.js";
import { adminOnly } from "../middleware/adminOnly.js";
import { auth0Middleware } from "../middleware/auth0Mdw.js";

const router = Router();
const studentsController = new StudentsController();

router.get(
    "/me",
    auth0Middleware,
    asyncHandler(studentsController.getCurrentStudent.bind(studentsController)),
);
router.get(
    "/",
    adminOnly,
    asyncHandler(studentsController.getStudents.bind(studentsController)),
);
router.post(
    "/",
    adminOnly,
    asyncHandler(studentsController.createStudent.bind(studentsController)),
);
router.patch(
    "/:id",
    adminOnly,
    asyncHandler(studentsController.updateStudent.bind(studentsController)),
);
router.delete(
    "/:id",
    adminOnly,
    asyncHandler(studentsController.deleteStudent.bind(studentsController)),
);

export default router;
