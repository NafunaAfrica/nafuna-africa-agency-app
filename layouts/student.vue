<script setup lang="ts">
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue';

const { logout, user } = useDirectusAuth();
const route = useRoute();
const config = useRuntimeConfig();

// Define Navigation Items
const sidebarNavigation = {
	top: [
		{ name: 'Dashboard', href: '/campus/dashboard', icon: 'material-symbols:home-outline-rounded' },
		{ name: 'My Courses', href: '/campus/my-courses', icon: 'material-symbols:school-outline-rounded' },
		{ name: 'Browse', href: '/campus/courses', icon: 'material-symbols:travel-explore-rounded' },
		{ name: 'Assignments', href: '/campus/assignments', icon: 'material-symbols:assignment-outline-rounded' },
	],
	bottom: [
        { name: 'Help', href: '/campus/help', icon: 'material-symbols:help-outline-rounded' }
    ],
};

// User Dropdown Items
const userNavigation = [
	[
		{
			label: 'Profile',
			icon: 'i-heroicons-user-circle',
			click: () => navigateTo('/campus/profile') 
		},
		{ label: 'Sign out', icon: 'i-heroicons-arrow-left-on-rectangle', click: () => logout() },
	],
];

const mobileMenuOpen = ref(false);

const userName = computed(() => {
    if (!user.value) return 'Student';
    return `${user.value.first_name || ''} ${user.value.last_name || ''}`.trim() || 'Student';
});
</script>

