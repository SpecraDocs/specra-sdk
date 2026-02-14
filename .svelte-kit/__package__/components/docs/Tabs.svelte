<script lang="ts">
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet;
    defaultValue?: string;
  }

  let { children, defaultValue }: Props = $props();

  // Registration system: Tab children register themselves
  let tabs = $state<Array<{ label: string }>>([]);
  let activeTab = $state(defaultValue || '');

  function registerTab(label: string) {
    // Avoid duplicate registrations
    if (!tabs.find((t) => t.label === label)) {
      tabs = [...tabs, { label }];
    }
    // If no active tab yet, set first
    if (!activeTab) {
      activeTab = label;
    }
  }

  function setActiveTab(label: string) {
    activeTab = label;
  }

  // Store for reactive access from children
  const activeTabStore = writable(activeTab || '');
  $effect(() => {
    activeTabStore.set(activeTab);
  });

  setContext('specra-tabs', {
    registerTab,
    activeTab: activeTabStore,
    setActiveTab,
  });
</script>

<div class="my-6">
  <!-- Tab buttons -->
  <div class="flex items-center gap-1 border-b border-border mb-4">
    {#each tabs as tab}
      {@const isActive = activeTab === tab.label}
      <button
        onclick={() => setActiveTab(tab.label)}
        class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
          {isActive
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
          }"
      >
        {tab.label}
      </button>
    {/each}
  </div>

  <!-- Tab content -->
  <div>
    {#if children}
      {@render children()}
    {/if}
  </div>
</div>
