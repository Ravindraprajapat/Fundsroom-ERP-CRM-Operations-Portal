import express, { type Request, type Response } from "express";
import cors from "cors";
import env from "./config/env.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/notFound.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js";
import stockRoutes from "./routes/stock.routes.js";
import challanRoutes from "./routes/challan.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";

const app = express();

const allowedOrigins = [
  env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) ||
        /\.onrender\.com$/.test(origin) ||
        /\.vercel\.app$/.test(origin) ||
        /\.netlify\.app$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy does not allow this origin."));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    name: "Fundsroom ERP-CRM Operations Portal API",
    version: "1.0.0",
    status: "online",
    health: "/api/health",
  });
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ success: true, message: "API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/challans", challanRoutes);
app.use("/api/invoices", invoiceRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
