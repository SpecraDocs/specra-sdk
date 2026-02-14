<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    span?: 1 | 2 | 3 | 4;
    children?: Snippet;
  }

  let { span = 1, children }: Props = $props();

  const spanClasses: Record<number, string> = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
  };

  let spanClass = $derived(spanClasses[span] || spanClasses[1]);
</script>

<div class={spanClass}>
  {#if children}
    {@render children()}
  {/if}
</div>
