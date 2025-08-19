"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadMiddleware = void 0;
const apiResponseMiddleware_1 = require("./apiResponseMiddleware");
const multer_1 = __importDefault(require("multer"));
class FileUploadMiddleware {
    constructor() {
        this.upload = (0, multer_1.default)();
    }
    middleware() {
        return (req, res, next) => {
            this.upload.any()(req, res, (err) => {
                if (err) {
                    console.error("Error parsing files:", err);
                    return apiResponseMiddleware_1.ApiResponseHandler.error(res, "File upload error: " + err.message, 500);
                }
                const files = req.files;
                if (!files || files.length === 0) {
                    return apiResponseMiddleware_1.ApiResponseHandler.error(res, "No files were uploaded. Please provide at least one file.", 400);
                }
                const MAX_FILE_SIZE = 15 * 1024 * 1024;
                const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf", "application/octet-stream"];
                const invalidFiles = files.filter((file) => file.size > MAX_FILE_SIZE || !ALLOWED_MIME_TYPES.includes(file.mimetype));
                console.log(invalidFiles);
                if (invalidFiles.length > 0) {
                    return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Some files are invalid. Ensure each file is under 15MB and of an allowed type (JPEG, PNG, PDF).", 400);
                }
                if (files.length === 1) {
                    req.body.file = {
                        fieldname: files[0].fieldname,
                        originalname: files[0].originalname,
                        encoding: files[0].encoding,
                        mimetype: files[0].mimetype,
                        size: files[0].size,
                        buffer: files[0].buffer,
                    };
                }
                else {
                    req.body.files = files.map((file) => ({
                        fieldname: file.fieldname,
                        originalname: file.originalname,
                        encoding: file.encoding,
                        mimetype: file.mimetype,
                        size: file.size,
                        buffer: file.buffer,
                    }));
                }
                next();
            });
        };
    }
}
exports.FileUploadMiddleware = FileUploadMiddleware;
