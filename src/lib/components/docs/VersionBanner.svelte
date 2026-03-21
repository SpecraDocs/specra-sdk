<script lang="ts">
  import { Info, AlertTriangle, XCircle, CheckCircle2, X } from 'lucide-svelte';

  interface BannerConfig {
    text: string;
    type?: 'info' | 'warning' | 'error' | 'success';
  }

  interface Props {
    banner: BannerConfig;
  }

  let { banner }: Props = $props();

  let dismissed = $state(false);

  const styles = {
    info: {
      bg: 'bg-blue-500/10 border-blue-500/30',
      text: 'text-blue-900 dark:text-blue-300',
      icon: Info,
    },
    warning: {
      bg: 'bg-yellow-500/10 border-yellow-500/30',
      text: 'text-yellow-900 dark:text-yellow-300',
      icon: AlertTriangle,
    },
    error: {
      bg: 'bg-red-500/10 border-red-500/30',
      text: 'text-red-900 dark:text-red-300',
      icon: XCircle,
    },
    success: {
      bg: 'bg-green-500/10 border-green-500/30',
      text: 'text-green-900 dark:text-green-300',
      icon: CheckCircle2,
    },
  };

  let style = $derived(styles[banner.type || 'info']);
  let IconComponent = $derived(style.icon);
</script>

{#if !dismissed}
  <div class="border-b {style.bg} {style.text}">
    <div class="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
      <div class="flex items-center gap-2 text-sm">
        <IconComponent class="h-4 w-4 shrink-0" />
        <span>{banner.text}</span>
      </div>
      <button
        onclick={() => dismissed = true}
        class="shrink-0 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label="Dismiss banner"
      >
        <X class="h-3.5 w-3.5" />
      </button>
    </div>
  </div>
{/if}
