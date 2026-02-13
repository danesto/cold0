import { query, command, getRequestEvent } from '$app/server';
import prisma from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';

/**
 * Get all email templates for the current user
 */
export const getUserTemplates = query(async () => {
	const event = getRequestEvent();
	const user = event?.locals?.user;

	if (!user) {
		redirect(302, '/login');
	}

	const templates = await prisma.emailTemplate.findMany({
		where: {
			userId: user.id
		},
		orderBy: {
			createdAt: 'desc'
		}
	});

	return templates;
});

/**
 * Get a single template by ID
 */
export const getTemplate = query('unchecked', async ({ templateId }: { templateId: string }) => {
	const event = getRequestEvent();
	const user = event?.locals?.user;

	if (!user) {
		throw new Error('You must be logged in to view templates');
	}

	const template = await prisma.emailTemplate.findFirst({
		where: {
			id: templateId,
			userId: user.id // Ensure user owns this template
		}
	});

	if (!template) {
		throw new Error('Template not found or you do not have access to it');
	}

	return template;
});

/**
 * Create a new email template
 */
export const createTemplate = command(
	'unchecked',
	async ({ name, subject, body }: { name: string; subject: string; body: string }) => {
		const event = getRequestEvent();
		const user = event?.locals?.user;

		if (!user) {
			throw new Error('You must be logged in to create templates');
		}

		if (!name.trim()) {
			throw new Error('Template name is required');
		}

		if (!subject.trim()) {
			throw new Error('Subject is required');
		}

		if (!body.trim()) {
			throw new Error('Template body is required');
		}

		const template = await prisma.emailTemplate.create({
			data: {
				name: name.trim(),
				subject: subject.trim(),
				body: body.trim(),
				userId: user.id
			}
		});

		return {
			success: true,
			template
		};
	}
);

/**
 * Update an existing email template
 */
export const updateTemplate = command(
	'unchecked',
	async ({
		templateId,
		name,
		subject,
		body
	}: {
		templateId: string;
		name: string;
		subject: string;
		body: string;
	}) => {
		const event = getRequestEvent();
		const user = event?.locals?.user;

		if (!user) {
			throw new Error('You must be logged in to update templates');
		}

		// Verify ownership
		const existingTemplate = await prisma.emailTemplate.findFirst({
			where: {
				id: templateId,
				userId: user.id
			}
		});

		if (!existingTemplate) {
			throw new Error('Template not found or you do not have access to it');
		}

		if (!name.trim()) {
			throw new Error('Template name is required');
		}

		if (!subject.trim()) {
			throw new Error('Subject is required');
		}

		if (!body.trim()) {
			throw new Error('Template body is required');
		}

		const template = await prisma.emailTemplate.update({
			where: { id: templateId },
			data: {
				name: name.trim(),
				subject: subject.trim(),
				body: body.trim()
			}
		});

		return {
			success: true,
			template
		};
	}
);

/**
 * Delete an email template
 */
export const deleteTemplate = command(
	'unchecked',
	async ({ templateId }: { templateId: string }) => {
		const event = getRequestEvent();
		const user = event?.locals?.user;

		if (!user) {
			throw new Error('You must be logged in to delete templates');
		}

		// Verify ownership
		const existingTemplate = await prisma.emailTemplate.findFirst({
			where: {
				id: templateId,
				userId: user.id
			}
		});

		if (!existingTemplate) {
			throw new Error('Template not found or you do not have access to it');
		}

		await prisma.emailTemplate.delete({
			where: { id: templateId }
		});

		return {
			success: true
		};
	}
);
