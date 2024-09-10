interface Window {
    electronAPI: {
      makeApiRequest: (url: string, options: RequestInit) => Promise<any>;
    }
  }