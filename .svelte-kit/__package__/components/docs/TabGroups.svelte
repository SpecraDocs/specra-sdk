<script lang="ts">
  import { ChevronDown } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import type { TabGroup, SpecraConfig } from '../../config.types.js';
  import Icon from './Icon.svelte';

  interface DocItem {
    slug: string;
    version?: string;
    meta?: {
      tab_group?: string;
      title?: string;
      [key: string]: unknown;
    };
    tabGroup?: string;
    categoryTabGroup?: string;
    [key: string]: unknown;
  }

  interface Props {
    tabGroups: TabGroup[];
    activeTabId?: string;
    onTabChange?: (tabId: string) => void;
    mobileOnly?: boolean;
    docs?: DocItem[];
    version?: string;
  }

  let { tabGroups, activeTabId, onTabChange, mobileOnly = false, docs, version }: Props = $props();

  let dropdownOpen = $state(false);

  // Filter out tabs that have no associated docs
  let filteredTabGroups = $derived.by(() => {
    if (!docs) return tabGroups;
    return tabGroups.filter((tab) => {
      const hasDocsInTab = docs.some((doc) => {
        const docTabGroup = doc.meta?.tab_group || doc.categoryTabGroup;
        return docTabGroup === tab.id || (!docTabGroup && tab.id === tabGroups[0]?.id);
      });
      return hasDocsInTab;
    });
  });

  let activeTab = $derived(activeTabId || filteredTabGroups[0]?.id || '');
  let activeTabData = $derived(filteredTabGroups.find((tab) => tab.id === activeTab));

  function handleTabChange(tabId: string) {
    onTabChange?.(tabId);
    dropdownOpen = false;

    // Navigate to the first item in the new tab group if docs are provided
    if (docs && version) {
      const firstDocInTab = docs.find((doc) => {
        const docTabGroup = doc.meta?.tab_group || doc.categoryTabGroup;
        return docTabGroup === tabId || (!docTabGroup && tabId === filteredTabGroups[0]?.id);
      });

      if (firstDocInTab) {
        goto(`/docs/${version}/${firstDocInTab.slug}`);
      }
    }
  }
</script>

{#if filteredTabGroups.length > 0}
  {#if mobileOnly}
    <!-- Mobile only version (for sidebar) -->
    <div class="relative">
      <button
        onclick={() => (dropdownOpen = !dropdownOpen)}
        class="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-foreground bg-muted/50 rounded-lg hover:bg-muted transition-colors"
        aria-label="Select tab group"
        aria-expanded={dropdownOpen}
      >
        <div class="flex items-center gap-2">
          {#if activeTabData?.icon}
            <Icon icon={activeTabData.icon} size={16} class="shrink-0" />
          {/if}
          <span>{activeTabData?.label}</span>
        </div>
        <ChevronDown
          class="h-4 w-4 transition-transform {dropdownOpen ? 'rotate-180' : ''}"
        />
      </button>

      {#if dropdownOpen}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="fixed inset-0 z-40"
          onclick={() => (dropdownOpen = false)}
          onkeydown={(e) => { if (e.key === 'Escape') dropdownOpen = false; }}
        ></div>
        <div class="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-[60vh] overflow-y-auto">
          {#each filteredTabGroups as tab}
            {@const isActive = tab.id === activeTab}
            <button
              onclick={() => handleTabChange(tab.id)}
              class="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-left transition-colors first:rounded-t-lg last:rounded-b-lg {isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'}"
            >
              {#if tab.icon}
                <Icon icon={tab.icon} size={16} class="shrink-0" />
              {/if}
              {tab.label}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {:else}
    <!-- Full version with sticky header -->
    <div class="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container mx-auto px-2 md:px-6">
        <!-- Mobile Dropdown -->
        <div class="md:hidden relative">
          <button
            onclick={() => (dropdownOpen = !dropdownOpen)}
            class="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-foreground"
            aria-label="Select tab"
            aria-expanded={dropdownOpen}
          >
            <div class="flex items-center gap-2">
              {#if activeTabData?.icon}
                <Icon icon={activeTabData.icon} size={16} class="shrink-0" />
              {/if}
              {activeTabData?.label}
            </div>
            <ChevronDown
              class="h-4 w-4 transition-transform {dropdownOpen ? 'rotate-180' : ''}"
            />
          </button>

          {#if dropdownOpen}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              class="fixed inset-0 z-40"
              onclick={() => (dropdownOpen = false)}
              onkeydown={(e) => { if (e.key === 'Escape') dropdownOpen = false; }}
            ></div>
            <div class="absolute top-full left-0 right-0 bg-background border border-border shadow-lg z-50 max-h-[60vh] overflow-y-auto">
              {#each filteredTabGroups as tab}
                {@const isActive = tab.id === activeTab}
                <button
                  onclick={() => handleTabChange(tab.id)}
                  class="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-left transition-colors {isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'}"
                >
                  {#if tab.icon}
                    <Icon icon={tab.icon} size={16} class="shrink-0" />
                  {/if}
                  {tab.label}
                </button>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Desktop Tabs -->
        <nav class="hidden md:flex gap-1" aria-label="Documentation tabs">
          {#each filteredTabGroups as tab}
            {@const isActive = tab.id === activeTab}
            <button
              onclick={() => handleTabChange(tab.id)}
              class="flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 {isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}"
              aria-current={isActive ? 'page' : undefined}
            >
              {#if tab.icon}
                <Icon icon={tab.icon} size={16} class="shrink-0" />
              {/if}
              {tab.label}
            </button>
          {/each}
        </nav>
      </div>
    </div>
  {/if}
{/if}
