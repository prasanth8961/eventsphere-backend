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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticateUserMiddleware_1 = __importDefault(require("../Middleware/authenticateUserMiddleware"));
const fileUploadMiddleware_1 = require("../Middleware/fileUploadMiddleware");
const AuthModel = __importStar(require("../Controllers/Auth/authModel"));
const fileUploadInstance = new fileUploadMiddleware_1.FileUploadMiddleware();
const CategoryModel = __importStar(require("../Controllers/Category/categoryModel"));
const router = express_1.default.Router();
const EventModel = __importStar(require("../Controllers/Event/eventModel"));
const BookingModel = __importStar(require("../Controllers/Bookings/bookingsModel"));
const userFavouriteEventModel_1 = __importDefault(require("../models/userFavouriteEventModel"));
const paymentModel_1 = __importDefault(require("../models/paymentModel"));
const eventBookingModel_1 = __importDefault(require("../models/eventBookingModel"));
const userFavouriteEvent = new userFavouriteEventModel_1.default();
const authenticate = new authenticateUserMiddleware_1.default();
const payment = new paymentModel_1.default();
const booking = new eventBookingModel_1.default();
router.get("/events/upcoming", authenticate.verifyToken, EventModel.getUpcomingEvents);
router.get("/detail", authenticate.verifyToken, authenticate.isUserFound, AuthModel.getUserNameAndLocation);
router.get("/event/categories", authenticate.verifyToken, authenticate.isUserFound, CategoryModel.getAllCategories);
router.post("/events/favourites/create", authenticate.verifyToken, authenticate.isUserHaveAccess, userFavouriteEvent.addToFavorite);
router.post("/events/favourites/delete", authenticate.verifyToken, authenticate.isUserHaveAccess, userFavouriteEvent.removeFavorite);
router.get("/events/favourites", authenticate.verifyToken, authenticate.isUserHaveAccess, userFavouriteEvent.getFavoriteEvents);
router.post("/events/search", authenticate.verifyToken, EventModel.searchEvents);
router.post("/events/by-category", authenticate.verifyToken, EventModel.getEventsByCategoryName);
router.post("/payment/order", authenticate.verifyToken, authenticate.isUserHaveAccess, payment.createOrder);
router.post("/payment/verify-payment", authenticate.verifyToken, authenticate.isUserHaveAccess, payment.verifyPayment);
router.post("/events/bookings", authenticate.verifyToken, authenticate.isUserHaveAccess, BookingModel.createBooking);
router.get("/events/bookings/active", authenticate.verifyToken, authenticate.isUserHaveAccess, booking.getUserBookedEventsActive);
router.get("/profile", authenticate.verifyToken, authenticate.isUserFound, AuthModel.getUserProfile);
router.post("/verify", authenticate.verifyToken, authenticate.isUserFound, fileUploadInstance.middleware(), AuthModel.verifyUserIdentity);
// router.post(
//   "/events/bookings/confirm",
//   authenticate.verifyToken,
//   authenticate.isUserHaveAccess,
//   BookingModel.confirmBooking
// );
router.get("/bookings/pending", authenticate.verifyToken, authenticate.isUserHaveAccess, BookingModel.getUserPendingBookings);
router.get("/bookings/canceled", authenticate.verifyToken, authenticate.isUserHaveAccess, BookingModel.getUserCancelledBookings);
router.get("/name-location", authenticate.verifyToken, authenticate.isUserFound, AuthModel.getUserNameAndLocation);
router.get("/event-categories", authenticate.verifyToken, authenticate.isUserFound, CategoryModel.getAllCategories);
router.post("/events/category", authenticate.verifyToken, EventModel.getEventsByCategoryName);
// router.get(
//   "/events/category",
//   authenticate.verifyToken,
//   authenticate.isUserFound,
//   CategoryModel.getCategoryById
// );
exports.default = router;
