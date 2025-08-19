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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const v1_1 = __importDefault(require("./v1/v1"));
const path_1 = __importDefault(require("path"));
const apiResponseMiddleware_1 = require("./Middleware/apiResponseMiddleware");
const knex_1 = require("./Config/knex");
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const errorHandler_1 = __importDefault(require("./Utililes/errorHandler"));
dotenv.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.urlencoded({ extended: true }));
const ENVIRONMENT = process.env.NODE_ENV || 3000;
const corseOptions = { origin: "*" };
app.use(express_1.default.static("public"));
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use((0, cors_1.default)(corseOptions));
app.get("/", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send({
        version: '1.0.0'
    });
}));
app.use("/auth", authRoute_1.default);
// impement verfytoken here
//app.use("/api/v1", verifyToken , V1);
app.use("/api/v1", v1_1.default);
app.all("*", (req, res, next) => {
    apiResponseMiddleware_1.ApiResponseHandler.notFound(res, `URL ${req.path} not found`, 404);
});
app.use(errorHandler_1.default);
(0, knex_1.connectToDatabase)();
app.listen(Number(PORT), () => {
    const serverInfo = `\n------------------------------------------\n` +
        `🚀 Server is up and running!\n` +
        `🌐 URL: http://localhost:${PORT}\n` +
        `🌍 Environment: ${ENVIRONMENT}\n` +
        `------------------------------------------\n`;
    console.log(serverInfo);
});
