import { Router } from "express";
import { login, me } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { validateLogin } from "../validators/auth.validator.js";

const router = Router();

router.post("/login", validate(validateLogin), login);
router.get("/me", authenticate, me);

export default router;
