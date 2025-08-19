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
exports.AuthClass = void 0;
const knex_1 = __importDefault(require("../../Config/knex"));
const formatDateAndTime_1 = require("../../Utililes/formatDateAndTime");
const table_1 = require("../../tables/table");
class AuthClass {
    constructor() {
        this.isUserExistsOnMobileOrEmail = (email, mobile) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const results = yield knex_1.default
                        .select("*")
                        .from("es_users")
                        .where("email", email)
                        .orWhere("mobile", mobile);
                    resolve({ status: true, data: results });
                }
                catch (e) {
                    reject({
                        status: false,
                    });
                }
            }));
        });
        this.isUserExistsOnIdAndRole = (id, role) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const results = yield knex_1.default
                        .select("*")
                        .from("users")
                        .where("_id", id)
                        .andWhere("role", role);
                    resolve({ status: true, data: results });
                }
                catch (e) {
                    reject({
                        status: false,
                    });
                }
            }));
        });
        this.isOrganizationCodeExists = (code) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const results = yield knex_1.default
                        .select("*")
                        .from("es_organizations ")
                        .where("code", code);
                    resolve({ status: true, data: results });
                }
                catch (e) {
                    reject({
                        status: false,
                    });
                }
            }));
        });
        this.isUserExistsOnMobileOrEmailWithoutSpecificId = (id, email, mobile) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    // const results: any = await db
                    //   .select("*")
                    //   .from("users")
                    //   .where("email", email)
                    //   .orWhere("mobile", mobile)
                    //   .whereNot({ _id: id });
                    const results = yield knex_1.default
                        .select("*")
                        .from("users")
                        .where((query) => {
                        query.where("email", email).orWhere("mobile", mobile);
                    })
                        .whereNot({ _id: id });
                    resolve({ status: true, data: results });
                }
                catch (e) {
                    reject({
                        status: false,
                    });
                }
            }));
        });
        this.updateUserIdentity = (id, userData) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const currentTime = formatDateAndTime_1.FormatDateAndTime.getCurrentTimestamp();
                    const results = yield (0, knex_1.default)("users").where({ _id: id }).update({
                        name: userData.name,
                        email: userData.email,
                        mobile: userData.mobile,
                        c_code: userData.ccode,
                        role: userData.role,
                        password: userData.password,
                        location: userData.location,
                        proof: userData.proof,
                        profile: userData.profile,
                        status: "pending",
                        requestedAt: currentTime
                    });
                    resolve({ status: true, data: results });
                }
                catch (e) {
                    reject({
                        status: false,
                    });
                }
            }));
        });
        this.userLogin = (userData) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const results = yield knex_1.default
                        .select("*")
                        .from("users")
                        .where("email", userData.email);
                    resolve({ status: true, data: results });
                }
                catch (e) {
                    reject({
                        status: false,
                    });
                }
            }));
        });
        this.adminLogin = (userData) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const results = yield knex_1.default
                        .select("*")
                        .from(table_1.tableName.ADMIN)
                        .where("email", userData.email);
                    resolve({ status: true, data: results });
                }
                catch (e) {
                    reject({
                        status: false,
                    });
                }
            }));
        });
        this.userSignup = (userData) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const results = yield (0, knex_1.default)("users").insert({
                        name: userData.name,
                        email: userData.email,
                        mobile: userData.mobile,
                        c_code: userData.ccode,
                        role: userData.role,
                        password: userData.password,
                        location: userData.location,
                    });
                    resolve({ status: true, data: results });
                }
                catch (e) {
                    console.log(e);
                    reject({
                        status: false,
                    });
                }
            }));
        });
        this.organizerSignup = (userData) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const result = yield (0, knex_1.default)("es_users").insert({
                        name: userData.name,
                        email: userData.email,
                        mobile: userData.mobile,
                        c_code: userData.ccode,
                        role: userData.role,
                        password: userData.password,
                        location: userData.location,
                        longitude: parseFloat(userData.longitude),
                        latitude: parseFloat(userData.latitude),
                        proof: userData.proof,
                        status: "pending"
                    });
                    yield (0, knex_1.default)("es_organizations").insert({
                        _id: result[0],
                        name: userData.collegeName,
                        code: userData.collegeCode,
                        noc: userData.collegeNoc,
                    });
                    resolve({ status: true, data: result });
                }
                catch (e) {
                    console.log(e);
                    reject({
                        status: false,
                    });
                }
            }));
        });
        this.isVerifiedUser = (id) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const results = yield knex_1.default.select("*").from("users").where({ _id: id });
                    resolve({ status: true, data: results });
                }
                catch (error) {
                    reject({
                        status: false,
                    });
                }
            }));
        });
        this.getUserProfile = (role, id) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let results;
                    switch (role) {
                        case "user":
                            const user = yield knex_1.default.select("name", "email", "c_code", "mobile", "profile", "role", "location", "proof", "status").from("users").where({ _id: id });
                            results =
                                {
                                    name: user[0].name,
                                    email: user[0].email,
                                    c_code: user[0].c_code,
                                    mobile: user[0].mobile,
                                    profile: user[0].profile,
                                    role: user[0].role,
                                    location: user[0].location,
                                    proof: JSON.parse(user[0].proof),
                                    status: user[0].status,
                                };
                            break;
                        case "organizer":
                            //PENDING --> Combine two tables
                            // "_id", "name", "email", "password", "c_code", "mobile", "profile", "role", "createdAt", "requestedAt", "approvedBy", "approvedAt", "denial_reason", "location", "favorite_events", "cart_events", "bookings", "proof", "longitude", "latitude", "status"
                            const data1 = yield knex_1.default.select("name", "email", "c_code", "mobile", "profile", "role", "location", "proof", "status").from("users").where({ _id: id });
                            const data2 = yield knex_1.default.select("name", "code", "noc").from("organizations").where({ _id: id });
                            results = [
                                {
                                    name: data1[0].name,
                                    email: data1[0].email,
                                    c_code: data1[0].c_code,
                                    mobile: data1[0].mobile,
                                    profile: data1[0].profile,
                                    role: data1[0].role,
                                    location: data1[0].location,
                                    proof: JSON.parse(data1[0].proof),
                                    status: data1[0].status,
                                    collegeName: data2[0].name,
                                    collegeCode: data2[0].code,
                                    noc: data2[0].noc,
                                }
                            ];
                            break;
                        case "squard":
                            const squard = yield knex_1.default.select("name", "email", "c_code", "mobile", "profile", "role", "location", "proof", "status").from("users").where({ _id: id });
                            results = [
                                {
                                    name: squard[0].name,
                                    email: squard[0].email,
                                    c_code: squard[0].c_code,
                                    mobile: squard[0].mobile,
                                    profile: squard[0].profile,
                                    role: squard[0].role,
                                    location: squard[0].location,
                                    proof: JSON.parse(squard[0].proof),
                                    status: squard[0].status,
                                }
                            ];
                            break;
                        default:
                            results = [];
                            break;
                    }
                    resolve({ status: true, data: results });
                }
                catch (error) {
                    console.log(error);
                    reject({
                        status: false,
                    });
                }
            }));
        });
        this.getUserNameAndLocation = (role, id) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const user = yield knex_1.default.select("name", "location").from("users").where({ _id: id });
                    const results = {
                        name: user[0].name,
                        location: user[0].location,
                    };
                    resolve({ status: true, data: results });
                }
                catch (error) {
                    console.log(error);
                    reject({
                        status: false,
                    });
                }
            }));
        });
        this.getAllUsers = (role) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let results;
                    switch (role) {
                        case "user":
                            const users = yield knex_1.default.select('_id', 'name', 'email', 'password', 'c_code', 'mobile', 'profile', 'role', 'createdAt', 'requestedAt', 'approvedBy', 'approvedAt', 'denial_reason', 'location', 'bookings', 'proof', 'longitude', 'latitude', 'status').from("users").where({ role: "user" });
                            // console.log(users);
                            results = yield Promise.all(users.map((user) => __awaiter(this, void 0, void 0, function* () {
                                console.log(user.bookings);
                                const booking = yield (0, knex_1.default)("bookings").
                                    select("*").whereIn("_id", user.bookings == null ? [] : JSON.parse(user.bookings));
                                console.log(booking);
                                return Object.assign(Object.assign({}, user), { bookingData: booking });
                            })));
                            results.forEach((user) => {
                                user.createdAt = formatDateAndTime_1.FormatDateAndTime.formatDate2(user.createdAt);
                                user.requestedAt = user.requestedAt != null ? user.requestedAt = formatDateAndTime_1.FormatDateAndTime.formatDate2(user.requestedAt) : null;
                                user.approvedAt = user.approvedAt != null ? user.approvedAt = formatDateAndTime_1.FormatDateAndTime.formatDate2(user.approvedAt) : null;
                                delete user.bookings;
                                delete user.password;
                                delete user.profile;
                                user.proof = JSON.parse(user.proof);
                                user.bookingData.forEach((user) => {
                                    delete user.user_id;
                                    user.sub_event_items = JSON.parse(user.sub_event_items);
                                    user.createdAt = formatDateAndTime_1.FormatDateAndTime.formatDate2(user.createdAt);
                                });
                            });
                            break;
                        case "organizer":
                            //PENDING --> Combine two tables
                            const org = yield knex_1.default.select('_id', 'name', 'email', 'password', 'c_code', 'mobile', 'profile', 'role', 'createdAt', 'requestedAt', 'approvedBy', 'approvedAt', 'denial_reason', 'location', 'bookings', 'proof', 'longitude', 'latitude', 'status').from("users").where({ role: "organizer" });
                            // console.log(users);
                            results = yield Promise.all(org.map((user) => __awaiter(this, void 0, void 0, function* () {
                                console.log(user._id);
                                const organization = yield (0, knex_1.default)("organizations").
                                    select("*").where("_id", user._id);
                                console.log(organization);
                                return Object.assign(Object.assign({}, user), { organizationData: organization });
                            })));
                            results.forEach((user) => {
                                user.createdAt = formatDateAndTime_1.FormatDateAndTime.formatDate2(user.createdAt);
                                user.requestedAt = user.requestedAt != null ? user.requestedAt = formatDateAndTime_1.FormatDateAndTime.formatDate2(user.requestedAt) : null;
                                user.approvedAt = user.approvedAt != null ? user.approvedAt = formatDateAndTime_1.FormatDateAndTime.formatDate2(user.approvedAt) : null;
                                delete user.bookings;
                                delete user.password;
                                delete user.profile;
                                user.proof = JSON.parse(user.proof);
                                user.organizationData.forEach((user) => {
                                    delete user._id;
                                    user.pending_events = JSON.parse(user.pending_events);
                                    user.active_events = JSON.parse(user.active_events);
                                    user.completed_events = JSON.parse(user.completed_events);
                                });
                            });
                            break;
                        case "squard":
                            results = yield knex_1.default.select("*").from("users");
                            break;
                        default:
                            results = [];
                            break;
                    }
                    resolve({ status: true, data: results });
                }
                catch (error) {
                    console.log(error);
                    reject({
                        status: false,
                    });
                }
            }));
        });
        this.deleteUser = (role, id) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let results;
                    switch (role) {
                        case "user":
                            results = yield (0, knex_1.default)("users").where({ _id: id }).delete();
                            break;
                        case "organizer":
                            //PENDING --> Delete two tables
                            results = yield (0, knex_1.default)("users").where({ _id: id }).delete();
                            break;
                        case "squard":
                            results = yield (0, knex_1.default)("users").where({ _id: id }).delete();
                            break;
                        default:
                            results = 0;
                            break;
                    }
                    resolve({ status: true, data: results });
                }
                catch (error) {
                    reject({
                        status: false,
                    });
                }
            }));
        });
        this.updateUserStatus = (state, userId, approvedBy, denialReason) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const currentTimestamp = formatDateAndTime_1.FormatDateAndTime.getCurrentTimestamp();
                    let results;
                    if (state === "approve") {
                        results = yield (0, knex_1.default)("users").where({ _id: userId }).update({
                            approvedBy: approvedBy,
                            approvedAt: currentTimestamp,
                            status: "active",
                        });
                    }
                    else {
                        results = yield (0, knex_1.default)("users").where({ _id: userId }).update({
                            approvedBy: approvedBy,
                            approvedAt: currentTimestamp,
                            status: "rejected",
                            denial_reason: denialReason,
                        });
                    }
                    resolve({ status: true, data: results });
                }
                catch (error) {
                    reject({
                        status: false,
                    });
                }
            }));
        });
        this.createSquard = (userData) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const results = yield (0, knex_1.default)("users").insert({
                        name: userData.name,
                        email: userData.email,
                        mobile: userData.mobile,
                        c_code: userData.ccode,
                        role: userData.role,
                        password: userData.password,
                        location: userData.location,
                        proof: userData.proof,
                        profile: userData.profile,
                        status: "active",
                    });
                    resolve({ status: true, data: results });
                }
                catch (e) {
                    reject({
                        status: false,
                    });
                }
            }));
        });
        this.updateSquard = (userData) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const results = yield (0, knex_1.default)("users")
                        .where({ _id: userData.userId })
                        .update({
                        name: userData.name,
                        email: userData.email,
                        mobile: userData.mobile,
                        c_code: userData.ccode,
                        role: userData.role,
                        password: userData.password,
                        location: userData.location,
                        status: userData.status,
                    });
                    resolve({ status: true, data: results });
                }
                catch (e) {
                    reject({
                        status: false,
                    });
                }
            }));
        });
    }
}
exports.AuthClass = AuthClass;
