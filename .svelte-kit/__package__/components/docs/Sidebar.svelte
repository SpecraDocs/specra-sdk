<script lang="ts">
  import type { SpecraConfig } from '../../config.types.js';
  import SidebarMenuItems from './SidebarMenuItems.svelte';

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
    onLinkClick?: () => void;
    config: SpecraConfig;
    activeTabGroup?: string;
  }

  let { docs, version, onLinkClick, config, activeTabGroup }: Props = $props();

  let hasTabGroups = $derived(
    config.navigation?.tabGroups && config.navigation.tabGroups.length > 0
  );
  let stickyTop = $derived(hasTabGroups ? 'top-[7.5rem]' : 'top-24');
  let maxHeight = $derived(
    hasTabGroups ? 'max-h-[calc(100vh-10rem)]' : 'max-h-[calc(100vh-7rem)]'
  );
</script>

{#if config.navigation?.showSidebar}
  <aside class="w-64 shrink-0 sticky {stickyTop} self-start">
    <div class="{maxHeight} overflow-y-auto bg-muted/30 dark:bg-muted/10 rounded-2xl p-4 border border-border/50">
      <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Documentation</h2>
      <SidebarMenuItems
        {docs}
        {version}
        {onLinkClick}
        {config}
        {activeTabGroup}
      />
    </div>
  </aside>
{/if}
