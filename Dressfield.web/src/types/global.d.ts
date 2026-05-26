export {};

declare global {
  interface Window {
    fbq?: (method: string, eventName: string, params?: Record<string, unknown>) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

