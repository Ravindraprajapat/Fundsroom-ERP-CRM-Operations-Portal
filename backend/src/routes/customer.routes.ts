import { Router } from "express";
import { list, getById, create, update, remove, createFollowUp, listFollowUps, getCustomerChallansHandler } from "../controllers/customer.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { validateCreateCustomer, validateUpdateCustomer, validateFollowUp } from "../validators/customer.validator.js";

const router = Router();
router.use(authenticate);

router.get("/", authorizeRoles("ADMIN", "SALES", "ACCOUNTS"), list);
router.post("/", authorizeRoles("ADMIN", "SALES"), validate(validateCreateCustomer), create);
router.get("/:id", authorizeRoles("ADMIN", "SALES", "ACCOUNTS"), getById);
router.put("/:id", authorizeRoles("ADMIN", "SALES"), validate(validateUpdateCustomer), update);
router.delete("/:id", authorizeRoles("ADMIN", "SALES"), remove);
router.post("/:id/followups", authorizeRoles("ADMIN", "SALES"), validate(validateFollowUp), createFollowUp);
router.get("/:id/followups", authorizeRoles("ADMIN", "SALES", "ACCOUNTS"), listFollowUps);
router.get("/:id/challans", authorizeRoles("ADMIN", "SALES", "ACCOUNTS"), getCustomerChallansHandler);

export default router;
