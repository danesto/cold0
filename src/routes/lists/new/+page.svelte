<script lang="ts">
	import CsvMapper from '$lib/components/csv-import/csv-mapper.svelte';
</script>

<div class="container mx-auto p-6">
	<div class="mb-6">
		<a href="/" class="btn btn-ghost btn-sm">
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
	</div>

	<div class="mb-6">
		<h1 class="text-3xl font-bold">Create New Contact List</h1>
		<p class="mt-2 text-base-content/70">
			Upload a CSV file, map your fields, and create a new contact list
		</p>
	</div>

	<CsvMapper />
</div>
