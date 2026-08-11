import { Router } from "express";
import { listMovementsController, stockInController, stockOutController } from "../controllers/stock.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { validateStockMovement } from "../validators/stock.validator.js";

const router = Router();
router.use(authenticate);

router.get("/movements", authorizeRoles("ADMIN", "WAREHOUSE", "ACCOUNTS"), listMovementsController);
router.post("/in", authorizeRoles("ADMIN", "WAREHOUSE"), validate(validateStockMovement), stockInController);
router.post("/out", authorizeRoles("ADMIN", "WAREHOUSE"), validate(validateStockMovement), stockOutController);

export default router;