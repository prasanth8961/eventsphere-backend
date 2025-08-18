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
const eventClass_1 = __importDefault(require("../classes/eventClass"));
const customError_1 = __importDefault(require("../Utililes/customError"));
const moment_1 = __importDefault(require("moment"));
const LRUCache_1 = require("../Cache/LRUCache");
const Storage_1 = require("../Services/Storage");
const event = new eventClass_1.default();
const cache = new LRUCache_1.LRUCache(3);
class EventModel {
    constructor() {
        this.isValidEventData = (data) => {
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
        this.isValidSubEventData = (subEvent) => {
            const requiredFields = [
                "c_code",
                "description",
                "end_time",
                "host_email",
                "host_mobile",
                "hostedBy",
                "name",
                "start_time",
                "starting_date",
                "ticket_price",
                "ticket_quantity",
                "ticket_type",
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
        this.getAllPendingEvents = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const events = yield event.getEventsByStatus("pending");
            return res.status(200).json({
                success: true,
                data: events,
                message: "Pending events retrieved successfully"
            });
        }));
        this.getAllActiveEvents = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const events = yield event.getEventsByStatus("active");
            return res.status(200).json({
                success: true,
                data: events,
                message: "Active events retrieved successfully"
            });
        }));
        this.getAllCompletedEvents = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const events = yield event.getEventsByStatus("completed");
            return res.status(200).json({
                success: true,
                data: events,
                message: "Completed events retrieved successfully"
            });
        }));
        this.getAllRejectedEvents = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const events = yield event.getEventsByStatus("rejected");
            return res.status(200).json({
                success: true,
                data: events,
                message: "Rejected events retrieved successfully"
            });
        }));
        this.getAllPendingEventsByOrganizerId = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!id)
                return next(new customError_1.default("Id missing", 400));
            const events = yield event.getEventsByStatusAndOrganizerId("pending", id);
            return res.status(200).json({
                success: true,
                data: events,
                message: "Pending events retrieved successfully"
            });
        }));
        this.getAllActiveEventsByOrganizerId = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!id)
                return next(new customError_1.default("Id missing", 400));
            const events = yield event.getEventsByStatusAndOrganizerId("active", id);
            return res.status(200).json({
                success: true,
                data: events,
                message: "Active events retrieved successfully"
            });
        }));
        this.getAllCompletedEventsByOrganizerId = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!id)
                return next(new customError_1.default("Id missing", 400));
            const events = yield event.getEventsByStatusAndOrganizerId("completed", id);
            return res.status(200).json({
                success: true,
                data: events,
                message: "Completed events retrieved successfully"
            });
        }));
        this.getAllRejectedEventsByOrganizerId = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!id)
                return next(new customError_1.default("Id missing", 400));
            const events = yield event.getEventsByStatusAndOrganizerId("rejected", id);
            return res.status(200).json({
                success: true,
                data: events,
                message: "Rejected events retrieved successfully"
            });
        }));
        this.createEvent = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (!req.body.data || !req.files) {
                return next(new customError_1.default("Missing required data in the request. Please provide the necessary event information", 400));
            }
            const user = req.user;
            if (!user) {
                return next(new customError_1.default("Something went wrong", 500));
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
                return next(new customError_1.default("Image files not found", 400));
            }
            const data = JSON.parse(req.body.data);
            if (!this.isValidEventData(data)) {
                return next(new customError_1.default("Invalid event data provided", 401));
            }
            if (data.sub_events === null ||
                data.sub_events === undefined ||
                data.sub_events.length === 0) {
                return next(new customError_1.default("Sub events are required", 400));
            }
            if (!Array.isArray(data.sub_events)) {
                return next(new customError_1.default("Sub-events must be an array", 400));
            }
            const mainImgFile = imageList.main_image;
            if (mainImgFile === null || mainImgFile === undefined) {
                return next(new customError_1.default("Main event image is required", 400));
            }
            const coverImgFiles = imageList.cover_images;
            if (coverImgFiles === null ||
                coverImgFiles === undefined ||
                Object.keys(coverImgFiles).length === 0) {
                return next(new customError_1.default("Cover Images are required", 400));
            }
            ;
            const imageKeys = Object.keys((_a = imageList.sub_cover_images) !== null && _a !== void 0 ? _a : []);
            if (imageKeys.length !== data.sub_events.length) {
                return next(new customError_1.default("Sub events cover Images are required", 400));
            }
            ;
            const imgUploadedResponse = yield Storage_1.FirebaseStorage.uploadSingleImage(`EVENTS/MAIN EVENT IMAGES`, mainImgFile);
            if (imgUploadedResponse.status === false) {
                return next(new customError_1.default((_b = imgUploadedResponse.message) !== null && _b !== void 0 ? _b : "failed to upload main event images. try again!", 500));
            }
            const coverImgUploadedResponse = yield Storage_1.FirebaseStorage.uploadCoverImages(`EVENTS/COVER IMAGES`, coverImgFiles);
            if (coverImgUploadedResponse.status === false) {
                return next(new customError_1.default("failed to upload cover images. try again later", 500));
            }
            const subEventIds = [];
            const subEventsData = [];
            let idx = 0;
            for (let subEvent of data.sub_events) {
                if (!this.isValidSubEventData(subEvent)) {
                    return next(new customError_1.default(`Invalid sub-event data: ${subEvent}`, 400));
                }
                subEventIds.push(subEvent._id);
                const subCoverGroupKey = `sub_cover_images${idx + 1}`;
                idx += 1;
                const subEventCoverImgFile = imageList.sub_cover_images[subCoverGroupKey];
                const coverImgUploadedResponse = yield Storage_1.FirebaseStorage.uploadSubEventCoverImages(`EVENTS/SUB EVENTS IMAGES/subevent_cover_img${idx}_${Date.now()}.jpg`, subEventCoverImgFile);
                if (coverImgUploadedResponse.status === false) {
                    return next(new customError_1.default("failed to upload sub event cover images. try again later", 500));
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
                    restrictions: "[]" //JSON.stringify(subEvent.restrictions),
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
            const response = yield event.createEvent(mainEvents, subEventsData);
            console.log("main ebvent ID :" + response.eventId);
            if (((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) === "organizer") {
                const updateOrganizerEventCount = yield event.updateOrganizationPendingEvent(mainEvents.org_id, response.eventId);
            }
            // if (!updateOrganizerEventCount.status) {
            //   console.log(
            //     "call the fn again to update count of the envent and organization pending events as well"
            //   );
            // }
            return res.status(200).json({
                success: true,
                data: null,
                message: "Event created successfully"
            });
        }));
        this.searchEvents = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { query = "", eventType = "active_events" } = req.body;
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id))
                return res.status(400).send({
                    success: false,
                    message: "Organizer ID missing"
                });
            if (typeof query !== "string" || query.trim() === "") {
                return res.status(400).send({
                    success: false,
                    message: "Query is required and must be a string"
                });
            }
            const allowedTypes = ["active_events", "pending_events", "completed_events"];
            if (!allowedTypes.includes(eventType)) {
                return res.status(400).json({ success: false, message: "Invalid event type" });
            }
            const events = yield event.searchEvents((_b = req.user) === null || _b === void 0 ? void 0 : _b.id, query.trim(), eventType);
            return res.status(200).json({
                success: true,
                data: events,
                message: "Events retrieved successfully"
            });
        }));
        this.getDashboardOverview = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            req.user = { id: 21, role: "organizer" };
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || typeof ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) !== 'number') {
                throw new Error("Invalid organization ID");
            }
            const dashboardStat = yield event.getOrganizationDashboardStats((_c = req.user) === null || _c === void 0 ? void 0 : _c.id);
            return res.status(200).send({
                success: true,
                data: dashboardStat,
                message: "Dashboard overview data retrieved successfully."
            });
        }));
    }
}
exports.default = EventModel;
