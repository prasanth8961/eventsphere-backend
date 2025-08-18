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
exports.BookingsClass = void 0;
const knex_1 = __importDefault(require("../../Config/knex"));
const formatDateAndTime_1 = require("../../Utililes/formatDateAndTime");
class BookingsClass {
    isBookingExist(userId, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const booking = yield (0, knex_1.default)("bookings")
                    .where({ user_id: userId, event_id: eventId })
                    .first();
                return booking
                    ? { status: true, message: "Booking already exists." }
                    : { status: false, message: "Booking does not exist." };
            }
            catch (error) {
                console.error("Error checking booking existence:", error);
                return { status: false, message: "Database error." };
            }
        });
    }
    getAmounts(subEventIds) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { total_amount } = (yield (0, knex_1.default)("subevents")
                    .whereIn("_id", subEventIds)
                    .sum({ total_amount: "ticket_price" })
                    .first()) || { total_amount: 0 };
                return { status: true, amount: total_amount };
            }
            catch (error) {
                console.error("Error calculating amounts:", error);
                return { status: false, amount: 0, message: "Database error." };
            }
        });
    }
    createBooking(bookingData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [newBookingId] = yield (0, knex_1.default)("bookings").insert(bookingData, ["_id"]);
                const newBooking = yield (0, knex_1.default)("bookings").where("_id", newBookingId);
                console.log("newBookingID : ", newBookingId);
                console.log("newBooking : ", newBooking);
                return { status: true, data: bookingData };
            }
            catch (error) {
                console.error("Error creating booking:", error);
                return { status: false, message: "Database error." };
            }
        });
    }
    getBookingByUserAndEvent(userId, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const booking = yield (0, knex_1.default)("bookings")
                    .where({ user_id: userId, event_id: eventId })
                    .first();
                return booking
                    ? { status: true, data: booking }
                    : { status: false, message: "Booking not found." };
            }
            catch (error) {
                console.error("Error fetching booking by user and event:", error);
                return { status: false, message: "Database error." };
            }
        });
    }
    updateBooking(bookingId, updatedData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updated = yield (0, knex_1.default)("bookings")
                    .where("_id", bookingId)
                    .update(updatedData, ["_id"]);
                console.log(updated);
                // if (!updated.length) {
                //   return {
                //     status: false,
                //     message: "Failed to update booking. Booking not found.",
                //   };
                // }
                // if (updated >= 0) {
                //   return {
                //     status: false,
                //     message: "Failed to update booking. Booking not found.",
                //   };
                // }
                const updatedBooking = yield (0, knex_1.default)("bookings").where("_id", bookingId).first();
                return { status: true, data: updatedBooking };
            }
            catch (error) {
                console.error("Error updating booking:", error);
                return { status: false, message: "Database error." };
            }
        });
    }
    updateUserBookingsAndEarnings(userId, eventId, bookingAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield (0, knex_1.default)("users").where("_id", userId).first();
                if (user) {
                    const currentBookings = user.bookings ? JSON.parse(user.bookings) : [];
                    if (!currentBookings.includes(eventId)) {
                        currentBookings.push(eventId);
                        yield (0, knex_1.default)("users").where("_id", userId).update({
                            bookings: JSON.stringify(currentBookings),
                        });
                    }
                }
                const event = yield (0, knex_1.default)("events").where("_id", eventId).first();
                if (!event)
                    return { status: false };
                const organizerId = event.org_id;
                const organizer = yield (0, knex_1.default)("organizations").where("_id", organizerId).first();
                if (organizer) {
                    const updatedEarnings = (organizer.total_earnings || 0) + bookingAmount;
                    yield (0, knex_1.default)("organizations").where("_id", organizerId).update({
                        total_earnings: updatedEarnings,
                    });
                }
                return { status: true };
            }
            catch (error) {
                console.error("Error updating bookings and earnings:", error);
                return {
                    status: false,
                    message: "Failed to update bookings and earnings.",
                };
            }
        });
    }
    getBookingsByStatus(userId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const bookingList = await db("bookings")
                //   .select("event_id", "sub_event_items")
                //   .where({ user_id: userId, status, is_main: 1 });
                const bookingList = yield (0, knex_1.default)("bookings")
                    .select("*")
                    .where({ user_id: userId, status });
                if (!bookingList.length) {
                    return { status: true, message: "No bookings found.", data: [] };
                }
                const eventsWithSubEvents = yield Promise.all(bookingList.map((booking) => __awaiter(this, void 0, void 0, function* () {
                    const event = yield (0, knex_1.default)("events").where("_id", booking.event_id).first();
                    if (!event)
                        return null;
                    const updatedEvents = Object.assign(Object.assign({}, event), { id: event._id });
                    delete updatedEvents._id;
                    const subEventIds = JSON.parse(booking.sub_event_items || "[]");
                    const subEvents = yield (0, knex_1.default)("subevents").whereIn("_id", subEventIds);
                    const updatedSubEvents = subEvents.map((_a) => {
                        var { _id } = _a, data = __rest(_a, ["_id"]);
                        return (Object.assign({ id: _id }, data));
                    });
                    // const updatedSubEvents:any=subEvents.map(({_id,...data}:any)=>({
                    //   id:_id,
                    //   ...data
                    // }));
                    console.log("event.org_id", event.org_id);
                    const organizerDetail1 = yield (0, knex_1.default)("users").where("_id", event.org_id);
                    console.log(organizerDetail1);
                    const organizerDetail2 = yield (0, knex_1.default)("organizations").where("_id", event.org_id);
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
                        eventData: Object.assign(Object.assign({}, updatedEvents), { sub_events: updatedSubEvents })
                    };
                })));
                console.log(eventsWithSubEvents);
                eventsWithSubEvents.forEach((data) => {
                    data.eventData.starting_date = formatDateAndTime_1.FormatDateAndTime.formatDate(data.eventData.starting_date);
                    data.eventData.ending_date = formatDateAndTime_1.FormatDateAndTime.formatDate(data.eventData.ending_date);
                    data.eventData.registration_start = formatDateAndTime_1.FormatDateAndTime.formatDate(data.eventData.registration_start);
                    data.eventData.registration_end = formatDateAndTime_1.FormatDateAndTime.formatDate(data.eventData.registration_end);
                    data.eventData.sub_event_items = JSON.parse(data.eventData.sub_event_items);
                    data.eventData.tags = JSON.parse(data.eventData.tags);
                    data.eventData.cover_images = JSON.parse(data.eventData.cover_images);
                    data.eventData.sub_event_items = JSON.parse(data.eventData.sub_event_items);
                    data.eventData.sub_events.forEach((subevent) => {
                        subevent.cover_images = JSON.parse(subevent.cover_images);
                        subevent.restrictions = JSON.parse(subevent.restrictions);
                        subevent.starting_date = formatDateAndTime_1.FormatDateAndTime.formatDate(subevent.starting_date);
                    });
                });
                //  eventsWithSubEvents.forEach((data:any)=>{
                //         data.starting_date= FormatDateAndTime.formatDate(data.starting_date);
                //         data.ending_date= FormatDateAndTime.formatDate(data.ending_date);
                //         data.registration_start= FormatDateAndTime.formatDate(data.registration_start);
                //         data.registration_end= FormatDateAndTime.formatDate(data.registration_end);
                //         data.sub_event_items=JSON.parse(data.sub_event_items)
                //         data.tags=JSON.parse(data.tags)
                //         data.cover_images=JSON.parse(data.cover_images)
                //         data.sub_event_items=JSON.parse(data.sub_event_items)
                //         data.sub_events.forEach((subevent:any)=>{
                //           subevent.cover_images=JSON.parse(subevent.cover_images)
                //           subevent.restrictions=JSON.parse(subevent.restrictions)
                //           subevent.starting_date= FormatDateAndTime.formatDate(subevent.starting_date);
                //         })
                //       })
                return {
                    status: true,
                    message: "Event data with sub-events retrieved successfully.",
                    data: eventsWithSubEvents.filter(Boolean),
                };
            }
            catch (error) {
                console.error("Error fetching bookings by status:", error);
                return {
                    status: false,
                    message: "An error occurred while fetching event data.",
                    data: [],
                };
            }
        });
    }
    getPendingBookingList(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getBookingsByStatus(userId, "pending");
        });
    }
    getBookedEventsList(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getBookingsByStatus(userId, "confirmed");
        });
    }
    getCancelledBookings(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getBookingsByStatus(userId, "cancelled");
        });
    }
}
exports.BookingsClass = BookingsClass;
