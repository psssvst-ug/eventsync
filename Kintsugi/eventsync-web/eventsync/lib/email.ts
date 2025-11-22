import { Resend } from "resend";

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendCredentialsEmailParams {
    to: string;
    name: string;
    email: string;
    password: string;
    teamName: string;
    teamLeaderName: string;
}

/**
 * Send credentials email to a new team member
 */
export async function sendCredentialsEmail({
    to,
    name,
    email,
    password,
    teamName,
    teamLeaderName,
}: SendCredentialsEmailParams) {
    try {
        const { data, error } = await resend.emails.send({
            from:
                process.env.EMAIL_FROM ||
                "EventSync <onboarding@eventsync.com>",
            to,
            subject: `Welcome to ${teamName} on EventSync`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background: #ffffff;
                            border-radius: 8px;
                            padding: 30px;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .header h1 {
                            color: #2563eb;
                            margin: 0;
                            font-size: 28px;
                        }
                        .content {
                            margin-bottom: 30px;
                        }
                        .credentials-box {
                            background: #f8fafc;
                            border: 1px solid #e2e8f0;
                            border-radius: 6px;
                            padding: 20px;
                            margin: 20px 0;
                        }
                        .credential-item {
                            margin: 15px 0;
                        }
                        .credential-label {
                            font-weight: 600;
                            color: #64748b;
                            font-size: 14px;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                        .credential-value {
                            font-size: 16px;
                            color: #0f172a;
                            font-family: 'Courier New', monospace;
                            background: #ffffff;
                            padding: 10px;
                            border-radius: 4px;
                            border: 1px solid #cbd5e1;
                            margin-top: 5px;
                            word-break: break-all;
                        }
                        .button {
                            display: inline-block;
                            background: #2563eb;
                            color: #ffffff;
                            text-decoration: none;
                            padding: 12px 30px;
                            border-radius: 6px;
                            font-weight: 600;
                            margin: 20px 0;
                        }
                        .button:hover {
                            background: #1d4ed8;
                        }
                        .warning {
                            background: #fef3c7;
                            border-left: 4px solid #f59e0b;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                        .warning-title {
                            font-weight: 600;
                            color: #92400e;
                            margin-bottom: 5px;
                        }
                        .warning-text {
                            color: #78350f;
                            font-size: 14px;
                        }
                        .footer {
                            text-align: center;
                            color: #64748b;
                            font-size: 14px;
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #e2e8f0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Welcome to EventSync!</h1>
                        </div>

                        <div class="content">
                            <p>Hi ${name},</p>

                            <p>Great news! <strong>${teamLeaderName}</strong> has added you to the team <strong>${teamName}</strong> on EventSync.</p>

                            <p>An account has been created for you. Here are your login credentials:</p>

                            <div class="credentials-box">
                                <div class="credential-item">
                                    <div class="credential-label">Email</div>
                                    <div class="credential-value">${email}</div>
                                </div>
                                <div class="credential-item">
                                    <div class="credential-label">Temporary Password</div>
                                    <div class="credential-value">${password}</div>
                                </div>
                            </div>

                            <div class="warning">
                                <div class="warning-title">⚠️ Important Security Notice</div>
                                <div class="warning-text">
                                    Please change your password immediately after your first login.
                                    Do not share these credentials with anyone.
                                </div>
                            </div>

                            <center>
                                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/sign-in" class="button">
                                    Log In to EventSync
                                </a>
                            </center>

                            <p>Once logged in, you'll be able to:</p>
                            <ul>
                                <li>View and manage team events</li>
                                <li>Register for upcoming events</li>
                                <li>Collaborate with your team members</li>
                                <li>Update your profile and preferences</li>
                            </ul>

                            <p>If you have any questions or need assistance, feel free to reach out to your team leader or our support team.</p>

                            <p>Looking forward to seeing you on EventSync!</p>
                        </div>

                        <div class="footer">
                            <p>This email was sent by EventSync</p>
                            <p>If you didn't expect this email, please contact us immediately.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
Welcome to EventSync!

Hi ${name},

Great news! ${teamLeaderName} has added you to the team "${teamName}" on EventSync.

An account has been created for you. Here are your login credentials:

Email: ${email}
Temporary Password: ${password}

⚠️ IMPORTANT SECURITY NOTICE:
Please change your password immediately after your first login. Do not share these credentials with anyone.

Log in here: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/sign-in

Once logged in, you'll be able to:
- View and manage team events
- Register for upcoming events
- Collaborate with your team members
- Update your profile and preferences

If you have any questions or need assistance, feel free to reach out to your team leader or our support team.

Looking forward to seeing you on EventSync!

---
This email was sent by EventSync
If you didn't expect this email, please contact us immediately.
            `,
        });

        if (error) {
            console.error("Failed to send credentials email:", error);
            return { success: false, error: error.message };
        }

        console.log("Credentials email sent successfully:", data?.id);
        return { success: true, emailId: data?.id };
    } catch (error) {
        console.error("Error sending credentials email:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 12): string {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*";

    const allChars = lowercase + uppercase + numbers + symbols;

    // Ensure password has at least one character from each category
    let password = "";
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password
        .split("")
        .sort(() => Math.random() - 0.5)
        .join("");
}

interface SendRunningEventEmailParams {
    to: string[];
    eventTitle: string;
    eventId: string;
    teamId: string;
    teamName: string;
    eventStartDate: string;
    eventLocation: string;
}

/**
 * Send running event URL to team members
 */
export async function sendRunningEventEmail({
    to,
    eventTitle,
    eventId,
    teamId,
    teamName,
    eventStartDate,
    eventLocation,
}: SendRunningEventEmailParams) {
    try {
        const runningEventUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/running/${eventId}/${teamId}`;

        const { data, error } = await resend.emails.send({
            from:
                process.env.EMAIL_FROM ||
                "EventSync <onboarding@eventsync.com>",
            to,
            subject: `${eventTitle} is Now Running - Access Your Team Portal`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background: #ffffff;
                            border-radius: 8px;
                            padding: 30px;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .header h1 {
                            color: #2563eb;
                            margin: 0;
                            font-size: 28px;
                        }
                        .event-banner {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 25px;
                            border-radius: 8px;
                            text-align: center;
                            margin: 20px 0;
                        }
                        .event-banner h2 {
                            margin: 0 0 10px 0;
                            font-size: 24px;
                        }
                        .event-banner p {
                            margin: 5px 0;
                            opacity: 0.95;
                        }
                        .content {
                            margin-bottom: 30px;
                        }
                        .info-box {
                            background: #f8fafc;
                            border: 1px solid #e2e8f0;
                            border-radius: 6px;
                            padding: 20px;
                            margin: 20px 0;
                        }
                        .info-item {
                            display: flex;
                            margin: 12px 0;
                        }
                        .info-label {
                            font-weight: 600;
                            color: #64748b;
                            min-width: 100px;
                        }
                        .info-value {
                            color: #0f172a;
                        }
                        .button {
                            display: inline-block;
                            background: #2563eb;
                            color: #ffffff;
                            text-decoration: none;
                            padding: 14px 40px;
                            border-radius: 6px;
                            font-weight: 600;
                            margin: 20px 0;
                            font-size: 16px;
                        }
                        .button:hover {
                            background: #1d4ed8;
                        }
                        .url-box {
                            background: #ffffff;
                            border: 2px solid #2563eb;
                            border-radius: 6px;
                            padding: 15px;
                            margin: 20px 0;
                            word-break: break-all;
                            font-family: 'Courier New', monospace;
                            font-size: 14px;
                            color: #2563eb;
                        }
                        .feature-list {
                            list-style: none;
                            padding: 0;
                        }
                        .feature-list li {
                            padding: 8px 0;
                            padding-left: 25px;
                            position: relative;
                        }
                        .feature-list li:before {
                            content: "✓";
                            position: absolute;
                            left: 0;
                            color: #10b981;
                            font-weight: bold;
                        }
                        .important-notice {
                            background: #fef3c7;
                            border-left: 4px solid #f59e0b;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                        .important-notice-title {
                            font-weight: 600;
                            color: #92400e;
                            margin-bottom: 5px;
                        }
                        .footer {
                            text-align: center;
                            color: #64748b;
                            font-size: 14px;
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #e2e8f0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Event is Now Running!</h1>
                        </div>

                        <div class="event-banner">
                            <h2>${eventTitle}</h2>
                            <p>📍 ${eventLocation}</p>
                            <p>🗓️ ${new Date(eventStartDate).toLocaleDateString(
                                "en-US",
                                {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                },
                            )}</p>
                        </div>

                        <div class="content">
                            <p>Hello Team <strong>${teamName}</strong>!</p>

                            <p>Great news! The event <strong>${eventTitle}</strong> has officially started, and your team portal is now active.</p>

                            <div class="important-notice">
                                <div class="important-notice-title">📱 Access Your Team Portal</div>
                                <p style="margin: 5px 0 0 0; color: #78350f; font-size: 14px;">
                                    Click the button below or use the direct link to access all event information, updates, and your team's QR codes.
                                </p>
                            </div>

                            <center>
                                <a href="${runningEventUrl}" class="button">
                                    Access Team Portal →
                                </a>
                            </center>

                            <p style="text-align: center; color: #64748b; font-size: 14px; margin-top: 10px;">
                                Or copy this link:
                            </p>
                            <div class="url-box">
                                ${runningEventUrl}
                            </div>

                            <h3 style="color: #0f172a; margin-top: 30px;">What's Available in Your Portal:</h3>
                            <ul class="feature-list">
                                <li><strong>Event Details</strong> - Location, schedule, and important information</li>
                                <li><strong>Rules & Regulations</strong> - Review event guidelines</li>
                                <li><strong>Live Updates</strong> - Real-time messages from event managers</li>
                                <li><strong>Team QR Codes</strong> - For attendance, food coupons, and more</li>
                                <li><strong>Team Member Info</strong> - View all your team members</li>
                            </ul>

                            <div class="info-box">
                                <h3 style="margin-top: 0; color: #0f172a;">📋 Event Information</h3>
                                <div class="info-item">
                                    <span class="info-label">Event:</span>
                                    <span class="info-value">${eventTitle}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Team:</span>
                                    <span class="info-value">${teamName}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Location:</span>
                                    <span class="info-value">${eventLocation}</span>
                                </div>
                            </div>

                            <p><strong>Important:</strong> Keep this link handy throughout the event. You'll need it to access your QR codes for attendance tracking, meal coupons, and other event activities.</p>

                            <p>If you have any questions or encounter any issues, please contact the event organizers.</p>

                            <p style="margin-top: 30px;">Best of luck with the event!</p>
                        </div>

                        <div class="footer">
                            <p>This email was sent by EventSync</p>
                            <p>You received this email because your team is registered for ${eventTitle}</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
🎉 Event is Now Running!

${eventTitle}
Location: ${eventLocation}
Date: ${new Date(eventStartDate).toLocaleDateString()}

Hello Team ${teamName}!

The event "${eventTitle}" has officially started, and your team portal is now active.

ACCESS YOUR TEAM PORTAL:
${runningEventUrl}

What's Available in Your Portal:
✓ Event Details - Location, schedule, and important information
✓ Rules & Regulations - Review event guidelines
✓ Live Updates - Real-time messages from event managers
✓ Team QR Codes - For attendance, food coupons, and more
✓ Team Member Info - View all your team members

Event Information:
- Event: ${eventTitle}
- Team: ${teamName}
- Location: ${eventLocation}

Important: Keep this link handy throughout the event. You'll need it to access your QR codes for attendance tracking, meal coupons, and other event activities.

If you have any questions or encounter any issues, please contact the event organizers.

Best of luck with the event!

---
This email was sent by EventSync
You received this email because your team is registered for ${eventTitle}
            `,
        });

        if (error) {
            console.error("Failed to send running event email:", error);
            return { success: false, error: error.message };
        }

        console.log("Running event email sent successfully:", data?.id);
        return { success: true, emailId: data?.id };
    } catch (error) {
        console.error("Error sending running event email:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
