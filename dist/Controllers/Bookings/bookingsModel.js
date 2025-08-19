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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCancelledBookings = exports.getUserBookedEvents = exports.getUserPendingBookings = exports.createBooking = void 0;
const apiResponseMiddleware_1 = require("../../Middleware/apiResponseMiddleware");
const eventClass_1 = require("../Event/eventClass");
const bookingsClass_1 = require("./bookingsClass");
const messages_1 = require("../../Common/messages");
// Global instances
const eventInstance = new eventClass_1.EventClass();
const bookingInstance = new bookingsClass_1.BookingsClass();
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.body.data) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.VALIDATION_ERROR, 400);
        }
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.AUTH_ERROR, 401);
        }
        const { eventId, subEventItems, isMain, paymentMethod, paymentId } = req.body.data;
        if (!eventId) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.MISMATCHED_IDS, 400);
        }
        if (!Array.isArray(subEventItems) || subEventItems.length === 0) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Sub-events are required for bookings", 400);
        }
        console.log("111111");
        const eventResponse = yield eventInstance.getEventById(eventId);
        if (!eventResponse.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.EVENT_NOT_FOUND, 404);
        }
        console.log("111111");
        const userId = Number(req.user.id);
        const bookingExistResponse = yield bookingInstance.isBookingExist(userId, eventId);
        console.log("111111");
        if (bookingExistResponse.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.BOOKING_EXISTS, 409);
        }
        const bookingId = Date.now() + Math.floor(Math.random() * 1000);
        const amountResponse = yield bookingInstance.getAmounts(subEventItems);
        const bookingAmount = Number(amountResponse.amount);
        const bookingData = {
            _id: bookingId,
            event_id: eventId,
            sub_event_items: JSON.stringify(subEventItems),
            user_id: userId,
            amount: bookingAmount,
            is_main: isMain,
            payment_method: paymentMethod,
            payment_ids: paymentId,
            status: "confirmed",
        };
        const bookingResponse = yield bookingInstance.createBooking(bookingData);
        if (!bookingResponse.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.BOOKING_FAILED, 500);
        }
        yield bookingInstance.updateUserBookingsAndEarnings(userId, bookingId, 0);
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, bookingResponse.data, "Booked successfully", 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.SERVER_ERROR, 500);
    }
});
exports.createBooking = createBooking;
// export const confirmBooking = async (req: Request | any, res: Response) => {
//   try {
//     if (!req.body.data) {
//       return ApiResponseHandler.error(res, COMMON_MESSAGES.VALIDATION_ERROR, 400);
//     }
//     if (!req.user?.id) {
//       return ApiResponseHandler.error(res, COMMON_MESSAGES.AUTH_ERROR, 401);
//     }
//     const { eventId, paymentMethod, paymentId, subEventItems } = req.body.data;
//     if (!eventId || !paymentMethod || !paymentId || !Array.isArray(subEventItems) || subEventItems.length === 0) {
//       return ApiResponseHandler.error(res, COMMON_MESSAGES.VALIDATION_ERROR, 400);
//     }
//     const eventResponse = await eventInstance.getEventById(eventId);
//     if (!eventResponse.status) {
//       return ApiResponseHandler.error(res, COMMON_MESSAGES.EVENT_NOT_FOUND, 404);
//     }
//     const userId = Number(req.user.id);
//     const existingBookingResponse = await bookingInstance.getBookingByUserAndEvent(userId, eventId);
//     // booking already initiated then update status as confirmed.
//     if (existingBookingResponse.status) {
//       const updatedBookingData: Partial<BookingInterface> = {
//         event_id:eventId,
//         payment_method: paymentMethod,
//         payment_ids: paymentId,
//         status: "confirmed",
//       };
//       const updateResponse = await bookingInstance.updateBooking(existingBookingResponse.data._id, updatedBookingData);
// console.log(updateResponse)
//       if (!updateResponse.status) {
//         return ApiResponseHandler.error(res, COMMON_MESSAGES.BOOKING_FAILED, 500);
//       }
//       return ApiResponseHandler.success(res, updateResponse.data, COMMON_MESSAGES.BOOKING_CONFIRMED, 200);
//     }
//     // booking not exist. so, creating an new booking
//     // const bookingId = Date.now() + Math.floor(Math.random() * 1000);
//     // const amountResponse = await bookingInstance.getAmounts(subEventItems);
//     // const bookingAmount = Number(amountResponse.amount);
//     // const bookingData: BookingInterface = {
//     //   _id: bookingId,
//     //   event_id: eventId,
//     //   sub_event_items: JSON.stringify(subEventItems),
//     //   user_id: userId,
//     //   amount: bookingAmount,
//     //   is_main: 1,
//     //   status: "confirmed",
//     //   payment_method: paymentMethod,
//     //   payment_ids: paymentId,
//     // };
//     // const createResponse = await bookingInstance.createBooking(bookingData);
//     // if (!createResponse.status) {
//     //   return ApiResponseHandler.error(res, COMMON_MESSAGES.BOOKING_FAILED, 500);
//     // }
//     // await bookingInstance.updateUserBookingsAndEarnings(userId, eventId, bookingAmount);
//     // return ApiResponseHandler.success(res, createResponse.data, COMMON_MESSAGES.BOOKING_CONFIRMED, 201);
//   } catch (error: any) {
//     console.log(error)
//     return ApiResponseHandler.error(res, COMMON_MESSAGES.SERVER_ERROR, 500);
//   }
// };
const getUserPendingBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    try {
        if (!req.user || !((_b = req.user) === null || _b === void 0 ? void 0 : _b.id)) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.AUTH_ERROR, 401);
        }
        const response = yield bookingInstance.getPendingBookingList(Number(req.user.id));
        if (!response.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, (_c = response.message) !== null && _c !== void 0 ? _c : messages_1.COMMON_MESSAGES.NO_PENDING_BOOKINGS, 404);
        }
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, response.data, "Pending bookings retrieved successfully.", 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.SERVER_ERROR, 500);
    }
});
exports.getUserPendingBookings = getUserPendingBookings;
const getUserBookedEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    try {
        if (!req.user || !((_d = req.user) === null || _d === void 0 ? void 0 : _d.id)) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.AUTH_ERROR, 401);
        }
        const response = yield bookingInstance
            .getBookedEventsList(Number(req.user.id));
        if (!response.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, (_e = response.message) !== null && _e !== void 0 ? _e : messages_1.COMMON_MESSAGES.NO_BOOKED_EVENTS, 404);
        }
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, response.data, "Booked events retrieved successfully.", 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.SERVER_ERROR, 500);
    }
});
exports.getUserBookedEvents = getUserBookedEvents;
const getUserCancelledBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f, _g;
    try {
        if (!req.user || !((_f = req.user) === null || _f === void 0 ? void 0 : _f.id)) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.AUTH_ERROR, 401);
        }
        const response = yield bookingInstance.getCancelledBookings(Number(req.user.id));
        if (!response.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, (_g = response.message) !== null && _g !== void 0 ? _g : messages_1.COMMON_MESSAGES.NO_CANCELLED_BOOKINGS, 404);
        }
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, response.data, "Cancelled bookings retrieved successfully.", 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.SERVER_ERROR, 500);
    }
});
exports.getUserCancelledBookings = getUserCancelledBookings;
