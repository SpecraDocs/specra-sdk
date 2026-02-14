<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    children: string;
    block?: boolean;
  }

  let { children, block = false }: Props = $props();

  let containerEl: HTMLSpanElement | HTMLDivElement;

  async function renderMath(el: HTMLElement, expr: string, displayMode: boolean) {
    try {
      const katex = (await import('katex')).default;
      katex.render(expr, el, {
        throwOnError: false,
        displayMode,
      });
    } catch (err) {
      console.error('KaTeX rendering error:', err);
      if (el) {
        el.textContent = expr;
      }
    }
  }

  onMount(() => {
    if (containerEl) {
      renderMath(containerEl, children, block);
    }
  });

  // Re-render when children or block changes
  $effect(() => {
    const expr = children;
    const isBlock = block;
    if (containerEl) {
      renderMath(containerEl, expr, isBlock);
    }
  });
</script>

{#if block}
  <div
    bind:this={containerEl}
    class="my-6 overflow-x-auto text-center"
  ></div>
{:else}
  <span
    bind:this={containerEl}
    class="inline-block"
  ></span>
{/if}
