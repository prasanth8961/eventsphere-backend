"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponseHandler = void 0;
class ApiResponseHandler {
    static success(res, data, message, statusCode = 200) {
        const response = {
            success: true,
            data,
            message,
        };
        res.status(statusCode).send(response);
    }
    static error(res, message, statusCode = 500) {
        const response = {
            success: false,
            message,
        };
        res.status(statusCode).send(response);
    }
    static warning(res, message, data = null, statusCode = 300) {
        const response = {
            success: false,
            message,
            data,
        };
        res.status(statusCode).send(response);
    }
    static notFound(res, message, statusCode = 404) {
        const response = {
            success: false,
            message,
        };
        res.status(statusCode).send(response);
    }
}
exports.ApiResponseHandler = ApiResponseHandler;
