<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.ico';
	import UserMenu from '$lib/components/authentication/user-menu.svelte';
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';

	let { children } = $props();

	// Hide navbar on auth pages
	const hideNavbar = $derived(
		$page.url.pathname.startsWith('/login') || $page.url.pathname.startsWith('/register')
	);

	let navbarBorderColor = $derived($page.url.pathname.startsWith('/templates') ? 'border-primary' : 'border-accent');
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if !hideNavbar}
	<div class="navbar bg-base-100 shadow-sm border-b {navbarBorderColor}">
		<div class="flex-1">
			<a href={resolve('/')} class="btn text-xl btn-ghost">cold0</a>
			<ul class="menu menu-horizontal">
				<li><a href={resolve('/')}>My Lists</a></li>
				<li><a href={resolve('/templates')}>Templates</a></li>
				<li><a href={resolve('/settings')}>Settings</a></li>
				<!-- <li><a href={resolve('/campaigns')}>Campaigns</a></li>
				<li><a href={resolve('/analytics')}>Analytics</a></li> -->
			</ul>
		</div>
		<div class="flex-none">
			<UserMenu />
		</div>
	</div>
{/if}

{@render children()}
