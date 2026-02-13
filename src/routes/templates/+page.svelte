<script lang="ts">
	import MailTemplateEditor from '$lib/components/mailing/mail-template-editor.svelte';
	import { getUserTemplates, deleteTemplate } from './data.remote';

	const templates = getUserTemplates();
	let selectedTemplateId: string | null = $state(null);
	let deletingTemplateId: string | null = $state(null);

	const selectedTemplate = $derived(
		templates.current?.find((t) => t.id === selectedTemplateId) || null
	);

	const handleDeleteTemplate = async (templateId: string) => {
		if (!confirm('Are you sure you want to delete this template?')) return;

		deletingTemplateId = templateId;
		try {
			await deleteTemplate({ templateId });
			templates.refresh();

			// If we were editing this template, clear selection
			if (selectedTemplateId === templateId) {
				selectedTemplateId = null;
			}
		} catch (error) {
			console.error('Failed to delete template:', error);
			alert('Failed to delete template');
		} finally {
			deletingTemplateId = null;
		}
	};

	const handleTemplateSelect = (templateId: string) => {
		selectedTemplateId = selectedTemplateId === templateId ? null : templateId;
	};

	const handleNewTemplate = () => {
		selectedTemplateId = null;
	};

	const handleSaveSuccess = () => {
		selectedTemplateId = null;
		templates.refresh();
	};
</script>

<div class="container mx-auto p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">Email Templates</h1>
		<p class="mt-2 text-base-content/70">Create and manage your email templates</p>
	</div>

	<!-- Saved Templates List -->
	{#if templates.loading}
		<div class="mb-8 flex justify-center py-12">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if templates.error}
		<div class="alert alert-error mb-8">
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
			<span>Failed to load templates</span>
		</div>
	{:else if templates.current && templates.current.length > 0}
		<div class="mb-8">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-2xl font-bold">Saved Templates ({templates.current.length})</h2>
				{#if selectedTemplateId}
					<button class="btn btn-ghost btn-sm" onclick={handleNewTemplate}>
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
						Create New Template
					</button>
				{/if}
			</div>

			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each templates.current as template (template.id)}
						<div
							class="card cursor-pointer border-2 bg-base-200 text-left transition-all hover:shadow-lg {selectedTemplateId ===
							template.id
								? 'border-primary'
								: 'border-transparent'}"
							role="button"
							tabindex="0"
							onclick={() => handleTemplateSelect(template.id)}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									handleTemplateSelect(template.id);
								}
							}}
						>
							<div class="card-body p-4">
								<div class="flex items-start justify-between">
									<div class="flex-1">
										<h3 class="font-semibold">{template.name}</h3>
										<p class="mt-1 text-sm text-base-content/70">
											Subject: {template.subject}
										</p>
									</div>
									{#if selectedTemplateId === template.id}
										<span class="badge badge-primary badge-sm">Editing</span>
									{/if}
								</div>

								<div class="mt-3 text-xs text-base-content/50">
									Updated {new Date(template.updatedAt).toLocaleDateString()}
								</div>

								<div class="card-actions justify-end mt-2">
									<button
										class="btn btn-error btn-xs"
										onclick={(e) => {
											e.stopPropagation();
											handleDeleteTemplate(template.id);
										}}
										disabled={deletingTemplateId === template.id}
									>
										{#if deletingTemplateId === template.id}
											<span class="loading loading-spinner loading-xs"></span>
										{:else}
											Delete
										{/if}
									</button>
								</div>
							</div>
						</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Template Editor -->
	<div class="card border border-card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title mb-4">
				{selectedTemplate ? `Edit: ${selectedTemplate.name}` : 'Create New Template'}
			</h2>

			{#if selectedTemplate}
				<MailTemplateEditor
					templateId={selectedTemplate.id}
					initialName={selectedTemplate.name}
					initialSubject={selectedTemplate.subject}
					initialBody={selectedTemplate.body}
					onSaveSuccess={handleSaveSuccess}
				/>
			{:else}
				<MailTemplateEditor onSaveSuccess={handleSaveSuccess} />
			{/if}
		</div>
	</div>
</div>
