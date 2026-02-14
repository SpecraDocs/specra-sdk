<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    cols?: 1 | 2 | 3 | 4;
    children?: Snippet;
  }

  let { cols = 3, children }: Props = $props();

  const gridCols: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  let gridClass = $derived(gridCols[cols] || gridCols[3]);
</script>

<div class="grid {gridClass} gap-4 my-6">
  {#if children}
    {@render children()}
  {/if}
</div>
