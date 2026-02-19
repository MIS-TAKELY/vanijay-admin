import nodemailer from "nodemailer";

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log("NODEMAILER: Transporter connection error:", error);
  } else {
    console.log("NODEMAILER: Server is ready to take our messages");
  }
});


type TemplateContext = {
  url?: string;
  name?: string;
  [key: string]: any;
};

type EmailTemplate = {
  subject: string | ((context: TemplateContext) => string);
  text: (context: TemplateContext) => string;
  html: (context: TemplateContext) => string;
};

const getEmailLayout = (content: string, subject: string) => {
  const appUrl = "https://www.vanijay.com";
  const logoUrl = `${appUrl}/final_blue_text_logo_500by500.png`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f7; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .header { padding: 30px; text-align: center; background-color: #ffffff; border-bottom: 1px solid #f0f0f0; }
        .logo { max-width: 150px; height: auto; }
        .content { padding: 40px 30px; }
        .footer { padding: 30px; background-color: #f8f9fa; color: #6c757d; font-size: 13px; text-align: center; border-top: 1px solid #eeeeee; }
        .social-links { margin-bottom: 20px; }
        .social-links a { display: inline-block; margin: 0 10px; color: #6c757d; text-decoration: none; }
        .social-links img { width: 24px; height: 24px; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #007bff !important; color: #ffffff !important; text-decoration: none !important; border-radius: 5px; font-weight: 600; margin: 20px 0; }
        .info-box { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #007bff; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="Vanijay" class="logo">
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <div class="social-links">
            <a href="https://www.facebook.com/VanijayEnterprises" title="Facebook"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="FB"></a>
            <a href="https://www.instagram.com/vanijay_enterprises" title="Instagram"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="IG"></a>
            <a href="https://x.com/Vanijay_Ent" title="X"><img src="https://cdn-icons-png.flaticon.com/512/3256/3256013.png" alt="X"></a>
            <a href="https://www.tiktok.com/@vanijay_enterprises" title="TikTok"><img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="TikTok"></a>
          </div>
          <p>&copy; ${new Date().getFullYear()} Vanijay. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const TEMPLATES: Record<string, EmailTemplate> = {
  VERIFICATION: {
    subject: "Verify your email - Vanijay",
    text: (ctx) => `Please verify your email by clicking on this link: ${ctx.url}`,
    html: (ctx) => getEmailLayout(`
      <h2 style="color: #333; margin-top: 0;">Welcome to Vanijay!</h2>
      <p>Hello ${ctx.name || 'there'},</p>
      <p>Please verify your email address by clicking the button below:</p>
      <div style="text-align: center;">
        <a href="${ctx.url}" class="btn">Verify Email Address</a>
      </div>
      <p style="color: #666; font-size: 0.9em; margin-top: 30px;">If you didn't request this, you can safely ignore this email.</p>
    `, "Verify your email - Vanijay"),
  },
  PASSWORD_RESET: {
    subject: "Reset your password - Vanijay",
    text: (ctx) => `You requested a password reset. Use this link: ${ctx.url}`,
    html: (ctx) => getEmailLayout(`
        <h2 style="color: #333; margin-top: 0;">Password Reset</h2>
        <p>Hello,</p>
        <p>You recently requested to reset your password for your Vanijay account. Click the button below to proceed:</p>
        <div style="text-align: center;">
          <a href="${ctx.url}" class="btn" style="background-color: #dc3545 !important;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 0.9em; margin-top: 30px;">This link will expire soon. If you didn't request a password reset, please ignore this email.</p>
    `, "Reset your password - Vanijay"),
  },
  NEW_ORDER: {
    subject: "New Order Received! - Vanijay",
    text: (ctx) => `You have received a new order. Total: NPR ${ctx.total}`,
    html: (ctx) => getEmailLayout(`
        <h2 style="color: #333; margin-top: 0;">New Order Received!</h2>
        <p>Hello ${ctx.name || 'Seller'},</p>
        <p>Great news! You have received a new order on Vanijay.</p>
        <div class="info-box">
          <p style="margin: 0; font-size: 1.1em; font-weight: bold;">Order Summary:</p>
          <p style="margin: 10px 0 0 0;">Total Amount: <strong>NPR ${ctx.total}</strong></p>
        </div>
        <p>Please log in to your dashboard to process the order as soon as possible.</p>
        <p style="color: #666; font-size: 0.9em;">Thank you for selling on Vanijay!</p>
    `, "New Order Received! - Vanijay"),
  },
  CREDENTIALS_BACKUP: {
    subject: "Admin Credentials Backup - Vanijay",
    text: (ctx) => `Admin Credentials Backup\n\nUsername: ${ctx.username}\nPassword: ${ctx.password}\nTimestamp: ${ctx.timestamp}`,
    html: (ctx) => getEmailLayout(`
        <h2 style="color: #333; margin-top: 0;">Admin Credentials Backup</h2>
        <p>${ctx.isInitial ? 'Your initial admin credentials have been created.' : 'Your admin credentials have been updated.'}</p>
        <div class="info-box" style="background-color: #fff3cd; border-left-color: #ffc107;">
          <p style="margin: 0; font-size: 0.9em; font-weight: bold; color: #856404;">⚠️ CONFIDENTIAL INFORMATION</p>
          <p style="margin: 10px 0 0 0; color: #856404;">Please keep this information secure and delete this email after storing the credentials safely.</p>
        </div>
        <div class="info-box">
          <p style="margin: 0; font-weight: bold;">Username:</p>
          <p style="margin: 5px 0 15px 0; font-family: monospace; font-size: 1.2em;">${ctx.username}</p>
          <p style="margin: 0; font-weight: bold;">Password:</p>
          <p style="margin: 5px 0 15px 0; font-family: monospace; font-size: 1.2em;">${ctx.password}</p>
          <p style="margin: 0; font-weight: bold;">Timestamp:</p>
          <p style="margin: 5px 0 0 0; font-size: 0.9em; color: #666;">${ctx.timestamp}</p>
        </div>
        <p style="color: #dc3545; font-size: 0.9em; font-weight: bold; margin-top: 20px;">🔒 Security Notice:</p>
        <p style="color: #666; font-size: 0.9em;">This email contains sensitive credentials. Do not forward this email to anyone.</p>
    `, "Admin Credentials Backup"),
  },
};

export const senMail = async (
  receiverEmail: string,
  templateKey: keyof typeof TEMPLATES,
  context: TemplateContext
) => {
  console.log("---------------- SENMAIL CALLED ----------------");
  try {
    const template = TEMPLATES[templateKey];
    if (!template) {
      throw new Error(`Template "${templateKey}" not found`);
    }

    console.log(`NODEMAILER: Attempting to send ${templateKey} email to:`, receiverEmail);

    const info = await transporter.sendMail({
      from: '"Vanijay" <mailitttome@gmail.com>',
      to: receiverEmail,
      subject: typeof template.subject === 'function' ? template.subject(context) : template.subject,
      text: template.text(context),
      html: template.html(context),
    });

    console.log("NODEMAILER: Message sent successfully:", info.messageId);
    return info;
  } catch (error: any) {
    console.error("NODEMAILER: Error while sending email:", error.message);
    if (error.stack) console.error(error.stack);
    throw error;
  }
};
