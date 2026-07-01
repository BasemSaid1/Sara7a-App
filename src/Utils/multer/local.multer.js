// import multer from "multer";
// import path from "node:path";
// import fs from "node:fs";

// export const fileValidation = {
//   images: ["image/png", "image/jpg", "image/jpeg"],
//   videos: ["video/mp4", "video/mpeg", "video/jpeg", "video/mj2"],
//   audios: ["audio/3jpp2", "audio/acc", "audio/accp", "audio/mp3"],
//   documents: [
//     "application/pdf",
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   ],
// };

// export const localFileUpload = ({
//   customPath = "general",
//   validation = [],
// }) => {
//   let basePath = `uploads/${customPath}`;

//   const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       let userBasePath = basePath;
//       if (req.user?._id) userBasePath += `/${req.user?._id}`;
//       const fullPath = path.resolve(`./src/${userBasePath}`);

//       if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });

//       cb(null, path.resolve(fullPath));
//     },
//     filename: (req, file, cb) => {
//       const uniqueFileName =
//         Date.now() +
//         "-" +
//         Math.round(Math.random() * 1e9) +
//         "-" +
//         file.originalname;

//       file.finalPath = `${basePath}/${req.user?._id}/${uniqueFileName}`;
//       cb(null, uniqueFileName);
//     },
//   });

//   const fileFilter = (req, file, cb) => {
//     if (validation.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       return cb(new Error("Invalid file type"), false);
//     }
//   };

//   return multer({ fileFilter, storage });
// };

import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileTypeFromBuffer } from "file-type";

export const fileValidation = {
  images: ["image/png", "image/jpg", "image/jpeg"],
  videos: ["video/mp4", "video/mpeg", "video/jpeg", "video/mj2"],
  audios: ["audio/3jpp2", "audio/acc", "audio/accp", "audio/mp3"],
  documents: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

export const localFileUpload = ({
  customPath = "general",
  validation = [],
  uploadType = "single",
  fieldName = "img",
  maxCount = 5,
}) => {
  const basePath = `uploads/${customPath}`;

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let userBasePath = basePath;
      if (req.user?._id) userBasePath += `/${req.user._id}`;

      const fullPath = path.resolve(`./src/${userBasePath}`);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      cb(null, fullPath);
    },

    filename: (req, file, cb) => {
      const safeName = path.basename(file.originalname);
      const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;

      const userFolder = req.user?._id ? `${req.user._id}/` : "";
      file.finalPath = `${basePath}/${userFolder}${uniqueFileName}`;

      cb(null, uniqueFileName);
    },
  });

  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (validation.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Invalid mime type"), false);
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  return async (req, res, next) => {
    const multerMiddleware =
      uploadType === "array"
        ? upload.array(fieldName, maxCount)
        : upload.single(fieldName);

    multerMiddleware(req, res, async (err) => {
      if (err) return next(err);

      const filesToCheck = req.file ? [req.file] : req.files || [];

      if (filesToCheck.length === 0) {
        return next(new Error("File is required"));
      }

      try {
        for (const file of filesToCheck) {
          const buffer = fs.readFileSync(file.path);
          const type = await fileTypeFromBuffer(buffer);

          if (!type || !validation.includes(type.mime)) {
            fs.unlinkSync(file.path);
            return next(
              new Error(`Invalid file content for: ${file.originalname}`),
            );
          }
        }
        next();
      } catch (error) {
        filesToCheck.forEach((file) => {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
        next(error);
      }
    });
  };
};
