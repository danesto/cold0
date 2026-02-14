import { query, command, getRequestEvent } from '$app/server';
import prisma from '$lib/server/prisma';
import nodemailer from 'nodemailer';
import { replaceTemplateVariables } from '$lib/utils/template-variables';
import { decrypt } from '$lib/server/crypto';
import { redirect } from '@sveltejs/kit';

/**
 * Get list details with all contacts
 */
export const getListWithContacts = query('unchecked', async ({ listId }: { listId: string }) => {
	const event = getRequestEvent();
	const user = event?.locals?.user;

	if (!user) {
		redirect(302, '/login');
	}

	// Get the list and verify ownership
	const list = await prisma.list.findFirst({
		where: {
			id: listId,
			userId: user.id // Ensure user owns this list
		},
		include: {
			contactLists: {
				include: {
					contact: true
				},
				orderBy: {
					addedAt: 'desc'
				}
			}
		}
	});

	if (!list) {
		throw new Error('List not found or you do not have access to it');
	}

	return {
		id: list.id,
		name: list.name,
		description: list.description,
		createdAt: list.createdAt,
		updatedAt: list.updatedAt,
		contacts: list.contactLists.map((cl) => ({
			id: cl.contact.id,
			email: cl.contact.email,
			firstName: cl.contact.firstName,
			lastName: cl.contact.lastName,
			company: cl.contact.company,
			jobTitle: cl.contact.jobTitle,
			website: cl.contact.website,
			phone: cl.contact.phone,
			linkedInUrl: cl.contact.linkedInUrl,
			industry: cl.contact.industry,
			companySize: cl.contact.companySize,
			numberOfEmployees: cl.contact.numberOfEmployees,
			city: cl.contact.city,
			country: cl.contact.country,
			emailSent: cl.contact.emailSent,
			emailSentAt: cl.contact.emailSentAt,
			status: cl.contact.status,
			notes: cl.contact.notes,
			createdAt: cl.contact.createdAt,
			addedToListAt: cl.addedAt
		}))
	};
});

/**
 * Update contact notes
 */
export const updateContactNotes = command(
	'unchecked',
	async ({ contactId, notes }: { contactId: string; notes: string }) => {
		const event = getRequestEvent();
		const user = event?.locals?.user;

		if (!user) {
			throw new Error('You must be logged in');
		}

		// Verify the contact belongs to the user
		const contact = await prisma.contact.findFirst({
			where: { id: contactId, userId: user.id }
		});

		if (!contact) {
			throw new Error('Contact not found or you do not have access to it');
		}

		await prisma.contact.update({
			where: { id: contactId },
			data: { notes }
		});

		return { success: true };
	}
);

/**
 * Update contact emailSent status
 */
export const updateContactEmailSent = command(
	'unchecked',
	async ({ contactId, emailSent }: { contactId: string; emailSent: boolean }) => {
		const event = getRequestEvent();
		const user = event?.locals?.user;

		if (!user) {
			throw new Error('You must be logged in');
		}

		// Verify the contact belongs to the user
		const contact = await prisma.contact.findFirst({
			where: { id: contactId, userId: user.id }
		});

		if (!contact) {
			throw new Error('Contact not found or you do not have access to it');
		}

		await prisma.contact.update({
			where: { id: contactId },
			data: {
				emailSent,
				emailSentAt: emailSent ? new Date() : null,
				status: emailSent ? 'CONTACTED' : 'PROSPECT'
			}
		});

		return { success: true };
	}
);

/**
 * Create a new contact and add it to the list
 */
