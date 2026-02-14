<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet;
    type?: 'single' | 'multiple';
    collapsible?: boolean;
    class?: string;
  }

  let { children, type = 'multiple', collapsible, class: className }: Props = $props();
</script>

<div class={className || 'my-6 space-y-2'}>
  {#if children}
    {@render children()}
  {/if}
</div>
