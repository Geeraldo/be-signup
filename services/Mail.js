import NodeMailer from 'nodemailer'
import * as dotenv from "dotenv"
dotenv.config()

class EmailSender {
    transport

    constructor() {
        this.transport = NodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth:{
            user: process.env.EMAIL_HOST,
            pass: process.env.EMAIL_PASSWORD,
            },
        })
    }

    async sendMessage(to, subject, text, html) {
        let mailOptions = {
            from: 'lantanggeraldo@gmail.com',
            to,
            subject,
            text,
            html,
        }

        await this.transport.sendMail(mailOptions)
    }
}

export default new EmailSender()