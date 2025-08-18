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
const customError_1 = __importDefault(require("../Utililes/customError"));
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
class PaymentModel {
    constructor() {
        this.razorPay = new razorpay_1.default({
            key_secret: process.env.RAZOR_PAY_SECRET_KEY,
            key_id: process.env.RAZOR_PAY_KEY_ID
        });
        this.secret = process.env.RAZOR_PAY_SECRET_KEY;
        this.createOrder = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            console.log("-----");
            console.log({
                key_secret: process.env.RAZOR_PAY_SECRET_KEY,
                key_id: process.env.RAZOR_PAY_KEY_ID
            });
            const { amount, currency = "INR" } = req.body;
            if (!amount)
                return next(new customError_1.default("Amount is missing", 401));
            const receipt = "receipt" + Math.random() + Date.now();
            const options = {
                amount: amount * 100,
                currency: currency,
                receipt: receipt,
                payment_capture: 1
            };
            console.log("-----");
            const order = yield this.razorPay.orders.create(options);
            console.log("-----");
            console.log(order);
            res.status(200).json({
                success: true,
                data: order,
                message: "Order detail"
            });
        }));
        this.verifyPayment = (0, errorMiddleware_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { orderId, paymentId, signatureId } = req.body;
            if (!orderId || !paymentId || !signatureId)
                return next(new customError_1.default("Enter missing datas", 401));
            const generatedSignatureId = crypto_1.default.createHmac("sha256", this.secret).update(orderId + "|" + paymentId).digest("hex");
            console.log(generatedSignatureId);
            if (generatedSignatureId !== signatureId)
                return next(new customError_1.default("Invalid signature", 401));
            res.status(200).json({
                success: true,
                data: null,
                message: "Payment verified"
            });
        }));
    }
}
exports.default = PaymentModel;
