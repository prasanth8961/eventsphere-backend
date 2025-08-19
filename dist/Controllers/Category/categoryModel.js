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
exports.getAllCategories = exports.getCategoryById = exports.deleteCategoryByID = exports.updateCategoryByID = exports.createCategory = void 0;
const apiResponseMiddleware_1 = require("../../Middleware/apiResponseMiddleware");
const Storage_1 = require("../../Services/Storage");
const categoryClass_1 = require("./categoryClass");
const messages_1 = require("../../Common/messages");
const categoryInstance = new categoryClass_1.CategoryClass();
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { categoryName, file: categoryImageFile } = req.body;
        console.log(req.body.categoryName);
        console.log({ name: categoryName, file: categoryImageFile });
        if (!categoryName || !categoryImageFile) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.VALIDATION_ERROR, 400);
        }
        const imgUploadedResponse = yield Storage_1.FirebaseStorage.uploadSingleImage(`categories/CATEGORY IMAGES`, categoryImageFile);
        if (!imgUploadedResponse.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, (_a = imgUploadedResponse.message) !== null && _a !== void 0 ? _a : "Failed to upload category image.", 500);
        }
        const categoryData = {
            name: categoryName,
            image: imgUploadedResponse.url,
            is_enable: 1,
        };
        const response = yield categoryInstance.createCategory(categoryData);
        if (!response.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.CATEGORY_CREATION_FAILED, 500);
        }
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, response.data, messages_1.COMMON_MESSAGES.CATEGORY_CREATED, 200);
    }
    catch (error) {
        console.log(error);
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.SERVER_ERROR, 500);
    }
});
exports.createCategory = createCategory;
const updateCategoryByID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { data: bodyData, file: categoryImageFile } = req.body;
        if (!bodyData || (!bodyData.name && !categoryImageFile)) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.VALIDATION_ERROR, 400);
        }
        const categoryExists = yield categoryInstance.getCategoryById(bodyData._id);
        if (!categoryExists.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.CATEGORY_NOT_FOUND, 404);
        }
        let imageUrl = bodyData.image;
        if (categoryImageFile) {
            const imgUploadedResponse = yield Storage_1.FirebaseStorage.uploadSingleImage(`categories/CATEGORY IMAGES`, categoryImageFile);
            if (imgUploadedResponse.status) {
                imageUrl = imgUploadedResponse.url;
            }
        }
        const categoryUpdatedData = {
            _id: bodyData._id,
            name: bodyData.name,
            image: imageUrl,
            is_enable: (_a = bodyData.is_enable) !== null && _a !== void 0 ? _a : 1,
        };
        const response = yield categoryInstance.updateCategory(categoryUpdatedData);
        if (!response.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.CATEGORY_UPDATE_FAILED, 500);
        }
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, response.data, messages_1.COMMON_MESSAGES.CATEGORY_UPDATED, 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.SERVER_ERROR, 500);
    }
});
exports.updateCategoryByID = updateCategoryByID;
const deleteCategoryByID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.body;
        if (!_id) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.VALIDATION_ERROR, 400);
        }
        const categoryExists = yield categoryInstance.getCategoryById(_id);
        if (!categoryExists.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.CATEGORY_NOT_FOUND, 404);
        }
        const response = yield categoryInstance.deleteCategoryById(_id);
        if (!response.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.CATEGORY_DELETION_FAILED, 500);
        }
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, [], messages_1.COMMON_MESSAGES.CATEGORY_DELETED, 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.SERVER_ERROR, 500);
    }
});
exports.deleteCategoryByID = deleteCategoryByID;
const getCategoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.body;
        if (!_id) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.VALIDATION_ERROR, 400);
        }
        const response = yield categoryInstance.getCategoryById(_id);
        if (!response.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.CATEGORY_NOT_FOUND, 404);
        }
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, response.data, messages_1.COMMON_MESSAGES.CATEGORY_FETCHED, 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.SERVER_ERROR, 500);
    }
});
exports.getCategoryById = getCategoryById;
const getAllCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const response = yield categoryInstance.getAllCategories();
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, (_a = response.data) !== null && _a !== void 0 ? _a : [], messages_1.COMMON_MESSAGES.CATEGORIES_FETCHED, 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, messages_1.COMMON_MESSAGES.SERVER_ERROR, 500);
    }
});
exports.getAllCategories = getAllCategories;
