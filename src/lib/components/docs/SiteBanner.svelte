<script lang="ts">
  import { Info, AlertTriangle, CheckCircle, XCircle, X } from 'lucide-svelte';
  import { browser } from '$app/environment';
  import type { SpecraConfig } from '$lib/config.types.js';

  interface Props {
    config: SpecraConfig;
  }

  let { config }: Props = $props();

  const banner = $derived(config.banner);
  const isEnabled = $derived(banner?.enabled && banner?.message);
  const bannerType = $derived(banner?.type || 'info');
  const isDismissible = $derived(banner?.dismissible !== false);

  let isDismissed = $state(false);

  // Check localStorage for dismissal state
  $effect(() => {
    if (!browser || !banner?.message) return;
    const storageKey = `specra-banner-dismissed-${btoa(banner.message).slice(0, 16)}`;
    const dismissed = localStorage.getItem(storageKey);
    if (dismissed === 'true') {
      isDismissed = true;
    }
  });

  function dismiss() {
    isDismissed = true;
    if (browser && banner?.message) {
      const storageKey = `specra-banner-dismissed-${btoa(banner.message).slice(0, 16)}`;
      localStorage.setItem(storageKey, 'true');
    }
  }

  const typeStyles: Record<string, string> = {
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-300',
    success: 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300',
    error: 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300'
  };

  const iconColor: Record<string, string> = {
    info: 'text-blue-500',
    warning: 'text-yellow-500',
    success: 'text-green-500',
    error: 'text-red-500'
  };
</script>

{#if isEnabled && !isDismissed}
  <div
    class="relative flex items-center justify-center gap-2 px-4 py-2.5 text-sm border-b {typeStyles[bannerType] || typeStyles.info}"
    role="banner"
  >
    <span class="shrink-0 {iconColor[bannerType] || iconColor.info}">
      {#if bannerType === 'info'}
        <Info class="h-4 w-4" />
      {:else if bannerType === 'warning'}
        <AlertTriangle class="h-4 w-4" />
      {:else if bannerType === 'success'}
        <CheckCircle class="h-4 w-4" />
      {:else if bannerType === 'error'}
        <XCircle class="h-4 w-4" />
      {/if}
    </span>

    <span class="text-center font-medium">{banner?.message}</span>

    {#if isDismissible}
      <button
        onclick={dismiss}
        class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label="Dismiss banner"
      >
        <X class="h-3.5 w-3.5" />
      </button>
    {/if}
  </div>
{/if}
