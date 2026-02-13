import { query, command, getRequestEvent } from '$app/server';
import prisma from '$lib/server/prisma';
import { encrypt, decrypt } from '$lib/server/crypto';

/**
 * Get the current user's SMTP settings.
 * Password is NEVER returned to the client — only a masked indicator.
 */
export const getSmtpSettings = query(async () => {
	const event = getRequestEvent();
	const user = event?.locals?.user;

	if (!user) {
		throw new Error('You must be logged in');
	}

	const settings = await prisma.smtpSettings.findUnique({
		where: { userId: user.id }
	});

	if (!settings) {
		return null;
	}

	return {
		host: settings.host,
		port: settings.port,
		secure: settings.secure,
		email: settings.email,
		senderName: settings.senderName,
		hasPassword: true // never expose the actual password
	};
});

/**
 * Save or update SMTP settings for the current user.
 * Password is encrypted before storage.
 */
export const saveSmtpSettings = command(
	'unchecked',
	async ({
		host,
		port,
		secure,
		email,
		password,
		senderName
	}: {
		host: string;
		port: number;
		secure: boolean;
		email: string;
		password?: string; // optional on update (keep existing if not provided)
		senderName?: string;
	}) => {
		const event = getRequestEvent();
		const user = event?.locals?.user;

		if (!user) {
			throw new Error('You must be logged in');
		}

		if (!host || !email) {
			throw new Error('Host and email are required');
		}

		// Check if settings already exist
		const existing = await prisma.smtpSettings.findUnique({
			where: { userId: user.id }
		});

		// If updating and no new password provided, keep existing encrypted password
		let encryptedPassword: string;
		if (password) {
			encryptedPassword = encrypt(password);
		} else if (existing) {
			encryptedPassword = existing.password;
		} else {
			throw new Error('Password is required for initial setup');
		}

		await prisma.smtpSettings.upsert({
			where: { userId: user.id },
			create: {
				userId: user.id,
				host,
				port,
				secure,
				email,
				password: encryptedPassword,
				senderName: senderName || null
			},
			update: {
				host,
				port,
				secure,
				email,
				password: encryptedPassword,
				senderName: senderName || null
			}
		});

		return { success: true };
	}
);

/**
 * Test SMTP connection with current settings.
 * Used to verify settings before saving.
 */
export const testSmtpConnection = command(
	'unchecked',
	async ({
		host,
		port,
		secure,
		email,
		password
	}: {
		host: string;
		port: number;
		secure: boolean;
		email: string;
		password?: string;
	}) => {
		const event = getRequestEvent();
		const user = event?.locals?.user;

		if (!user) {
			throw new Error('You must be logged in');
		}

		// If no password provided, use the stored one
		let smtpPassword: string;
		if (password) {
			smtpPassword = password;
		} else {
			const existing = await prisma.smtpSettings.findUnique({
				where: { userId: user.id }
			});
			if (!existing) {
				throw new Error('No saved SMTP settings found. Please enter a password.');
			}
			smtpPassword = decrypt(existing.password);
		}

		const nodemailer = await import('nodemailer');
		const transporter = nodemailer.createTransport({
			host,
			port,
			secure,
			auth: {
				user: email,
				pass: smtpPassword
			}
		});

		try {
			await transporter.verify();
			return { success: true, message: 'SMTP connection successful' };
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : 'Connection failed'
			};
		}
	}
);
