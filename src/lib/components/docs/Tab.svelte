<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { Snippet } from 'svelte';

  interface Props {
    label: string;
    children?: Snippet;
  }

  let { label, children }: Props = $props();

  const ctx = getContext<{
    registerTab: (label: string) => void;
    activeTab: Writable<string>;
    setActiveTab: (label: string) => void;
  }>('specra-tabs');

  let isActive = $state(false);

  onMount(() => {
    ctx.registerTab(label);
  });

  // Subscribe to active tab changes
  $effect(() => {
    const unsub = ctx.activeTab.subscribe((value) => {
      isActive = value === label;
    });
    return unsub;
  });
</script>

{#if isActive}
  <div class="prose prose-slate dark:prose-invert max-w-none [&>*:first-child]:mt-0">
    {#if children}
      {@render children()}
    {/if}
  </div>
{/if}
