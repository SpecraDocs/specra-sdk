<script lang="ts">
  import { ChevronDown, Check } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';

  interface VersionMeta {
    id: string;
    label: string;
    badge?: string;
    hidden?: boolean;
  }

  interface Props {
    currentVersion: string;
    versions: string[];
    versionsMeta?: VersionMeta[];
  }

  let { currentVersion, versions, versionsMeta }: Props = $props();

  let isOpen = $state(false);
  let dropdownEl = $state<HTMLDivElement | null>(null);

  // Build version list: use metadata if available, filter hidden versions
  let visibleVersions = $derived.by(() => {
    if (versionsMeta && versionsMeta.length > 0) {
      return versionsMeta.filter(v => !v.hidden || v.id === currentVersion);
    }
    return versions.map(id => ({ id, label: id }));
  });

  // Get current version display label
  let currentLabel = $derived.by(() => {
    const meta = versionsMeta?.find(v => v.id === currentVersion);
    return meta?.label || currentVersion;
  });

  $effect(() => {
    if (!browser || !isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (dropdownEl && !dropdownEl.contains(e.target as Node)) {
        isOpen = false;
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        isOpen = false;
      }
    }

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  });

  function switchVersion(versionId: string) {
    if (versionId === currentVersion) {
      isOpen = false;
      return;
    }

    const currentPath = $page.url.pathname;
    const newPath = currentPath.replace(
      new RegExp(`/${currentVersion}(/|$)`),
      `/${versionId}$1`
    );

    isOpen = false;
    goto(newPath);
  }
</script>

{#if visibleVersions.length > 1}
  <div class="relative" bind:this={dropdownEl}>
    <button
      onclick={() => (isOpen = !isOpen)}
      class="flex items-center gap-1.5 h-8 px-3 text-sm font-medium rounded-md border border-border bg-background hover:bg-accent transition-colors text-foreground"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-label="Switch version"
    >
      <span>{currentLabel}</span>
      <ChevronDown class="h-3.5 w-3.5 text-muted-foreground transition-transform {isOpen ? 'rotate-180' : ''}" />
    </button>

    {#if isOpen}
      <div
        class="absolute top-full right-0 mt-1 w-48 py-1 bg-popover border border-border rounded-md shadow-lg z-50"
        role="listbox"
        aria-label="Available versions"
      >
        {#each visibleVersions as version}
          <button
            role="option"
            aria-selected={version.id === currentVersion}
            onclick={() => switchVersion(version.id)}
            class="w-full flex items-center justify-between px-3 py-1.5 text-sm transition-colors {version.id === currentVersion
              ? 'text-primary bg-accent/50 font-medium'
              : 'text-foreground hover:bg-accent'}"
          >
            <span class="flex items-center gap-2">
              {version.label}
              {#if version.badge}
                <span class="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary leading-none">{version.badge}</span>
              {/if}
            </span>
            {#if version.id === currentVersion}
              <Check class="h-3.5 w-3.5 text-primary" />
            {/if}
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}
