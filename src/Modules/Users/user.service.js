import jwt from "jsonwebtoken";
import { successResponse } from "../../Utils/response/success.response.js";
import { decrypt } from "../../Utils/security/encryption.security.js";

export const getProfile = async (req, res) => {
  const { user } = req;

  if (user.phone) req.user.phone = decrypt(user.phone);

  successResponse({
    res,
    message: "data fetched successfully",
    statusCode: 200,
    data: { user },
  });
};
