<script lang="ts">
	import { createTemplate, updateTemplate } from '../../../routes/templates/data.remote';
	import { goto } from '$app/navigation';

	type Props = {
		templateId?: string;
		initialName?: string;
		initialSubject?: string;
		initialBody?: string;
		onSaveSuccess?: () => void;
	};

	let {
		templateId,
		initialName = '',
		initialSubject = '',
		initialBody = '',
		onSaveSuccess
	}: Props = $props();

	let name = $state(initialName);
	let subject = $state(initialSubject);
	let body = $state(initialBody);
	let isSaving = $state(false);
	let error = $state<string | null>(null);
	let successMessage = $state<string | null>(null);

	// Available variables from Contact model
	const availableVariables = [
		{ name: 'firstName', description: 'First name' },
		{ name: 'lastName', description: 'Last name' },
		{ name: 'email', description: 'Email address' },
		{ name: 'company', description: 'Company name' },
		{ name: 'jobTitle', description: 'Job title' },
		{ name: 'website', description: 'Website URL' },
		{ name: 'phone', description: 'Phone number' },
		{ name: 'linkedInUrl', description: 'LinkedIn URL' },
		{ name: 'industry', description: 'Industry' },
		{ name: 'companySize', description: 'Company size' },
		{ name: 'numberOfEmployees', description: 'Number of employees' },
		{ name: 'city', description: 'City' },
		{ name: 'country', description: 'Country' }
	];

	let textareaElement: HTMLTextAreaElement;

	const insertVariable = (variableName: string) => {
		const cursorPos = textareaElement.selectionStart;
		const textBefore = body.substring(0, cursorPos);
		const textAfter = body.substring(cursorPos);

		const variableTag = `{{${variableName}}}`;
		body = textBefore + variableTag + textAfter;

		// Move cursor after inserted variable
		setTimeout(() => {
			textareaElement.focus();
			textareaElement.selectionStart = textareaElement.selectionEnd =
				cursorPos + variableTag.length;
		}, 0);
	};

	const handleSave = async () => {
		error = null;
		successMessage = null;

		if (!name.trim()) {
			error = 'Template name is required';
			return;
		}

		if (!subject.trim()) {
			error = 'Subject is required';
			return;
		}

		if (!body.trim()) {
			error = 'Template body is required';
			return;
		}

		isSaving = true;

		try {
			if (templateId) {
				// Update existing template
				await updateTemplate({
					templateId,
					name,
					subject,
					body
				});
				successMessage = 'Template updated successfully!';
			} else {
				// Create new template
				const result = await createTemplate({
					name,
					subject,
					body
				});
				successMessage = 'Template created successfully!';

				// Clear form after creation
				setTimeout(() => {
					if (onSaveSuccess) {
						onSaveSuccess();
					} else {
						goto('/templates');
					}
				}, 1500);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save template';
			console.error('Save template error:', err);
		} finally {
			isSaving = false;
		}
	};
</script>

<div class="space-y-4">
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

	{#if successMessage}
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
			<span>{successMessage}</span>
		</div>
	{/if}

	<div class="fieldset-label flex flex-col items-start">
		<span class="label-text text-lg font-semibold text-white">Email Template</span>
		<span class="label-text-alt text-base-content/60"
			>You can use HTML tags to format your email.</span
		>
		<span class="label-text-alt text-base-content/60">
			Use double curly braces for variables: <code class="text-xs text-primary"
				>&#123;&#123;variableName&#125;&#125;</code
			>
		</span>
	</div>

	<fieldset class="fieldset">
		<legend class="fieldset-label flex flex-col items-start">
			Template Name <span class="text-error">*</span>
		</legend>
		<input
			type="text"
			class="input input-bordered w-full"
			placeholder="my super cool template"
			bind:value={name}
			required
			disabled={isSaving}
		/>
	</fieldset>

	<fieldset class="fieldset">
		<legend class="fieldset-label flex flex-col items-start">
			Subject <span class="text-error">*</span>
		</legend>
		<input
			type="text"
			class="input input-bordered w-full"
			placeholder="Try out my super cool app!"
			bind:value={subject}
			required
			disabled={isSaving}
		/>
	</fieldset>
    
  
	<!-- Email Template form -->
	<fieldset class="fieldset">

		<!-- Available Variables -->
		<div class="card border border-card bg-base-200 card-border">
			<div class="card-body">
				<h3 class="card-title text-base">Available Variables</h3>
				<p class="mb-2 text-sm text-base-content/70">
					Click on a variable to insert it at cursor position
				</p>
                <div class="flex flex-wrap items-start gap-2">
				{#each availableVariables as variable (variable.name)}
					<button
						type="button"
						class="btn btn-sm btn-outline btn-primary"
						onclick={() => insertVariable(variable.name)}
						title={variable.description}
					>
						<code class="text-xs">&#123;&#123;{variable.name}&#125;&#125;</code>
					</button>
				{/each}
			</div>
			</div>
		</div>
		<legend class="fieldset-label flex flex-col items-start">
			Body <span class="text-error">*</span>
		</legend>
		<textarea
			id="email-template"
			bind:this={textareaElement}
			bind:value={body}
			rows="14"
			class="textarea-bordered textarea h-100 w-full font-mono text-sm"
			placeholder="Enter your email template here...&#10;&#10;You can use HTML and insert variables like &#123;&#123;firstName&#125;&#125;, &#123;&#123;company&#125;&#125;, etc."
			disabled={isSaving}
		></textarea>
	</fieldset>

	<button class="btn btn-primary w-full" onclick={handleSave} disabled={isSaving}>
		{#if isSaving}
			<span class="loading loading-spinner loading-sm"></span>
		{/if}
		{templateId ? 'Update' : 'Save'} Template
	</button>

	<!-- Example Template -->
	<div class="collapse-arrow collapse bg-base-200">
		<input type="checkbox" />
		<div class="collapse-title font-medium">View Example Template</div>
		<div class="collapse-content">
			<div class="mockup-code text-xs">
				<pre><code>
    &lt;p&gt;Hi &#123;&#123;firstName&#125;&#125;,&lt;/p&gt;
    &lt;p&gt;I noticed you're working as &#123;&#123;jobTitle&#125;&#125; at &#123;&#123;company&#125;&#125;.
    I wanted to reach out because...&lt;/p&gt;

    &lt;p&gt;
    Best regards,&lt;br&gt;
    Your Name
    &lt;/p&gt;</code
					></pre>
			</div>
		</div>
	</div>
</div>
