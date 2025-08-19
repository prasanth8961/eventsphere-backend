"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tableName = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const NODE_ENV = process.env.NODE_ENV || 'DEV';
exports.tableName = NODE_ENV == 'DEV' ?
    {
        ADMIN: "admins",
        CATEGORY: "categories",
        USERS: "es_users",
        EVENTBOOKINGS: "bookings",
        ORGANIZATIONS: "organizations"
    }
    :
        {
            ADMIN: "es_admins",
            CATEGORY: "es_event_categories",
            USERS: "es_users",
            EVENTBOOKINGS: "es_event_bookings",
            ORGANIZATIONS: "es_organizations",
            EVENTS: "es_events",
            SUBEVENTS: "es_subevents"
        };
