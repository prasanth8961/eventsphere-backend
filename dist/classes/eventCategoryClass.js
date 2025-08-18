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
const knex_1 = __importDefault(require("../Config/knex"));
const table_1 = require("../tables/table");
class EventCategoryClass {
    constructor() {
        this.isCategoryExistsOrNot = (categoryName) => __awaiter(this, void 0, void 0, function* () {
            const categoryExists = yield (0, knex_1.default)(table_1.tableName.CATEGORY)
                .select("name")
                .where("name", categoryName)
                .first();
            return categoryExists;
        });
        this.createCategory = (categoryData) => __awaiter(this, void 0, void 0, function* () {
            const [id] = yield (0, knex_1.default)(table_1.tableName.CATEGORY).insert(categoryData);
            return true;
        });
        this.getAllCategories = (search, limit, offset) => __awaiter(this, void 0, void 0, function* () {
            const query = (0, knex_1.default)(table_1.tableName.CATEGORY);
            if (search) {
                query.where("name", "like", `%${search}%`);
            }
            const [{ count }] = yield query.clone().count("* as count");
            const categories = yield query.select("*").offset(offset).limit(limit);
            return { categories, totalPage: Math.ceil(Number(count) / limit), totalRecords: Number(count) };
        });
        this.updateCategory = (categoryUpdatedData) => __awaiter(this, void 0, void 0, function* () {
            const updated = yield (0, knex_1.default)(table_1.tableName.CATEGORY)
                .where("_id", categoryUpdatedData._id)
                .update(categoryUpdatedData);
            return updated;
        });
    }
    deleteCategoryById(categoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            const deleted = yield (0, knex_1.default)(table_1.tableName.CATEGORY)
                .where("_id", categoryId)
                .delete();
            return deleted;
        });
    }
}
exports.default = EventCategoryClass;
