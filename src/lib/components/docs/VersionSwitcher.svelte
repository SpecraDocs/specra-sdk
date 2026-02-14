<script lang="ts">
  import { ChevronDown, Check } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';

  interface Props {
    currentVersion: string;
    versions: string[];
  }

  let { currentVersion, versions }: Props = $props();

  let isOpen = $state(false);
  let dropdownEl = $state<HTMLDivElement | null>(null);

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

  function switchVersion(version: string) {
    if (version === currentVersion) {
      isOpen = false;
      return;
    }

    const currentPath = $page.url.pathname;
    const newPath = currentPath.replace(
      new RegExp(`/${currentVersion}(/|$)`),
      `/${version}$1`
    );

    isOpen = false;
    goto(newPath);
  }
</script>

{#if versions.length > 1}
  <div class="relative" bind:this={dropdownEl}>
    <button
      onclick={() => (isOpen = !isOpen)}
      class="flex items-center gap-1.5 h-8 px-3 text-sm font-medium rounded-md border border-border bg-background hover:bg-accent transition-colors text-foreground"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-label="Switch version"
    >
      <span>{currentVersion}</span>
      <ChevronDown class="h-3.5 w-3.5 text-muted-foreground transition-transform {isOpen ? 'rotate-180' : ''}" />
    </button>

    {#if isOpen}
      <div
        class="absolute top-full right-0 mt-1 w-40 py-1 bg-popover border border-border rounded-md shadow-lg z-50"
        role="listbox"
        aria-label="Available versions"
      >
        {#each versions as version}
          <button
            role="option"
            aria-selected={version === currentVersion}
            onclick={() => switchVersion(version)}
            class="w-full flex items-center justify-between px-3 py-1.5 text-sm transition-colors {version === currentVersion
              ? 'text-primary bg-accent/50 font-medium'
              : 'text-foreground hover:bg-accent'}"
          >
            <span>{version}</span>
            {#if version === currentVersion}
              <Check class="h-3.5 w-3.5 text-primary" />
            {/if}
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}
