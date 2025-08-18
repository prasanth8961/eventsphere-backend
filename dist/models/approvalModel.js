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
const approvalClass_1 = __importDefault(require("../classes/approvalClass"));
const eventClass_1 = __importDefault(require("../classes/eventClass"));
const approval = new approvalClass_1.default();
const event = new eventClass_1.default();
class ApprovalModel {
    constructor() {
        this.approveUser = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const approvedBy = req.user.id;
            if (!approvedBy) {
                return next(new customError_1.default("Approver ID is missing", 400));
            }
            const orgId = req.body.id;
            if (!orgId) {
                return next(new customError_1.default("User ID is missing", 400));
            }
            const org = yield approval.approveUserById(orgId, approvedBy);
            if (org <= 0) {
                return next(new customError_1.default("User not found with this ID", 404));
            }
            return res.status(200).json({
                success: true,
                data: org,
                message: "User approved"
            });
        }));
        this.rejectUser = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const approvedBy = req.user.id;
            if (!approvedBy) {
                return next(new customError_1.default("Rejecter ID is missing", 400));
            }
            const userId = req.body.id;
            if (!userId) {
                return next(new customError_1.default("User ID is missing", 400));
            }
            const denialReason = req.body.reason;
            if (!denialReason)
                return next(new customError_1.default("Rejection reason is missing", 401));
            const user = yield approval.rejectUserById(userId, approvedBy, denialReason);
            if (user <= 0) {
                return next(new customError_1.default("User not found with this ID", 404));
            }
            return res.status(200).json({
                success: true,
                data: user,
                message: "User rejected"
            });
        }));
        this.approveOrganizer = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const approvedBy = req.user.id;
            if (!approvedBy) {
                return next(new customError_1.default("Approver ID is missing", 400));
            }
            const orgId = req.body.id;
            if (!orgId) {
                return next(new customError_1.default("User ID is missing", 400));
            }
            const org = yield approval.approveUserById(orgId, approvedBy);
            if (org <= 0) {
                return next(new customError_1.default("Organizer not found with this ID", 404));
            }
            return res.status(200).json({
                success: true,
                data: org,
                message: "Organizer approved"
            });
        }));
        this.rejectOrganizer = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const approvedBy = req.user.id;
            if (!approvedBy) {
                return next(new customError_1.default("Approver id missing", 400));
            }
            const orgId = req.body.id;
            if (!orgId) {
                return next(new customError_1.default("User id missing", 400));
            }
            const denialReason = req.body.reason;
            if (!denialReason)
                return next(new customError_1.default("Reason for reject is missing", 401));
            const user = yield approval.rejectUserById(orgId, approvedBy, denialReason);
            if (user <= 0) {
                return next(new customError_1.default("Organizer not found", 404));
            }
            return res.status(200).json({
                success: true,
                data: user,
                message: "Organizer rejected"
            });
        }));
        this.approveOrRejectEvent = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const approvedBy = req.user.id;
            if (!approvedBy)
                return next(new customError_1.default("Approver ID is missing", 401));
            const { data } = req.body;
            if (!data) {
                return next(new customError_1.default("Data is missing", 400));
            }
            const eventId = Number(data.eventId);
            const eventResponse = yield event.getEventById(eventId);
            if (!eventResponse) {
                return next(new customError_1.default("Event not found with this ID", 404));
            }
            const requestApproveEventIds = data.approveEventIds || [];
            const requestRejectEventIds = Object.keys(data.rejectEvents || {}).map(Number);
            const requestRejectEventReasons = Object.values(data.rejectEvents || {}).map(String);
            const totalIds = requestApproveEventIds.length + requestRejectEventIds.length;
            const orgId = eventResponse.org_id;
            if (JSON.parse(eventResponse.sub_event_items).length != totalIds) {
                return next(new customError_1.default("ID is  missing matching", 400));
            }
            const response = yield approval.approveOrRejectEvent({
                eventId,
                approveIds: requestApproveEventIds,
                rejectIds: requestRejectEventIds,
                reasons: requestRejectEventReasons,
                orgId: orgId,
                approvedBy: approvedBy
            });
            return res.status(200).json({
                success: true,
                data: null,
                message: "Event approved or rejected"
            });
        }));
    }
}
exports.default = ApprovalModel;
