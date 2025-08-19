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
const apiResponseMiddleware_1 = require("./apiResponseMiddleware");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const knex_1 = __importDefault(require("../Config/knex"));
const errorMiddleware_1 = __importDefault(require("./errorMiddleware"));
const customError_1 = __importDefault(require("../Utililes/customError"));
const table_1 = require("../tables/table");
class AuthenticateUser {
    constructor() {
        // static async verifyToken(req: Request, res: Response, next: NextFunction) {
        //   try {
        //     const token = req.headers["authorization"];
        //     const isToken = token && token.split(" ")[1];
        //     if (!isToken) {
        //       return ApiResponseHandler.error(res, "Token not found", 403);
        //     }
        //     const SECRET_KEY = process.env.JWT_SECRET_KEY || "12345qwer";
        //     jwt.verify(isToken, SECRET_KEY, (error, data) => {
        //       if (error) {
        //         console.log(error)
        //         if (error.name === "TokenExpiredError") {
        //           return ApiResponseHandler.error(res, "Token expired", 401);
        //         }
        //         return ApiResponseHandler.error(res, "Invalid token", 401);
        //       }
        //       req.user = data as Iuser;
        //       next();
        //     });
        //   } catch (error: any) {
        //     console.log(error)
        //     return ApiResponseHandler.error(res, "Internal server error", 501);
        //   }
        // }
        this.verifyToken = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const token = req.headers["authorization"];
            const isToken = token && token.split(" ")[1];
            if (!isToken) {
                return next(new customError_1.default("Token not found", 403));
            }
            const SECRET_KEY = process.env.JWT_SECRET_KEY || "12345qwer";
            jsonwebtoken_1.default.verify(isToken, SECRET_KEY, (error, data) => {
                if (error) {
                    console.log(error);
                    if (error.name === "TokenExpiredError") {
                        return next(new customError_1.default("Token expired", 401));
                    }
                    return next(new customError_1.default("Invalid token", 401));
                }
                req.user = data;
                next();
            });
        }));
        this.isUserFound = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            if (!(user === null || user === void 0 ? void 0 : user.id) || !(user === null || user === void 0 ? void 0 : user.role)) {
                return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Token invalid", 401);
            }
            const isUser = yield knex_1.default.select("*").from("users").where({ _id: user.id });
            if (isUser.length <= 0) {
                return apiResponseMiddleware_1.ApiResponseHandler.error(res, "User not found", 401);
            }
            else {
                next();
            }
        }));
        this.isSquad = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            if (!(user === null || user === void 0 ? void 0 : user.id) || !(user === null || user === void 0 ? void 0 : user.role)) {
                return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Token invalid", 401);
            }
            if (user.role == "squad") {
                const isSquad = yield knex_1.default.select("*").from("users").where({ _id: user.id }).andWhere({ role: user.role });
                console.log(isSquad.length);
                if (isSquad.length <= 0) {
                    return apiResponseMiddleware_1.ApiResponseHandler.error(res, "squard not found", 401);
                }
                return next();
            }
            return next(new customError_1.default("you not have access to use this route", 401));
        }));
        this.isAdmin = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            if (!(user === null || user === void 0 ? void 0 : user.id) || !(user === null || user === void 0 ? void 0 : user.role)) {
                return next(new customError_1.default("Token Invalid", 401));
            }
            if (user.role === "admin") {
                const admin = yield knex_1.default
                    .select("*")
                    .from(table_1.tableName.ADMIN)
                    .where({ _id: user.id });
                if (admin.length <= 0) {
                    return next(new customError_1.default("Admin not found", 404));
                }
                return next();
            }
            return next(new customError_1.default("you not have access to use this route", 401));
        }));
        // static async isAdmin(req: Request, res: Response, next: NextFunction) {
        //   try {
        //     const user = req.user;
        //     if (!user?.id || !user?.role) {
        //       return ApiResponseHandler.error(res, "Token invalid", 401);
        //     }
        //     if (user.role === "admin") {
        //       const isAdmin = await db
        //         .select("*")
        //         .from("users")
        //         .where({ _id: user.id });
        //       if (isAdmin.length <= 0) {
        //         return ApiResponseHandler.error(res, "Admin not found", 401);
        //       }
        //       next();
        //     } else {
        //       return ApiResponseHandler.error(
        //         res,
        //         "you not have access to use this route",
        //         401
        //       );
        //     }
        //   } catch (error) {
        //     console.log(error)
        //     return ApiResponseHandler.error(res, "Internal server error", 501);
        //   }
        // }
        this.isOrganizerHaveAccess = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            console.log(user);
            if (!(user === null || user === void 0 ? void 0 : user.id) || !(user === null || user === void 0 ? void 0 : user.role)) {
                return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Token invalid", 401);
            }
            if (user.role === "organizer") {
                const isOrganizer = yield knex_1.default
                    .select("*")
                    .from("users")
                    .where({ _id: user.id, role: "organizer" });
                if (isOrganizer.length <= 0) {
                    return apiResponseMiddleware_1.ApiResponseHandler.error(res, "organizer not found", 401);
                }
                if (isOrganizer[0].status === "inactive") {
                    return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Organizer is verified request is pending..you are not allowed to create event", 401);
                }
                if (isOrganizer[0].status === "rejected") {
                    return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Organizer is verified request is rejected..you are not allowed to create event", 401);
                }
                next();
            }
            else {
                return apiResponseMiddleware_1.ApiResponseHandler.error(res, "you not have access to use this route", 401);
            }
        }));
        this.isUserHaveAccess = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            if (!(user === null || user === void 0 ? void 0 : user.id) || !(user === null || user === void 0 ? void 0 : user.role)) {
                return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Token invalid", 401);
            }
            // console.log(`User Id : ${user.id}`);
            // console.log(`User Role : ${user.role}`);
            if (user.role === "user") {
                const isUser = yield knex_1.default
                    .select("*")
                    .from("users")
                    .where({ _id: user.id, role: "user" });
                if (isUser.length <= 0) {
                    return apiResponseMiddleware_1.ApiResponseHandler.error(res, "user not found", 401);
                }
                // console.log(`User Status : ${isUser[0].status}`)
                if (isUser[0].status === "inactive") {
                    return apiResponseMiddleware_1.ApiResponseHandler.error(res, "user is not verified user", 401);
                }
                if (isUser[0].status === "rejected") {
                    return apiResponseMiddleware_1.ApiResponseHandler.error(res, "user is verified request is rejected..you are not allowed to create event", 401);
                }
                next();
            }
            else {
                return apiResponseMiddleware_1.ApiResponseHandler.error(res, "you not have access to use this route", 401);
            }
        }));
    }
}
exports.default = AuthenticateUser;
