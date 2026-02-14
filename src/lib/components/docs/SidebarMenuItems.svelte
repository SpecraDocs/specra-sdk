<script lang="ts">
  import { page } from '$app/stores';
  import { ChevronRight, ChevronDown, FolderOpen } from 'lucide-svelte';
  import type { SpecraConfig } from '$lib/config.types.js';
  import Icon from './Icon.svelte';
  import { sortSidebarItems, sortSidebarGroups } from '$lib/sidebar-utils.js';

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
      sidebar_position?: number;
      order?: number;
      [key: string]: any;
    };
  }

  interface SidebarGroup {
    label: string;
    path: string;
    icon?: string;
    items: DocItem[];
    position: number;
    collapsible: boolean;
    defaultCollapsed: boolean;
    children: Record<string, SidebarGroup>;
  }

  interface Props {
    docs: DocItem[];
    version: string;
    onLinkClick?: () => void;
    config: SpecraConfig;
    activeTabGroup?: string;
  }

  let { docs, version, onLinkClick, config, activeTabGroup }: Props = $props();

  let collapsed: Record<string, boolean> = $state({});
  let pathname = $derived($page.url.pathname);

  // Filter docs by active tab group if tab groups are configured
  let hasTabGroups = $derived(
    config.navigation?.tabGroups && config.navigation.tabGroups.length > 0
  );

  let filteredDocs = $derived.by(() => {
    if (hasTabGroups && activeTabGroup) {
      return docs.filter((doc) => {
        const docTabGroup = doc.meta?.tab_group || doc.categoryTabGroup;
        if (!docTabGroup) {
          return activeTabGroup === config.navigation?.tabGroups?.[0]?.id;
        }
        return docTabGroup === activeTabGroup;
      });
    }
    return docs;
  });

  // Build hierarchical tree structure
  interface SidebarStructure {
    rootGroups: Record<string, SidebarGroup>;
    standalone: DocItem[];
  }

  let structure = $derived.by((): SidebarStructure => {
    const rootGroups: Record<string, SidebarGroup> = {};
    const standalone: DocItem[] = [];

    filteredDocs.forEach((doc) => {
      const pathParts = doc.filePath.split('/');
      const isIndexFile =
        doc.filePath.endsWith('/index') ||
        doc.filePath === 'index' ||
        (pathParts.length > 1 && doc.slug === pathParts.slice(0, -1).join('/'));

      const customGroup = doc.sidebar || doc.group;

      if (customGroup) {
        const groupName = customGroup.charAt(0).toUpperCase() + customGroup.slice(1);
        if (!rootGroups[groupName]) {
          rootGroups[groupName] = {
            label: groupName,
            path: customGroup,
            items: [],
            position: 999,
            collapsible: doc.categoryCollapsible ?? true,
            defaultCollapsed: doc.categoryCollapsed ?? false,
            children: {}
          };
        }
        if (isIndexFile) {
          rootGroups[groupName].position = doc.sidebar_position ?? 999;
          rootGroups[groupName].icon = doc.categoryIcon;
        } else {
          rootGroups[groupName].items.push(doc);
        }
        return;
      }

      if (pathParts.length > 1) {
        const folderParts = pathParts.slice(0, -1);
        let currentLevel = rootGroups;
        let currentPath = '';

        for (let i = 0; i < folderParts.length; i++) {
          const folder = folderParts[i];
          currentPath = currentPath ? `${currentPath}/${folder}` : folder;
          const folderLabel = folder
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');

          if (!currentLevel[folder]) {
            currentLevel[folder] = {
              label:
                doc.categoryLabel && i === folderParts.length - 1
                  ? doc.categoryLabel
                  : folderLabel,
              path: currentPath,
              icon: doc.categoryIcon,
              items: [],
              position: doc.categoryPosition ?? 999,
              collapsible: doc.categoryCollapsible ?? true,
              defaultCollapsed: doc.categoryCollapsed ?? false,
              children: {}
            };
          }

          if (i === folderParts.length - 1) {
            if (isIndexFile) {
              currentLevel[folder].position =
                doc.categoryPosition ?? doc.sidebar_position ?? 999;
              if (doc.categoryLabel) {
                currentLevel[folder].label = doc.categoryLabel;
              }
              if (doc.categoryIcon) {
                currentLevel[folder].icon = doc.categoryIcon;
              }
            } else {
              currentLevel[folder].items.push(doc);
            }
          }

          currentLevel = currentLevel[folder].children;
        }
      } else {
        if (!isIndexFile) {
          standalone.push(doc);
        }
      }
    });

    return { rootGroups, standalone };
  });

  let sortedRootGroups = $derived(sortSidebarGroups(structure.rootGroups));
  let sortedStandalone = $derived(sortSidebarItems(structure.standalone));

  function toggleSection(section: string) {
    collapsed = { ...collapsed, [section]: !collapsed[section] };
  }

  function isActiveInGroup(group: SidebarGroup): boolean {
    const hasActiveItem = group.items.some(
      (doc) => pathname === `/docs/${version}/${doc.slug}`
    );
    if (hasActiveItem) return true;
    return Object.values(group.children).some((child) => isActiveInGroup(child));
  }

  function getGroupHref(group: SidebarGroup): string {
    let groupHref = `/docs/${version}/${group.path}`;

    if (config.features?.i18n) {
      const i18n = config.features.i18n;
      const locales = typeof i18n === 'object' ? i18n.locales : ['en'];
      const pathParts = pathname?.split('/') || [];
      const potentialLocale = pathParts[3];

      if (potentialLocale && locales.includes(potentialLocale)) {
        groupHref = `/docs/${version}/${potentialLocale}/${group.path}`;
      }
    }

    return groupHref;
  }

  function isGroupCollapsed(groupKey: string, group: SidebarGroup): boolean {
    const hasActive = isActiveInGroup(group);
    const isGroupActive = pathname === `/docs/${version}/${group.path}`;
    if (hasActive || isGroupActive) return false;
    return collapsed[groupKey] ?? group.defaultCollapsed;
  }

  type MergedItem =
    | { type: 'group'; key: string; group: SidebarGroup; position: number }
    | { type: 'item'; doc: DocItem; position: number };

  function getMergedItems(group: SidebarGroup): MergedItem[] {
    const sortedItems = sortSidebarItems(group.items);
    const sortedChildren = sortSidebarGroups(group.children);

    const merged: MergedItem[] = [
      ...sortedChildren.map(([childKey, childGroup]) => ({
        type: 'group' as const,
        key: childKey,
        group: childGroup,
        position: childGroup.position
      })),
      ...sortedItems.map((doc) => ({
        type: 'item' as const,
        doc,
        position: doc.sidebar_position ?? doc.meta?.sidebar_position ?? doc.meta?.order ?? 999
      }))
    ];

    merged.sort((a, b) => a.position - b.position);
    return merged;
  }
