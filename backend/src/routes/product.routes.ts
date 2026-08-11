import { Router } from "express";
import { list, getById, create, update, remove, uploadProductImage, getProductImage } from "../controllers/product.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { validateCreateProduct, validateUpdateProduct } from "../validators/product.validator.js";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const router = Router();
router.use(authenticate);

router.get("/", authorizeRoles("ADMIN", "WAREHOUSE", "SALES", "ACCOUNTS"), list);
router.post("/", authorizeRoles("ADMIN", "WAREHOUSE"), upload.single('image'), validate(validateCreateProduct), create);
router.get('/images', getProductImage);
router.get("/:id", authorizeRoles("ADMIN", "WAREHOUSE", "SALES", "ACCOUNTS"), getById);
router.put("/:id", authorizeRoles("ADMIN", "WAREHOUSE"), validate(validateUpdateProduct), update);
router.delete('/:id', authorizeRoles('ADMIN', 'WAREHOUSE'), remove);
router.post('/:id/image', authorizeRoles('ADMIN', 'WAREHOUSE'), upload.single('image'), uploadProductImage);

export default router;