export const addContactToList = command(
	'unchecked',
	async ({
		listId,
		contactData
	}: {
		listId: string;
		contactData: {
			email: string;
			firstName?: string;
			lastName?: string;
			company?: string;
			jobTitle?: string;
			website?: string;
			phone?: string;
			linkedInUrl?: string;
			industry?: string;
			companySize?: string;
			numberOfEmployees?: string;
			city?: string;
			country?: string;
			notes?: string;
		};
	}) => {
		const event = getRequestEvent();
		const user = event?.locals?.user;

		if (!user) {
			throw new Error('You must be logged in');
		}

		// Verify the list belongs to the user
		const list = await prisma.list.findFirst({
			where: {
				id: listId,
				userId: user.id
			}
		});

		if (!list) {
			throw new Error('List not found or you do not have access to it');
		}

		// Check if contact with this email already exists for this user
		let contact = await prisma.contact.findUnique({
			where: {
				email_userId: {
					email: contactData.email,
					userId: user.id
				}
			}
		});

		if (contact) {
			// Contact exists for this user, just link it to the list if not already linked
			const existingLink = await prisma.contactList.findUnique({
				where: {
					contactId_listId: {
						contactId: contact.id,
						listId: listId
					}
				}
			});

			if (existingLink) {
				throw new Error('This contact is already in the list');
			}

			// Link existing contact to the list
			await prisma.contactList.create({
				data: {
					contactId: contact.id,
					listId: listId
				}
			});
		} else {
			// Create new contact owned by this user
			// Convert numberOfEmployees to number if it's a string
			const numEmployees = contactData.numberOfEmployees
				? Number(contactData.numberOfEmployees)
				: null;

			contact = await prisma.contact.create({
				data: {
					userId: user.id,
					email: contactData.email,
					firstName: contactData.firstName || null,
					lastName: contactData.lastName || null,
					company: contactData.company || null,
					jobTitle: contactData.jobTitle || null,
					website: contactData.website || null,
					phone: contactData.phone || null,
					linkedInUrl: contactData.linkedInUrl || null,
					industry: contactData.industry || null,
					companySize: contactData.companySize || null,
					numberOfEmployees: numEmployees,
					city: contactData.city || null,
					country: contactData.country || null,
					notes: contactData.notes || null
				}
			});

			// Link to the list
			await prisma.contactList.create({
				data: {
					contactId: contact.id,
					listId: listId
				}
			});
		}

		return { success: true, contact };
	}
);

/**
 * Bulk send emails to selected contacts using a template
 */
export const bulkSendEmails = command(
	'unchecked',
	async ({ contactIds, templateId }: { contactIds: string[]; templateId: string }) => {
		const event = getRequestEvent();
		const user = event?.locals?.user;

		if (!user) {
			throw new Error('You must be logged in');
		}

		if (!contactIds || contactIds.length === 0) {
			throw new Error('No contacts selected');
		}

		if (!templateId) {
			throw new Error('No template selected');
		}

		// Fetch user's SMTP settings
		const smtpSettings = await prisma.smtpSettings.findUnique({
			where: { userId: user.id }
		});

		if (!smtpSettings) {
			throw new Error('SMTP settings not configured. Please set up your email settings first.');
		}

		// Decrypt the SMTP password
		const smtpPassword = decrypt(smtpSettings.password);

		// Fetch the template and verify ownership
		const template = await prisma.emailTemplate.findFirst({
			where: {
				id: templateId,
				userId: user.id
			}
		});

		if (!template) {
			throw new Error('Template not found or you do not have access to it');
		}

		// Fetch the contacts (only ones belonging to this user)
		const contacts = await prisma.contact.findMany({
			where: {
				id: { in: contactIds },
				userId: user.id
			}
		});

		if (contacts.length === 0) {
			throw new Error('No contacts found');
		}

		// Create nodemailer transporter with user's SMTP settings
		const transporter = nodemailer.createTransport({
			host: smtpSettings.host,
			port: smtpSettings.port,
			secure: smtpSettings.secure,
			auth: {
				user: smtpSettings.email,
				pass: smtpPassword
			}
		});

		const fromName = smtpSettings.senderName || user.name || 'Sender';

		const results = {
			success: 0,
			failed: 0,
			errors: [] as { contactId: string; email: string; error: string }[]
		};

		// Send emails to each contact
		for (const contact of contacts) {
			try {
				// Replace template variables with contact data
				const personalizedSubject = replaceTemplateVariables(template.subject, contact);
				const personalizedBody = replaceTemplateVariables(template.body, contact);

				await transporter.sendMail({
					from: `${fromName} <${smtpSettings.email}>`,
					to: contact.email,
					subject: personalizedSubject,
					html: personalizedBody
				});

				// Update contact status
				await prisma.contact.update({
					where: { id: contact.id },
					data: {
						emailSent: true,
						emailSentAt: new Date(),
						status: 'CONTACTED'
					}
				});

				results.success++;
			} catch (error) {
				console.error(`Failed to send email to ${contact.email}:`, error);
				results.failed++;
				results.errors.push({
					contactId: contact.id,
					email: contact.email,
					error: error instanceof Error ? error.message : 'Unknown error'
				});
			}
		}

		return {
			success: true,
			results
		};
	}
);
