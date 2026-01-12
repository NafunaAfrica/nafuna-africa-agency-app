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
const { login, user } = useDirectusAuth();
const router = useRouter();
const config = useRuntimeConfig();

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
		// Step 1: Standard Client-Side Login (Matches Client Portal)
		// This handles cookies securely and automatically based on the Directus SDK defaults
		await login(email, password);

		// Step 2: Determine Redirect based on Role
		// We trust the client-side User object which is now populated
		const userRole = user.value?.role;
		
		// Extract Role ID safely
		const roleId = typeof userRole === 'object' && userRole !== null 
			? userRole.id 
			: userRole;
		
		const roleIdStr = String(roleId || '').trim().toLowerCase();
		const campusRoleId = String(config.public.campusRoleId || '').trim().toLowerCase();

		console.log('Login Success. Role:', roleIdStr);

		// Step 3: Client-Side Redirect Logic

		if (roleIdStr && campusRoleId && roleIdStr === campusRoleId) {
			console.log('Student detected, redirecting to Dashboard...');
			// use navigateTo to preserve state (SPA navigation)
			await navigateTo('/campus/dashboard');
		} else {
			console.log('Client/Staff detected, redirecting to Portal...');
			// Portal might be a separate app or need refresh, but try SPA first.
			// If portal is in the same Nuxt app (layers), SPA is better.
			await navigateTo('/portal');
		}

	} catch (err) {
		console.error('Login error:', err);
		error.value = err.message || 'Invalid email or password';
	} finally {
		loading.value = false;
	}
}
</script>
