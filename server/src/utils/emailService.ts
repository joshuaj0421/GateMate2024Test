const nodemailer = require("nodemailer");

class RateLimiter {
    private emailLog: Map<string, number> = new Map();
    private readonly COOLDOWN_PERIOD = 1800000;
  
    canSendEmail(key: string): boolean {
      const lastSentTime = this.emailLog.get(key);
      const currentTime = Date.now();
  
      if (!lastSentTime || (currentTime - lastSentTime) >= this.COOLDOWN_PERIOD) {
        this.emailLog.set(key, currentTime);
        return true;
      }
      return false;
    }
  }
  
const rateLimiter = new RateLimiter();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendCriticalGateAlert = async (
    userEmail: string, 
    gateId: number,
    status: string,
    actualWaterLevel: number,
    idealWaterLevel: number
  ) => {
    // Create a unique key for this user-gate combination
    const rateLimitKey = `${userEmail}-${gateId}`;

    // Check if we can send an email based on rate limiting
    if (!rateLimiter.canSendEmail(rateLimitKey)) {
      console.log(`Email skipped due to rate limiting for ${rateLimitKey}`);
      return;
    }

    try {
      // await transporter.sendMail({
      //   from: process.env.EMAIL_USER,
      //   to: userEmail,
      //   subject: `Critical Gate Alert - Gate ${gateId}`,
      //   html: `
      //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      //       <h2 style="color: #d9534f;">Critical Gate Alert</h2>
      //       <p style="font-size: 16px;">Dear User,</p>
      //       <p style="font-size: 16px;">We have detected a critical status for one of your gates. Please find the details below:</p>
      //       <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      //         <tr>
      //           <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Gate ID</th>
      //           <td style="padding: 8px; border-bottom: 1px solid #ddd;">${gateId}</td>
      //         </tr>
      //         <tr>
      //           <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Status</th>
      //           <td style="padding: 8px; border-bottom: 1px solid #ddd;">${status}</td>
      //         </tr>
      //         <tr>
      //           <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Current Water Level</th>
      //           <td style="padding: 8px; border-bottom: 1px solid #ddd;">${actualWaterLevel}</td>
      //         </tr>
      //         <tr>
      //           <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Ideal Water Level</th>
      //           <td style="padding: 8px; border-bottom: 1px solid #ddd;">${idealWaterLevel}</td>
      //         </tr>
      //       </table>
      //       <p style="font-size: 16px; margin-top: 20px;">Please check your GateMate dashboard for more details.</p>
      //       <p style="font-size: 16px;">Best regards,</p>
      //       <p style="font-size: 16px;">The GateMate Team</p>
      //     </div>
      //   `
      // });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
};