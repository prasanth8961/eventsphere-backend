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
const customError_1 = __importDefault(require("../Utililes/customError"));
const formatDateAndTime_1 = require("../Utililes/formatDateAndTime");
class UserFavouriteEventClass {
    constructor() {
        this.isUserExistsOnId = (id) => __awaiter(this, void 0, void 0, function* () {
            const user = yield knex_1.default
                .select("*")
                .from("users")
                .where("_id", id);
            return user;
        });
        this.addFavoriteEvent = (userId, favoriteId, next) => __awaiter(this, void 0, void 0, function* () {
            const [user] = yield this.isUserExistsOnId(userId);
            if (!user) {
                return next(new customError_1.default("User not found.", 401));
            }
            const favoriteEvents = user.favorite_events ? JSON.parse(user.favorite_events) : [];
            if (favoriteEvents.includes(favoriteId)) {
                return { status: false, message: "Event is already in favorites.", data: null };
            }
            favoriteEvents.push(favoriteId);
            yield (0, knex_1.default)("users").where("_id", userId).update({
                favorite_events: JSON.stringify(favoriteEvents),
            });
            return favoriteEvents;
        });
        this.removeFavoriteEvent = (userId, favoriteId, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const [user] = yield this.isUserExistsOnId(userId);
            if (!user) {
                return next(new customError_1.default("User not found.", 401));
            }
            console.log("user Id ===================" + userId);
            const favoriteEvents = user.favorite_events ? JSON.parse((_a = user.favorite_events) !== null && _a !== void 0 ? _a : []) : [];
            // console.log(favoriteEvents)
            const updatedFavorites = favoriteEvents.filter((id) => id !== favoriteId);
            yield (0, knex_1.default)("users").where("_id", userId).update({
                favorite_events: JSON.stringify(updatedFavorites),
            });
            // console.log(updatedFavorites);
            return updatedFavorites;
        });
        this.getFavoriteEventList = (userId, next) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            const [user] = yield this.isUserExistsOnId(userId);
            if (!user) {
                return next(new customError_1.default("User not found.", 401));
            }
            const favoriteEventIds = user.favorite_events ? JSON.parse((_b = user.favorite_events) !== null && _b !== void 0 ? _b : []) : [];
            console.log(favoriteEventIds);
            const events = yield (0, knex_1.default)("events").whereIn("_id", favoriteEventIds);
            const updatedFavorites = events.map((_a) => {
                var { _id } = _a, data = __rest(_a, ["_id"]);
                return (Object.assign({ id: _id }, data));
            });
            const eventsWithSubEvents = yield Promise.all(updatedFavorites.map((event) => __awaiter(this, void 0, void 0, function* () {
                const subEventIds = JSON.parse(event.sub_event_items || "[]");
                const subEvents = subEventIds.length ? yield (0, knex_1.default)("subevents").whereIn("_id", subEventIds) : [];
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
            return eventsWithSubEvents;
        });
    }
}
exports.default = UserFavouriteEventClass;
