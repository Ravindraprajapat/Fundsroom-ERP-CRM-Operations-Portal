import { Router } from "express";
import { list, getById, create, confirm, cancel, markPaid, update } from "../controllers/challan.controller.js";
import { exportChallanPDF } from "../controllers/challanPdf.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { validateCreateChallan } from "../validators/challan.validator.js";

const router = Router();
router.use(authenticate);

router.get("/", authorizeRoles("ADMIN", "SALES", "ACCOUNTS"), list);
router.post("/", authorizeRoles("ADMIN", "SALES"), validate(validateCreateChallan), create);
router.get("/:id", authorizeRoles("ADMIN", "SALES", "ACCOUNTS"), getById);
router.put("/:id", authorizeRoles("ADMIN", "SALES"), validate(validateCreateChallan), update);
router.patch("/:id/confirm", authorizeRoles("ADMIN", "SALES"), confirm);
router.patch("/:id/cancel", authorizeRoles("ADMIN", "SALES"), cancel);
router.patch("/:id/paid", authorizeRoles("ADMIN", "SALES", "ACCOUNTS"), markPaid);
router.get("/:id/pdf", authorizeRoles("ADMIN", "SALES", "ACCOUNTS"), exportChallanPDF);

export default router;