"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (err, req, res, next) => {
    console.log("ERROR : " + err);
    const statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    if (process.env.NODE_ENV == "PROD") {
        if (err.codde && err.code.startsWith("ER_")) {
            message = "Internal Server Error(DB)";
        }
        res.status(statusCode).json({
            success: false,
            data: null,
            message: message
        });
    }
    else {
        res.status(statusCode).json({
            success: false,
            data: null,
            message: message,
            stack: err
        });
    }
};
exports.default = errorHandler;
