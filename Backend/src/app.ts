import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import helmet from "helmet";
import morgan from "morgan";
import logger from "./utils/logger.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import fs from "fs";
import path from "path";
import authRouter from "./modules/auth/auth.router.js";
import "dotenv/config";
import formationsRouter from "./modules/formations/formations.router.js";
import sessionsRouter from "./modules/sessions/sessions.router.js";
import candidatesRouter from "./modules/candidates/candidates.router.js";
import usersRouter from "./modules/users/users.router.js";
import { roomsRouter } from "./modules/rooms/rooms.router.js";
const openApiPath = path.join(process.cwd(), "src/docs/openapi.yaml");
const openApiFile = fs.readFileSync(openApiPath, "utf8");
const openApiSpec = YAML.parse(openApiFile);

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(
  morgan("combined", {
    stream: { write: (message: string) => logger.info(message.trim()) },
  }),
);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/formations", formationsRouter);
app.use("/api/v1/sessions", sessionsRouter);
app.use("/api/v1/candidates", candidatesRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/rooms", roomsRouter);
app.use(errorHandler);

export default app;
