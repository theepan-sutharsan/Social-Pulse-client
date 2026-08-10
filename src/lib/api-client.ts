import axios from "axios";

const LOCAL_API_URL = "http://127.0.0.1:5000";

/**
 * Resolve the API origin once at build time, while keeping browser deployments
 * safe when a Railway URL was entered with a trailing slash or http scheme.
 * An HTTPS Vercel page cannot call an HTTP API (the browser blocks it as mixed
 * content and Axios reports only "Network Error"), so upgrade that scheme.
 */
function resolveApiUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const browserOrigin = typeof window !== "undefined" ? window.location.origin : undefined;
  const fallbackUrl = browserOrigin || LOCAL_API_URL;

  let resolvedUrl = configuredUrl || fallbackUrl;
  try {
    const parsed = new URL(resolvedUrl, fallbackUrl);
    const isHttpsBrowser = typeof window !== "undefined" && window.location.protocol === "https:";
    const isLocalDevelopmentHost = ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
    if ((isHttpsBrowser || (process.env.NODE_ENV === "production" && !isLocalDevelopmentHost)) && parsed.protocol === "http:") {
      parsed.protocol = "https:";
    }
    // Service functions already include /api in each route. Accept a Railway
    // URL copied with a trailing /api segment without producing /api/api/*.
    if (parsed.pathname.replace(/\/+$/, "") === "/api") {
      parsed.pathname = "";
    }
    resolvedUrl = parsed.toString().replace(/\/+$/, "");
  } catch {
    // Keep the original value so the response interceptor can provide a useful
    // deployment hint instead of crashing the application during boot.
    resolvedUrl = resolvedUrl.replace(/\/+$/, "");
  }

  return resolvedUrl;
}

export const API_URL = resolveApiUrl();

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15 * 60 * 1000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("sp_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Browser CORS, mixed-content, DNS, and unreachable Railway failures all
    // arrive from Axios without a response. Add context so the UI no longer
    // exposes the unhelpful generic "Network Error" message.
    if (!error.response && error.request) {
      const isProduction = process.env.NODE_ENV === "production";
      error.message = isProduction
        ? `Unable to reach the API at ${API_URL}. Verify NEXT_PUBLIC_API_URL in Vercel and allow this Vercel origin in Railway CORS settings.`
        : `Unable to reach the API at ${API_URL}. Make sure the backend is running.`;
    }
    return Promise.reject(error);
  },
);
