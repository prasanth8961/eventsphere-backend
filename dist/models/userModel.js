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
const userClass_1 = require("../classes/userClass");
const customError_1 = __importDefault(require("../Utililes/customError"));
const validators_1 = require("../Utililes/validators");
const passwordEncryption_1 = require("../Utililes/passwordEncryption");
const Storage_1 = require("../Services/Storage");
const mailServices_1 = __importDefault(require("../Utililes/mailServices"));
const ticketServices_1 = __importDefault(require("../Utililes/ticketServices"));
const user = new userClass_1.UserClass;
const mail = new mailServices_1.default;
const pdf = new ticketServices_1.default;
class UserModel {
    constructor() {
        this.isValidData = (data, fields) => {
            return fields.every((field) => typeof data[field] === "string" && data[field].trim() !== "");
        };
        this.getAllUsers = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { status = ["all"], limit = 10, search = "", page = 1 } = req.body;
            const offset = (page - 1) * 10;
            const { users, totalPage, totalRecords } = yield user.getUsersByRole("user", status, search, offset, limit);
            return res.status(200).json({
                status: true,
                data: {
                    users: users,
                    totalPage: totalPage,
                    totalRecords: totalRecords
                },
                message: "Users"
            });
        }));
        this.getUserById = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const userData = yield user.getUserById(Number(req.body._id));
            return res.status(200).json({
                status: true,
                data: {
                    users: userData
                },
                message: "User detail retrieved successfully"
            });
        }));
        this.getAllOrganizers = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { status = "all", limit = 10, search = "", page = 1 } = req.body;
            const offset = (page - 1) * 10;
            const { organizers, totalPage, totalRecords } = yield user.getUsersByRole("organizer", status, search, offset, limit);
            return res.status(200).json({
                status: true,
                data: {
                    organizers: organizers,
                    totalPage: totalPage,
                    totalRecords: totalRecords
                },
                message: "Organizers"
            });
        }));
        this.getOrganizerById = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const userData = yield user.getUserById(Number(req.body._id));
            return res.status(200).json({
                status: true,
                data: {
                    users: userData
                },
                message: "Organizer detail retrieved successfully"
            });
        }));
        this.getAllSquads = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { status = "all", limit = 10, search = "", page = 1 } = req.body;
            const offset = (page - 1) * 10;
            const { squads, totalPage, totalRecords } = yield user.getUsersByRole("squad", status, search, offset, limit);
            return res.status(200).json({
                status: true,
                data: {
                    squads: squads,
                    totalPage: totalPage,
                    totalRecords: totalRecords
                },
                message: "Squads"
            });
        }));
        this.getAllPendingUsers = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { status = "all", limit = 10, search = "", page = 1 } = req.body;
            const offset = (page - 1) * 10;
            const users = yield user.getUsersByRoleAndStatus("user", "pending");
            return res.status(200).json({
                status: true,
                data: users,
                message: "Users are retrieved successfully"
            });
        }));
        this.getAllPendingOrganizers = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            // const ticketPdf = await pdf.generateTicketPdf();
            // const mailData = await mail.sendMailToUser(ticketPdf);
            const { status = "all", limit = 10, search = "", page = 1 } = req.body;
            const offset = (page - 1) * 10;
            const organizers = yield user.getUsersByRoleAndStatus("organizer", "pending");
            return res.status(200).json({
                status: true,
                data: organizers,
                message: "Organizers"
            });
        }));
        this.getAllActiveUsers = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { status = "all", limit = 10, search = "", page = 1 } = req.body;
            const offset = (page - 1) * 10;
            const users = yield user.getUsersByRoleAndStatus("user", "active");
            return res.status(200).json({
                status: true,
                data: users,
                message: "Users"
            });
        }));
        this.getAllActiveOrganizers = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { status = "all", limit = 10, search = "", page = 1 } = req.body;
            const offset = (page - 1) * 10;
            const organizers = yield user.getUsersByRoleAndStatus("organizer", "active");
            return res.status(200).json({
                status: true,
                data: organizers,
                message: "Organizers"
            });
        }));
        this.getAllRejectedUsers = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { status = "all", limit = 10, search = "", page = 1 } = req.body;
            const offset = (page - 1) * 10;
            const users = yield user.getUsersByRoleAndStatus("user", "rejected");
            return res.status(200).json({
                status: true,
                data: users,
                message: "Users"
            });
        }));
        this.getAllRejectedOrganizers = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { status = "all", limit = 10, search = "", page = 1 } = req.body;
            const offset = (page - 1) * 10;
            const organizers = yield user.getUsersByRoleAndStatus("organizer", "rejected");
            return res.status(200).json({
                status: true,
                data: organizers,
                message: "Organizers"
            });
        }));
        this.getUserProfileByRoleAndId = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const userData = req.user;
            if (!(userData === null || userData === void 0 ? void 0 : userData.id) || !(userData === null || userData === void 0 ? void 0 : userData.role)) {
                return next(new customError_1.default("User id or role missing", 400));
            }
            const role = userData.role;
            const id = userData.id;
            const userResponse = yield user.getUserProfileByRoleAndId(role, id);
            console.log(userResponse);
            if (!userResponse) {
                return next(new customError_1.default("user not found", 404));
            }
            res.status(200).json({
                success: true,
                data: userResponse,
                message: "User"
            });
        }));
        this.createSquad = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            //PENDING-->  upload profile pic in firestore
            const approvedBy = req.user.id;
            if (!approvedBy) {
                return next(new customError_1.default("Approver id missing", 400));
            }
            if (!req.body.data) {
                return next(new customError_1.default("Data is missing", 401));
            }
            const files = req.files;
            if (!req.files || !files[0]) {
                return next(new customError_1.default("Image is missing", 401));
            }
            const squardData = JSON.parse(req.body.data);
            const requiredFields = [
                "name",
                "email",
                "password",
                "c_code",
                "mobile",
                "location",
            ];
            if (!this.isValidData(squardData, requiredFields)) {
                return next(new customError_1.default("All fields are required", 401));
            }
            if (!validators_1.Validators.isValidEmail(squardData.email)) {
                return next(new customError_1.default("Enter valid email", 401));
            }
            if (!validators_1.Validators.isValidMobile(squardData.mobile)) {
                return next(new customError_1.default("Enter valid mobile", 401));
            }
            if (!validators_1.Validators.isValidPassword(squardData.password)) {
                return next(new customError_1.default("Enter valid password", 401));
            }
            const isSquardExists = yield user.isUserExistsOnMobileOrEmail(squardData.email, squardData.mobile);
            console.log("squad" + isSquardExists);
            if (!isSquardExists || isSquardExists.length > 0) {
                return next(new customError_1.default("Email or Mobile already in use", 401));
            }
            const hashedPassword = yield passwordEncryption_1.PasswordEncryption.hashPassword(squardData.password);
            squardData.password = hashedPassword;
            const profileUploadedResponse = yield Storage_1.FirebaseStorage.uploadSingleImage(`USERS/PROFILE`, files[0]);
            if (profileUploadedResponse.status === false) {
                return next(new customError_1.default("failed to upload Profile . try again!"));
            }
            const updateSquard = Object.assign(Object.assign({}, squardData), { profile: profileUploadedResponse.url, approvedBy: approvedBy });
            const squard = yield user.createSquad(updateSquard);
            res.status(200).json({
                success: true,
                data: null,
                message: "Squard created"
            });
        }));
        this.createAdmin = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            if (!req.body) {
                return next(new customError_1.default("Data is missing", 401));
            }
            if (!validators_1.Validators.isValidEmail(req.body.email)) {
                return next(new customError_1.default("Enter valid email", 401));
            }
            if (!validators_1.Validators.isValidPassword(req.body.password)) {
                return next(new customError_1.default("Enter valid password", 401));
            }
            const hashedPassword = yield passwordEncryption_1.PasswordEncryption.hashPassword(req.body.password);
            const admin = yield user.createAdmin(req.body.email, hashedPassword);
            res.status(200).json({
                success: true,
                data: null,
                message: "admin created"
            });
        }));
    }
}
exports.default = UserModel;