<template>
	<div class="flex h-full transition duration-150 bg-gray-100 dark:bg-gray-950">
		<div class="hidden p-3 md:block">
			<!-- Narrow sidebar (Rail Style) -->
			<div class="w-24 h-full bg-gray-900 rounded-panel">
				<div class="flex flex-col items-center w-full h-full py-6">
					<div class="flex items-center flex-shrink-0">
                        <NuxtLink to="/campus/dashboard">
						    <Logo class="w-20 text-white" alt="Nafuna Campus" />
                        </NuxtLink>
					</div>
					<div class="flex flex-col justify-between flex-1 h-full gap-y-4">
						<div class="w-full px-2 mt-6 space-y-1">
                            <!-- Top Navigation -->
							<NuxtLink
								v-for="item in sidebarNavigation.top"
								:key="item.name"
								:to="item.href"
								:class="[
									route.path.startsWith(item.href) ? 'bg-gray-800 text-white' : 'text-gray-100 hover:bg-gray-800 hover:text-white',
									'group flex w-full flex-col items-center rounded-card py-3 px-2 text-xs font-bold ',
								]"
							>
								<UIcon
									:name="item.icon"
									:class="[route.path.startsWith(item.href) ? 'text-white' : 'text-gray-300 group-hover:text-white', 'h-6 w-6']"
									aria-hidden="true"
								/>
								<span class="mt-2 text-center">{{ item.name }}</span>
							</NuxtLink>
						</div>

						<div class="flex flex-col items-center justify-center w-full px-2 space-y-2">
                             <!-- Bottom Navigation -->
							<NuxtLink
								v-for="item in sidebarNavigation.bottom"
								:key="item.name"
								:to="item.href"
								:class="[
									route.path.startsWith(item.href) ? 'bg-gray-800 text-white' : 'text-gray-100 hover:bg-gray-800 hover:text-white',
									'group flex w-full flex-col items-center rounded-card py-3 px-2 text-xs font-bold ',
								]"
							>
								<UIcon
									:name="item.icon"
									:class="[route.path.startsWith(item.href)? 'text-white' : 'text-gray-300 group-hover:text-white', 'h-6 w-6']"
									aria-hidden="true"
								/>
								<span class="mt-2">{{ item.name }}</span>
							</NuxtLink>

							<DarkModeToggle bg="dark" class="" />
							
                            <!-- Profile dropdown -->
							<UDropdown class="relative" :items="userNavigation" :popper="{ placement: 'right-end' }">
								<button class="focus:outline-none">
									<span class="sr-only">Open user menu</span>
									<UAvatar class="w-12 h-12 mx-auto ring-2 ring-gray-800" :src="user?.avatar" :alt="userName" />
								</button>
							</UDropdown>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Mobile menu -->
		<TransitionRoot as="template" :show="mobileMenuOpen">
			<Dialog as="div" class="relative z-20 md:hidden" @close="mobileMenuOpen = false">
				<TransitionChild
					as="template"
					enter="transition-opacity ease-linear duration-300"
					enter-from="opacity-0"
					enter-to="opacity-100"
					leave="transition-opacity ease-linear duration-300"
					leave-from="opacity-100"
					leave-to="opacity-0"
				>
					<div class="fixed inset-0 bg-gray-600 bg-opacity-75" />
				</TransitionChild>

				<div class="fixed inset-0 z-40 flex">
					<TransitionChild
						as="template"
						enter="transition ease-in-out duration-300 transform"
						enter-from="-translate-x-full"
						enter-to="translate-x-0"
						leave="transition ease-in-out duration-300 transform"
						leave-from="translate-x-0"
						leave-to="-translate-x-full"
					>
						<DialogPanel class="relative flex flex-col flex-1 w-full max-w-xs pt-5 pb-4 bg-gray-900">
							<TransitionChild
								as="template"
								enter="ease-in-out duration-300"
								enter-from="opacity-0"
								enter-to="opacity-100"
								leave="ease-in-out duration-300"
								leave-from="opacity-100"
								leave-to="opacity-0"
							>
								<div class="absolute right-0 p-1 top-1 -mr-14">
									<button
										type="button"
										class="flex items-center justify-center w-12 h-12 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
										@click="mobileMenuOpen = false"
									>
										<UIcon name="i-heroicons-x-mark" class="w-6 h-6 text-white" aria-hidden="true" />
										<span class="sr-only">Close sidebar</span>
									</button>
								</div>
							</TransitionChild>
							<div class="flex items-center flex-shrink-0 px-4">
								<Logo class="w-auto h-8 text-white" alt="Nafuna Campus" />
							</div>
							<div class="flex-1 h-0 px-2 mt-5 overflow-y-auto">
								<nav class="flex flex-col h-full">
									<div class="space-y-1">
										<NuxtLink
											v-for="item in sidebarNavigation.top"
											:key="item.name"
											:to="item.href"
											:class="[
												route.path.startsWith(item.href) ? 'bg-gray-800 text-white' : 'text-gray-100 hover:bg-gray-800 hover:text-white',
												'group flex items-center rounded-md py-2 px-3 text-sm font-medium ',
											]"
                                            @click="mobileMenuOpen = false"
										>
											<UIcon
												:name="item.icon"
												:class="[route.path.startsWith(item.href) ? 'text-white' : 'text-gray-300 group-hover:text-white', 'mr-3 h-6 w-6']"
												aria-hidden="true"
											/>
											<span>{{ item.name }}</span>
										</NuxtLink>
                                        
                                        <!-- Mobile Bottom Nav items -->
                                        <NuxtLink
											v-for="item in sidebarNavigation.bottom"
											:key="item.name"
											:to="item.href"
											:class="[
												route.path.startsWith(item.href) ? 'bg-gray-800 text-white' : 'text-gray-100 hover:bg-gray-800 hover:text-white',
												'group flex items-center rounded-md py-2 px-3 text-sm font-medium ',
											]"
                                            @click="mobileMenuOpen = false"
										>
											<UIcon
												:name="item.icon"
												:class="[route.path.startsWith(item.href) ? 'text-white' : 'text-gray-300 group-hover:text-white', 'mr-3 h-6 w-6']"
												aria-hidden="true"
											/>
											<span>{{ item.name }}</span>
										</NuxtLink>
									</div>
								</nav>
							</div>
                            
                            <!-- Mobile User Profile -->
                            <div class="p-4 border-t border-gray-700">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0">
                                        <UAvatar :src="user?.avatar" :alt="userName" />
                                    </div>
                                    <div class="ml-3">
                                        <div class="text-base font-medium text-white">{{ userName }}</div>
                                        <div class="text-sm font-medium text-gray-400" @click="logout">Sign Out</div>
                                    </div>
                                </div>
                            </div>
						</DialogPanel>
					</TransitionChild>
					<div class="flex-shrink-0 w-14" aria-hidden="true">
						<!-- Dummy element to force sidebar to shrink to fit close icon -->
					</div>
				</div>
			</Dialog>
		</TransitionRoot>

		<!-- Content area -->
		<div class="flex flex-col flex-1 overflow-y-auto">
             <!-- Mobile Header -->
            <div class="sticky top-0 z-10 pl-1 pt-1 sm:pl-3 sm:pt-3 md:hidden bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center">
				<button
					type="button"
					class="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
					@click="mobileMenuOpen = true"
				>
					<span class="sr-only">Open sidebar</span>
					<UIcon name="i-heroicons-bars-3" class="w-6 h-6" aria-hidden="true" />
				</button>
                <span class="ml-2 font-bold text-gray-900 dark:text-white">Nafuna Campus</span>
			</div>

			<NuxtErrorBoundary>
				<template #error="{ error, clearError }">
					<VAlert type="error">{{ error }}</VAlert>
					<button class="mt-4 text-sm text-gray-500 underline" @click="clearError">Try again</button>
					<p>An error occurred: {{ error }}</p>
				</template>
				<div class="w-full max-w-5xl p-4 mx-auto">
                    <!-- MAIN CONTENT SLOT -->
					<slot />
				</div>
			</NuxtErrorBoundary>
		</div>
	</div>
</template>

<style>
html {
	@apply h-full;
}
body {
	@apply h-full antialiased;
}
#__nuxt {
	@apply h-full;
}
</style>
