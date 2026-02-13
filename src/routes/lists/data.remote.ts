import { query, getRequestEvent } from '$app/server';
import prisma from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';

/**
 * Get all lists for the current user with contact counts
 */
export const getUserLists = query(async () => {
	const event = getRequestEvent();
	const user = event?.locals?.user;

	if (!user) {
		redirect(302, '/login');
		throw new Error('You must be logged in to view lists');
	}

	const lists = await prisma.list.findMany({
		where: {
			userId: user.id
		},
		include: {
			_count: {
				select: {
					contactLists: true
				}
			}
		},
		orderBy: {
			createdAt: 'desc'
		}
	});

	return lists.map((list) => ({
		id: list.id,
		name: list.name,
		description: list.description,
		contactCount: list._count.contactLists,
		createdAt: list.createdAt,
		updatedAt: list.updatedAt
	}));
});
