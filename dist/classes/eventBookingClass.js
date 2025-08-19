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
const knex_1 = __importDefault(require("../Config/knex"));
const formatDateAndTime_1 = require("../Utililes/formatDateAndTime");
class EventBookingClass {
    constructor() {
        this.fetchBookingDeatils = (userId, status) => __awaiter(this, void 0, void 0, function* () {
            return yield (0, knex_1.default)("bookings")
                .select("*")
                .where({ user_id: userId, status });
        });
    }
    getBookingsByStatus(userId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const bookingList = yield this.fetchBookingDeatils(userId, status);
            if (bookingList.length <= 0) {
                return [];
            }
            const eventsWithSubEvents = yield Promise.all(bookingList.map((booking) => __awaiter(this, void 0, void 0, function* () {
                const event = yield (0, knex_1.default)("events").where("_id", booking.event_id).first();
                if (!event)
                    return null;
                console.log(event);
                const updatedEvents = Object.assign(Object.assign({}, event), { id: event._id });
                delete updatedEvents._id;
                const subEventIds = JSON.parse(booking.sub_event_items || "[]");
                const subEvents = yield (0, knex_1.default)("subevents").whereIn("_id", subEventIds);
                const updatedSubEvents = subEvents.map((_a) => {
                    var { _id } = _a, data = __rest(_a, ["_id"]);
                    return (Object.assign({ id: _id }, data));
                });
                const [organizer] = yield (0, knex_1.default)("users").where("_id", event.org_id);
                const [organization] = yield (0, knex_1.default)("organizations").where("_id", event.org_id);
                return {
                    bookingData: {
                        bookingId: booking._id,
                        bookingCreatedAt: booking.createdAt,
                        isMain: booking.is_main,
                        paymentId: booking.payment_ids,
                        paymentMethod: booking.payment_method,
                        amount: booking.amount,
                        status: booking.status
                    },
                    organizerData: {
                        organizationName: organization.name,
                        organizationCode: organization.code,
                        organizationNoc: organization.noc,
                        organizerName: organizer.name,
                        organizerEmail: organizer.email,
                        organizerMobile: organizer.mobile,
                        organizerCountryCode: organizer.c_code,
                        organizerProfile: organizer.profile,
                        organizerLocation: organizer.location,
                        organizerLongitude: organizer.longitude,
                        organizerLatitude: organizer.latitude,
                    },
                    eventData: Object.assign(Object.assign({}, updatedEvents), { sub_events: updatedSubEvents })
                };
            })));
            const format = formatDateAndTime_1.FormatDateAndTime.formatDate;
            const parse = (data) => JSON.parse(data || "[]");
            eventsWithSubEvents.forEach((data) => {
                console.log(data.eventData.sub_event_items);
                data.eventData.starting_date = format(data.eventData.starting_date);
                data.eventData.ending_date = format(data.eventData.ending_date);
                data.eventData.registration_start = format(data.eventData.registration_start);
                data.eventData.registration_end = format(data.eventData.registration_end);
                data.eventData.sub_event_items = parse(data.eventData.sub_event_items);
                data.eventData.tags = parse(data.eventData.tags);
                data.eventData.cover_images = parse(data.eventData.cover_images);
                data.eventData.sub_events.forEach((subevent) => {
                    subevent.cover_images = parse(subevent.cover_images);
                    subevent.restrictions = parse(subevent.restrictions);
                    subevent.starting_date = format(subevent.starting_date);
                });
            });
            return eventsWithSubEvents.filter(Boolean);
        });
    }
}
exports.default = EventBookingClass;
