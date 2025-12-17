<template>
	<div v-auto-animate>
		<UAlert
			v-if="error"
			type="error"
			class="mb-4"
			title="Oops! Something went wrong."
			:description="error"
			color="rose"
			variant="outline"
			icon="material-symbols:warning-rounded"
		/>

		<form class="grid gap-4" @submit.prevent="attemptLogin">
			<UFormGroup label="Email" required>
				<UInput
					v-model="credentials.email"
					type="email"
					:disabled="loading"
					size="lg"
					name="email"
					label="Work Email"
					placeholder="john@example.com"
				/>
			</UFormGroup>
			<UFormGroup label="Password" required>
				<UInput
					v-model="credentials.password"
					type="password"
					:disabled="loading"
					size="lg"
					name="password"
					label="Password"
					placeholder="Your Password"
				/>
			</UFormGroup>
			<UButton
				type="submit"
				:loading="loading"
				:disabled="!credentials.email"
				size="lg"
				label="Sign In"
				trailing-icon="material-symbols:arrow-forward"
				block
			/>
		</form>

		<!-- @TODO Remove password once magic link authentication is added -->
		<!-- <div class="mt-6">
			<VText>
				<UIcon name="material-symbols:info-rounded" class="mr-2" />
				<span>What about a password?</span>
			</VText>
			<VText text-color="light" size="xs" class="mt-2">
				Not needed 😃. Just enter your email above and we'll send you a magic link to login to your dashboard.
			</VText>
		</div> -->
	</div>
</template>

<script setup>
const loading = ref(false);
const error = ref(null);

const credentials = reactive({
	email: '',
	password: '',
});

async function attemptLogin() {
	const { email, password } = unref(credentials);
	loading.value = true;
	error.value = null;

	try {
		// Use server API for role-based redirect
		const response = await $fetch('/api/campus/login', {
			method: 'POST',
			body: { email, password }
		});

		if (response.success) {
			// Store tokens in cookies for Directus auth
			// Use the expires value from response (ms) or default to 15 mins
			const maxAge = response.expires ? Math.floor(response.expires / 1000) : 900;
			
			const accessToken = useCookie('directus_token', { 
				maxAge, 
				path: '/'
			});
			
			const refreshToken = useCookie('directus_refresh_token', { 
				maxAge: 604800, // 7 days
				path: '/'
			});

			accessToken.value = response.access_token;
			refreshToken.value = response.refresh_token;
			
			console.log('Login success, setting cookies and redirecting to:', response.redirectTo);
			
			// Redirect based on role
			await navigateTo(response.redirectTo, { external: true });
		}
	} catch (err) {
		error.value = err.data?.message || err.message || 'Login failed';
	}

	loading.value = false;
}
</script>
