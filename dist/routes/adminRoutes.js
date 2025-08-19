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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthModel = __importStar(require("../Controllers/Auth/authModel"));
const fileUploadMiddleware_1 = require("../Middleware/fileUploadMiddleware");
const userModel_1 = __importDefault(require("../models/userModel"));
const eventModel_1 = __importDefault(require("../models/eventModel"));
const approvalModel_1 = __importDefault(require("../models/approvalModel"));
const authenticateUserMiddleware_1 = __importDefault(require("../Middleware/authenticateUserMiddleware"));
const eventCategoryModel_1 = __importDefault(require("../models/eventCategoryModel"));
const router = (0, express_1.Router)();
const user = new userModel_1.default();
const event = new eventModel_1.default();
const approval = new approvalModel_1.default();
const authenticate = new authenticateUserMiddleware_1.default();
const fileUploadInstance = new fileUploadMiddleware_1.FileUploadMiddleware();
const category = new eventCategoryModel_1.default();
router.post("/login", AuthModel.adminLogin);
// router.post("/create", authenticate.verifyToken, authenticate.isAdmin, user.createAdmin);
router.post("/create", user.createAdmin);
router.post("/squard/create", authenticate.verifyToken, authenticate.isAdmin, fileUploadInstance.middleware(), user.createSquad);
router.post("/users", authenticate.verifyToken, authenticate.isAdmin, user.getAllUsers);
router.post("/users/single", authenticate.verifyToken, authenticate.isAdmin, user.getUserById);
router.post("/organizers", authenticate.verifyToken, authenticate.isAdmin, user.getAllOrganizers);
router.post("/organizer/single", authenticate.verifyToken, authenticate.isAdmin, user.getOrganizerById);
router.post("/squads", authenticate.verifyToken, authenticate.isAdmin, user.getAllSquads);
router.get("/users/active", authenticate.verifyToken, authenticate.isAdmin, user.getAllActiveUsers);
router.get("/users/pending", authenticate.verifyToken, authenticate.isAdmin, user.getAllPendingUsers);
router.get("/users/rejected", authenticate.verifyToken, authenticate.isAdmin, user.getAllRejectedUsers);
router.get("/organizers/active", authenticate.verifyToken, authenticate.isAdmin, user.getAllActiveOrganizers);
router.get("/organizers/pending", authenticate.verifyToken, authenticate.isAdmin, user.getAllPendingOrganizers);
router.get("/organizers/rejected", authenticate.verifyToken, authenticate.isAdmin, user.getAllRejectedOrganizers);
router.get("/events/active", authenticate.verifyToken, authenticate.isAdmin, event.getAllActiveEvents);
router.get("/events/pending", authenticate.verifyToken, authenticate.isAdmin, event.getAllPendingEvents);
router.get("/events/rejected", authenticate.verifyToken, authenticate.isAdmin, event.getAllRejectedEvents);
router.get("/events/completed", authenticate.verifyToken, authenticate.isAdmin, event.getAllCompletedEvents);
router.post("/user/approve", authenticate.verifyToken, authenticate.isAdmin, approval.approveUser);
router.post("/user/reject", authenticate.verifyToken, authenticate.isAdmin, approval.rejectUser);
router.post("/organizer/approve", authenticate.verifyToken, authenticate.isAdmin, approval.approveOrganizer);
router.post("/organizer/reject", authenticate.verifyToken, authenticate.isAdmin, approval.rejectOrganizer);
router.post("/event/approve-reject", authenticate.verifyToken, authenticate.isAdmin, approval.approveOrRejectEvent);
router.post("/events/create", authenticate.verifyToken, authenticate.isAdmin, fileUploadInstance.middleware(), event.createEvent);
router.post("/category/create", authenticate.verifyToken, authenticate.isAdmin, fileUploadInstance.middleware(), category.createCategory);
router.get("/categories", authenticate.verifyToken, authenticate.isAdmin, category.getAllCategories);
router.post("/category/delete", authenticate.verifyToken, authenticate.isAdmin, category.deleteCategory);
// router.post(
//   "/categories/update",
//   authenticate.verifyToken,
//   authenticate.isAdmin,
//   fileUploadInstance.middleware(),
//   CategoryModel.updateCategoryByID
// );
// router.post(
//   "/categories/delete",
//   authenticate.verifyToken,
//   authenticate.isAdmin,
//   CategoryModel.deleteCategoryByID
// );
// router.get(
//   "/categories/single",
//   authenticate.verifyToken,
//   authenticate.isAdmin,
//   CategoryModel.getCategoryById
// );
// router.get(
//   "/categories",
//   authenticate.verifyToken,
//   authenticate.isAdmin,
//   CategoryModel.getAllCategories
// );
exports.default = router;
