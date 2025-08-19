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
const table_1 = require("../tables/table");
class EventClass {
    constructor() {
        this.getEventById = (eventId) => __awaiter(this, void 0, void 0, function* () {
            const mainEvent = yield (0, knex_1.default)("events")
                .select("*")
                .where("_id", "=", eventId)
                .first();
            if (mainEvent)
                return mainEvent;
            return null;
        });
        this.getEventsByStatus = (status) => __awaiter(this, void 0, void 0, function* () {
            const query = (0, knex_1.default)(table_1.tableName.EVENTS).select("*").where("status", status);
            const events = yield query;
            if (!events || events.length === 0) {
                return [];
            }
            const eventsWithSubEvents = yield Promise.all(events.map((event) => __awaiter(this, void 0, void 0, function* () {
                const subEventIds = JSON.parse(event.sub_event_items || "[]");
                const subEvents = subEventIds.length
                    ? yield (0, knex_1.default)(table_1.tableName.SUBEVENTS)
                        .whereIn("_id", subEventIds)
                        .where("event_id", event._id)
                    : [];
                const subEventsWithImages = subEvents.map((subEvent) => (Object.assign(Object.assign({}, subEvent), { restrictions: subEvent.restrictions != undefined ? JSON.parse(subEvent.restrictions) : "[]", cover_images: JSON.parse(subEvent.cover_images || "[]") })));
                const parsedEventData = Object.assign(Object.assign({}, event), { cover_images: JSON.parse(event.cover_images), tags: JSON.parse(event.tags) });
                return Object.assign(Object.assign({}, parsedEventData), { sub_events: [...subEventsWithImages] });
            })));
            return eventsWithSubEvents;
        });
        this.getEventsByStatusAndOrganizerId = (status, id) => __awaiter(this, void 0, void 0, function* () {
            const query = (0, knex_1.default)("events").select("*").where("org_id", id).andWhere("active_status", status);
            const events = yield query;
            if (!events || events.length === 0) {
                return [];
            }
            const eventsWithSubEvents = yield Promise.all(events.map((event) => __awaiter(this, void 0, void 0, function* () {
                const subEventIds = JSON.parse(event.sub_event_items || "[]");
                const subEvents = subEventIds.length
                    ? yield (0, knex_1.default)("subevents")
                        .whereIn("_id", subEventIds)
                        .where("event_id", event._id)
                    : [];
                const subEventsWithImages = subEvents.map((subEvent) => (Object.assign(Object.assign({}, subEvent), { restrictions: subEvent.restrictions != undefined ? JSON.parse(subEvent.restrictions) : "[]", cover_images: JSON.parse(subEvent.cover_images || "[]") })));
                const parsedEventData = Object.assign(Object.assign({}, event), { cover_images: JSON.parse(event.cover_images), tags: JSON.parse(event.tags) });
                return Object.assign(Object.assign({}, parsedEventData), { sub_events: Object.assign({}, subEventsWithImages) });
            })));
            return eventsWithSubEvents;
        });
        this.createEvent = (mainEventData, subEventData) => __awaiter(this, void 0, void 0, function* () {
            const [eventId] = yield (0, knex_1.default)(table_1.tableName.EVENTS)
                .insert(mainEventData);
            // .returning("_id");
            console.log(`event ID : ${eventId}`);
            let subEventIds = [];
            for (let subEvent of subEventData) {
                subEvent.event_id = eventId;
                const [sub] = yield (0, knex_1.default)(table_1.tableName.SUBEVENTS).insert(subEvent);
                subEventIds.push(sub);
            }
            const subEvent = yield (0, knex_1.default)(table_1.tableName.EVENTS)
                .where({ _id: eventId })
                .update({
                sub_event_items: JSON.stringify(subEventIds),
            });
            return eventId;
        });
        this.updateOrganizationPendingEvent = (orgId, eventId) => __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, knex_1.default)("organizations")
                .select("pending_events")
                .where("_id", orgId);
            const existingPendingEvents = result[0].pending_events || [];
            const updatedPendingEvents = [
                ...new Set([...existingPendingEvents, eventId]),
            ];
            yield (0, knex_1.default)("organizations")
                .where("_id", orgId)
                .update({ pending_events: updatedPendingEvents });
            return true;
        });
        this.searchEvents = (orgId_1, query_1, ...args_1) => __awaiter(this, [orgId_1, query_1, ...args_1], void 0, function* (orgId, query, eventType = "active_events") {
            var _a;
            const response = yield (0, knex_1.default)("es_organizations")
                .select(eventType)
                .where("_id", orgId);
            let eventsIds = [];
            if ((_a = response === null || response === void 0 ? void 0 : response[0]) === null || _a === void 0 ? void 0 : _a[eventType]) {
                try {
                    const value = response[0][eventType];
                    eventsIds = Array.isArray(value) ? value : JSON.parse(value);
                }
                catch (err) {
                    console.error("Failed to parse eventType field:", err);
                }
            }
            if (!Array.isArray(eventsIds) || eventsIds.length === 0) {
                return [];
            }
            const result = yield (0, knex_1.default)("events")
                .select("*")
                .whereIn("id", eventsIds)
                .andWhere("name", "like", `%${query}%`);
            return result;
        });
        this._isNull = (value) => {
            return value === null || value === undefined;
        };
        this.getOrganizationDashboardStats = (orgId) => __awaiter(this, void 0, void 0, function* () {
            const defaultStats = {
                activeEventsCount: 0,
                pendingEventsCount: 0,
                completedEventsCount: 0,
                bookedEventsCount: 0,
                totalEventsCount: 0,
                totalEarnings: 0,
                weeklyEvents: []
            };
            const [org] = yield (0, knex_1.default)("es_organizations").select("*").where("_id", orgId);
            if (!org) {
                console.warn(`Organization with ID ${orgId} not found.`);
                return defaultStats;
            }
            const eventData = yield (0, knex_1.default)("events").select("*").whereIn("verified_status", ["active", "pending"]);
            const activeEvents = (this._isNull(org.active_events)) ? [] : JSON.parse(org.active_events || "[]");
            const pendingEvents = (this._isNull(org.pending_events)) ? [] : JSON.parse(org.pending_events || "[]");
            const completedEvents = (this._isNull(org.completed_events)) ? [] : JSON.parse(org.completed_events || "[]");
            // const bookedEvents = JSON.parse(org.booked_events || "[]");
            const weeklyEvents = (this._isNull(eventData[0]) ? [] : eventData);
            return {
                activeEventsCount: Array.isArray(activeEvents) ? activeEvents.length : 0,
                pendingEventsCount: Array.isArray(pendingEvents) ? pendingEvents.length : 0,
                completedEventsCount: Array.isArray(completedEvents) ? completedEvents.length : 0,
                bookedEventsCount: 0,
                // Array.isArray(org.booked_events) ? org.booked_events.length : 0
                totalEventsCount: typeof org.events_counts === "number" ? org.events_counts : 0,
                totalEarnings: org.total_earnings,
                weeklyEvents: Array.isArray(weeklyEvents) ? eventData.reverse() : []
            };
        });
    }
}
exports.default = EventClass;
