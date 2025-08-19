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
const customError_1 = __importDefault(require("../Utililes/customError"));
const errorMiddleware_1 = __importDefault(require("../Middleware/errorMiddleware"));
const userFavouriteEventClass_1 = __importDefault(require("../classes/userFavouriteEventClass"));
const userFavoutiteEvent = new userFavouriteEventClass_1.default();
class UserFavouriteEventModel {
    constructor() {
        this.addToFavorite = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user || !req.user.id) {
                return next(new customError_1.default("User not authenticated. Please log in.", 401));
            }
            const { favouriteId } = req.body;
            if (!favouriteId) {
                return next(new customError_1.default("Favorite event ID is required.", 400));
            }
            const data = yield userFavoutiteEvent.addFavoriteEvent(Number(req.user.id), Number(favouriteId), next);
            return res.status(200).json({
                success: true,
                data: data,
                message: "Favorite event updated successfully."
            });
        }));
        this.removeFavorite = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user || !req.user.id) {
                return next(new customError_1.default("User not authenticated. Please log in.", 401));
            }
            const { favouriteId } = req.body;
            if (!favouriteId) {
                return next(new customError_1.default("Favorite event ID is required.", 400));
            }
            const data = yield userFavoutiteEvent.removeFavoriteEvent(Number(req.user.id), Number(favouriteId), next);
            return res.status(200).json({
                success: true,
                data: data,
                message: "Favorite event updated successfully."
            });
        }));
        this.getFavoriteEvents = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user || !req.user.id) {
                return next(new customError_1.default("User not authenticated. Please log in.", 401));
            }
            const data = yield userFavoutiteEvent.getFavoriteEventList(Number(req.user.id), next);
            return res.status(200).json({
                success: true,
                data: data,
                message: "Favorite event updated successfully."
            });
        }));
    }
}
exports.default = UserFavouriteEventModel;
