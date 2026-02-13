import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { admin } from 'better-auth/plugins';
import prisma from './prisma';
import nodemailer from 'nodemailer';

/**
 * Create a system-level nodemailer transporter for auth emails
 * (verification, password reset, etc.)
 * Uses SYSTEM_SMTP_* env vars — separate from per-user SMTP settings.
 */
function getSystemTransporter() {
	if (!env.SYSTEM_SMTP_HOST || !env.SYSTEM_SMTP_EMAIL || !env.SYSTEM_SMTP_PASSWORD) {
		throw new Error('System SMTP is not configured. Set SYSTEM_SMTP_* env vars.');
	}

	return nodemailer.createTransport({
		host: env.SYSTEM_SMTP_HOST,
		port: Number(env.SYSTEM_SMTP_PORT || 465),
		secure: env.SYSTEM_SMTP_SECURE !== 'false',
		auth: {
			user: env.SYSTEM_SMTP_EMAIL,
			pass: env.SYSTEM_SMTP_PASSWORD
		}
	});
}

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'postgresql'
	}),
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true
	},
	emailVerification: {
		sendVerificationEmail: async ({
			user,
			url
		}: {
			user: { email: string; name?: string | null };
			url: string;
		}) => {
			console.log('[Auth] sendVerificationEmail called for:', user.email);
			console.log('[Auth] Verification URL:', url);

			try {
				const transporter = getSystemTransporter();
				const appName = env.APP_NAME || 'cold0';

				console.log('[Auth] SMTP config:', {
					host: env.SYSTEM_SMTP_HOST,
					port: env.SYSTEM_SMTP_PORT,
					email: env.SYSTEM_SMTP_EMAIL,
					hasPassword: !!env.SYSTEM_SMTP_PASSWORD
				});

				const info = await transporter.sendMail({
					from: `${appName} <${env.SYSTEM_SMTP_EMAIL}>`,
					to: user.email,
					subject: `Verify your email — ${appName}`,
					html: `
						<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
							<h2>Welcome to ${appName}!</h2>
							<p>Hi ${user.name || 'there'},</p>
							<p>Please verify your email address by clicking the button below:</p>
							<div style="text-align: center; margin: 32px 0;">
								<a href="${url}" style="background-color: #6366f1; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
									Verify Email
								</a>
							</div>
							<p style="color: #666; font-size: 14px;">
								If you didn't create an account, you can safely ignore this email.
							</p>
							<p style="color: #666; font-size: 14px;">
								Or copy and paste this link: <a href="${url}">${url}</a>
							</p>
						</div>
					`
				});

				console.log('[Auth] Verification email sent:', info.response);
			} catch (error) {
				console.error('[Auth] Failed to send verification email:', error);
				throw error;
			}
		}
	},
	plugins: [sveltekitCookies(getRequestEvent), admin()]
});
