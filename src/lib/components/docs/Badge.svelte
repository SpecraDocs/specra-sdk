<script lang="ts">
  import type { Snippet } from 'svelte';

  type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

  interface Props {
    variant?: BadgeVariant;
    children?: Snippet;
  }

  let { variant = 'default', children }: Props = $props();

  const variants: Record<BadgeVariant, string> = {
    default: 'bg-muted text-foreground border-border',
    success: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  };

  let classes = $derived(variants[variant] || variants.default);
</script>

<span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border {classes}">
  {#if children}
    {@render children()}
  {/if}
</span>
