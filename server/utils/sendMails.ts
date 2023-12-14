require("dotenv").config();
import ejs from "ejs";
import nodemailer, { Transporter } from "nodemailer";
import path from "path";

interface EmailOptions {
  email: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
}

const sendMails = async (options: EmailOptions): Promise<void> => {
  const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const { email, subject, data, template } = options;

  // * GET THE PATH OF THE EMAIL TEMPLATE
  const templatePath = path.join(__dirname, "../mails/template.ejs");

  // * RENDER THE EMAIL TEMPLATE BY EJS
  const html: string = await ejs.renderFile(templatePath, data);

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendMails;
