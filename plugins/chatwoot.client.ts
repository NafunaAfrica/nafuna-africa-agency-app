export default defineNuxtPlugin(() => {
  // Only run on client side
  if (process.client) {
    console.log('Chatwoot plugin loading...');
    
    // Wait for DOM to be ready
    const loadChatwoot = () => {
      // Set Chatwoot configuration
      window.chatwootSettings = {
        position: "right",
        type: "expanded_bubble",
        launcherTitle: "Chat with us"
      };

      console.log('Chatwoot settings configured:', window.chatwootSettings);

      // Load Chatwoot SDK
      const BASE_URL = "https://support.nafuna.africa";
      const script = document.createElement("script");
      
      script.src = BASE_URL + "/packs/js/sdk.js";
      script.async = true;
      
      script.onload = function() {
        console.log('Chatwoot SDK loaded, initializing...');
        if (window.chatwootSDK) {
          window.chatwootSDK.run({
            websiteToken: 'fdChXQzsdetjXai8PHkjyays',
            baseUrl: BASE_URL
          });
          console.log('Chatwoot initialized successfully');
        }
      };
      
      script.onerror = function() {
        console.error('Failed to load Chatwoot SDK');
      };
      
      document.head.appendChild(script);
    };

    // Load when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadChatwoot);
    } else {
      loadChatwoot();
    }
  }
});
