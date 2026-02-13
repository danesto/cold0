<script lang="ts">
	import { getSmtpSettings, saveSmtpSettings, testSmtpConnection } from './data.remote';

	const smtpData = getSmtpSettings();

	let host = $state('');
	let port = $state(465);
	let secure = $state(true);
	let email = $state('');
	let password = $state('');
	let senderName = $state('');

	let isSaving = $state(false);
	let isTesting = $state(false);
	let successMessage: string | null = $state(null);
	let errorMessage: string | null = $state(null);
	let testResult: { success: boolean; message: string } | null = $state(null);

	// Populate form when data loads
	$effect(() => {
		if (smtpData.current) {
			host = smtpData.current.host;
			port = smtpData.current.port;
			secure = smtpData.current.secure;
			email = smtpData.current.email;
			senderName = smtpData.current.senderName || '';
			// password is never returned from server
		}
	});

	const handleSave = async (e: Event) => {
		e.preventDefault();

		if (!host || !email) {
			errorMessage = 'Host and email are required';
			return;
		}

		if (!smtpData.current && !password) {
			errorMessage = 'Password is required for initial setup';
			return;
		}

		isSaving = true;
		successMessage = null;
		errorMessage = null;

		try {
			await saveSmtpSettings({
				host,
				port,
				secure,
				email,
				password: password || undefined,
				senderName: senderName || undefined
			});

			successMessage = 'SMTP settings saved successfully';
			password = ''; // Clear password field after save
			smtpData.refresh();
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Failed to save settings';
		} finally {
			isSaving = false;

			setTimeout(() => {
				successMessage = null;
				errorMessage = null;
			}, 5000);
		}
	};

	const handleTest = async () => {
		if (!host || !email) {
			errorMessage = 'Host and email are required to test';
			return;
		}

		isTesting = true;
		testResult = null;

		try {
			testResult = await testSmtpConnection({
				host,
				port,
				secure,
				email,
				password: password || undefined
			});
		} catch (error) {
			testResult = {
				success: false,
				message: error instanceof Error ? error.message : 'Test failed'
			};
		} finally {
			isTesting = false;
		}
	};
</script>

<div class="container mx-auto max-w-2xl p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">Settings</h1>
		<p class="mt-2 text-base-content/70">Configure your email sending settings</p>
	</div>

	<!-- Alerts -->
	{#if successMessage}
		<div class="alert alert-success mb-6">
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
					d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<span>{successMessage}</span>
		</div>
	{/if}

	{#if errorMessage}
		<div class="alert alert-error mb-6">
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
			<span>{errorMessage}</span>
		</div>
	{/if}

	{#if smtpData.loading}
		<div class="flex justify-center py-12">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else}
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title mb-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
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
					SMTP Configuration
				</h2>

				<form onsubmit={handleSave}>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<!-- Host -->
						<div class="form-control col-span-2">
							<label class="label" for="smtp-host">
								<span class="label-text font-semibold">SMTP Host <span class="text-error">*</span></span>
							</label>
							<input
								id="smtp-host"
								type="text"
								class="input input-bordered"
								bind:value={host}
								placeholder="smtp.gmail.com"
								required
							/>
						</div>

						<!-- Port -->
						<div class="form-control">
							<label class="label" for="smtp-port">
								<span class="label-text font-semibold">Port</span>
							</label>
							<input
								id="smtp-port"
								type="number"
								class="input input-bordered"
								bind:value={port}
								placeholder="465"
							/>
						</div>

						<!-- Secure -->
						<div class="form-control">
							<label class="label" for="smtp-secure">
								<span class="label-text font-semibold">SSL/TLS</span>
							</label>
							<div class="flex items-center gap-3 h-12">
								<input
									id="smtp-secure"
									type="checkbox"
									class="toggle toggle-primary"
									bind:checked={secure}
								/>
								<span class="text-sm text-base-content/70">
									{secure ? 'Enabled (recommended)' : 'Disabled'}
								</span>
							</div>
						</div>

						<!-- Email -->
						<div class="form-control col-span-2">
							<label class="label" for="smtp-email">
								<span class="label-text font-semibold">Email Address <span class="text-error">*</span></span>
							</label>
							<input
								id="smtp-email"
								type="email"
								class="input input-bordered"
								bind:value={email}
								placeholder="you@domain.com"
								required
							/>
							<label class="label" for="smtp-email">
								<span class="label-text-alt text-base-content/50">
									Used for SMTP authentication and as the "from" address
								</span>
							</label>
						</div>

						<!-- Password -->
						<div class="form-control col-span-2">
							<label class="label" for="smtp-password">
								<span class="label-text font-semibold">
									Password
									{#if !smtpData.current}
										<span class="text-error">*</span>
									{/if}
								</span>
							</label>
							<input
								id="smtp-password"
								type="password"
								class="input input-bordered"
								bind:value={password}
								placeholder={smtpData.current?.hasPassword
									? '••••••••  (leave empty to keep current)'
									: 'Enter SMTP password or app password'}
								required={!smtpData.current}
							/>
							<label class="label" for="smtp-password">
								<span class="label-text-alt text-base-content/50">
									{#if smtpData.current?.hasPassword}
										Leave blank to keep your current password
									{:else}
										For Gmail, use an App Password instead of your account password
									{/if}
								</span>
							</label>
						</div>

						<!-- Sender Name -->
						<div class="form-control col-span-2">
							<label class="label" for="smtp-sender-name">
								<span class="label-text font-semibold">Sender Name</span>
							</label>
							<input
								id="smtp-sender-name"
								type="text"
								class="input input-bordered"
								bind:value={senderName}
								placeholder="John from Acme Corp"
							/>
							<label class="label" for="smtp-sender-name">
								<span class="label-text-alt text-base-content/50">
									Displayed as the "from" name in emails (e.g. "John from Acme Corp &lt;you@domain.com&gt;")
								</span>
							</label>
						</div>
					</div>

					<!-- Test Result -->
					{#if testResult}
						<div class="alert mt-4 {testResult.success ? 'alert-success' : 'alert-error'}">
							<span>{testResult.message}</span>
						</div>
					{/if}

					<!-- Actions -->
					<div class="mt-6 flex flex-wrap gap-3">
						<button
							type="button"
							class="btn btn-outline"
							onclick={handleTest}
							disabled={isTesting || isSaving || !host || !email}
						>
							{#if isTesting}
								<span class="loading loading-spinner loading-sm"></span>
								Testing...
							{:else}
								Test Connection
							{/if}
						</button>

						<button
							type="submit"
							class="btn btn-primary"
							disabled={isSaving || isTesting}
						>
							{#if isSaving}
								<span class="loading loading-spinner loading-sm"></span>
								Saving...
							{:else}
								Save Settings
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>

		<!-- Security Note -->
		<div class="alert mt-6">
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
					d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
				/>
			</svg>
			<div>
				<p class="font-semibold">Your credentials are secure</p>
				<p class="text-sm text-base-content/70">
					Your SMTP password is encrypted.
				</p>
			</div>
		</div>
	{/if}
</div>
