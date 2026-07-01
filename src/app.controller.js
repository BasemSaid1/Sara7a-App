import { authRouter, userRouter, messageRouter } from "./Modules/index.js";
import { successResponse } from "./Utils/response/success.response.js";
import {
  globalErrorHandler,
  NotFoundException,
} from "./Utils/response/error.response.js";
import connectDB from "./DB/connection.js";
import cors from "cors";
import path from "node:path";

const bootstrap = async (app, express) => {
  app.use(express.json(), cors());
  await connectDB();

  app.use("/uploads", express.static(path.resolve("./src/uploads")));
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/messages", messageRouter);

  app.all("/*dummy", (req, res) => {
    throw NotFoundException("Route not found");
  });

  app.use(globalErrorHandler);
};

export default bootstrap;
