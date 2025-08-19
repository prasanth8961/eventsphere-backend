"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthModel = __importStar(require("../Controllers/Auth/authModel"));
const fileUploadMiddleware_1 = require("../Middleware/fileUploadMiddleware");
const fileUploadInstance = new fileUploadMiddleware_1.FileUploadMiddleware();
const router = (0, express_1.Router)();
router.post("/login", AuthModel.login);
router.post("/signup", AuthModel.signup);
router.post("/validate-session", AuthModel.validateSession);
router.post("/organizer/signup", fileUploadInstance.middleware(), AuthModel.organizerSignup);
exports.default = router;
// get organizer details
//router.get("/organizer",AuthenticateUser.verifyToken,AuthenticateUser.isUserFound, AuthModel.);
// get organizer details
//router.get("/organizer",AuthenticateUser.verifyToken,AuthenticateUser.isUserFound, AuthModel.);
