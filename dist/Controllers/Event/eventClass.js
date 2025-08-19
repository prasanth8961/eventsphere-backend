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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventClass = void 0;
const knex_1 = __importDefault(require("../../Config/knex"));
const formatDateAndTime_1 = require("../../Utililes/formatDateAndTime");
const table_1 = require("../../tables/table");
class EventClass {
    constructor() {
        this.createEvent = (mainEventData, subEventData) => __awaiter(this, void 0, void 0, function* () {
            try {
                const [eventId] = yield (0, knex_1.default)(table_1.tableName.EVENTS)
                    .insert(mainEventData)
                    .returning("_id");
                let subEventIds = [];
                for (let subEvent of subEventData) {
                    subEvent.event_id = eventId;
                    const [sub] = yield (0, knex_1.default)(table_1.tableName.SUBEVENTS).insert(subEvent);
                    subEventIds.push(sub);
                }
                console.log(subEventIds);
                const subEvent = yield (0, knex_1.default)(table_1.tableName.EVENTS)
                    .where({ _id: eventId })
                    .update({
                    sub_event_items: JSON.stringify(subEventIds),
                });
                return { status: true, data: eventId };
            }
            catch (error) {
                console.error("Error creating event:", error);
                return { status: false, data: null };
            }
        });
        this.createSubEventById = (eventId, subEventData) => __awaiter(this, void 0, void 0, function* () {
            try {
                const [newId] = yield (0, knex_1.default)(table_1.tableName.SUBEVENTS).insert(Object.assign(Object.assign({}, subEventData), { event_id: eventId }));
                return newId ? { status: true, data: newId } : { status: false };
            }
            catch (error) {
                console.error("Error creating sub-event:", error);
                return { status: false, message: "An error occurred." };
            }
        });
        this.updateEvent = (eventId, updatedMainEventData, updatedSubEvents, subEventIdsToDelete, existingSubEventIds, newSubEventIds) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield knex_1.default.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                    yield trx("events")
                        .update(updatedMainEventData)
                        .where("_id", "=", eventId);
                    for (let subEvent of updatedSubEvents) {
                        const existingSubEvent = yield trx(table_1.tableName.SUBEVENTS)
                            .select("*")
                            .where("_id", subEvent._id)
                            .first();
                        existingSubEvent
                            ? yield trx("subevents").update(subEvent).where("_id", subEvent._id)
                            : yield trx("subevents").insert(subEvent);
                    }
                    for (let subEventId of subEventIdsToDelete) {
                        yield trx("subevents").where("_id", "=", subEventId).del();
                    }
                    const allSubEventIds = [
                        ...existingSubEventIds.filter((id) => !subEventIdsToDelete.includes(id)),
                        ...newSubEventIds,
                    ];
                    yield trx("events")
                        .update({ sub_event_items: JSON.stringify(allSubEventIds) })
                        .where("_id", "=", eventId);
                }));
                return { status: true };
            }
            catch (error) {
                console.error("Error updating event:", error);
                return { status: false };
            }
        });
        this.getEventById = (eventId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const mainEvent = yield (0, knex_1.default)("events")
                    .select("*")
                    .where("_id", "=", eventId)
                    .first();
                // console.log(mainEvent)
                return mainEvent ? { status: true, data: mainEvent } : { status: false };
            }
            catch (error) {
                console.error("Error fetching event:", error);
                return { status: false, message: "An error occurred." };
            }
        });
        this.getPendingEventList = (userId) => __awaiter(this, void 0, void 0, function* () {
            return this.getEventsByStatus("pending", userId);
        });
        this.getAllPendingEventList = () => __awaiter(this, void 0, void 0, function* () {
            return this.getEventsByStatus("pending");
        });
        this.getAllCompletedEventList = () => __awaiter(this, void 0, void 0, function* () {
            return this.getEventsByStatus("completed");
        });
        this.getCompletedEventList = (orgId) => __awaiter(this, void 0, void 0, function* () {
            return this.getEventsByStatus("completed", orgId);
        });
        this.getActiveEventList = (userId) => __awaiter(this, void 0, void 0, function* () {
            return this.getEventsByStatus("active", userId);
        });
        this.getAllActiveEventList = () => __awaiter(this, void 0, void 0, function* () {
            return this.getEventsByStatus("active");
        });
        this.getRejectedEventList = (userId) => __awaiter(this, void 0, void 0, function* () {
            return this.getEventsByStatus("rejected", userId);
        });
        this.getAllRejectedEventList = () => __awaiter(this, void 0, void 0, function* () {
            return this.getEventsByStatus("rejected");
        });
        this.getEventsByStatus = (status, orgId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const query = (0, knex_1.default)(table_1.tableName.EVENTS).select("*").where("active_status", status);
                if (orgId) {
                    query.andWhere("org_id", orgId);
                }
                const events = yield query;
                if (!events || events.length === 0) {
                    return { status: false, data: [] };
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
                    return Object.assign(Object.assign({}, parsedEventData), { sub_events: Object.assign({}, subEventsWithImages) });
                })));
                return {
                    status: true,
                    data: eventsWithSubEvents,
                };
            }
            catch (error) {
                console.error(`Error fetching ${status} events:`, error);
                return {
                    status: false,
                    data: [],
                };
            }
        });
        this.getEvents = (status) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Status filter:", status);
                const events = status.includes("all")
                    ? yield (0, knex_1.default)(table_1.tableName.EVENTS).select("*")
                    : yield (0, knex_1.default)(table_1.tableName.EVENTS).select("*").whereIn("active_status", status);
                console.log(events.length);
                if (events.length === 0) {
                    return {
                        status: false,
                        data: [],
                    };
                }
                const eventsWithSubEvents = yield Promise.all(events.map((event) => __awaiter(this, void 0, void 0, function* () {
                    let subEventIds = [];
                    try {
                        subEventIds = JSON.parse(event.sub_event_items || "[]");
                    }
                    catch (parseError) {
                        console.warn("Failed to parse sub_event_items:", parseError);
                    }
                    const subEvents = subEventIds.length
                        ? yield (0, knex_1.default)(table_1.tableName.SUBEVENTS).whereIn("_id", subEventIds)
                        : [];
                    return Object.assign(Object.assign({}, event), { sub_events: subEvents });
                })));
                return {
                    status: true,
                    data: eventsWithSubEvents,
                };
            }
            catch (error) {
                console.error("Error fetching events:", error);
                return {
                    status: false,
                    data: [],
                };
            }
        });
        this.getAllEventList = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const events = yield (0, knex_1.default)(table_1.tableName.EVENTS).select("*");
                if (!events || events.length === 0) {
                    return {
                        status: false,
                        data: [],
                    };
                }
                const eventsWithSubEvents = yield Promise.all(events.map((event) => __awaiter(this, void 0, void 0, function* () {
                    const subEventIds = JSON.parse(event.sub_event_items || "[]");
                    const subEvents = subEventIds.length
                        ? yield (0, knex_1.default)(table_1.tableName.SUBEVENTS).whereIn("_id", subEventIds)
                        : [];
                    return Object.assign(Object.assign({}, event), { sub_events: subEvents });
                })));
                return {
                    status: true,
                    data: eventsWithSubEvents,
                };
            }
            catch (error) {
                console.error("Error fetching all events:", error);
                return {
                    status: false,
                    data: [],
                };
            }
        });
        this.getAllEventsById = (userId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const events = yield (0, knex_1.default)("events").where("org_id", userId).select("*");
                console.log(events);
                if (!events || events.length === 0) {
                    return {
                        status: false,
                        data: [],
                    };
                }
                const eventsWithSubEvents = yield Promise.all(events.map((event) => __awaiter(this, void 0, void 0, function* () {
                    const subEventIds = JSON.parse(event.sub_event_items || "[]");
                    const subEvents = subEventIds.length
                        ? yield (0, knex_1.default)("subevents").whereIn("_id", subEventIds)
                        : [];
                    return Object.assign(Object.assign({}, event), { sub_events: subEvents });
                })));
                return {
                    status: true,
                    data: eventsWithSubEvents,
                };
            }
            catch (error) {
                console.error(`Error fetching events for user ID: ${userId}:`, error);
                return {
                    status: false,
                    data: [],
                };
            }
        });
        this.updateOrganizationPendingEvent = (orgId, eventId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield (0, knex_1.default)("organizations")
                    .select("pending_events")
                    .where("_id", orgId);
                if (result.length === 0) {
                    return { status: false };
                }
                const existingPendingEvents = result[0].pending_events || [];
                const updatedPendingEvents = [
                    ...new Set([...existingPendingEvents, eventId]),
                ];
                yield (0, knex_1.default)("organizations")
                    .where("_id", orgId)
                    .update({ pending_events: updatedPendingEvents });
                return { status: true };
            }
            catch (error) {
                console.error("Error updating pending events:", error);
                return { status: false };
            }
        });
        this.updateOrganizationEventCounts = (orgId, amount, currentEvents) => __awaiter(this, void 0, void 0, function* () {
            try {
                const [{ events_counts, pending_events, total_earnings }] = yield knex_1.default
                    .select("events_counts", "pending_events", "total_earnings")
                    .from("organizations")
                    .where("_id", orgId);
                const totalCount = Number(events_counts) + 1;
                const totalEarnings = total_earnings + amount;
                const updatedPendingEvents = pending_events.filter((event) => !currentEvents.includes(event));
                yield (0, knex_1.default)("organizations")
                    .where("_id", orgId)
                    .update({
                    events_counts: totalCount,
                    pending_events: JSON.stringify(updatedPendingEvents),
                    total_earnings: totalEarnings,
                });
                return { status: true, data: { totalCount, updatedPendingEvents } };
            }
            catch (error) {
                console.error("Error updating organization event counts:", error);
                return { status: false, data: null };
            }
        });
        // New York, USA
        this.searchEventList = (_a) => __awaiter(this, [_a], void 0, function* ({ queryText, tempLocation, tempCategory, }) {
            try {
                console.log(queryText);
                console.log(tempLocation);
                console.log(tempCategory);
                if (!queryText && Array.isArray(tempLocation) && tempLocation.length <= 0 && Array.isArray(tempCategory) && tempCategory.length <= 0) {
                    return {
                        status: true,
                        data: [],
                    };
                }
                const query = (0, knex_1.default)("events").select("*")
                    .where("name", "like", `%${queryText}%`);
                //   .andWhere("location", "in", Array.isArray(tempLocation)?tempLocation : [])
                //  .andWhere("category", "in", Array.isArray(tempCategory)?tempCategory : []);
                if (Array.isArray(tempLocation) && tempLocation.length > 0) {
                    query.andWhere("location", "in", tempLocation);
                }
                if (Array.isArray(tempCategory) && tempCategory.length > 0) {
                    query.andWhere("category", "in", tempCategory);
                }
                // const query = db("events").select("*");
                // if (queryText) query.where("name", "like", `%${queryText}%`);
                // if (tempLocation!.length > 0) query.andWhere("location", "in", tempLocation)
                // if (tempCategory) query.andWhere("category", "in", tempCategory);
                const mainEvents = yield query;
                const updatedEvents = mainEvents.map((_a) => {
                    var { _id } = _a, data = __rest(_a, ["_id"]);
                    return (Object.assign({ id: _id }, data));
                });
                const eventsWithSubEvents = yield Promise.all(updatedEvents.map((event) => __awaiter(this, void 0, void 0, function* () {
                    console.log("eeeeeeeeeee" + event.sub_event_items);
                    const subEventIds = JSON.parse(event.sub_event_items || "[]");
                    const subEvents = subEventIds.length
                        ? yield (0, knex_1.default)("subevents").select("*").whereIn("_id", subEventIds)
                        : [];
                    const updatedSubEvents = subEvents.map((_a) => {
                        var { _id } = _a, data = __rest(_a, ["_id"]);
                        return (Object.assign({ id: _id }, data));
                    });
                    const organizerDetail1 = yield (0, knex_1.default)("users").where("_id", event.org_id);
                    const organizerDetail2 = yield (0, knex_1.default)("organizations").where("_id", event.org_id);
                    return {
                        organizerData: {
                            organizationName: organizerDetail2[0].name,
                            organizationCode: organizerDetail2[0].code,
                            organizationNoc: organizerDetail2[0].noc,
                            organizerName: organizerDetail1[0].name,
                            organizerEmail: organizerDetail1[0].name,
                            organizerMobile: organizerDetail1[0].name,
                            organizerCountryCode: organizerDetail1[0].name,
                            organizerProfile: organizerDetail1[0].profile,
                            organizerLocation: organizerDetail1[0].location,
                            organizerLongitude: organizerDetail1[0].name,
                            organizerLatitude: organizerDetail1[0].name,
                        },
                        eventData: Object.assign(Object.assign({}, event), { sub_events: updatedSubEvents })
                    };
                })));
                eventsWithSubEvents.forEach(data => {
                    console.log("hhhhhhhh", data.eventData.sub_event_items);
                    data.eventData.starting_date = formatDateAndTime_1.FormatDateAndTime.formatDate(data.eventData.starting_date);
                    data.eventData.ending_date = formatDateAndTime_1.FormatDateAndTime.formatDate(data.eventData.ending_date);
                    data.eventData.registration_start = formatDateAndTime_1.FormatDateAndTime.formatDate(data.eventData.registration_start);
                    data.eventData.registration_end = formatDateAndTime_1.FormatDateAndTime.formatDate(data.eventData.registration_end);
                    data.eventData.sub_event_items = JSON.parse(data.eventData.sub_event_items);
                    if (!Array.isArray(data.eventData.sub_event_items)) {
                        console.log("--------------");
                        data.eventData.sub_event_items = [data.eventData.sub_event_items];
                    }
                    console.log("Parsed:", data.eventData.sub_event_items, "Type:", typeof data.eventData.sub_event_items);
                    console.log("hhhhhhhh", data.eventData.sub_event_items);
                    data.eventData.tags = JSON.parse(data.eventData.tags);
                    data.eventData.cover_images = JSON.parse(data.eventData.cover_images);
                    data.eventData.sub_events.forEach((subevent) => {
                        subevent.cover_images = JSON.parse(subevent.cover_images);
                        subevent.restrictions = JSON.parse(subevent.restrictions);
                        subevent.starting_date = formatDateAndTime_1.FormatDateAndTime.formatDate(subevent.starting_date);
                    });
                });
                console.log("VEVET", eventsWithSubEvents[0].eventData.sub_event_items);
                return {
                    status: true,
                    data: eventsWithSubEvents,
                };
            }
            catch (error) {
                console.error("Error searching events:", error);
                return { status: false, message: "An error occurred.", data: [] };
            }
        });
        // searchEventsByStatus = async ({
        //   queryText,
        //   status,
        // }: {
        //   queryText?: string;
        //   status?: string;
        // }): Promise<any> => {
        //   return this.searchEventList({ queryText, category: status });
        // };
        this.getPopularEventList = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const popularEvents = yield (0, knex_1.default)("bookings")
                    .select("event_id")
                    .count("* as bookings_count")
                    .groupBy("event_id")
                    .orderBy("bookings_count", "desc")
                    .limit(10);
                const eventDetails = yield Promise.all(popularEvents.map((event) => __awaiter(this, void 0, void 0, function* () {
                    const eventData = yield (0, knex_1.default)("events")
                        .where("_id", event.event_id)
                        .first();
                    if (eventData) {
                        const subEventIds = JSON.parse(eventData.sub_event_items || "[]");
                        const subEvents = subEventIds.length
                            ? yield (0, knex_1.default)("subevents").whereIn("_id", subEventIds)
                            : [];
                        return Object.assign(Object.assign({}, eventData), { bookings_count: event.bookings_count, sub_events: subEvents });
                    }
                    return null;
                })));
                return {
                    status: true,
                    data: eventDetails.filter(Boolean),
                };
            }
            catch (error) {
                console.error("Error fetching popular events:", error);
                return { status: false, message: "An error occurred.", data: [] };
            }
        });
        this.getUpcomingEventList = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const upcomingEvents = yield (0, knex_1.default)("events")
                    .select("*");
                // .where("starting_date", ">", new Date())
                // .orderBy("starting_date", "asc");
                const updatedUpcomingEvents = upcomingEvents.map((_a) => {
                    var { _id } = _a, data = __rest(_a, ["_id"]);
                    return (Object.assign({ id: _id }, data));
                });
                const eventsWithSubEvents = yield Promise.all(updatedUpcomingEvents.map((event) => __awaiter(this, void 0, void 0, function* () {
                    const subEventIds = JSON.parse(event.sub_event_items || "[]");
                    const subEvents = subEventIds.length
                        ? yield (0, knex_1.default)("subevents").whereIn("_id", subEventIds)
                        : [];
                    const updatedSubEvents = subEvents.map((_a) => {
                        var { _id } = _a, data = __rest(_a, ["_id"]);
                        return (Object.assign({ id: _id }, data));
                    });
                    ;
                    const organizerDetail1 = yield (0, knex_1.default)("users").where("_id", event.org_id);
                    const organizerDetail2 = yield (0, knex_1.default)("organizations").where("_id", event.org_id);
                    return {
                        organizerData: {
                            organizationName: organizerDetail2[0].name,
                            organizationCode: organizerDetail2[0].code,
                            organizationNoc: organizerDetail2[0].noc,
                            organizerName: organizerDetail1[0].name,
                            organizerEmail: organizerDetail1[0].name,
                            organizerMobile: organizerDetail1[0].name,
                            organizerCountryCode: organizerDetail1[0].name,
                            organizerProfile: organizerDetail1[0].profile,
                            organizerLocation: organizerDetail1[0].location,
                            organizerLongitude: organizerDetail1[0].name,
                            organizerLatitude: organizerDetail1[0].name,
                        },
                        eventData: Object.assign(Object.assign({}, event), { sub_events: updatedSubEvents })
                    };
                })));
                eventsWithSubEvents.forEach(data => {
                    console.log(data.eventData.starting_date);
                    data.eventData.starting_date = formatDateAndTime_1.FormatDateAndTime.formatDate(data.eventData.starting_date);
                    console.log(data.eventData.starting_date);
                    data.eventData.ending_date = formatDateAndTime_1.FormatDateAndTime.formatDate(data.eventData.ending_date);
                    data.eventData.registration_start = formatDateAndTime_1.FormatDateAndTime.formatDate(data.eventData.registration_start);
                    data.eventData.registration_end = formatDateAndTime_1.FormatDateAndTime.formatDate(data.eventData.registration_end);
                    data.eventData.sub_event_items = JSON.parse(data.eventData.sub_event_items);
                    data.eventData.tags = JSON.parse(data.eventData.tags);
                    data.eventData.cover_images = JSON.parse(data.eventData.cover_images);
                    data.eventData.sub_events.forEach((subevent) => {
                        subevent.cover_images = JSON.parse(subevent.cover_images);
                        subevent.restrictions = JSON.parse(subevent.restrictions);
                        subevent.starting_date = formatDateAndTime_1.FormatDateAndTime.formatDate(subevent.starting_date);
                    });
                });
                console.log(eventsWithSubEvents[0].eventData);
                return {
                    status: true,
                    data: eventsWithSubEvents,
                };
            }
            catch (error) {
                console.error("Error fetching upcoming events:", error);
                return { status: false, message: "An error occurred.", data: [] };
            }
        });
        this.updateEventStatus = (_a) => __awaiter(this, [_a], void 0, function* ({ eventId, approveIds, rejectIds, reasons, orgId }) {
            try {
                if ((approveIds === null || approveIds === void 0 ? void 0 : approveIds.length) > 0) {
                    yield (0, knex_1.default)("subevents")
                        .where("event_id", eventId)
                        .whereIn("_id", approveIds)
                        .update({ status: "available" });
                }
                if ((rejectIds === null || rejectIds === void 0 ? void 0 : rejectIds.length) > 0) {
                    for (let i = 0; i < rejectIds.length; i++) {
                        yield (0, knex_1.default)("subevents")
                            .where("event_id", eventId)
                            .where("_id", rejectIds[i])
                            .update({ status: "cancelled", denial_reason: reasons[i] });
                    }
                }
                const result = yield (0, knex_1.default)("subevents")
                    .select("*")
                    // .count("_id as count")
                    .where("event_id", eventId).andWhere("status", "available");
                console.log("status count" + result.length);
                const totalProcessed = approveIds.length + rejectIds.length;
                if ((result === null || result === void 0 ? void 0 : result.length) === totalProcessed) {
                    yield (0, knex_1.default)("events")
                        .where("_id", eventId)
                        .update({ status: 1, active_status: "active" });
                    console.log("orgid" + orgId);
                    const organizerEventStatus = yield (0, knex_1.default)("organizations")
                        .select("*")
                        .select("pending_events", "active_events")
                        .where("_id", orgId)
                        .first();
                    console.log(organizerEventStatus);
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
                    return { status: true };
                }
                return { status: true };
                // return { status: false };
            }
            catch (error) {
                console.error("Error updating event status:", error);
                return {
                    status: false,
                    message: "An error occurred while updating event status.",
                };
            }
        });
        this.getEventsByCategoryName = (categoryName) => __awaiter(this, void 0, void 0, function* () {
            try {
                const eventsByCategory = yield (0, knex_1.default)("events")
                    .select("*")
                    .where("category", categoryName);
                if (!eventsByCategory || eventsByCategory.length === 0) {
                    return {
                        status: true,
                        data: [],
                    };
                }
                const eventsWithSubEvents = yield Promise.all(eventsByCategory.map((event) => __awaiter(this, void 0, void 0, function* () {
                    const subEventIds = JSON.parse(event.sub_event_items || "[]");
                    const subEvents = subEventIds.length
                        ? yield (0, knex_1.default)("subevents").whereIn("_id", subEventIds)
                        : [];
                    const organizerDetail1 = yield (0, knex_1.default)("users").where("_id", event.org_id);
                    console.log(organizerDetail1);
                    const organizerDetail2 = yield (0, knex_1.default)("organizations").where("_id", event.org_id);
                    return {
                        organizerData: {
                            organizationName: organizerDetail2[0].name,
                            organizationCode: organizerDetail2[0].code,
                            organizationNoc: organizerDetail2[0].noc,
                            organizerName: organizerDetail1[0].name,
                            organizerEmail: organizerDetail1[0].name,
                            organizerMobile: organizerDetail1[0].name,
                            organizerCountryCode: organizerDetail1[0].name,
                            organizerProfile: organizerDetail1[0].profile,
                            organizerLocation: organizerDetail1[0].location,
                            organizerLongitude: organizerDetail1[0].name,
                            organizerLatitude: organizerDetail1[0].name,
                        },
                        eventData: Object.assign(Object.assign({}, event), { sub_events: subEvents })
                    };
                })));
                eventsWithSubEvents.forEach(data => {
                    data.eventData.starting_date = formatDateAndTime_1.FormatDateAndTime.formatDate(data.eventData.starting_date);
                    data.eventData.ending_date = formatDateAndTime_1.FormatDateAndTime.formatDate(data.eventData.ending_date);
                    data.eventData.registration_start = formatDateAndTime_1.FormatDateAndTime.formatDate(data.eventData.registration_start);
                    data.eventData.registration_end = formatDateAndTime_1.FormatDateAndTime.formatDate(data.eventData.registration_end);
                    data.eventData.sub_event_items = JSON.parse(data.eventData.sub_event_items);
                    data.eventData.tags = JSON.parse(data.eventData.tags);
                    data.eventData.cover_images = JSON.parse(data.eventData.cover_images);
                    data.eventData.sub_events.forEach((subevent) => {
                        subevent.cover_images = JSON.parse(subevent.cover_images);
                        subevent.restrictions = JSON.parse(subevent.restrictions);
                        subevent.starting_date = formatDateAndTime_1.FormatDateAndTime.formatDate(subevent.starting_date);
                    });
                });
                return {
                    status: true,
                    data: eventsWithSubEvents,
                };
            }
            catch (error) {
                console.error("Error fetching events by category:", error);
                return {
                    status: false,
                    data: [],
                };
            }
        });
    }
}
exports.EventClass = EventClass;
