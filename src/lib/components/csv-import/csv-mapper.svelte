<script lang="ts">
	import { parseCSVHeaders, saveContactsToList } from '../../../routes/actions.remote';

	// Internal database field names matching Contact schema
	const internalFields = [
		'email',
		'firstName',
		'lastName',
		'company',
		'jobTitle',
		'website',
		'phone',
		'linkedInUrl',
		'industry',
		'companySize',
		'numberOfEmployees',
		'city',
		'country',
		'notes'
	] as const;

	let csvContent: string = $state('');
	let csvHeaders: string[] = $state([]);
	let fieldMapping: Record<string, string> = $state({});
	let isLoading = $state(false);
	let error: string | null = $state(null);
	let listName: string = $state('');
	let listDescription: string = $state('');
	let showListForm: boolean = $state(false);
	let importResult: {
		success: boolean;
		list: { id: string; name: string };
		stats: {
			created: number;
			updated: number;
			linkedToList: number;
			errors: string[];
		};
	} | null = $state(null);

	const handleFileSelect = async (event: Event) => {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (!file) return;

		csvHeaders = [];
		fieldMapping = {};
		error = null;
		isLoading = true;

		try {
			// Read file content as text
			csvContent = await file.text();

			// Parse headers from the CSV content
			const headers = await parseCSVHeaders({ csvContent });
			csvHeaders = headers;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to parse CSV headers';
			console.error(err);
		} finally {
			isLoading = false;
		}
	};

	const handleContinueToListCreation = () => {
		// Validate mappings
		if (!csvContent) {
			error = 'Please select a file first';
			return;
		}

		// Check if at least one field is mapped
		const mappedFields = Object.values(fieldMapping).filter(Boolean);
		if (mappedFields.length === 0) {
			error = 'Please map at least one field';
			return;
		}

		// Check if email is mapped
		const hasEmail = Object.values(fieldMapping).includes('email');
		if (!hasEmail) {
			error = 'Email field is required. Please map at least one column to "email"';
			return;
		}

		// Show list creation form
		showListForm = true;
		error = null;
	};

	const handleSaveToDatabase = async () => {
		if (!listName.trim()) {
			error = 'Please enter a list name';
			return;
		}

		isLoading = true;
		error = null;

		try {
			const result = await saveContactsToList({
				csvContent,
				fieldMapping,
				listName: listName.trim(),
				listDescription: listDescription.trim() || undefined
			});

			importResult = result;
			console.log('Import result:', result);

			// Clear form on success
			if (result.success) {
				csvContent = '';
				csvHeaders = [];
				fieldMapping = {};
				listName = '';
				listDescription = '';
				showListForm = false;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save contacts';
			console.error(err);
		} finally {
			isLoading = false;
		}
	};
</script>

<div
	class="card col-span-6 border-t-6 border-r-2 border-b-2 border-l-2 border-base-300 border-t-primary bg-base-100 shadow-xl"
>
	<div class="card-body">
		{#if !showListForm}
		<h2 class="card-title">1. Let's start by uploading and parsing your contacts</h2>

		<!-- File Upload -->
		<div class="form-control mt-2 w-full">
			<legend class="fieldset-legend text-base text-primary">Choose a CSV file</legend>
			<input
				id="csv-file"
				type="file"
				accept=".csv"
				class="file-input mt-2 w-full file-input-primary"
				onchange={handleFileSelect}
				disabled={isLoading}
			/>
		</div>
		{/if}

		{#if !showListForm && csvHeaders.length}
			<div class="divider mb-10 mt-10"></div>
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

		{#if isLoading}
			<div class="flex justify-center py-4">
				<span class="loading loading-lg loading-spinner"></span>
			</div>
		{/if}

		<!-- Field Mapping -->
		{#if csvHeaders.length > 0 && !isLoading && !importResult && !showListForm}
			<h2 class="card-title">2. Map Your CSV Fields</h2>
			<p class="text-sm text-base-content/70">
				Match your CSV columns to contact fields. <strong>Email is required.</strong>
			</p>

			<div class="mt-4 overflow-x-auto">
				<table class="table">
					<thead>
						<tr>
							<th class="text-primary">Your CSV Column</th>
							<th class="text-primary">Maps To</th>
						</tr>
					</thead>
					<tbody>
						{#each csvHeaders as header (header)}
							<tr>
								<td class="font-semibold">{header}</td>
								<td>
									<select
										class="select-bordered select w-full max-w-xs"
										bind:value={fieldMapping[header]}
									>
										<option value="">-- Skip this field --</option>
										{#each internalFields as field (field)}
											<option value={field}>{field}</option>
										{/each}
									</select>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<div class="card-actions justify-end">
				<button class="btn btn-primary" onclick={handleContinueToListCreation} disabled={isLoading}>
					Continue to Create List
				</button>
			</div>
		{/if}

		<!-- List Creation Form -->
		{#if showListForm && !importResult}
			<h2 class="card-title">3. Create List & Save Contacts</h2>
			<p class="text-sm text-base-content/70">
				Give your contact list a name and optionally add a description.
			</p>

			<div class="form-control mt-4 w-full">
				<label class="label" for="list-name">
					<span class="label-text">List Name <span class="text-error">*</span></span>
				</label>
				<input
					id="list-name"
					type="text"
					placeholder="e.g., Q1 2026 Prospects, Tech Companies"
					class="input-bordered input w-full"
					bind:value={listName}
					required
				/>
			</div>

			<div class="form-control w-full">
				<label class="label" for="list-description">
					<span class="label-text">Description (optional)</span>
				</label>
				<textarea
					id="list-description"
					placeholder="Add notes about this list..."
					class="textarea-bordered textarea w-full"
					rows="3"
					bind:value={listDescription}
				></textarea>
			</div>

			<div class="card-actions mt-6 justify-between">
				<button
					class="btn btn-ghost"
					onclick={() => {
						showListForm = false;
						error = null;
					}}
					disabled={isLoading}
				>
					← Back to Mapping
				</button>
				<button class="btn btn-primary" onclick={handleSaveToDatabase} disabled={isLoading}>
					{#if isLoading}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					Save Contacts to Database
				</button>
			</div>
		{/if}

		<!-- Import Success Result -->
		{#if importResult}
			<div class="divider mb-10 mt-10"></div>

			<div class="alert alert-success">
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
				<div>
					<h3 class="font-bold">Successfully imported contacts!</h3>
					<div class="text-xs">List "{importResult.list.name}" created</div>
				</div>
			</div>

			<div class="stats stats-vertical mt-4 shadow lg:stats-horizontal">
				<div class="stat">
					<div class="stat-title">New Contacts</div>
					<div class="stat-value text-success">{importResult.stats.created}</div>
				</div>

				<div class="stat">
					<div class="stat-title">Updated Contacts</div>
					<div class="stat-value text-info">{importResult.stats.updated}</div>
				</div>

				<div class="stat">
					<div class="stat-title">Added to List</div>
					<div class="stat-value text-primary">{importResult.stats.linkedToList}</div>
				</div>
			</div>

			{#if importResult.stats.errors.length > 0}
				<div class="alert alert-warning mt-4">
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
						<h3 class="font-bold">{importResult.stats.errors.length} rows had errors</h3>
						<div class="text-xs max-h-32 overflow-y-auto">
							{#each importResult.stats.errors.slice(0, 5) as error}
								<div>• {error}</div>
							{/each}
							{#if importResult.stats.errors.length > 5}
								<div>...and {importResult.stats.errors.length - 5} more</div>
							{/if}
						</div>
					</div>
				</div>
			{/if}

			<div class="card-actions justify-end mt-6">
				<button
					class="btn btn-primary"
					onclick={() => {
						importResult = null;
						// Reset to allow new import
					}}
				>
					Import Another CSV
				</button>
			</div>
		{/if}
	</div>
</div>
