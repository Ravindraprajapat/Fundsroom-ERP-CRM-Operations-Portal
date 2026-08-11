import { Router } from "express";
import { exportInvoicePDF } from "../controllers/invoice.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = Router();
router.use(authenticate);

router.get("/:id/pdf", authorizeRoles("ADMIN", "SALES", "ACCOUNTS"), exportInvoicePDF);

export default router;