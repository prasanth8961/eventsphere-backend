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
exports.CategoryClass = void 0;
const knex_1 = __importDefault(require("../../Config/knex"));
class CategoryClass {
    createCategory(categoryData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categoryExists = yield (0, knex_1.default)("categories")
                    .select("name")
                    .where("name", categoryData.name)
                    .first();
                if (categoryExists) {
                    return { status: false };
                }
                const [id] = yield (0, knex_1.default)("categories").insert(categoryData);
                return { status: true, data: id };
            }
            catch (error) {
                console.error("Error creating category:", error);
                return {
                    status: false
                };
            }
        });
    }
    getCategoryById(categoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const category = yield (0, knex_1.default)("categories")
                    .select("*")
                    .where("_id", categoryId)
                    .first();
                if (!category) {
                    return { status: false };
                }
                return { status: true, data: category };
            }
            catch (error) {
                console.error("Error fetching category by ID:", error);
                return {
                    status: false
                };
            }
        });
    }
    getAllCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categories = yield (0, knex_1.default)("categories").select("*");
                if (categories.length === 0) {
                    return { status: true, data: [] };
                }
                return { status: true, data: categories };
            }
            catch (error) {
                console.error("Error fetching all categories:", error);
                return {
                    status: false,
                };
            }
        });
    }
    updateCategory(categoryUpdatedData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updated = yield (0, knex_1.default)("categories")
                    .where("_id", categoryUpdatedData._id)
                    .update(categoryUpdatedData);
                if (updated === 0) {
                    return {
                        status: false,
                    };
                }
                return { status: true };
            }
            catch (error) {
                console.error("Error updating category:", error);
                return {
                    status: false,
                };
            }
        });
    }
    deleteCategoryById(categoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deleted = yield (0, knex_1.default)("categories")
                    .where("_id", categoryId)
                    .delete();
                if (deleted === 0) {
                    return {
                        status: false,
                    };
                }
                return { status: true };
            }
            catch (error) {
                console.error("Error deleting category:", error);
                return {
                    status: false
                };
            }
        });
    }
}
exports.CategoryClass = CategoryClass;
