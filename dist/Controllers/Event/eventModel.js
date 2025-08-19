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
exports.getAllEventsbyId = exports.getAllEventsList = exports.getAllRejectedEventsById = exports.getAllRejectedEventsList = exports.approveEvent = exports.searchEvents = exports.getUpcomingEvents = exports.getPopularEvents = exports.getActiveEvents = exports.getCompletedEvents = exports.getPendingEvents = exports.getEventsByStatus = exports.getEventsByCategoryName = exports.getActiveEventsById = exports.getCompletedEventsById = exports.getPendingEventsById = exports.updateEvent = exports.createEvent = void 0;
const apiResponseMiddleware_1 = require("../../Middleware/apiResponseMiddleware");
const eventClass_1 = require("./eventClass");
const Storage_1 = require("../../Services/Storage");
const moment_1 = __importDefault(require("moment"));
const messages_1 = require("../../Common/messages");
const LRUCache_1 = require("../../Cache/LRUCache");
const cache = new LRUCache_1.LRUCache(3);
const isValidEventData = (data) => {
    const requiredFields = [
        "name",
        "location",
        "description",
        "longitude",
        "latitude",
        "category",
        "audience_type",
        "currency",
        "is_main",
        "starting_date",
        "ending_date"
    ];
    for (const field of requiredFields) {
        if (data[field] === null ||
            data[field] === undefined ||
            data[field] === "") {
            return false;
        }
    }
    return true;
};
const isValidSubEventData = (subEvent) => {
    const requiredFields = [
        "name",
        "description",
        "start_time",
        "end_time",
        "restrictions",
        "starting_date",
        "hostedBy",
        "host_email",
        "host_mobile",
        "c_code",
        "ticket_quantity",
        "ticket_type",
        "ticket_price",
    ];
    for (const field of requiredFields) {
        if (subEvent[field] === null ||
            subEvent[field] === undefined ||
            subEvent[field] === "") {
            return false;
        }
    }
    return true;
};
const eventInstance = new eventClass_1.EventClass();
// CREATE EVENT ENDPOINT--> http://localhost:3000/api/v1/events/create
const createEvent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        if (!req.body.data || !req.files) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Missing required data in the request. Please provide the necessary event information.", 400);
        }
        const user = req.user;
        if (!user) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Something went wrong", 500);
        }
        const imageList = {
            main_image: null,
            cover_images: [],
            sub_cover_images: {},
        };
        if (Array.isArray(req.files)) {
            req.files.forEach((file) => {
                if (file.fieldname === "main_image") {
                    imageList.main_image = file;
                }
                else if (file.fieldname === "cover_images") {
                    imageList.cover_images.push(file);
                }
                else if (file.fieldname.startsWith("sub_cover_images")) {
                    if (!imageList.sub_cover_images[file.fieldname]) {
                        imageList.sub_cover_images[file.fieldname] = [];
                    }
                    imageList.sub_cover_images[file.fieldname].push(file);
                }
            });
        }
        else {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Image files not found", 400);
        }
        const data = JSON.parse(req.body.data);
        if (!isValidEventData(data)) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Invalid event data provided.", 401);
        }
        if (data.sub_events === null ||
            data.sub_events === undefined ||
            data.sub_events.length === 0) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Sub events are required", 400);
        }
        if (!Array.isArray(data.sub_events)) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Sub-events must be an array.", 400);
        }
        const mainImgFile = imageList.main_image;
        if (mainImgFile === null || mainImgFile === undefined) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Main event image is required", 400);
        }
        const coverImgFiles = imageList.cover_images;
        if (coverImgFiles === null ||
            coverImgFiles === undefined ||
            Object.keys(coverImgFiles).length === 0) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Cover Images are required", 400);
        }
        ;
        const imageKeys = Object.keys((_a = imageList.sub_cover_images) !== null && _a !== void 0 ? _a : []);
        if (imageKeys.length !== data.sub_events.length) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Sub events cover Images are required", 400);
        }
        ;
        const imgUploadedResponse = yield Storage_1.FirebaseStorage.uploadSingleImage(`EVENTS/MAIN EVENT IMAGES`, mainImgFile);
        if (imgUploadedResponse.status === false) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, (_b = imgUploadedResponse.message) !== null && _b !== void 0 ? _b : "failed to upload main event images. try again!", 500);
        }
        const coverImgUploadedResponse = yield Storage_1.FirebaseStorage.uploadCoverImages(`EVENTS/COVER IMAGES`, coverImgFiles);
        if (coverImgUploadedResponse.status === false) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "failed to upload cover images. try again later", 500);
        }
        const subEventIds = [];
        const subEventsData = [];
        let idx = 0;
        for (let subEvent of data.sub_events) {
            if (!isValidSubEventData(subEvent)) {
                return apiResponseMiddleware_1.ApiResponseHandler.error(res, `Invalid sub-event data: ${subEvent}`, 400);
            }
            subEventIds.push(subEvent._id);
            const subCoverGroupKey = `sub_cover_images${idx + 1}`;
            idx += 1;
            const subEventCoverImgFile = imageList.sub_cover_images[subCoverGroupKey];
            const coverImgUploadedResponse = yield Storage_1.FirebaseStorage.uploadSubEventCoverImages(`EVENTS/SUB EVENTS IMAGES/subevent_cover_img${idx}_${Date.now()}.jpg`, subEventCoverImgFile);
            if (coverImgUploadedResponse.status === false) {
                return apiResponseMiddleware_1.ApiResponseHandler.error(res, "failed to upload sub event cover images. try again later", 500);
            }
            const subevent = {
                name: subEvent.name,
                description: subEvent.description,
                cover_images: JSON.stringify(coverImgUploadedResponse.urls),
                video_url: subEvent.video_url || null,
                start_time: subEvent.start_time,
                end_time: subEvent.end_time,
                starting_date: (0, moment_1.default)(subEvent.starting_date).format("YYYY-MM-DD"),
                hostedBy: subEvent.hostedBy,
                host_email: subEvent.host_email,
                host_mobile: subEvent.host_mobile,
                c_code: subEvent.c_code,
                ticket_quantity: subEvent.ticket_quantity,
                ticket_sold: 0,
                ticket_type: subEvent.ticket_type,
                ticket_price: subEvent.ticket_price,
                earnings: 0,
                restrictions: JSON.stringify(subEvent.restrictions),
            };
            subEventsData.push(subevent);
        }
        const mainEvents = {
            name: data.name,
            location: data.location,
            org_id: user.id,
            description: data.description,
            registration_start: (0, moment_1.default)(data.registration_start).format("YYYY-MM-DD"),
            registration_end: (0, moment_1.default)(data.registration_end).format("YYYY-MM-DD"),
            latitude: data.latitude,
            longitude: data.longitude,
            category: data.category,
            sub_event_items: JSON.stringify(subEventIds),
            tags: JSON.stringify(data.tags),
            audience_type: data.audience_type,
            currency: data.currency,
            main_image: imgUploadedResponse.url,
            cover_images: JSON.stringify(coverImgUploadedResponse.urls),
            is_main: data.is_main,
            starting_date: (0, moment_1.default)(data.starting_date).format("YYYY-MM-DD"),
            ending_date: (0, moment_1.default)(data.ending_date).format("YYYY-MM-DD")
        };
        const response = yield eventInstance.createEvent(mainEvents, subEventsData);
        if (response.status === false) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Something went wrong. Try again!", 500);
        }
        if (response.status) {
            const updateOrganizerEventCount = yield eventInstance.updateOrganizationPendingEvent(mainEvents.org_id, response.data._id);
            if (!updateOrganizerEventCount.status) {
                console.log("call the fn again to update count of the envent and organization pending events as well");
            }
            return apiResponseMiddleware_1.ApiResponseHandler.success(res, response.data, "Event created successfully.");
        }
    }
    catch (err) {
        console.error("Error creating event:", err);
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Internal server error", 501);
    }
});
exports.createEvent = createEvent;
const updateEvent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const { eventId, mainEventData, subEventsData } = req.body;
        const subEventsCoverFiles = req.body.files;
        if (!eventId) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Event ID is required.", 400);
        }
        const existingEvent = yield eventInstance.getEventById(eventId);
        if (!existingEvent) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Event not found.", 404);
        }
        if (!mainEventData) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Main event data is required.", 400);
        }
        const requiredMainFields = [
            "name",
            "location",
            "org_id",
            "description",
            "registration_start",
            "registration_end",
            "longitude",
            "latitude",
            "category",
            "tags",
            "audience_type",
            "currency",
            "main_image",
            "cover_images",
            "is_main",
        ];
        for (const field of requiredMainFields) {
            if (!mainEventData[field] || mainEventData[field] === "") {
                return apiResponseMiddleware_1.ApiResponseHandler.error(res, `Field ${field} is required and cannot be empty.`, 400);
            }
        }
        for (let subEvent of subEventsData) {
            const requiredSubFields = [
                "name",
                "description",
                "start_time",
                "end_time",
                "starting_date",
                "hostedBy",
                "host_email",
                "host_mobile",
                "c_code",
                "ticket_quantity",
                "ticket_sold",
                "ticket_type",
                "ticket_price",
                "restrictions",
            ];
            for (const field of requiredSubFields) {
                if (!subEvent[field] || subEvent[field] === "") {
                    return apiResponseMiddleware_1.ApiResponseHandler.error(res, `Field ${field} in sub-event is required and cannot be empty.`, 400);
                }
            }
        }
        const updatedMainEventData = Object.assign(Object.assign({}, mainEventData), { registration_start: (0, moment_1.default)(mainEventData.registration_start).format("YYYY-MM-DD HH:mm:ss"), registration_end: (0, moment_1.default)(mainEventData.registration_end).format("YYYY-MM-DD HH:mm:ss"), tags: JSON.stringify(mainEventData.tags), audience_type: mainEventData.audience_type });
        const existingSubEventIds = JSON.parse(existingEvent.data.sub_event_items || "[]");
        const mappedSubEventsCoverFiles = {};
        if (subEventsCoverFiles) {
            for (const key in subEventsCoverFiles) {
                const match = key.match(/sub_cover_images(\d+)/);
                if (match) {
                    const subEventId = match[1];
                    if (!mappedSubEventsCoverFiles[subEventId]) {
                        mappedSubEventsCoverFiles[subEventId] = [];
                    }
                    mappedSubEventsCoverFiles[subEventId].push(subEventsCoverFiles[key]);
                }
            }
        }
        const updatedSubEvents = [];
        const subEventIdsToDelete = new Set(existingSubEventIds);
        const newSubEventIds = [];
        for (let subEvent of subEventsData) {
            if (!existingSubEventIds.includes(subEvent._id)) {
                if (mappedSubEventsCoverFiles[subEvent._id]) {
                    const coverImages = mappedSubEventsCoverFiles[subEvent._id];
                    const coverImgUploadedResponse = yield Storage_1.FirebaseStorage.uploadCoverImages(`EVENTS/SUB EVENT IMAGES`, coverImages);
                    if (coverImgUploadedResponse.status === false) {
                        return apiResponseMiddleware_1.ApiResponseHandler.error(res, `Failed to upload cover images for sub-event ${subEvent.name}. Try again later.`, 500);
                    }
                    subEvent.cover_images = JSON.stringify(coverImgUploadedResponse.urls);
                }
                const newId = yield eventInstance.createSubEventById(mainEventData._id, subEvent);
                subEvent._id = newId;
                newSubEventIds.push(subEvent._id);
            }
            const subEventUpdate = Object.assign(Object.assign({}, subEvent), { start_time: (0, moment_1.default)(subEvent.start_time).format("HH:mm:ss"), end_time: (0, moment_1.default)(subEvent.end_time).format("HH:mm:ss"), starting_date: (0, moment_1.default)(subEvent.starting_date).format("YYYY-MM-DD"), restrictions: JSON.stringify(subEvent.restrictions) });
            updatedSubEvents.push(subEventUpdate);
            subEventIdsToDelete.delete(subEvent._id);
        }
        const response = yield eventInstance.updateEvent(eventId, updatedMainEventData, updatedSubEvents, subEventIdsToDelete, existingSubEventIds, newSubEventIds);
        if (!response.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, (_c = response.message) !== null && _c !== void 0 ? _c : "Failed to update event", 500);
        }
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, { eventId, updatedMainEventData, updatedSubEvents }, "Event updated successfully.");
    }
    catch (err) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Internal server error", 500);
    }
});
exports.updateEvent = updateEvent;
// GET PENDING EVENTS ENDPOINT--> http://localhost:3000/api/v1/events/pending
const getPendingEventsById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user.id) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.AUTHENTICATION_FAILED, 401);
        }
        const response = yield eventInstance.getPendingEventList(Number(req.user.id));
        console.log(response);
        if (!response.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.RESOURCE_NOT_FOUND, 404);
        }
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, response.data, "Pending events retrieved successfully.", 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.SERVER_ERROR, 500);
    }
});
exports.getPendingEventsById = getPendingEventsById;
// GET COMPLETED EVENTS ENDPOINT--> http://localhost:3000/api/v1/events/completed
const getCompletedEventsById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user.id) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.AUTHENTICATION_FAILED, 401);
        }
        const response = yield eventInstance.getCompletedEventList(Number(req.user.id));
        if (!response.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.RESOURCE_NOT_FOUND, 404);
        }
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, response.data, "Completed events retrieved successfully.", 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.SERVER_ERROR, 500);
    }
});
exports.getCompletedEventsById = getCompletedEventsById;
// GET ACTIVE EVENTS ENDPOINT--> http://localhost:3000/api/v1/events/active
const getActiveEventsById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user.id) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.AUTHENTICATION_FAILED, 401);
        }
        const response = yield eventInstance.getActiveEventList(Number(req.user.id));
        console.log(response.status);
        if (!response.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.RESOURCE_NOT_FOUND, 404);
        }
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, response.data, "Active events retrieved successfully.", 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.SERVER_ERROR, 500);
    }
});
exports.getActiveEventsById = getActiveEventsById;
const getEventsByCategoryName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryName } = req.body;
        console.log(categoryName);
        if (!categoryName) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.CATEGORY_REQUIRED, 400);
        }
        const response = yield eventInstance.getEventsByCategoryName(categoryName.toString());
        if (!response.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.CATEGORY_NOT_FOUND, 404);
        }
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, response.data, `Events under category: ${categoryName} retrieved successfully.`, 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.SERVER_ERROR, 500);
    }
});
exports.getEventsByCategoryName = getEventsByCategoryName;
const getEventsByStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, limit = 10, search = "", page = 1 } = req.body;
        const offset = (page - 1) * limit;
        console.log(status);
        const response = yield eventInstance.getEvents(status);
        if (response.status) {
            return res.status(200).json({
                status: true,
                data: {
                    events: response.data
                },
                message: "Events retrieved successfully.",
            });
        }
        else {
            return res.status(200).json({
                status: false,
                data: {
                    events: []
                },
                message: "Events not found.",
            });
        }
        // let events: any[] = [];
        // let response: any;
        // console.log(status)
        // switch (status[0]) {
        //   case "all":
        //     response = await eventInstance.getAllEventList();
        //     break;
        //   case "active":
        //     response = await eventInstance.getAllActiveEventList();
        //     break;
        //   case "pending":
        //     response = await eventInstance.getAllPendingEventList();
        //     break;
        //   case "completed":
        //     response = await eventInstance.getAllCompletedEventList();
        //     break;
        //   case "rejected":
        //     response = await eventInstance.getAllRejectedEventList();
        //     break;
        //   default:
        //     response = await eventInstance.getAllEventList();
        //     break;
        // }
        // console.log(response?.status)
        const events = response.data;
        return res.status(200).json({
            status: true,
            data: {
                events,
            },
            message: "Events retrieved successfully.",
        });
    }
    catch (error) {
        console.error(error);
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.SERVER_ERROR, 500);
    }
});
exports.getEventsByStatus = getEventsByStatus;
const getPendingEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // if (!req.user || !req.user.id) {
        //   return ApiResponseHandler.error(
        //     res,
        //     COMMON_MESSAGES.AUTHENTICATION_FAILED,
        //     401
        //   );
        // }
        const response = yield eventInstance.getAllPendingEventList();
        if (!response.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.RESOURCE_NOT_FOUND, 404);
        }
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, response.data, "Pending events retrieved successfully.", 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.SERVER_ERROR, 500);
    }
});
exports.getPendingEvents = getPendingEvents;
const getCompletedEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user.id) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.AUTHENTICATION_FAILED, 401);
        }
        const response = yield eventInstance.getAllCompletedEventList();
        if (!response.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.RESOURCE_NOT_FOUND, 404);
        }
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, response.data, "Completed events retrieved successfully.", 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.SERVER_ERROR, 500);
    }
});
exports.getCompletedEvents = getCompletedEvents;
const getActiveEvents = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user.id) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.AUTHENTICATION_FAILED, 401);
        }
        if (cache.keyExists(req.originalUrl)) {
            cache.getResponse(req.originalUrl, res);
        }
        const response = yield eventInstance.getAllActiveEventList();
        if (!response.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.RESOURCE_NOT_FOUND, 404);
        }
        yield cache.storeResponse(req.originalUrl, response.data);
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, response.data, "Active events retrieved successfully.", 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.SERVER_ERROR, 500);
    }
});
exports.getActiveEvents = getActiveEvents;
const getPopularEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (cache.keyExists(req.originalUrl)) {
            cache.getResponse(req.originalUrl, res);
        }
        const response = yield eventInstance.getPopularEventList();
        if (!response.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.POPULAR_EVENTS_NOT_FOUND, 404);
        }
        yield cache.storeResponse(req.originalUrl, response.date);
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, response.data, "Popular events retrieved successfully.", 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.SERVER_ERROR, 500);
    }
});
exports.getPopularEvents = getPopularEvents;
const getUpcomingEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // if(cache.keyExists(req.originalUrl)){
        // return  cache.getResponse(req.originalUrl, res);
        // }
        const response = yield eventInstance.getUpcomingEventList();
        if (!response.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.UPCOMING_EVENTS_NOT_FOUND, 404);
        }
        // await cache.storeResponse(req.originalUrl , response.data);
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, response.data, "Upcoming events retrieved successfully.", 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.SERVER_ERROR, 500);
    }
});
exports.getUpcomingEvents = getUpcomingEvents;
const searchEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { queryText, location, category } = req.body;
        // if(!queryText ||! location ||! category){
        //   return ApiResponseHandler.warning(res,"Give all fields", 401);
        // }
        const tempLocation = location.length <= 0 ? [] : location.split(",");
        const tempCategory = category.length <= 0 ? [] : category.split(",");
        const response = yield eventInstance.searchEventList({
            queryText,
            tempLocation,
            tempCategory,
        });
        if (!response.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.EVENTS_NOT_FOUND, 404);
        }
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, response.data, "Events retrieved successfully.", 200);
    }
    catch (error) {
        console.error("Error searching events:", error);
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.SERVER_ERROR, 500);
    }
});
exports.searchEvents = searchEvents;
// export const searchEventsByStatus = async (req: Request, res: Response) => {
//   try {
//     const { queryText, status } = req.body;
//     const response = await eventInstance.searchEventsByStatus({
//       queryText,
//       status,
//     });
//     if (!response.status) {
//       return ApiResponseHandler.error(
//         res,
//         COMMON_MESSAGES.EVENTS_NOT_FOUND,
//         404
//       );
//     }
//     return ApiResponseHandler.success(
//       res,
//       response.data,
//       "Events retrieved successfully.",
//       200
//     );
//   } catch (error: any) {
//     console.error("Error searching events:", error);
//     return ApiResponseHandler.error(res, COMMON_MESSAGES.SERVER_ERROR, 500);
//   }
// };
const approveEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = req.body;
        if (!data) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.MISSING_DATA, 400);
        }
        const eventId = Number(data.eventId);
        const eventResponse = yield eventInstance.getEventById(eventId);
        if (!eventResponse.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.EVENT_NOT_FOUND, 404);
        }
        const requestApproveEventIds = data.approveEventIds || [];
        const requestRejectEventIds = Object.keys(data.rejectEvents || {}).map(Number);
        const requestRejectEventReasons = Object.values(data.rejectEvents || {}).map(String);
        //console.log(requestApproveEventIds+":"+requestRejectEventIds+":"+requestRejectEventReasons)
        const totalIds = requestApproveEventIds.length + requestRejectEventIds.length;
        console.log(eventResponse.data.org_id);
        const orgId = eventResponse.data.org_id;
        // console.log(totalIds)
        if (JSON.parse(eventResponse.data.sub_event_items).length != totalIds) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.MISMATCHED_IDS, 400);
        }
        console.log("reached!");
        const response = yield eventInstance.updateEventStatus({
            eventId,
            approveIds: requestApproveEventIds,
            rejectIds: requestRejectEventIds,
            reasons: requestRejectEventReasons,
            orgId: orgId
        });
        if (!response.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.APPROVE_FAILURE, 500);
        }
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, null, messages_1.COMMON_MESSAGES.APPROVE_SUCCESS, 200);
    }
    catch (error) {
        console.error("Error updating event status:", error);
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.SERVER_ERROR, 500);
    }
});
exports.approveEvent = approveEvent;
const getAllRejectedEventsList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        if (!((_d = req.user) === null || _d === void 0 ? void 0 : _d.id)) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.AUTHENTICATION_FAILED, 401);
        }
        const response = yield eventInstance.getAllRejectedEventList();
        if (!response.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.RESOURCE_NOT_FOUND, 404);
        }
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, response.data, "Rejected events retrieved successfully.", 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.SERVER_ERROR, 500);
    }
});
exports.getAllRejectedEventsList = getAllRejectedEventsList;
const getAllRejectedEventsById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user.id) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.AUTHENTICATION_FAILED, 401);
        }
        const response = yield eventInstance.getRejectedEventList(Number(req.user.id));
        if (!response.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.RESOURCE_NOT_FOUND, 404);
        }
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, response.data, "Active events retrieved successfully.", 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.SERVER_ERROR, 500);
    }
});
exports.getAllRejectedEventsById = getAllRejectedEventsById;
const getAllEventsList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    try {
        if (!((_e = req.user) === null || _e === void 0 ? void 0 : _e.id)) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.AUTHENTICATION_FAILED, 401);
        }
        const response = yield eventInstance.getAllEventList();
        if (!response.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.RESOURCE_NOT_FOUND, 404);
        }
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, response.data, "Events retrieved successfully.", 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.SERVER_ERROR, 500);
    }
});
exports.getAllEventsList = getAllEventsList;
const getAllEventsbyId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user.id) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.AUTHENTICATION_FAILED, 401);
        }
        const response = yield eventInstance.getAllEventsById(Number(req.user.id));
        if (!response.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.RESOURCE_NOT_FOUND, 404);
        }
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, response.data, "Events retrieved successfully.", 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.SERVER_ERROR, 500);
    }
});
exports.getAllEventsbyId = getAllEventsbyId;
