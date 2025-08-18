"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware_1 = __importDefault(require("../Middleware/errorMiddleware"));
const customError_1 = __importDefault(require("../Utililes/customError"));
const eventBookingClass_1 = __importDefault(require("../classes/eventBookingClass"));
const eventBookingClass = new eventBookingClass_1.default();
class EventBookingModel {
    constructor() {
        this.getUserBookedEventsActive = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user)
                return next(new customError_1.default("User ID is missing", 401));
            const userId = req.user.id;
            const response = yield eventBookingClass.getBookingsByStatus(userId, "confirmed");
            return res.json({
                message: "Booked events retrieved successfully",
                success: true,
                data: response
            });
        }));
    }
}
exports.default = EventBookingModel;
