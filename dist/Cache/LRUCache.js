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
exports.LRUCache = void 0;
const apiResponseMiddleware_1 = require("../Middleware/apiResponseMiddleware");
class CacheEntry {
    constructor(url, response) {
        this.url = url;
        this.response = response;
        this.prevEntry = null;
        this.nextEntry = null;
    }
}
class LRUCache {
    constructor(capacity) {
        //<--add to front ---->
        this.addToMostRecent = (newEntry) => {
            newEntry.nextEntry = this.mostRecentEntry;
            newEntry.prevEntry = null;
            if (this.mostRecentEntry != null) {
                this.mostRecentEntry.prevEntry = newEntry;
            }
            this.mostRecentEntry = newEntry;
            if (this.leastRecentEntry == null) {
                this.leastRecentEntry = newEntry;
            }
        };
        //<-- move to front ---->
        this.markAsMostRecent = (entry) => {
            if (entry == this.mostRecentEntry)
                return;
            this.removeEntry(entry);
            this.addToMostRecent(entry);
        };
        //<-- remove---->
        this.removeEntry = (entry) => {
            if (entry.prevEntry != null) {
                entry.prevEntry.nextEntry = entry.nextEntry;
            }
            else {
                this.mostRecentEntry = entry.nextEntry;
            }
            if (entry.nextEntry != null) {
                entry.nextEntry.prevEntry = entry.prevEntry;
            }
            else {
                this.leastRecentEntry = entry.prevEntry;
            }
        };
        //<-- remove from rear---->
        this.evictLeastRecent = () => {
            if (this.leastRecentEntry == null)
                return;
            this.cacheMap.delete(this.leastRecentEntry.url);
            if (this.leastRecentEntry.prevEntry != null) {
                this.leastRecentEntry.prevEntry.nextEntry = null;
            }
            else {
                this.mostRecentEntry = null;
            }
            this.leastRecentEntry = this.leastRecentEntry.prevEntry;
        };
        //<-- get ---->
        this.getResponse = (url, res) => {
            if (!this.cacheMap.has(url)) {
                console.log("Cache is not stored your request data");
                return;
            }
            const responseData = this.cacheMap.get(url);
            this.markAsMostRecent(responseData);
            return apiResponseMiddleware_1.ApiResponseHandler.success(res, responseData === null || responseData === void 0 ? void 0 : responseData.response, "success response", 200);
        };
        //<-- put ---->
        this.storeResponse = (url, response) => __awaiter(this, void 0, void 0, function* () {
            if (this.cacheMap.has(url)) {
                const entry = this.cacheMap.get(url);
                this.markAsMostRecent(entry);
            }
            else {
                const newEntry = new CacheEntry(url, response);
                if (this.cacheMap.size >= this.capacity) {
                    this.evictLeastRecent();
                }
                this.cacheMap.set(url, newEntry);
                this.addToMostRecent(newEntry);
            }
        });
        //<--- is valid key --->
        this.keyExists = (url) => {
            return this.cacheMap.has(url);
        };
        this.capacity = capacity;
        this.cacheMap = new Map();
        this.mostRecentEntry = null;
        this.leastRecentEntry = null;
    }
}
exports.LRUCache = LRUCache;
