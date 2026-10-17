import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Workers Free = 10ms CPU/request. Prerendered pages are served from the ASSETS
// binding (no R2/KV, no per-request React render) instead of the default
// dummy cache that re-renders them. Fully static only: no ISR revalidation.
export default defineCloudflareConfig({ incrementalCache: staticAssetsIncrementalCache });
