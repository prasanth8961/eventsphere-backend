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
const knex_1 = __importDefault(require("../Config/knex"));
const formatDateAndTime_1 = require("../Utililes/formatDateAndTime");
class ApprovalClass {
    constructor() {
        this.approveUserById = (userId, approvedBy) => __awaiter(this, void 0, void 0, function* () {
            const currentTimestamp = formatDateAndTime_1.FormatDateAndTime.getCurrentTimestamp();
            const data = yield (0, knex_1.default)("es_users").where({ _id: userId }).update({
                approvedBy: approvedBy,
                approvedAt: currentTimestamp,
                status: "active",
                denial_reason: null
            });
            console.log(data);
            return data;
        });
        this.rejectUserById = (userId, approvedBy, denialReason) => __awaiter(this, void 0, void 0, function* () {
            const currentTimestamp = formatDateAndTime_1.FormatDateAndTime.getCurrentTimestamp();
            const data = yield (0, knex_1.default)("es_users").where({ _id: userId }).update({
                approvedBy: approvedBy,
                approvedAt: currentTimestamp,
                status: "rejected",
                denial_reason: denialReason
            });
            console.log(data);
            return data;
        });
        this.approveOrRejectEvent = ({ eventId, approveIds, rejectIds, reasons, orgId, approvedBy }) => __awaiter(this, void 0, void 0, function* () {
            const currentTime = formatDateAndTime_1.FormatDateAndTime.getCurrentTimestamp();
            if ((approveIds === null || approveIds === void 0 ? void 0 : approveIds.length) > 0) {
                yield (0, knex_1.default)("subevents")
                    .where("event_id", eventId)
                    .whereIn("_id", approveIds)
                    .update({ status: "available", approvedBy: approvedBy, approvedAt: currentTime, denial_reason: null });
            }
            if ((rejectIds === null || rejectIds === void 0 ? void 0 : rejectIds.length) > 0) {
                for (let i = 0; i < rejectIds.length; i++) {
                    yield (0, knex_1.default)("subevents")
                        .where("event_id", eventId)
                        .where("_id", rejectIds[i])
                        .update({ status: "cancelled", denial_reason: reasons[i], approvedBy: approvedBy, approvedAt: currentTime });
                }
            }
            const result = yield (0, knex_1.default)("subevents")
                .select("*")
                .where("event_id", eventId).andWhere("status", "available");
            const totalProcessed = approveIds.length + rejectIds.length;
            if ((result === null || result === void 0 ? void 0 : result.length) === totalProcessed) {
                yield (0, knex_1.default)("events")
                    .where("_id", eventId)
                    .update({ status: 1, active_status: "active" });
                const organizerEventStatus = yield (0, knex_1.default)("organizations")
                    .select("*")
                    .select("pending_events", "active_events")
                    .where("_id", orgId)
                    .first();
                if (organizerEventStatus) {
                    const { pending_events, active_events } = organizerEventStatus;
                    const updatedPendingEvents = (JSON.parse(pending_events) || []).filter((eventID) => eventID !== eventId);
                    const updatedActiveEvent = JSON.parse(active_events);
                    if (!(updatedActiveEvent === null || updatedActiveEvent === void 0 ? void 0 : updatedActiveEvent.includes(eventId))) {
                        updatedActiveEvent.push(eventId);
                    }
                    yield (0, knex_1.default)("organizations")
                        .where("_id", orgId)
                        .update({
                        pending_events: JSON.stringify(updatedPendingEvents),
                        active_events: JSON.stringify(updatedActiveEvent),
                    });
                }
            }
            return true;
        });
    }
}
exports.default = ApprovalClass;
