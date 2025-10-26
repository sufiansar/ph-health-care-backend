import nodemailer from "nodemailer";
import config from "../../config";
import ejs from "ejs";
import path from "path";

const transporter = nodemailer.createTransport({
  secure: true,
  auth: {
    user: config.smtp.smtp_user,
    pass: config.smtp.smtp_pass,
  },
  host: config.smtp.smtp_host,
  port: Number(config.smtp.smtp_port),
});

export interface EmailOptions {
  to: string;
  subject: string;
  templateName?: string;
  templateData?: Record<string, any>;
  attachments?: {
    filename: string;

    content: Buffer;
    contentType: string;
  }[];
  text: string;
}

export const sendEmail = async ({
  to,
  subject,

  templateName,
  templateData,
  attachments,
}: EmailOptions) => {
  const templatePath = path.join(__dirname, `templates/${templateName}.ejs`);

  const template = await ejs.renderFile(templatePath, templateData);

  const mailOptions = await transporter.sendMail({
    from: config.smtp.smtp_from,
    to: to,
    subject: subject,
    html: template,
    attachments: attachments?.map((attachment) => ({
      filename: attachment.filename,
      content: attachment.content,
      contentType: attachment.contentType,
    })),
  });

  return mailOptions;
};
