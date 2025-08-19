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
const EventModel = __importStar(require("../Controllers/Event/eventModel"));
const fileUploadMiddleware_1 = require("../Middleware/fileUploadMiddleware");
const authenticateUserMiddleware_1 = __importDefault(require("../Middleware/authenticateUserMiddleware"));
const router = (0, express_1.Router)();
const authenticate = new authenticateUserMiddleware_1.default();
const fileUploadInstance = new fileUploadMiddleware_1.FileUploadMiddleware();
// const imageParserInstance = new ImageParser();
//<---- Event router----->
router.post("/create", authenticate.verifyToken, authenticate.isOrganizerHaveAccess, fileUploadInstance.middleware(), EventModel.createEvent);
router.post("/update", authenticate.verifyToken, authenticate.isOrganizerHaveAccess, fileUploadInstance.middleware(), EventModel.updateEvent);
//<---- Retrieve events------>
router.get("/pending", authenticate.verifyToken, authenticate.isOrganizerHaveAccess, EventModel.getPendingEventsById);
router.get("/completed", authenticate.verifyToken, authenticate.isOrganizerHaveAccess, EventModel.getCompletedEventsById);
router.get("/active", authenticate.verifyToken, authenticate.isOrganizerHaveAccess, EventModel.getActiveEventsById);
router.post("/geteventbystatus", authenticate.verifyToken, EventModel.getEventsByStatus);
router.get("/admin/pending", authenticate.verifyToken, authenticate.isAdmin, EventModel.getPendingEvents);
router.get("/admin/completed", authenticate.verifyToken, authenticate.isAdmin, EventModel.getCompletedEvents);
router.get("/admin/active", authenticate.verifyToken, authenticate.isAdmin, EventModel.getActiveEvents);
router.post("/search", authenticate.verifyToken, EventModel.searchEvents);
router.get("/by-category-name", authenticate.verifyToken, EventModel.getEventsByCategoryName);
router.get("/popular", authenticate.verifyToken, EventModel.getPopularEvents);
router.get("/upcoming", authenticate.verifyToken, EventModel.getUpcomingEvents);
//<---- Events decisions [aprovel/rejection] routes ------>
// router.post("/status-update" , EventModel.updateEventStatus);
exports.default = router;
