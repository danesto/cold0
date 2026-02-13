<script lang="ts">
	import { updateContactNotes, updateContactEmailSent } from '../../../routes/lists/[id]/data.remote';

	type Contact = {
		id: string;
		email: string;
		firstName: string | null;
		lastName: string | null;
		company: string | null;
		jobTitle: string | null;
		website: string | null;
		phone: string | null;
		city: string | null;
		country: string | null;
		emailSent: boolean;
		emailSentAt: string | null;
		notes: string | null;
	};

	type Props = {
		contact: Contact;
		selected: boolean;
		onToggleSelect: () => void;
		onUpdated: () => void;
	};

	let { contact, selected, onToggleSelect, onUpdated }: Props = $props();

	// Notes editing state (local to this row)
	let isEditingNotes = $state(false);
	let notesValue = $state('');
	let isSavingNotes = $state(false);

	// Email sent state (local to this row)
	let isUpdatingEmailSent = $state(false);

	const startEditNotes = () => {
		isEditingNotes = true;
		notesValue = contact.notes || '';
	};

	const cancelEditNotes = () => {
		isEditingNotes = false;
		notesValue = '';
	};

	const saveNotes = async () => {
		isSavingNotes = true;
		try {
			await updateContactNotes({
				contactId: contact.id,
				notes: notesValue.trim()
			});
			isEditingNotes = false;
			notesValue = '';
			onUpdated();
		} catch (error) {
			console.error('Failed to save notes:', error);
			alert('Failed to save notes');
		} finally {
			isSavingNotes = false;
		}
	};

	const toggleEmailSent = async () => {
		isUpdatingEmailSent = true;
		try {
			await updateContactEmailSent({
				contactId: contact.id,
				emailSent: !contact.emailSent
			});
			onUpdated();
		} catch (error) {
			console.error('Failed to update email status:', error);
			alert('Failed to update email status');
		} finally {
			isUpdatingEmailSent = false;
		}
	};
</script>

<tr>
	<!-- Select -->
	<td>
		<input
			type="checkbox"
			class="checkbox"
			checked={selected}
			onchange={onToggleSelect}
		/>
	</td>

	<!-- Email Sent -->
	<td>
		<div class="flex items-center gap-2">
			<input
				type="checkbox"
				class="checkbox checkbox-success"
				checked={contact.emailSent}
				disabled={isUpdatingEmailSent}
				onchange={toggleEmailSent}
			/>
			{#if isUpdatingEmailSent}
				<span class="loading loading-xs loading-spinner"></span>
			{/if}
		</div>
	</td>

	<!-- Email -->
	<td>
		<div class="flex items-center gap-2">
			{#if contact.emailSent}
				<span class="badge badge-sm badge-success">Sent</span>
			{/if}
			<a href="mailto:{contact.email}" class="link link-primary">
				{contact.email}
			</a>
		</div>
		{#if contact.emailSentAt}
			<div class="text-xs text-base-content/50">
				{new Date(contact.emailSentAt).toLocaleDateString()}
			</div>
		{/if}
	</td>

	<!-- Name -->
	<td>
		<div class="font-medium">
			{contact.firstName || ''}
			{contact.lastName || ''}
		</div>
	</td>

	<!-- Company -->
	<td>
		<div class="font-medium">{contact.company || '-'}</div>
	</td>

	<!-- Job Title -->
	<td>{contact.jobTitle || '-'}</td>

	<!-- Website -->
	<td>
		{#if contact.website}
			<a
				href={contact.website}
				target="_blank"
				rel="noopener noreferrer"
				class="link link-secondary"
				aria-label="Visit website"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="inline h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
					/>
				</svg>
			</a>
		{:else}
			-
		{/if}
	</td>

	<!-- Location -->
	<td>
		{#if contact.city || contact.country}
			<div class="text-sm">
				{contact.city ? contact.city : ''}{contact.city && contact.country
					? ', '
					: ''}{contact.country || ''}
			</div>
		{:else}
			-
		{/if}
	</td>

	<!-- Notes -->
	<td>
		{#if isEditingNotes}
			<div class="flex items-center gap-2">
				<textarea
					class="textarea-bordered textarea w-full textarea-sm"
					rows="2"
					bind:value={notesValue}
					placeholder="Add notes..."
				></textarea>
				<div class="flex flex-col gap-1">
					<button
						class="btn btn-xs btn-success"
						disabled={isSavingNotes}
						onclick={saveNotes}
					>
						{#if isSavingNotes}
							<span class="loading loading-xs loading-spinner"></span>
						{:else}
							✓
						{/if}
					</button>
					<button class="btn btn-ghost btn-xs" onclick={cancelEditNotes}>
						✕
					</button>
				</div>
			</div>
		{:else}
			<button
				class="btn w-full justify-start text-left btn-ghost btn-sm"
				onclick={startEditNotes}
			>
				{#if contact.notes}
					<span class="line-clamp-2">{contact.notes}</span>
				{:else}
					<span class="text-base-content/50">Click to add notes...</span>
				{/if}
			</button>
		{/if}
	</td>
</tr>
