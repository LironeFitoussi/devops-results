import { Router } from "express";
import UsersController from "../controllers/usersControllers.js";
import { asyncHandler } from "../utils/errorHandler.js";

const router = Router();
const usersController = new UsersController();

// Wrap all controller methods with asyncHandler
router.post("/", asyncHandler(usersController.createUser.bind(usersController)));
router.get("/", asyncHandler(usersController.getUsers.bind(usersController)));
router.get("/:id", asyncHandler(usersController.getUserById.bind(usersController)));
router.patch("/:id", asyncHandler(usersController.updateUser.bind(usersController)));
router.delete("/:id", asyncHandler(usersController.deleteUser.bind(usersController)));

export default router;
