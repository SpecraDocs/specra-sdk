<script lang="ts">
  import { sidebarStore } from '../../stores/sidebar.js';
  import TabGroups from './TabGroups.svelte';
  import SidebarMenuItems from './SidebarMenuItems.svelte';
  import Logo from './Logo.svelte';
  import type { SpecraConfig } from '../../config.types.js';

  interface DocItem {
    title: string;
    slug: string;
    filePath: string;
    section?: string;
    group?: string;
    sidebar?: string;
    sidebar_position?: number;
    categoryLabel?: string;
    categoryPosition?: number;
    categoryCollapsible?: boolean;
    categoryCollapsed?: boolean;
    categoryIcon?: string;
    categoryTabGroup?: string;
    meta?: {
      icon?: string;
      tab_group?: string;
      [key: string]: any;
    };
  }

  interface Props {
    docs: DocItem[];
    version: string;
    config: SpecraConfig;
    activeTabGroup?: string;
    onTabChange?: (tabId: string) => void;
  }

  let { docs, version, config, activeTabGroup, onTabChange }: Props = $props();

  let isOpen = $derived($sidebarStore);

  function handleTabChange(tabId: string) {
    onTabChange?.(tabId);
  }

  function handleClose() {
    sidebarStore.close();
  }
</script>

<!-- Mobile Sidebar Overlay -->
{#if isOpen}
  <div
    class="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
    onclick={handleClose}
    onkeydown={(e) => { if (e.key === 'Escape') handleClose(); }}
    role="button"
    tabindex="-1"
    aria-label="Close sidebar"
  ></div>
{/if}

<!-- Mobile Sidebar -->
<div
  class="lg:hidden fixed top-0 left-0 h-full w-72 bg-background border-r border-border z-50 transform transition-transform duration-300 ease-in-out {isOpen ? 'translate-x-0' : '-translate-x-full'}"
>
  <div class="flex flex-col h-full">
    <!-- Logo and Site Title Header -->
    <div class="shrink-0 px-4 py-4 border-b border-border">
      <a href="/" class="flex items-center gap-2 group justify-center">
        {#if !config.site?.hideLogo}
          <Logo
            logo={config.site?.logo}
            alt={config.site?.title || 'Logo'}
            className="w-18 object-contain"
          />
        {/if}
        <div class="flex flex-col">
          <span class="font-semibold text-foreground group-hover:text-primary transition-colors">
            {config.site?.title || 'Documentation'}
          </span>
          {#if config.site?.description}
            <span class="text-xs text-muted-foreground line-clamp-1">
              {config.site.description}
            </span>
          {/if}
        </div>
      </a>
    </div>

    <!-- Documentation Label -->
    <div class="shrink-0 px-4 pt-4 pb-2">
      <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
        Documentation
      </h2>
    </div>

    <!-- Tab Groups Dropdown - Mobile Only -->
    {#if config.navigation?.tabGroups && config.navigation.tabGroups.length > 0}
      <div class="shrink-0 px-4 py-3 border-b border-border">
        <TabGroups
          tabGroups={config.navigation.tabGroups}
          activeTabId={activeTabGroup || ''}
          onTabChange={handleTabChange}
          mobileOnly={true}
          {docs}
          {version}
        />
      </div>
    {/if}

    <!-- Sidebar Menu Items -->
    <div class="flex-1 overflow-y-auto px-4 py-4">
      <SidebarMenuItems
        {docs}
        {version}
        {config}
        onLinkClick={handleClose}
        {activeTabGroup}
      />
    </div>
  </div>
</div>
