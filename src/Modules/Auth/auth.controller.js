import { Router } from "express";
import * as authService from "./auth.service.js";
import { authentication } from "../../Middlewares/authentication.middleware.js";
import { TokenTypeEnum } from "../../Utils/enums/user.enum.js";
import { validation } from "../../Middlewares/validate.middleware.js";
import {
  loginSchema,
  loginWithGoogleSchema,
  signupSchema,
} from "./auth.validation.js";

const router = Router();

router.post("/signup", validation(signupSchema), authService.signup);
router.post("/login", validation(loginSchema), authService.login);

router.post(
  "/refresh-token",
  authentication({ tokenType: TokenTypeEnum.Refresh }),
  authService.refreshToken,
);

router.post(
  "/social-login",
  validation(loginWithGoogleSchema),
  authService.loginWithGoogle,
);

export default router;
