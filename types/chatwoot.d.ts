declare global {
  interface Window {
    chatwootSettings: {
      position: string;
      type: string;
      launcherTitle: string;
    };
    chatwootSDK: {
      run: (config: {
        websiteToken: string;
        baseUrl: string;
      }) => void;
    };
  }
}

export {};
