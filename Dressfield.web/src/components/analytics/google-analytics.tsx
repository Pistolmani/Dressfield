"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { trackGaPageView } from "@/lib/analytics";

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  const pathname = usePathname();
  const isFirstRouteEffect = useRef(true);

  useEffect(() => {
    if (!gaId) return;

    // Skip the initial mount — gtag('config') in the inline script already
    // tracks the first page view.
    if (isFirstRouteEffect.current) {
      isFirstRouteEffect.current = false;
      return;
    }

    trackGaPageView(pathname);
  }, [pathname]);

  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', { send_page_view: true });
          `,
        }}
      />
    </>
  );
}
