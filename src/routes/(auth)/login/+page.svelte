<script lang="ts">
	import LoginForm from '$lib/components/authentication/login-form.svelte';
</script>

<div class="flex min-h-screen items-center justify-center p-4">
	<div class="w-full max-w-md">
		<LoginForm />

		<div class="mt-4 text-center">
			<p class="text-sm">
				Don't have an account?
				<a href="/register" class="link link-primary">Sign up</a>
			</p>
		</div>
	</div>
</div>
