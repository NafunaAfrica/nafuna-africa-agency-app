<script setup lang="ts">
// Add Chatwoot script to head
useHead({
  script: [
    {
      innerHTML: `
        window.chatwootSettings = {"position":"right","type":"expanded_bubble","launcherTitle":"Chat with us"};
        (function(d,t) {
          var BASE_URL="https://support.nafuna.africa";
          var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
          g.src=BASE_URL+"/packs/js/sdk.js";
          g.async = true;
          s.parentNode.insertBefore(g,s);
          g.onload=function(){
            window.chatwootSDK.run({
              websiteToken: 'fdChXQzsdetjXai8PHkjyays',
              baseUrl: BASE_URL
            })
          }
        })(document,"script");
      `,
      type: 'text/javascript'
    }
  ]
})
</script>
<template>
	<div
		class="relative flex flex-col min-h-screen overflow-hidden antialiased transition duration-150 bg-white visual-effects bg-gradient-to-br from-white to-gray-100 dark:from-gray-950 dark:to-gray-700"
	>
		<div class="relative w-full max-w-6xl px-6 pt-6 mx-auto lg:px-16">
			<NavigationTheHeader />
		</div>

		<div class="relative text-gray-900">
			<slot />
		</div>

		<div class="relative w-full max-w-6xl px-2 pt-6 pb-12 mx-auto lg:px-16">
			<NavigationTheFooter />
		</div>

		<div class="fixed z-10 bottom-4 left-4">
			<!-- <ScrollTop /> -->
		</div>
	</div>
</template>
