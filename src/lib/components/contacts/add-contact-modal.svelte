<script lang="ts">
	import { TEMPLATE_VARIABLES } from '$lib/utils/template-variables';

	type Props = {
		isOpen: boolean;
		onClose: () => void;
		onSave: (contactData: any) => Promise<void>;
	};

	let { isOpen = $bindable(), onClose, onSave }: Props = $props();

	// Form state
	let formData = $state({
		email: '',
		firstName: '',
		lastName: '',
		company: '',
		jobTitle: '',
		website: '',
		phone: '',
		linkedInUrl: '',
		industry: '',
		companySize: '',
		numberOfEmployees: '',
		city: '',
		country: '',
		notes: ''
	});

	let isSaving = $state(false);
	let error = $state<string | null>(null);

	const resetForm = () => {
		formData = {
			email: '',
			firstName: '',
			lastName: '',
			company: '',
			jobTitle: '',
			website: '',
			phone: '',
			linkedInUrl: '',
			industry: '',
			companySize: '',
			numberOfEmployees: '',
			city: '',
			country: '',
			notes: ''
		};
		error = null;
	};

	const handleClose = () => {
		if (!isSaving) {
			resetForm();
			onClose();
		}
	};

	const handleSubmit = async (e: Event) => {
		e.preventDefault();

		// Validate email
		if (!formData.email || !formData.email.includes('@')) {
			error = 'Please enter a valid email address';
			return;
		}

		isSaving = true;
		error = null;

		try {
			await onSave(formData);
			resetForm();
			onClose();
		} catch (err) {
			console.error('Failed to save contact:', err);
			error = err instanceof Error ? err.message : 'Failed to save contact';
		} finally {
			isSaving = false;
		}
	};
</script>

{#if isOpen}
	<div class="modal modal-open">
		<div class="modal-box max-w-3xl">
			<h3 class="text-lg font-bold mb-4">Add New Contact</h3>

			{#if error}
				<div class="alert alert-error mb-4">
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

			<form onsubmit={handleSubmit}>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<!-- Email (Required) -->
					<div class="form-control col-span-2">
						<label class="label" for="email">
							<span class="label-text font-semibold">Email <span class="text-error">*</span></span>
						</label>
						<input
							id="email"
							type="email"
							class="input input-bordered"
							bind:value={formData.email}
							required
							placeholder="contact@company.com"
						/>
					</div>

					<!-- First Name -->
					<div class="form-control">
						<label class="label" for="firstName">
							<span class="label-text">First Name</span>
						</label>
						<input
							id="firstName"
							type="text"
							class="input input-bordered"
							bind:value={formData.firstName}
							placeholder="John"
						/>
					</div>

					<!-- Last Name -->
					<div class="form-control">
						<label class="label" for="lastName">
							<span class="label-text">Last Name</span>
						</label>
						<input
							id="lastName"
							type="text"
							class="input input-bordered"
							bind:value={formData.lastName}
							placeholder="Doe"
						/>
					</div>

					<!-- Company -->
					<div class="form-control">
						<label class="label" for="company">
							<span class="label-text">Company</span>
						</label>
						<input
							id="company"
							type="text"
							class="input input-bordered"
							bind:value={formData.company}
							placeholder="Acme Corp"
						/>
					</div>

					<!-- Job Title -->
					<div class="form-control">
						<label class="label" for="jobTitle">
							<span class="label-text">Job Title</span>
						</label>
						<input
							id="jobTitle"
							type="text"
							class="input input-bordered"
							bind:value={formData.jobTitle}
							placeholder="CEO"
						/>
					</div>

					<!-- Industry -->
					<div class="form-control">
						<label class="label" for="industry">
							<span class="label-text">Industry</span>
						</label>
						<input
							id="industry"
							type="text"
							class="input input-bordered"
							bind:value={formData.industry}
							placeholder="Technology"
						/>
					</div>

					<!-- Company Size -->
					<div class="form-control">
						<label class="label" for="companySize">
							<span class="label-text">Company Size</span>
						</label>
						<select id="companySize" class="select select-bordered" bind:value={formData.companySize}>
							<option value="">Select size...</option>
							<option value="1-10">1-10</option>
							<option value="11-50">11-50</option>
							<option value="51-200">51-200</option>
							<option value="201-500">201-500</option>
							<option value="501-1000">501-1000</option>
							<option value="1000+">1000+</option>
						</select>
					</div>

					<!-- Number of Employees -->
					<div class="form-control">
						<label class="label" for="numberOfEmployees">
							<span class="label-text">Number of Employees</span>
						</label>
						<input
							id="numberOfEmployees"
							type="number"
							class="input input-bordered"
							bind:value={formData.numberOfEmployees}
							placeholder="50"
						/>
					</div>

					<!-- Website -->
					<div class="form-control">
						<label class="label" for="website">
							<span class="label-text">Website</span>
						</label>
						<input
							id="website"
							type="url"
							class="input input-bordered"
							bind:value={formData.website}
							placeholder="https://company.com"
						/>
					</div>

					<!-- Phone -->
					<div class="form-control">
						<label class="label" for="phone">
							<span class="label-text">Phone</span>
						</label>
						<input
							id="phone"
							type="tel"
							class="input input-bordered"
							bind:value={formData.phone}
							placeholder="+1 234 567 8900"
						/>
					</div>

					<!-- LinkedIn URL -->
					<div class="form-control">
						<label class="label" for="linkedInUrl">
							<span class="label-text">LinkedIn URL</span>
						</label>
						<input
							id="linkedInUrl"
							type="url"
							class="input input-bordered"
							bind:value={formData.linkedInUrl}
							placeholder="https://linkedin.com/in/johndoe"
						/>
					</div>

					<!-- City -->
					<div class="form-control">
						<label class="label" for="city">
							<span class="label-text">City</span>
						</label>
						<input
							id="city"
							type="text"
							class="input input-bordered"
							bind:value={formData.city}
							placeholder="New York"
						/>
					</div>

					<!-- Country -->
					<div class="form-control">
						<label class="label" for="country">
							<span class="label-text">Country</span>
						</label>
						<input
							id="country"
							type="text"
							class="input input-bordered"
							bind:value={formData.country}
							placeholder="USA"
						/>
					</div>

					<!-- Notes -->
					<div class="form-control col-span-2">
						<label class="label" for="notes">
							<span class="label-text">Notes</span>
						</label>
						<textarea
							id="notes"
							class="textarea textarea-bordered"
							bind:value={formData.notes}
							placeholder="Additional notes about this contact..."
							rows="3"
						></textarea>
					</div>
				</div>

				<div class="modal-action">
					<button type="button" class="btn" onclick={handleClose} disabled={isSaving}>
						Cancel
					</button>
					<button type="submit" class="btn btn-primary" disabled={isSaving}>
						{#if isSaving}
							<span class="loading loading-spinner loading-sm"></span>
							Saving...
						{:else}
							Add Contact
						{/if}
					</button>
				</div>
			</form>
		</div>
		<button
			type="button"
			class="modal-backdrop"
			onclick={handleClose}
			aria-label="Close modal"
		></button>
	</div>
{/if}