</script>

<!-- Recursive group renderer component -->
{#snippet renderGroup(groupKey: string, group: SidebarGroup, depth: number)}
  {@const sortedItems = sortSidebarItems(group.items)}
  {@const sortedChildren = sortSidebarGroups(group.children)}
  {@const hasChildren = sortedChildren.length > 0}
  {@const hasItems = sortedItems.length > 0}
  {@const hasContent = hasChildren || hasItems}
  {@const isGroupActive = pathname === `/docs/${version}/${group.path}`}
  {@const isCollapsed = isGroupCollapsed(groupKey, group)}
  {@const marginLeft = depth > 0 ? 'ml-4' : ''}
  {@const groupHref = getGroupHref(group)}
  {@const mergedItems = getMergedItems(group)}

  <div class="space-y-1 {marginLeft}">
    <div class="flex items-center group">
      <a
        href={groupHref}
        onclick={(e) => {
          e.preventDefault();
          toggleSection(groupKey);
        }}
        class="flex items-center gap-2 flex-1 px-3 py-2 text-sm font-semibold rounded-l-xl transition-all {isGroupActive
          ? 'bg-primary/10 text-primary'
          : 'text-foreground hover:bg-accent/50'}"
      >
        {#if group.icon}
          <Icon icon={group.icon} size={16} className="shrink-0" />
        {:else}
          <FolderOpen size={16} class="shrink-0" />
        {/if}
        {group.label}
      </a>

      {#if hasContent && group.collapsible && config.navigation?.collapsibleSidebar}
        <button
          onclick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSection(groupKey);
          }}
          class="p-2 rounded-r-xl transition-all {isGroupActive ? 'hover:bg-primary/20' : 'hover:bg-accent/50'}"
          aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
        >
          {#if isCollapsed}
            <ChevronRight class="h-4 w-4 {isGroupActive ? 'text-primary' : 'text-muted-foreground'}" />
          {:else}
            <ChevronDown class="h-4 w-4 {isGroupActive ? 'text-primary' : 'text-muted-foreground'}" />
          {/if}
        </button>
      {/if}
    </div>

    {#if !isCollapsed && hasContent}
      <div class="ml-4 space-y-1">
        {#each mergedItems as item}
          {#if item.type === 'group'}
            {@render renderGroup(`${groupKey}/${item.key}`, item.group, depth + 1)}
          {:else}
            {@const href = `/docs/${version}/${item.doc.slug}`}
            {@const isActive = pathname === href}
            <a
              {href}
              onclick={onLinkClick}
              class="flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-all {isActive
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-foreground hover:text-foreground hover:bg-accent/50'}"
            >
              {#if item.doc.meta?.icon}
                <Icon icon={item.doc.meta.icon} size={16} className="shrink-0" />
              {/if}
              {item.doc.title}
            </a>
          {/if}
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

<nav class="space-y-1">
  {#if sortedStandalone.length > 0}
    {#each sortedStandalone as doc (doc.slug)}
      {@const href = `/docs/${version}/${doc.slug}`}
      {@const isActive = pathname === href}
      <a
        {href}
        onclick={onLinkClick}
        class="flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-all {isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-foreground hover:text-foreground hover:bg-accent/50'}"
      >
        {#if doc.meta?.icon}
          <Icon icon={doc.meta.icon} size={16} className="shrink-0" />
        {/if}
        {doc.title}
      </a>
    {/each}
  {/if}

  {#each sortedRootGroups as [groupKey, group] (groupKey)}
    {@render renderGroup(groupKey, group, 0)}
  {/each}
</nav>
