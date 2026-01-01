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

		<div class="mt-6 text-center text-sm">
			<p class="text-gray-500 dark:text-gray-400">
				New to Nafuna Campus?
				<NuxtLink to="/campus/register" class="text-primary-600 font-medium hover:underline">
					Create an account
				</NuxtLink>
			</p>
		</div>

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
const { user } = useDirectusAuth();
const nuxtApp = useNuxtApp();
const $directus = nuxtApp.$directus;

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
		// Step 1: Call server API to login and determine redirect based on role
		const response = await $fetch('/api/campus/login', {
			method: 'POST',
			body: { email, password }
		});

		console.log('=== LOGIN RESPONSE ===', response);

		if (!response.success || !response.access_token) {
			throw new Error('Login failed');
		}

		// Step 2: Set tokens in the Directus client
		await $directus.setToken(response.access_token);
		
		// Step 3: Cache role and auth state
		if (process.client) {
			localStorage.setItem('authenticated', 'true');
			if (response.user?.role) {
				const roleId = typeof response.user.role === 'object' 
					? response.user.role.id 
					: response.user.role;
				const roleIdStr = String(roleId).trim();
				localStorage.setItem('user_role_id', roleIdStr);
				
				// FORCE COOKIE SET ON CLIENT (Redundancy for Middleware)
				const roleCookie = useCookie('user_role_id', {
					maxAge: 60 * 60 * 24 * 7,
					path: '/'
				});
				roleCookie.value = roleIdStr;
			}
		}

		// Step 4: Update user state
		user.value = response.user;

		// Step 5: Navigate to the server-determined redirect path
		// Step 5: Navigate to the server-determined redirect path
		// FORCE REDIRECT based on Role to prevent cross-contamination
		let finalRedirect = response.redirectTo;
		
		const roleId = response.user?.role && typeof response.user.role === 'object' 
			? response.user.role.id 
			: response.user.role;
			
		// Check against Campus Role ID (from config or hardcoded known ID if needed)
		// We trust the server 'redirectTo' usually, but let's be explicit:
		// if (finalRedirect && finalRedirect === '/campus') {
		// 	// If target is just root /campus (now public), bump them to their dashboard
        //      finalRedirect = '/campus/dashboard';
		// }

		console.log('Redirecting to:', finalRedirect);
		await navigateTo(finalRedirect);
	} catch (err) {
		console.error('Login error:', err);
		error.value = err.data?.message || err.message || 'Invalid email or password';
	}

	loading.value = false;
}
</script>
