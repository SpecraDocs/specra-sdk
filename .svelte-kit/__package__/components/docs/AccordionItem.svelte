<script lang="ts">
  import { ChevronDown } from 'lucide-svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    defaultOpen?: boolean;
    value?: string;
    children?: Snippet;
  }

  let { title, defaultOpen = false, value, children }: Props = $props();

  let isOpen = $state(defaultOpen);

  function toggle() {
    isOpen = !isOpen;
  }
</script>

<div class="border border-border rounded-xl overflow-hidden mb-2">
  <button
    onclick={toggle}
    class="w-full flex items-center justify-between p-4 text-left bg-muted/30 hover:bg-muted/50 transition-colors"
    aria-expanded={isOpen}
  >
    <span class="font-medium text-foreground">{title}</span>
    <ChevronDown
      class="h-5 w-5 text-muted-foreground transition-transform {isOpen ? 'rotate-180' : ''}"
    />
  </button>
  {#if isOpen}
    <div class="p-4 border-t border-border bg-background">
      <div class="prose prose-sm dark:prose-invert max-w-none [&>*:last-child]:mb-0">
        {#if children}
          {@render children()}
        {/if}
      </div>
    </div>
  {/if}
</div>
