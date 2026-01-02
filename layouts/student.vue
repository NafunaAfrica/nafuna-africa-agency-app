<script setup lang="ts">
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue';

const { logout, user } = useDirectusAuth();
const route = useRoute();

// Navigation for Students
const navigation = [
  { name: 'Dashboard', href: '/campus/dashboard', icon: 'i-heroicons-home' },
  { name: 'My Courses', href: '/campus/my-courses', icon: 'i-heroicons-academic-cap' },
  { name: 'Browse Courses', href: '/campus/courses', icon: 'i-heroicons-globe-alt' },
  { name: 'Assignments', href: '/campus/assignments', icon: 'i-heroicons-document-text' },
//   { name: 'Certificates', href: '/campus/certificates', icon: 'i-heroicons-trophy' }, // Commented out until implemented
];

const userNavigation = [
  { label: 'Sign out', icon: 'i-heroicons-arrow-left-on-rectangle', click: () => logout() },
];

const mobileMenuOpen = ref(false);

const userName = computed(() => {
    if (!user.value) return 'Student';
    return `${user.value.first_name || ''} ${user.value.last_name || ''}`.trim() || 'Student';
});
</script>

<template>
	<div class="flex h-full min-h-screen bg-gray-50 dark:bg-gray-900">
        <!-- Desktop Sidebar -->
		<div class="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
			<div class="flex flex-col flex-1 min-h-0 bg-gray-900">
				<div class="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
                    <NuxtLink to="/campus/dashboard">
					    <Logo class="w-auto h-8 text-white" alt="Nafuna Campus" />
                    </NuxtLink>
				</div>
				<div class="flex flex-col flex-1 overflow-y-auto">
					<nav class="flex-1 px-2 py-4 space-y-1">
						<NuxtLink
							v-for="item in navigation"
							:key="item.name"
							:to="item.href"
							:class="[
								route.path === item.href
									? 'bg-gray-800 text-white'
									: 'text-gray-300 hover:bg-gray-700 hover:text-white',
								'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
							]"
						>
							<UIcon
								:name="item.icon"
								:class="[
									route.path === item.href ? 'text-white' : 'text-gray-400 group-hover:text-gray-300',
									'mr-3 flex-shrink-0 h-6 w-6'
								]"
								aria-hidden="true"
							/>
							{{ item.name }}
						</NuxtLink>
					</nav>
				</div>
                <div class="flex flex-shrink-0 p-4 bg-gray-800">
                    <div class="flex items-center w-full group">
                        <div class="flex items-center">
                            <div>
                                <UAvatar :src="user?.avatar" :alt="userName" size="sm" />
                            </div>
                            <div class="ml-3">
                                <p class="text-sm font-medium text-white">{{ userName }}</p>
                                <p class="text-xs font-medium text-gray-300 group-hover:text-gray-200" @click="logout" role="button">
                                    Sign Out
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
			</div>
		</div>

		<!-- Mobile menu -->
		<TransitionRoot as="template" :show="mobileMenuOpen">
			<Dialog as="div" class="relative z-40 md:hidden" @close="mobileMenuOpen = false">
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
						<DialogPanel class="relative flex flex-col flex-1 w-full max-w-xs pt-5 pb-4 bg-gray-800">
							<TransitionChild
								as="template"
								enter="ease-in-out duration-300"
								enter-from="opacity-0"
								enter-to="opacity-100"
								leave="ease-in-out duration-300"
								leave-from="opacity-100"
								leave-to="opacity-0"
							>
								<div class="absolute top-0 right-0 -mr-12 pt-2">
									<button
										type="button"
										class="flex items-center justify-center w-10 h-10 ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
										@click="mobileMenuOpen = false"
									>
										<span class="sr-only">Close sidebar</span>
										<UIcon name="i-heroicons-x-mark" class="w-6 h-6 text-white" aria-hidden="true" />
									</button>
								</div>
							</TransitionChild>
							<div class="flex items-center flex-shrink-0 px-4">
								<Logo class="w-auto h-8 text-white" alt="Nafuna Campus" />
							</div>
							<div class="flex-1 h-0 mt-5 overflow-y-auto">
								<nav class="px-2 space-y-1">
									<NuxtLink
										v-for="item in navigation"
										:key="item.name"
										:to="item.href"
										:class="[
											route.path === item.href
												? 'bg-gray-900 text-white'
												: 'text-gray-300 hover:bg-gray-700 hover:text-white',
											'group flex items-center px-2 py-2 text-base font-medium rounded-md'
										]"
                                        @click="mobileMenuOpen = false"
									>
										<UIcon
											:name="item.icon"
											:class="[
												route.path === item.href ? 'text-white' : 'text-gray-400 group-hover:text-gray-300',
												'mr-4 flex-shrink-0 h-6 w-6'
											]"
											aria-hidden="true"
										/>
										{{ item.name }}
									</NuxtLink>
								</nav>
							</div>
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
						<!-- Force sidebar to shrink to fit close icon -->
					</div>
				</div>
			</Dialog>
		</TransitionRoot>

		<!-- Content Area -->
		<div class="flex flex-col flex-1 md:pl-64">
			<div class="sticky top-0 z-10 pl-1 pt-1 sm:pl-3 sm:pt-3 md:hidden bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
				<button
					type="button"
					class="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
					@click="mobileMenuOpen = true"
				>
					<span class="sr-only">Open sidebar</span>
					<UIcon name="i-heroicons-bars-3" class="w-6 h-6" aria-hidden="true" />
				</button>
			</div>
			<main class="flex-1">
				<div class="py-6">
					<slot />
				</div>
			</main>
		</div>
	</div>
</template>

<style scoped>
/* Ensure the layout takes full height */
:deep(body), :deep(html), :deep(#__nuxt) {
    height: 100%;
}
</style>
