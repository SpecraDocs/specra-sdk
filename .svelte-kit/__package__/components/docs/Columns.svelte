<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    cols?: {
      sm?: 1 | 2 | 3 | 4;
      md?: 1 | 2 | 3 | 4;
      lg?: 1 | 2 | 3 | 4;
      xl?: 1 | 2 | 3 | 4;
    };
    children?: Snippet;
  }

  let { cols = { sm: 1, md: 2, lg: 3 }, children }: Props = $props();

  const colClasses: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  // Build responsive class string matching React original
  // sm is the base, md/lg/xl get responsive prefixes
  let gridClasses = $derived(() => {
    const smClass = cols.sm ? colClasses[cols.sm] : 'grid-cols-1';
    const mdClass = cols.md ? `md:${colClasses[cols.md]}` : '';
    const lgClass = cols.lg ? `lg:${colClasses[cols.lg]}` : '';
    const xlClass = cols.xl ? `xl:${colClasses[cols.xl]}` : '';
    return `${smClass} ${mdClass} ${lgClass} ${xlClass}`.trim();
  });
</script>

<div class="grid {gridClasses()} gap-4 my-6">
  {#if children}
    {@render children()}
  {/if}
</div>
