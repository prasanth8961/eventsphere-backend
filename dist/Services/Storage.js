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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseStorage = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const firebase_config_1 = __importDefault(require("../Config/firebase-config"));
const dotenv = __importStar(require("dotenv"));
const uuid_1 = require("uuid");
dotenv.config();
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(firebase_config_1.default),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});
const storage = firebase_admin_1.default.storage().bucket();
class FirebaseStorage {
}
exports.FirebaseStorage = FirebaseStorage;
_a = FirebaseStorage;
FirebaseStorage.uploadSingleImage = (baseUrl, file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uniqueFileName = `${baseUrl}/${(0, uuid_1.v4)()}.jpg`;
        const firebaseFile = storage.file(uniqueFileName);
        yield firebaseFile.save(file.buffer, {
            public: true,
            metadata: {
                contentType: file.mimetype,
                cacheControl: "public, max-age=31536000",
            },
        });
        const [url] = yield firebaseFile.getSignedUrl({
            action: "read",
            expires: "03-09-2030",
        });
        return { status: true, url: uniqueFileName };
    }
    catch (error) {
        console.error(`Error uploading image file : `, error);
        return { status: false, message: "Failed to upload image" };
    }
});
FirebaseStorage.uploadCoverImages = (baseUrl, files) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const urls = [];
        yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            const uniqueFileName = `${baseUrl}/${(0, uuid_1.v4)()}.jpg`;
            const firebaseFile = storage.file(uniqueFileName);
            yield firebaseFile.save(file.buffer, {
                public: true,
                metadata: {
                    contentType: file.mimetype,
                    cacheControl: "public, max-age=31536000",
                },
            });
            const [url] = yield firebaseFile.getSignedUrl({
                action: "read",
                expires: "03-09-2030",
            });
            urls.push(uniqueFileName);
        })));
        return { status: true, urls };
    }
    catch (error) {
        console.error(`Error uploading cover images : `, error);
        return { status: false, message: "Failed to upload cover images" };
    }
});
FirebaseStorage.uploadSubEventCoverImages = (baseUrl, files) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const urls = [];
        yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            const uniqueFileName = `${baseUrl}/${(0, uuid_1.v4)()}.jpg`;
            const firebaseFile = storage.file(uniqueFileName);
            yield firebaseFile.save(file.buffer, {
                public: true,
                metadata: {
                    contentType: file.mimetype,
                    cacheControl: "public, max-age=31536000",
                },
            });
            const [url] = yield firebaseFile.getSignedUrl({
                action: "read",
                expires: "03-09-2030",
            });
            urls.push(uniqueFileName);
        })));
        return { status: true, urls };
    }
    catch (error) {
        console.error(`Error uploading sub-event cover images : `, error);
        return {
            status: false,
            message: "Failed to upload sub-event cover images",
        };
    }
});
FirebaseStorage.deleteFile = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = storage.file(filePath);
        yield file.delete();
        return { status: true, message: "File deleted successfully" };
    }
    catch (error) {
        console.error(`Error deleting file : `, error);
        return { status: false, message: "Failed to delete file" };
    }
});
FirebaseStorage.updateFile = (filePath, file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const firebaseFile = storage.file(filePath);
        yield firebaseFile.save(file.buffer, {
            public: true,
            metadata: {
                contentType: file.mimetype,
                cacheControl: "public, max-age=31536000",
            },
        });
        const [url] = yield firebaseFile.getSignedUrl({
            action: "read",
            expires: "03-09-2030",
        });
        return { status: true, url: filePath };
    }
    catch (error) {
        console.error(`Error updating file : `, error);
        return { status: false, message: "Failed to update file" };
    }
});
