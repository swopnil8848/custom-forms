import nodemailer, { Transporter } from "nodemailer";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { convert } from "html-to-text";
import ejs from "ejs";
import fs from "fs";
import path from "path";

// Common interface for all email services
interface EmailService {
  send(options: {
    templateName: string;
    subject: string;
    dynamicData?: Record<string, any>;
  }): Promise<any>;
}

// Base Email class with common properties and methods
abstract class BaseEmail implements EmailService {
  protected to: string;
  protected firstName: string;
  protected url?: string;
  protected from: string;
  protected otp?: string;

  constructor(
    user: { email: string; firstName: string },
    url?: string,
    otp?: string
  ) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.url = url;
    this.from = process.env.MAIL_USERNAME || "";
    this.otp = otp;
  }

  // Common method to render email template
  protected renderTemplate(
    templateName: string,
    dynamicData?: Record<string, any>
  ): string {
    const templatePath = path.join(
      __dirname,
      "../views",
      `${templateName}.ejs`
    );
    return ejs.render(fs.readFileSync(templatePath, "utf-8"), {
      name: this.firstName,
      url: this.url,
      otp: this.otp,
      logoURL:
        process.env.BACKEND_LOGO_URL ||
        "https://emis-api.ekrasunya.com/logo/logoKU.png",
      ...dynamicData,
    });
  }

  // Abstract method to be implemented by each email service
  abstract send(options: {
    templateName: string;
    subject: string;
    dynamicData?: Record<string, any>;
  }): Promise<any>;
}

// NodeMailer implementation
class NodeMailerEmail extends BaseEmail {
  private newTransport(): Transporter {
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: process.env.MAIL_SECURE === "true",
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
      tls: {
        ciphers: "SSLv3",
      },
    });
  }

  async send({
    templateName,
    subject,
    dynamicData,
  }: {
    templateName: string;
    subject: string;
    dynamicData?: Record<string, any>;
  }): Promise<any> {
    try {
      // Render email template
      const html = this.renderTemplate(templateName, dynamicData);

      // Email options
      const mailOptions = {
        from: `${process.env.MAIL_FROM_NAME || "System"} <${this.from}>`,
        to: this.to,
        subject,
        html,
        text: convert(html, { wordwrap: 50 }),
      };

      // Send email
      const info = await this.newTransport().sendMail(mailOptions);
      return {
        success: true,
        message: `Email sent via NodeMailer: ${info.response}`,
        provider: "nodemailer",
      };
    } catch (error) {
      console.error("NodeMailer email error:", error);
      return {
        success: false,
        message: "Failed to send email via NodeMailer",
        error,
        provider: "nodemailer",
      };
    }
  }
}

// MailerSend implementation
class MailerSendEmail extends BaseEmail {
  private mailerSend: MailerSend;

  constructor(
    user: { email: string; firstName: string },
    url?: string,
    otp?: string
  ) {
    super(user, url, otp);

    // Initialize MailerSend with API key
    this.mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY || "",
    });
  }

  async send({
    templateName,
    subject,
    dynamicData,
  }: {
    templateName: string;
    subject: string;
    dynamicData?: Record<string, any>;
  }): Promise<any> {
    try {
      // Render email template
      const html = this.renderTemplate(templateName, dynamicData);

      // Use the configured sender domain or fall back to default
      const senderEmail =
        process.env.MAILERSEND_SENDER_EMAIL || "noreply@ekrasunya.com.np";
      const senderName = process.env.MAIL_FROM_NAME || "System";

      const sender = new Sender(senderEmail, senderName);
      const recipients = [new Recipient(this.to, this.firstName)];

      // Create email params
      const emailParams = new EmailParams()
        .setFrom(sender)
        .setTo(recipients)
        .setSubject(subject)
        .setHtml(html)
        .setText(convert(html));

      // Set reply-to as the original system email if different from sender
      if (this.from !== senderEmail) {
        emailParams.setReplyTo({
          email: this.from,
          name: senderName,
        });
      }

      // Send email
      const response = await this.mailerSend.email.send(emailParams);
      return {
        success: true,
        message: `Email sent via MailerSend`,
        response,
        provider: "mailersend",
      };
    } catch (error) {
      console.error("MailerSend email error:", error);
      return {
        success: false,
        message: `Failed to send email to ${this.to} via MailerSend`,
        error,
        provider: "mailersend",
      };
    }
  }
}

// Factory class to create the appropriate email service
export class EmailFactory {
  static getEmailService(
    user: { email: string; firstName: string },
    url?: string,
    otp?: string
  ): EmailService {
    // Get provider from environment variables or use default
    const provider = process.env.EMAIL_PROVIDER || "mailersend";

    console.log(`Using email provider: ${provider}`);

    switch (provider.toLowerCase()) {
      case "nodemailer":
        console.log("nodemailer sending email:: ");
        return new NodeMailerEmail(user, url, otp);
      case "mailersend":
        return new MailerSendEmail(user, url, otp);
      default:
        console.warn(
          `Unknown email provider: ${provider}, falling back to MailerSend`
        );
        return new MailerSendEmail(user, url, otp);
    }
  }
}

// Main Email class for backward compatibility and cleaner API
export class Email {
  private emailService: EmailService;

  constructor(
    user: { email: string; firstName: string },
    url?: string,
    otp?: string
  ) {
    console.log("Creating email service for user:", user.email);
    this.emailService = EmailFactory.getEmailService(user, url, otp);
  }

  async send(options: {
    templateName: string;
    subject: string;
    dynamicData?: Record<string, any>;
  }): Promise<any> {
    return this.emailService.send(options);
  }
}
