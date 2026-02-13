<script lang="ts">
	import { resolve } from '$app/paths';
	import { getUserLists } from './lists/data.remote';

	const lists = getUserLists();
</script>

<div class="container mx-auto p-6">
	<!-- Header -->
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Contact Lists</h1>
			<p class="mt-2 text-base-content/70">Manage your cold email contact lists</p>
		</div>
		<a href={resolve('/lists/new')} class="btn btn-primary">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Create New List
		</a>
	</div>

	<!-- Lists Grid -->
	{#if lists.error}
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
			<span>Failed to load lists. Please try refreshing the page.</span>
		</div>
	{:else if lists.loading}
		<div class="flex justify-center py-12">
			<span class="loading loading-lg loading-spinner"></span>
		</div>
	{:else if !lists.loading && (!lists.current || lists.current.length === 0)}
		<!-- Empty State -->
		<div class="card bg-base-200">
			<div class="card-body items-center text-center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-24 w-24 text-base-content/20"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				<h2 class="card-title">No lists yet</h2>
				<p class="text-base-content/70">
					Get started by creating your first contact list from a CSV file
				</p>
				<div class="card-actions">
					<a href={resolve('/lists/new')} class="btn btn-primary">Create Your First List</a>
				</div>
			</div>
		</div>
	{:else}
		<!-- Lists Grid -->
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each lists.current as list (list.id)}
				<div
					class="card border-2 border-accent bg-base-100 shadow-xl transition-shadow hover:shadow-2xl"
				>
					<div class="card-body">
						<h2 class="card-title line-clamp-1">{list.name}</h2>

						{#if list.description}
							<p class="text-sm text-base-content/70">{list.description}</p>
						{/if}

						<!-- Stats -->
						<div class="stats mt-4 shadow">
							<div class="stat">
								<div class="stat-title text-xs">Contacts</div>
								<div class="stat-value text-2xl">{list.contactCount}</div>
							</div>
						</div>

						<!-- Metadata -->
						<div class="mt-2 text-xs text-base-content/50">
							Created {new Date(list.createdAt).toLocaleDateString()}
						</div>

						<!-- Actions -->
						<div class="mt-4 card-actions justify-end">
							<button class="btn btn-ghost btn-sm">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
									/>
								</svg>
								Edit
							</button>
							<a href={resolve(`/lists/${list.id}`)} class="btn btn-sm btn-accent">
								View Contacts
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</a>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
