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
const nodemailer_1 = __importDefault(require("nodemailer"));
class MailServices {
    constructor() {
        this.sendMailToUser = (buffer) => __awaiter(this, void 0, void 0, function* () {
            const transporter = nodemailer_1.default.createTransport({
                service: 'gmail',
                auth: {
                    user: 'suriyasivakumar60@gmail.com',
                    pass: 'ehno snrm dipn mamw'
                }
            });
            const mailOptions = {
                from: '"Surya from Event Manager" <suriyasivakumar60@gmail.com>',
                to: "suriyasivakumar80@gmail.com",
                subject: "🎟️ Your Event Ticket Confirmation",
                text: "Thanks for booking. Ticket ID: 10000",
                html: `
              <h2>Thanks for booking your event!</h2>
              <p>Your ticket ID is <strong>10000</strong></p>
              <p>We look forward to seeing you there!</p>
              <br/>
              <p>Cheers,<br/>Surya<br/>Event Manager Team</p>
              <small>This email was sent by Surya via Gmail SMTP</small>
            `,
                attachments: [
                    {
                        filename: "ticket.pdf",
                        content: buffer,
                        contentType: "application/pdf"
                    }
                ]
            };
            const data = yield transporter.sendMail(mailOptions);
            console.log("Mail sended : " + data.response);
        });
    }
}
exports.default = MailServices;
