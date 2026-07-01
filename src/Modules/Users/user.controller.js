import { Router } from "express";
import * as userService from "./user.service.js";
import {
  authentication,
  authorization,
} from "../../Middlewares/authentication.middleware.js";
import { RoleEnum, TokenTypeEnum } from "../../Utils/enums/user.enum.js";
import {
  fileValidation,
  localFileUpload,
} from "../../Utils/multer/local.multer.js";
import { validation } from "../../Middlewares/validate.middleware.js";
import * as userValidation from "./user.validation.js";

const router = Router();

router.get(
  "/profile",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRole: [RoleEnum.Admin, RoleEnum.User] }),
  userService.getProfile,
);

router.patch(
  "/upload-file",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRole: [RoleEnum.Admin, RoleEnum.User] }),
  localFileUpload({
    customPath: "users",
    validation: [...fileValidation.images],
    uploadType: "single",
    fieldName: "img",
  }),
  userService.updateProfilePicture,
);

router.patch(
  "/upload-cover-file",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRole: [RoleEnum.Admin, RoleEnum.User] }),
  localFileUpload({
    customPath: "users",
    validation: [...fileValidation.images],
    uploadType: "array",
    fieldName: "img",
    maxCount: 5,
  }),
  userService.updateCoverPicture,
);

router.patch(
  "/update-password",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRole: [RoleEnum.Admin, RoleEnum.User] }),
  validation(userValidation.updatePasswordSchema),
  userService.updatePassword,
);

export default router;
