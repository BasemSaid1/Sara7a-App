import { Router } from "express";
import * as authService from "./auth.service.js";
import { authentication } from "../../Middlewares/authentication.middleware.js";
import { TokenTypeEnum } from "../../Utils/enums/user.enum.js";
import { validation } from "../../Middlewares/validate.middleware.js";
import * as authValidation from "./auth.validation.js";

const router = Router();

router.post(
  "/signup",
  validation(authValidation.signupSchema),
  authService.signup,
);

router.patch(
  "/confirm-email",
  validation(authValidation.confirmEmailSchema),
  authService.confirmEmail,
);

router.post(
  "/login",
  validation(authValidation.loginSchema),
  authService.login,
);

router.patch(
  "/forget-password",
  validation(authValidation.forgetPasswordSchema),
  authService.forgetPassword,
);

router.patch(
  "/reset-password",
  validation(authValidation.resetPasswordSchema),
  authService.resetPassword,
);

router.post(
  "/logout",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authService.logout,
);

router.post(
  "/refresh-token",
  authentication({ tokenType: TokenTypeEnum.Refresh }),
  authService.refreshToken,
);

router.post(
  "/social-login",
  validation(authValidation.loginWithGoogleSchema),
  authService.loginWithGoogle,
);

export default router;
