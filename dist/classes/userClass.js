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
exports.UserClass = void 0;
const knex_1 = __importDefault(require("../Config/knex"));
const formatDateAndTime_1 = require("../Utililes/formatDateAndTime");
const table_1 = require("../tables/table");
class UserClass {
    constructor() {
        this.fetchUsersByRole = (role, status, limit, offset, search) => __awaiter(this, void 0, void 0, function* () {
            const query = (0, knex_1.default)(table_1.tableName.USERS).where({ role: role });
            if (status.includes("verified") || status.includes("rejected") || status.includes("active") || status.includes("inactive") || status.includes("pending")) {
                query.whereIn("status", status);
            }
            if (search) {
                query.andWhere("name", "like", `%${search}%`);
            }
            const [{ count }] = yield query.clone().count("* as count");
            const users = yield query.select('_id', 'name', 'email', 'password', 'c_code', 'mobile', 'profile', 'role', 'createdAt', 'requestedAt', 'approvedBy', 'approvedAt', 'denial_reason', 'location', 'bookings', 'proof', 'longitude', 'latitude', 'status').offset(offset).limit(limit);
            return {
                totalRecords: Number(count),
                totalPage: Math.ceil(Number(count) / limit),
                users: users
            };
        });
        this.fetchUsersByRoleAndStatus = (role, status) => __awaiter(this, void 0, void 0, function* () {
            return yield knex_1.default.select('_id', 'name', 'email', 'password', 'c_code', 'mobile', 'profile', 'role', 'createdAt', 'requestedAt', 'approvedBy', 'approvedAt', 'denial_reason', 'location', 'bookings', 'proof', 'longitude', 'latitude', 'status').from(table_1.tableName.USERS).where({ role: role }).andWhere({ status: status });
        });
        this.fetchUsersByRoleAndId = (role, id) => __awaiter(this, void 0, void 0, function* () {
            return yield knex_1.default.select('_id', 'name', 'email', 'c_code', 'mobile', 'profile', 'role', 'denial_reason', 'location', 'bookings', 'proof', 'longitude', 'latitude', 'status').from(table_1.tableName.USERS).where({ _id: id }).andWhere({ role: role });
        });
        this.sanitiseAndFormatUser = (user) => {
            user.createdAt != null ? user.createdAt = formatDateAndTime_1.FormatDateAndTime.formatDate2(user.createdAt) : null;
            user.requestedAt != null ? user.requestedAt = formatDateAndTime_1.FormatDateAndTime.formatDate2(user.requestedAt) : null;
            user.approvedAt != null ? user.approvedAt = formatDateAndTime_1.FormatDateAndTime.formatDate2(user.approvedAt) : null;
            delete user.bookings;
            delete user.password;
            delete user.profile;
            if (user.proof && user.proof != undefined && user.proof != null) {
                user.proof = JSON.parse(user.proof);
            }
            return user;
        };
        this.isUserExistsOnId = (id) => __awaiter(this, void 0, void 0, function* () {
            const data = yield knex_1.default
                .select("*")
                .from(table_1.tableName.USERS)
                .where("_id", id);
            return data;
        });
        this.isUserExistsOnMobileOrEmail = (email, mobile) => __awaiter(this, void 0, void 0, function* () {
            const results = yield knex_1.default
                .select("*")
                .from(table_1.tableName.USERS)
                .where("email", email)
                .orWhere("mobile", mobile);
            return results;
        });
        this.getUserById = (id) => __awaiter(this, void 0, void 0, function* () {
            const result = yield knex_1.default.select("*").from(table_1.tableName.USERS).where("_id", id);
            return result;
        });
        this.getUsersByRole = (role, status, search, offset, limit) => __awaiter(this, void 0, void 0, function* () {
            let data = {};
            switch (role) {
                case "user":
                    const userResponse = yield this.fetchUsersByRole(role, status, limit, offset, search);
                    const userData = yield Promise.all(userResponse.users.map((user) => __awaiter(this, void 0, void 0, function* () {
                        const bookings = yield (0, knex_1.default)(table_1.tableName.EVENTBOOKINGS).
                            select("*").whereIn("_id", user.bookings == null ? [] : JSON.parse(user.bookings));
                        bookings.forEach((booking) => {
                            delete booking.user_id;
                            booking.sub_event_items = JSON.parse(booking.sub_event_items);
                            booking.createdAt = formatDateAndTime_1.FormatDateAndTime.formatDate2(booking.createdAt);
                        });
                        return Object.assign(Object.assign({}, this.sanitiseAndFormatUser(user)), { bookingData: bookings });
                    })));
                    data = {
                        users: userData,
                        totalPage: userResponse.totalPage,
                        totalRecords: userResponse.totalRecords
                    };
                    break;
                case "organizer":
                    const organizerResponse = yield this.fetchUsersByRole(role, status, limit, offset, search);
                    console.log(organizerResponse.users);
                    const organizerData = yield Promise.all(organizerResponse.users.map((user) => __awaiter(this, void 0, void 0, function* () {
                        const organization = yield (0, knex_1.default)(table_1.tableName.ORGANIZATIONS).
                            select("*").where("_id", user._id);
                        organization.forEach((user) => {
                            delete user._id;
                            user.pending_events = JSON.parse(user.pending_events);
                            user.active_events = JSON.parse(user.active_events);
                            user.completed_events = JSON.parse(user.completed_events);
                        });
                        return Object.assign(Object.assign({}, this.sanitiseAndFormatUser(user)), { organizationData: organization });
                    })));
                    data = {
                        organizers: organizerData,
                        totalPage: organizerResponse.totalPage,
                        totalRecords: organizerResponse.totalRecords
                    };
                    break;
                case "squad":
                    const squadResponse = yield this.fetchUsersByRole(role, status, limit, offset, search);
                    const squadData = yield Promise.all(squadResponse.users.map((user) => __awaiter(this, void 0, void 0, function* () {
                        return Object.assign({}, this.sanitiseAndFormatUser(user));
                    })));
                    data = {
                        squads: squadData,
                        totalPage: squadResponse.totalPage,
                        totalRecords: squadResponse.totalRecords
                    };
                    break;
                default:
                    data = {};
                    break;
            }
            console.log("DATA : " + data.totalPage);
            return data;
        });
        this.getUsersByRoleAndStatus = (role, status) => __awaiter(this, void 0, void 0, function* () {
            let data = [];
            switch (role) {
                case "user":
                    console.log(role + ":" + status);
                    const users = yield this.fetchUsersByRoleAndStatus(role, status);
                    // limit,offset,search
                    console.log(users);
                    data = yield Promise.all(users.map((user) => __awaiter(this, void 0, void 0, function* () {
                        console.log(user.bookings);
                        const bookings = yield (0, knex_1.default)("bookings").
                            select("*").whereIn("_id", user.bookings == null ? [] : JSON.parse(user.bookings));
                        bookings.forEach((booking) => {
                            delete booking.user_id;
                            booking.sub_event_items = JSON.parse(booking.sub_event_items);
                            booking.createdAt = formatDateAndTime_1.FormatDateAndTime.formatDate2(booking.createdAt);
                        });
                        if (status == "pending") {
                            const _a = this.sanitiseAndFormatUser(user), { approvedBy, approvedAt, denial_reason } = _a, remaining = __rest(_a, ["approvedBy", "approvedAt", "denial_reason"]);
                            // return {
                            //   ...this.sanitiseAndFormatUser(user),
                            //   delete user.approvedBy,
                            // }
                            return remaining;
                        }
                        else {
                            const _b = this.sanitiseAndFormatUser(user), { denial_reason } = _b, remaingData = __rest(_b, ["denial_reason"]);
                            return Object.assign(Object.assign({}, remaingData), { bookingData: bookings });
                        }
                    })));
                    break;
                case "organizer":
                    const org = yield this.fetchUsersByRoleAndStatus(role, status);
                    data = yield Promise.all(org.map((user) => __awaiter(this, void 0, void 0, function* () {
                        console.log(user._id);
                        const [organization] = yield (0, knex_1.default)("organizations").
                            select("*").where("_id", user._id);
                        delete organization._id;
                        if (status == "pending") {
                            const _a = this.sanitiseAndFormatUser(user), { approvedBy, approvedAt, requestedAt, denial_reason } = _a, remaining = __rest(_a, ["approvedBy", "approvedAt", "requestedAt", "denial_reason"]);
                            return Object.assign(Object.assign({}, remaining), { organizationData: {
                                    name: organization.name,
                                    code: organization.code,
                                    noc: organization.noc
                                } });
                        }
                        else {
                            organization.pending_events = JSON.parse(organization.pending_events);
                            organization.active_events = JSON.parse(organization.active_events);
                            organization.completed_events = JSON.parse(organization.completed_events);
                            const _b = this.sanitiseAndFormatUser(user), { requestedAt, denial_reason } = _b, remaining = __rest(_b, ["requestedAt", "denial_reason"]);
                            return Object.assign(Object.assign({}, remaining), { organizationData: organization });
                        }
                    })));
                    break;
                case "squard":
                    data = yield knex_1.default.select("*").from("users");
                    break;
                default:
                    data = [];
                    break;
            }
            return data;
        });
        this.getUserProfileByRoleAndId = (role, id) => __awaiter(this, void 0, void 0, function* () {
            switch (role) {
                case "user":
                    const [user] = yield this.fetchUsersByRoleAndId(role, id);
                    if (!user)
                        return null;
                    return yield this.sanitiseAndFormatUser(user);
                case "organizer":
                    const [org] = yield this.fetchUsersByRoleAndId(role, id);
                    if (!org)
                        return null;
                    const [orgData] = yield (0, knex_1.default)("organizations").
                        select("*").where("_id", org._id);
                    const organization = Object.assign(Object.assign({}, orgData), { pending_events: JSON.parse(orgData.pending_events), active_events: JSON.parse(orgData.active_events), completed_events: JSON.parse(orgData.completed_events) });
                    delete organization._id;
                    return yield Object.assign(Object.assign({}, this.sanitiseAndFormatUser(org)), { organizationData: organization });
                case "squad":
                    const [squard] = yield this.fetchUsersByRoleAndId(role, id);
                    if (!squard)
                        return null;
                    return yield this.sanitiseAndFormatUser(squard);
                default:
                    return null;
            }
        });
        this.createSquad = (userData) => __awaiter(this, void 0, void 0, function* () {
            const currentTime = formatDateAndTime_1.FormatDateAndTime.getCurrentTimestamp();
            const results = yield (0, knex_1.default)(table_1.tableName.USERS).insert({
                name: userData.name,
                email: userData.email,
                mobile: userData.mobile,
                c_code: userData.ccode,
                role: "squad",
                password: userData.password,
                location: userData.location,
                profile: userData.profile,
                status: "active",
                approvedBy: userData.approvedBy,
                approvedAt: currentTime
            });
            return results;
        });
        this.createAdmin = (email, password) => __awaiter(this, void 0, void 0, function* () {
            const results = yield (0, knex_1.default)(table_1.tableName.ADMIN).insert({
                email: email,
                password: password,
            });
            return results;
        });
    }
}
exports.UserClass = UserClass;
exports.default = UserClass;
