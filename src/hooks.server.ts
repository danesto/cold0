import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Get session from Better Auth
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	// Attach session and user to event.locals
	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	// Use the Better Auth SvelteKit handler
	return svelteKitHandler({ event, resolve, auth, building });
};
