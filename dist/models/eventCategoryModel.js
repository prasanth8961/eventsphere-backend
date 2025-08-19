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
const eventCategoryClass_1 = __importDefault(require("../classes/eventCategoryClass"));
const Storage_1 = require("../Services/Storage");
const customError_1 = __importDefault(require("../Utililes/customError"));
const eventCategory = new eventCategoryClass_1.default();
class EventCategoryModel {
    constructor() {
        this.getAllCategories = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { limit = 10, search = "", page = 1 } = req.body;
            const offset = (page - 1) * 10;
            const { categories, totalPage, totalRecords } = yield eventCategory.getAllCategories(search, limit, offset);
            res.status(200).json({
                success: true,
                data: {
                    categories,
                    totalPage,
                    totalRecords
                },
                message: "Category"
            });
        }));
        this.createCategory = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { categoryName, file: categoryImageFile } = req.body;
            if (!categoryName || !categoryImageFile) {
                return next(new customError_1.default("Category name or file missing", 400));
            }
            const isCategoryExists = yield eventCategory.isCategoryExistsOrNot(categoryName);
            if (isCategoryExists) {
                return next(new customError_1.default("Category name already registered", 400));
            }
            const imgUploadedResponse = yield Storage_1.FirebaseStorage.uploadSingleImage(`categories/CATEGORY IMAGES`, categoryImageFile);
            if (!imgUploadedResponse.status) {
                return next(new customError_1.default((_a = imgUploadedResponse.message) !== null && _a !== void 0 ? _a : "Failed to upload category image."));
            }
            const categoryData = {
                name: categoryName,
                image: imgUploadedResponse.url,
                is_enable: 1,
            };
            const response = yield eventCategory.createCategory(categoryData);
            res.status(200).json({
                success: true,
                data: null,
                message: "Category created successfully"
            });
        }));
        this.deleteCategory = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            // const data = await eventCategory.getAllCategories();
            // res.status(200).json({
            //     success: true,
            //     data: data,
            //     message: "Category"
            // })
        }));
    }
}
exports.default = EventCategoryModel;
