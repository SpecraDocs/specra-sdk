<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    children?: Snippet;
  }

  let { title, children }: Props = $props();
</script>

<div class="step-item relative pl-8 pb-8 border-l-2 border-border last:border-l-0 last:pb-0">
  <div class="mb-2">
    <h3 class="text-lg font-semibold text-foreground">{title}</h3>
  </div>
  <div class="prose prose-sm dark:prose-invert max-w-none [&>*:last-child]:mb-0">
    {#if children}
      {@render children()}
    {/if}
  </div>
</div>

<style>
  .step-item {
    counter-increment: step;
  }
  .step-item::before {
    content: counter(step);
    position: absolute;
    top: 0;
    left: -1px;
    transform: translateX(-50%);
    width: 2rem;
    height: 2rem;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 600;
    z-index: 10;
    background: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
  }
</style>
