<script lang="ts">
	import RegisterForm from '$lib/components/authentication/register-form.svelte';
</script>

<div class="flex min-h-screen items-center justify-center p-4">
	<div class="w-full max-w-md">
		<RegisterForm />

		<div class="mt-4 text-center">
			<p class="text-sm">
				Already have an account?
				<a href="/login" class="link link-primary">Login</a>
			</p>
		</div>
	</div>
</div>
