<script lang="ts">
	import { signIn } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let error = $state<string | null>(null);
	let isLoading = $state(false);
	let emailNotVerified = $state(false);

	const handleSubmit = async () => {
		isLoading = true;
		error = null;
		emailNotVerified = false;

		try {
			const result = await signIn.email({
				email,
				password,
				callbackURL: '/'
			});

			if (result.error) {
				if (result.error.status === 403 || result.error.message?.toLowerCase().includes('verif')) {
					emailNotVerified = true;
				} else {
					error = result.error.message || 'Invalid email or password';
				}
				return;
			}

			goto('/');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to sign in';
			console.error('Login error:', err);
		} finally {
			isLoading = false;
		}
	};
</script>

<div class="card border-accent bg-base-100 card-border shadow-xl">
	<div class="card-body">
		<h2 class="card-title">Login</h2>

		{#if emailNotVerified}
			<div class="alert alert-warning">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
				<div>
					<p class="font-semibold">Email not verified</p>
					<p class="text-sm">Please check your inbox and click the verification link before logging in.</p>
				</div>
			</div>
		{/if}

		{#if error}
			<div class="alert alert-error">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span>{error}</span>
			</div>
		{/if}

		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
		>
			<div class="form-control w-full">
				<label class="label" for="email">
					<span class="label-text">Email</span>
				</label>
				<input
					id="email"
					type="email"
					placeholder="email@example.com"
					class="input input-bordered w-full"
					bind:value={email}
					required
					disabled={isLoading}
				/>
			</div>

			<div class="form-control w-full">
				<label class="label" for="password">
					<span class="label-text">Password</span>
				</label>
				<input
					id="password"
					type="password"
					placeholder="••••••••"
					class="input input-bordered w-full"
					bind:value={password}
					required
					disabled={isLoading}
				/>
			</div>

			<div class="card-actions justify-end mt-4">
				<button type="submit" class="btn btn-accent" disabled={isLoading}>
					{#if isLoading}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					Login
				</button>
			</div>
		</form>
	</div>
</div>
