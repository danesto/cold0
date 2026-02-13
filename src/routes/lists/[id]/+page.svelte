<script lang="ts">
	import { getListWithContacts, bulkSendEmails, addContactToList } from './data.remote';
	import { getUserTemplates } from '../../templates/data.remote';
	import AddContactModal from '$lib/components/contacts/add-contact-modal.svelte';
	import ContactRow from '$lib/components/contacts/contact-row.svelte';

	let { params } = $props();

	const listData = $derived(getListWithContacts({ listId: params.id }));
	const templates = getUserTemplates();

	// Bulk email sending state
	let selectedContactIds: string[] = $state([]);
	let selectedTemplateId: string = $state('');
	let isSendingEmails: boolean = $state(false);
	let sendSuccess: string | null = $state(null);
	let sendError: string | null = $state(null);

	// Add contact modal state
	let isAddContactModalOpen: boolean = $state(false);

	const toggleContactSelection = (contactId: string) => {
		if (selectedContactIds.includes(contactId)) {
			selectedContactIds = selectedContactIds.filter((id) => id !== contactId);
		} else {
			selectedContactIds = [...selectedContactIds, contactId];
		}
	};

	const toggleSelectAll = () => {
		const list = listData.current as any;
		if (!list?.contacts) return;

		if (selectedContactIds.length === list.contacts.length) {
			selectedContactIds = [];
		} else {
			selectedContactIds = list.contacts.map((c: any) => c.id);
		}
	};

	const handleBulkSend = async () => {
		if (selectedContactIds.length === 0) {
			alert('Please select at least one contact');
			return;
		}

		if (!selectedTemplateId) {
			alert('Please select a template');
			return;
		}

		if (
			!confirm(
				`Are you sure you want to send emails to ${selectedContactIds.length} contact(s)?`
			)
		) {
			return;
		}

		isSendingEmails = true;
		sendSuccess = null;
		sendError = null;

		try {
			const result = await bulkSendEmails({
				contactIds: selectedContactIds,
				templateId: selectedTemplateId
			});

			if (result.success) {
				sendSuccess = `Successfully sent ${result.results.success} email(s). Failed: ${result.results.failed}`;
				if (result.results.failed > 0) {
					console.error('Failed emails:', result.results.errors);
				}

				listData.refresh();
				selectedContactIds = [];
			}
		} catch (error) {
			console.error('Failed to send emails:', error);
			sendError = error instanceof Error ? error.message : 'Failed to send emails';
		} finally {
			isSendingEmails = false;

			setTimeout(() => {
				sendSuccess = null;
				sendError = null;
			}, 5000);
		}
	};

	const handleAddContact = async (contactData: any) => {
		await addContactToList({
			listId: params.id,
			contactData
		});

		listData.refresh();
	};
</script>

<div class="container mx-auto p-6">
	<!-- Header -->
	<div class="mb-6">
		<a href="/" class="btn mb-4 btn-ghost btn-sm">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			Back to Lists
		</a>

		{#if listData.loading}
			<div class="h-8 w-64 skeleton"></div>
		{:else if listData.current}
			{@const list = listData.current as any}
			<div class="flex items-start justify-between">
				<div>
					<h1 class="text-3xl font-bold">{list.name}</h1>
					{#if list.description}
						<p class="mt-2 text-base-content/70">{list.description}</p>
					{/if}
				</div>

				<div class="stats shadow">
					<div class="stat">
						<div class="stat-title">Total Contacts</div>
						<div class="stat-value text-primary">{list.contacts?.length || 0}</div>
					</div>
					<div class="stat">
						<div class="stat-title">Emails Sent</div>
						<div class="stat-value text-success">
							{list.contacts?.filter((c: any) => c.emailSent).length || 0}
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Success/Error Messages -->
	{#if sendSuccess}
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
			<span>{sendSuccess}</span>
		</div>
	{/if}

	{#if sendError}
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
			<span>{sendError}</span>
		</div>
	{/if}

	<!-- Bulk Send Toolbar -->
	{#if listData.current}
		{@const list = listData.current as any}
		{#if list.contacts?.length > 0}
			<div class="card card-border border-accent mb-6 bg-base-100 shadow-xl">
				<div class="card-body">
					<div class="flex flex-wrap items-end gap-4">
						<div class="form-control flex-1 min-w-[250px]">
							<label class="label" for="template-selector">
								<span class="label-text font-semibold">Select Template</span>
							</label>
							<select
								id="template-selector"
								class="select select-bordered w-full"
								bind:value={selectedTemplateId}
								disabled={isSendingEmails || templates.loading}
							>
								<option value="">Choose a template...</option>
								{#if templates.current}
									{#each templates.current as template}
										<option value={template.id}>{template.name}</option>
									{/each}
								{/if}
							</select>
						</div>

						<div class="flex items-center gap-2">
							<div class="badge badge-lg badge-neutral">
								{selectedContactIds.length} selected
							</div>
							<button
								class="btn btn-primary"
								onclick={handleBulkSend}
								disabled={isSendingEmails ||
									selectedContactIds.length === 0 ||
									!selectedTemplateId}
							>
								{#if isSendingEmails}
									<span class="loading loading-spinner loading-sm"></span>
									Sending...
								{:else}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5"
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
									Send Emails
								{/if}
							</button>
						</div>
					</div>
				</div>
			</div>
		{/if}
	{/if}

	<!-- Contacts Table -->
	{#if listData.error}
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
			<span>{listData.error.message || 'Failed to load contacts'}</span>
		</div>
	{:else if listData.loading}
		<div class="flex justify-center py-12">
			<span class="loading loading-lg loading-spinner"></span>
		</div>
	{:else if listData.current}
		{@const list = listData.current as any}
		<div class="card bg-base-100">
			<div class="card-body px-0">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="card-title">Contacts</h2>
					<button
						class="btn btn-primary btn-sm"
						onclick={() => (isAddContactModalOpen = true)}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4v16m8-8H4"
							/>
						</svg>
						Add Contact
					</button>
				</div>

				<div class="overflow-x-auto">
					<table class="table border border-primary table-zebra">
						<thead>
							<tr>
								<th>
									<input
										type="checkbox"
										class="checkbox"
										checked={selectedContactIds.length === list.contacts?.length &&
											list.contacts?.length > 0}
										onchange={toggleSelectAll}
									/>
								</th>
								<th>Email Sent</th>
								<th>Email</th>
								<th>Name</th>
								<th>Company</th>
								<th>Job Title</th>
								<th>Website</th>
								<th>Location</th>
								<th>Notes</th>
							</tr>
						</thead>
						<tbody>
							{#each list.contacts || [] as contact (contact.id)}
							<ContactRow
								{contact}
								selected={selectedContactIds.includes(contact.id)}
								onToggleSelect={() => toggleContactSelection(contact.id)}
								onUpdated={() => listData.refresh()}
							/>
							{/each}
						</tbody>
					</table>
				</div>

				{#if !list.contacts || list.contacts.length === 0}
					<div class="py-12 text-center">
						<p class="text-base-content/70">No contacts in this list yet</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Add Contact Modal -->
	<AddContactModal
		bind:isOpen={isAddContactModalOpen}
		onClose={() => (isAddContactModalOpen = false)}
		onSave={handleAddContact}
	/>
</div>
