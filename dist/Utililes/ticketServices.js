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
const qrcode_1 = __importDefault(require("qrcode"));
const puppeteer_1 = __importDefault(require("puppeteer"));
class TicketServices {
    constructor() {
        this.generateQrCodeBase64 = (text) => __awaiter(this, void 0, void 0, function* () {
            return yield qrcode_1.default.toDataURL(text);
        });
        this.generateTicketPdf = () => __awaiter(this, void 0, void 0, function* () {
            const qrCodeUrl = yield this.generateQrCodeBase64("suriya");
            const browser = yield puppeteer_1.default.launch();
            const page = yield browser.newPage();
            const html = `
    <html>
      <head>
        <style>
          body { font-family: sans-serif; padding: 30px; }
          .ticket {
            border: 2px dashed #444;
            padding: 20px;
            width: 500px;
            margin: auto;
            text-align: center;
          }
          .qr {
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <h1>🎟️ Event Ticket</h1>
         

          <div class="qr">
            <img src="${qrCodeUrl}" width="150" height="150" />
          </div>

          <p>Scan this QR at the entrance</p>
        </div>
      </body>
    </html>
  `;
            yield page.setContent(html);
            const pdf = yield page.pdf({ format: 'A5', printBackground: true });
            browser.close();
            return pdf;
        });
    }
}
exports.default = TicketServices;
