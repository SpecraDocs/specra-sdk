<script lang="ts">
  import { ChevronDown } from 'lucide-svelte';
  import { cn } from '../../../utils.js';
  import type { Snippet } from 'svelte';

  interface Props {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    summary?: string;
    children?: Snippet;
    defaultOpen?: boolean;
  }

  let { method, path, summary, children, defaultOpen = false }: Props = $props();

  let isOpen = $state(defaultOpen);

  const methodColors: Record<string, string> = {
    GET: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    POST: 'bg-green-500/10 text-green-600 dark:text-green-400',
    PUT: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    PATCH: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    DELETE: 'bg-red-500/10 text-red-600 dark:text-red-400',
  };
</script>

<div class="not-prose mb-4 rounded-xl border border-border overflow-hidden">
  <!-- Accordion Header -->
  <button
    onclick={() => (isOpen = !isOpen)}
    class="w-full flex items-center gap-3 px-4 py-3 text-left bg-muted/30 hover:bg-muted/50 transition-colors"
  >
    <span
      class={cn(
        'text-xs font-semibold px-2 py-0.5 rounded',
        methodColors[method]
      )}
    >
      {method}
    </span>
    <code class="text-sm font-mono">{path}</code>
    {#if summary}
      <span class="text-sm text-muted-foreground ml-auto mr-2">{summary}</span>
    {/if}
    <ChevronDown
      class={cn(
        'h-5 w-5 text-muted-foreground transition-transform flex-shrink-0',
        isOpen ? 'rotate-180' : ''
      )}
    />
  </button>

  <!-- Accordion Content -->
  {#if isOpen && children}
    <div class="border-t border-border bg-background">
      <div class="px-4 py-4 space-y-6">
        {@render children()}
      </div>
    </div>
  {/if}
</div>
