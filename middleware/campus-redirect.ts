// Middleware to redirect campus users away from client portal to campus dashboard
export default defineNuxtRouteMiddleware((to) => {
  const { user } = useDirectusAuth();
  const config = useRuntimeConfig();
  
  if (!user.value) return;
  
  const campusRoleId = config.public.campusRoleId;
  const userRoleId = typeof user.value.role === 'object' ? (user.value.role as any).id : user.value.role;
  
  // If campus user trying to access /portal, redirect to /campus
  if (campusRoleId && userRoleId === campusRoleId && to.path.startsWith('/portal')) {
    return navigateTo('/campus');
  }
});
