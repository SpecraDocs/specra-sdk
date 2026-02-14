<script lang="ts">
  import { RefreshCw } from 'lucide-svelte';
  import { browser } from '$app/environment';
  import { dev } from '$app/environment';

  let isReloading = $state(false);
  let showIndicator = $state(false);

  $effect(() => {
    if (!browser || !dev) return;

    // Listen for Vite HMR events
    if (import.meta.hot) {
      import.meta.hot.on('vite:beforeUpdate', () => {
        isReloading = true;
        showIndicator = true;
      });

      import.meta.hot.on('vite:afterUpdate', () => {
        isReloading = false;
        // Keep indicator visible briefly after update
        setTimeout(() => {
          showIndicator = false;
        }, 1500);
      });

      import.meta.hot.on('vite:error', () => {
        isReloading = false;
        showIndicator = false;
      });
    }
  });
</script>

{#if dev && showIndicator}
  <div
    class="fixed top-4 right-4 z-50 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm text-xs font-medium transition-all duration-300 {isReloading
      ? 'bg-blue-500/90 text-white'
      : 'bg-green-500/90 text-white'}"
  >
    <RefreshCw class="h-3 w-3 {isReloading ? 'animate-spin' : ''}" />
    <span>{isReloading ? 'Reloading...' : 'Updated'}</span>
  </div>
{/if}
