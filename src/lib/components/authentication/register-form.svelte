<script lang="ts">
	import { signUp } from '$lib/auth-client';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state<string | null>(null);
	let isLoading = $state(false);
	let verificationSent = $state(false);

	const handleSubmit = async () => {
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		if (password.length < 8) {
			error = 'Password must be at least 8 characters long';
			return;
		}

		isLoading = true;
		error = null;

		try {
			await signUp.email({
				name,
				email,
				password,
				callbackURL: '/login'
			});

			verificationSent = true;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create account';
			console.error('Registration error:', err);
		} finally {
			isLoading = false;
		}
	};
</script>

<div class="card card-border border-primary bg-base-100 shadow-xl">
	<div class="card-body">
		{#if verificationSent}
			<div class="py-4 text-center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mx-auto mb-4 h-16 w-16 text-primary"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
					/>
				</svg>
				<h2 class="text-2xl font-bold">Check your email</h2>
				<p class="mt-2 text-base-content/70">
					We've sent a verification link to <span class="font-semibold">{email}</span>.
				</p>
				<p class="mt-1 text-base-content/70">
					Click the link in the email to verify your account.
				</p>
				<div class="mt-6">
					<a href="/login" class="btn btn-primary">Go to Login</a>
				</div>
			</div>
		{:else}
			<h2 class="card-title">Create Account</h2>

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
					<label class="label" for="name">
						<span class="label-text">Name</span>
					</label>
					<input
						id="name"
						type="text"
						placeholder="John Doe"
						class="input input-bordered w-full"
						bind:value={name}
						required
						disabled={isLoading}
					/>
				</div>

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

				<div class="form-control w-full">
					<label class="label" for="confirm-password">
						<span class="label-text">Confirm Password</span>
					</label>
					<input
						id="confirm-password"
						type="password"
						placeholder="••••••••"
						class="input input-bordered w-full"
						bind:value={confirmPassword}
						required
						disabled={isLoading}
					/>
				</div>

				<div class="card-actions justify-end mt-4">
					<button type="submit" class="btn btn-primary" disabled={isLoading}>
						{#if isLoading}
							<span class="loading loading-spinner loading-sm"></span>
						{/if}
						Create Account
					</button>
				</div>
			</form>
		{/if}
	</div>
</div>
