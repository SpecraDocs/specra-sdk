<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface Props {
    chart: string;
    caption?: string;
  }

  let { chart, caption }: Props = $props();

  let containerEl: HTMLDivElement;
  let error = $state<string | null>(null);

  async function renderChart() {
    if (!containerEl) return;

    try {
      const mermaid = (await import('mermaid')).default;

      mermaid.initialize({
        startOnLoad: false,
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'inherit',
      });

      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      const { svg } = await mermaid.render(id, chart);
      containerEl.innerHTML = svg;
      error = null;
    } catch (err) {
      console.error('Mermaid rendering error:', err);
      error = err instanceof Error ? err.message : 'Failed to render diagram';
    }
  }

  let observer: MutationObserver | null = null;

  onMount(() => {
    renderChart();

    // Re-render on theme change
    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          renderChart();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
  });

  onDestroy(() => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  });

  // Re-render when chart prop changes
  $effect(() => {
    const _chart = chart;
    if (containerEl) {
      renderChart();
    }
  });
</script>

{#if error}
  <div class="my-6 p-4 rounded-xl border border-red-500/50 bg-red-500/10">
    <p class="text-sm text-red-600 dark:text-red-400 font-mono">
      Mermaid Error: {error}
    </p>
  </div>
{:else}
  <figure class="my-6">
    <div
      bind:this={containerEl}
      class="flex justify-center items-center p-6 rounded-xl border border-border bg-muted/30 overflow-x-auto"
    ></div>
    {#if caption}
      <figcaption class="mt-2 text-center text-sm text-muted-foreground italic">
        {caption}
      </figcaption>
    {/if}
  </figure>
{/if}
