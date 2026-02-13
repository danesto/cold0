import { command, getRequestEvent } from '$app/server';
import { Readable } from 'stream';
import csv from 'csv-parser';
import prisma from '$lib/server/prisma';

/**
 * Parses the headers from an uploaded CSV file
 * Returns all headers so the client can map them to internal field names
 */
export const parseCSVHeaders = command(
	'unchecked',
	async ({ csvContent }: { csvContent: string }) => {
		if (!csvContent) {
			throw new Error('No CSV content provided');
		}

		// Convert string to Node.js Readable stream
		const stream = Readable.from(csvContent);

		const headers = await new Promise<string[]>((resolve, reject) => {
			stream
				.pipe(
					csv({
						// Don't map/filter headers - return them all as-is
						mapHeaders: ({ header }) => header.trim()
					})
				)
				.on('headers', (headerList: string[]) => {
					// Capture headers and resolve immediately
					stream.destroy();
					resolve(headerList);
				})
				.on('error', (error) => {
					console.error('Error parsing CSV:', error);
					reject(error);
				});
		});

		console.log('CSV headers parsed:', headers);
		return headers;
	}
);

/**
 * Saves imported contacts to database and adds them to a list
 */
export const saveContactsToList = command(
	'unchecked',
	async ({
		csvContent,
		fieldMapping,
		listName,
		listDescription
	}: {
		csvContent: string;
		fieldMapping: Record<string, string>;
		listName: string;
		listDescription?: string;
	}) => {
		// Get the authenticated user
		const event = getRequestEvent();
		const user = event?.locals?.user;

		if (!user) {
			throw new Error('You must be logged in to import contacts');
		}

		if (!csvContent || !fieldMapping || !listName) {
			throw new Error('Missing required fields');
		}

		// Parse CSV data
		const stream = Readable.from(csvContent);
		const rows: Record<string, string | number | boolean>[] = [];

		await new Promise<void>((resolve, reject) => {
			stream
				.pipe(
					csv({
						mapHeaders: ({ header }) => {
							const trimmedHeader = header.trim();
							return fieldMapping[trimmedHeader] || null;
						}
					})
				)
				.on('data', (data) => {
					const mappedData: Record<string, string | number | boolean> = {};
					for (const [key, value] of Object.entries(data)) {
						if (key && value !== undefined) {
							mappedData[key] = value as string | number | boolean;
						}
					}
					if (Object.keys(mappedData).length > 0) {
						rows.push(mappedData);
					}
				})
				.on('end', () => resolve())
				.on('error', (error) => reject(error));
		});

		// Validate that at least email is present
		const emailField = Object.values(fieldMapping).find((v) => v === 'email');
		if (!emailField) {
			throw new Error('Email field is required for importing contacts');
		}

		// Create or find the list
		const list = await prisma.list.create({
			data: {
				name: listName,
				description: listDescription,
				userId: user.id
			}
		});

		// Process contacts
		const contactResults = {
			created: 0,
			updated: 0,
			linkedToList: 0,
			errors: [] as string[]
		};

		for (const row of rows) {
			try {
				const email = row.email as string;
				if (!email) {
					contactResults.errors.push('Row missing email, skipped');
					continue;
				}

				// Prepare contact data
				const contactData = {
					email: email.toLowerCase().trim(),
					firstName: row.firstName as string | undefined,
					lastName: row.lastName as string | undefined,
					company: row.company as string | undefined,
					jobTitle: row.jobTitle as string | undefined,
					website: row.website as string | undefined,
					phone: row.phone as string | undefined,
					linkedInUrl: row.linkedInUrl as string | undefined,
					industry: row.industry as string | undefined,
					companySize: row.companySize as string | undefined,
					numberOfEmployees: row.numberOfEmployees
						? parseInt(row.numberOfEmployees as string)
						: undefined,
					city: row.city as string | undefined,
					country: row.country as string | undefined,
					notes: row.notes as string | undefined
				};

				// Upsert contact (create or update if exists)
				const contact = await prisma.contact.upsert({
					where: { email: contactData.email },
					create: contactData,
					update: {
						// Update fields if contact already exists
						...contactData,
						updatedAt: new Date()
					}
				});

				if (contact.createdAt.getTime() === contact.updatedAt.getTime()) {
					contactResults.created++;
				} else {
					contactResults.updated++;
				}

				// Link contact to list (skip if already linked)
				await prisma.contactList.upsert({
					where: {
						contactId_listId: {
							contactId: contact.id,
							listId: list.id
						}
					},
					create: {
						contactId: contact.id,
						listId: list.id
					},
					update: {}
				});

				contactResults.linkedToList++;
			} catch (error) {
				console.error('Error processing contact:', error);
				contactResults.errors.push(
					`Error with ${row.email}: ${error instanceof Error ? error.message : 'Unknown error'}`
				);
			}
		}

		return {
			success: true,
			list: {
				id: list.id,
				name: list.name
			},
			stats: contactResults
		};
	}
);
