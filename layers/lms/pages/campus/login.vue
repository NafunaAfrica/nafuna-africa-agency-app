<script setup lang="ts">
definePageMeta({
	layout: 'blank',
	auth: false, // Disable global auth middleware for this page
});

const { login, user } = useDirectusAuth();
// Re-use the existing login form logic but simpler
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function handleLogin() {
	loading.value = true;
	error.value = '';

	try {
        // 1. Standard Directus Login
		await login(email.value, password.value);
        
        // 2. Manual Cookie Setting (Client-Side Backup)
        // This ensures the middleware sees the role immediately
        if (user.value?.role) {
            const roleId = typeof user.value.role === 'object' 
                ? (user.value.role as any).id 
                : user.value.role;
            
            const roleCookie = useCookie('user_role_id', {
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: '/'
            });
            roleCookie.value = roleId;
            
            console.log('🍪 Cookie set manually:', roleId);

            // Backup: Set to LocalStorage for the Reliability Patch
            if (process.client) {
                localStorage.setItem('user_role_id', String(roleId).trim());
            }
        }

        // 3. Force Redirect to Campus (HARD RELOAD to ensure cookie is seen by middleware)
		window.location.href = '/campus';
	} catch (e: any) {
		error.value = e.message || 'Login failed. Please check your credentials.';
	} finally {
		loading.value = false;
	}
}
</script>

<template>
	<div class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
		<div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
			<!-- Header -->
			<div class="text-center">
				<Logo class="w-auto h-12 mx-auto" />
				<h2 class="mt-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
					Campus Login
				</h2>
				<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
					Sign in to access your courses
				</p>
			</div>

			<!-- Error Alert -->
			<UAlert
				v-if="error"
				color="red"
				variant="soft"
				icon="i-heroicons-exclamation-triangle"
				:title="error"
			/>

			<!-- Form -->
			<form class="space-y-6" @submit.prevent="handleLogin">
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-200">
						Email address
					</label>
					<div class="mt-1">
						<UInput
							id="email"
							v-model="email"
							name="email"
							type="email"
							autocomplete="email"
							required
							size="lg"
							class="w-full"
							placeholder="student@nafuna.africa"
						/>
					</div>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-200">
						Password
					</label>
					<div class="mt-1">
						<UInput
							id="password"
							v-model="password"
							name="password"
							type="password"
							autocomplete="current-password"
							required
							size="lg"
							class="w-full"
						/>
					</div>
				</div>

				<UButton
					type="submit"
					block
					size="lg"
					:loading="loading"
					color="primary"
				>
					Sign In to Campus
				</UButton>
			</form>
            
            <div class="text-center">
                <NuxtLink to="/auth/signin" class="text-sm text-gray-500 hover:text-primary-500">
                    Not a student? Go to Portal Login
                </NuxtLink>
            </div>
		</div>
	</div>
</template>
