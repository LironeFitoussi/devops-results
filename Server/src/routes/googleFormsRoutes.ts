import { asyncHandler } from "@/utils/errorHandler";
import { Router } from "express";
import GoogleFormsController from "../controllers/googleFormsController";
import { adminOnly } from "../middleware/adminOnly";

const router = Router();
const ctrl = new GoogleFormsController();

// OAuth linking. /oauth/callback is hit by Google's redirect — no adminOnly;
// it authenticates via the signed `state` instead.
router.get(
    "/oauth/start",
    adminOnly,
    asyncHandler(ctrl.connectStart.bind(ctrl)),
);
router.get("/oauth/callback", asyncHandler(ctrl.oauthCallback.bind(ctrl)));
router.get(
    "/oauth/status",
    adminOnly,
    asyncHandler(ctrl.connectStatus.bind(ctrl)),
);

router.get("/forms", adminOnly, asyncHandler(ctrl.listForms.bind(ctrl)));
router.get("/forms/:id", adminOnly, asyncHandler(ctrl.getForm.bind(ctrl)));
router.get(
    "/forms/:id/responses",
    adminOnly,
    asyncHandler(ctrl.getResponses.bind(ctrl)),
);
router.post(
    "/forms/:id/import-preview",
    adminOnly,
    asyncHandler(ctrl.importPreview.bind(ctrl)),
);

export default router;
