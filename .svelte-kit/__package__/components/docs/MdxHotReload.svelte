<script lang="ts">
  import { browser } from '$app/environment';
  import { dev } from '$app/environment';
  import { invalidateAll } from '$app/navigation';

  interface Props {
    /** Polling interval in ms for checking content changes */
    pollInterval?: number;
    /** Whether to automatically refresh on content change */
    autoRefresh?: boolean;
  }

  let { pollInterval = 2000, autoRefresh = true }: Props = $props();

  let lastContentHash = $state('');
  let isWatching = $state(false);

  $effect(() => {
    if (!browser || !dev || !autoRefresh) return;

    isWatching = true;
    let intervalId: ReturnType<typeof setInterval>;

    // Use Vite HMR if available
    if (import.meta.hot) {
      // Listen for custom mdx/md file changes via Vite plugin
      import.meta.hot.on('specra:content-update', (data: { file: string; hash?: string }) => {
        console.log(`[Specra] Content updated: ${data.file}`);
        invalidateAll();
      });

      // Also listen for generic file changes that match doc patterns
      import.meta.hot.on('vite:beforeUpdate', (payload: { updates: Array<{ path: string }> }) => {
        const hasDocUpdate = payload.updates?.some(
          (update) =>
            update.path.includes('/docs/') ||
            update.path.endsWith('.md') ||
            update.path.endsWith('.svx') ||
            update.path.endsWith('.mdx')
        );
        if (hasDocUpdate) {
          console.log('[Specra] Doc file changed, refreshing...');
          invalidateAll();
        }
      });
    } else {
      // Fallback: Poll the mdx-watch API endpoint
      intervalId = setInterval(async () => {
        try {
          const res = await fetch('/api/mdx-watch');
          if (res.ok) {
            const data = await res.json();
            const newHash = data.hash || data.timestamp || '';

            if (lastContentHash && newHash !== lastContentHash) {
              console.log('[Specra] Content change detected, refreshing...');
              invalidateAll();
            }
            lastContentHash = newHash;
          }
        } catch {
          // Silently ignore polling errors
        }
      }, pollInterval);
    }

    return () => {
      isWatching = false;
      if (intervalId) clearInterval(intervalId);
    };
  });
</script>

<!-- MdxHotReload is a side-effect only component, no visible output -->
{#if dev && isWatching}
  <!-- Hidden marker for dev tools inspection -->
  <div data-specra-hot-reload="active" class="hidden"></div>
{/if}
