<script lang="ts">
	import { signOut, useSession } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	const session = useSession();

	const handleSignOut = async () => {
		await signOut();
		goto(resolve('/login'));
	};
</script>

{#if $session.isPending}
	<!-- Session loading, show nothing to avoid flash -->
{:else if $session.data?.user}
	<div class="dropdown dropdown-end">
		<div tabindex="0" role="button" class="btn avatar btn-circle btn-ghost">
			<div
				class="flex w-10 items-center justify-center rounded-full bg-neutral text-neutral-content"
			>
				<span class="text-xl">{$session.data?.user.name?.[0]?.toUpperCase() || 'U'}</span>
			</div>
		</div>
		<ul class="dropdown-content menu z-1 mt-3 w-52 rounded-box bg-base-100 p-2 shadow">
			<li class="menu-title">
				<span>{$session.data?.user.name}</span>
				<span class="text-xs">{$session.data?.user.email}</span>
			</li>
			<!-- <li><a href={resolve('/')}>Profile</a></li> -->
			<li><a href={resolve('/settings')}>Settings</a></li>
			<li>
				<button onclick={handleSignOut}>Sign Out</button>
			</li>
		</ul>
	</div>
{:else}
	<div class="flex gap-2">
		<a href={resolve('/login')} class="btn btn-ghost">Login</a>
		<a href={resolve('/register')} class="btn btn-primary">Sign Up</a>
	</div>
{/if}
