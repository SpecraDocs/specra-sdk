<script lang="ts">
  import { Search, Menu, Github, Twitter, MessageCircle } from 'lucide-svelte';
  import { getConfigContext } from '$lib/stores/config.js';
  import { sidebarStore } from '$lib/stores/sidebar.js';
  import VersionSwitcher from './VersionSwitcher.svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  import SearchModal from './SearchModal.svelte';
  import Logo from './Logo.svelte';
  import type { SpecraConfig } from '$lib/config.types.js';

  interface Props {
    currentVersion: string;
    versions: string[];
    config?: SpecraConfig;
  }

  let { currentVersion, versions, config: configProp }: Props = $props();

  const configStore = getConfigContext();
  let config = $derived(configProp || $configStore);
  let searchOpen = $state(false);

  $effect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchOpen = true;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });
</script>

<header class="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
  <div class="container flex h-16 items-center justify-between px-2 md:px-6 mx-auto">
    <div class="flex items-center gap-1">
      <button
        onclick={() => sidebarStore.toggle()}
        class="lg:hidden hover:bg-muted p-2 rounded-md transition-colors"
        aria-label="Toggle menu"
      >
        <Menu class="h-5 w-5" />
      </button>
      <a href="/" class="flex items-center gap-2">
        {#if !config.site.hideLogo}
          {#if config.site.logo}
            <Logo logo={config.site.logo} alt={config.site.title} className="w-18 object-contain" />
          {:else}
            <div class="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
              <span class="text-primary-foreground font-bold text-lg">
                {config.site.title.charAt(0).toUpperCase()}
              </span>
            </div>
          {/if}
        {/if}
        {#if !config.site.hideTitle}
          <span class="font-semibold text-lg text-foreground">{config.site.title ?? 'Specra'}</span>
        {/if}
      </a>
    </div>

    <div class="flex items-center gap-2">
      {#if config.search?.enabled}
        <button
          onclick={() => (searchOpen = true)}
          class="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground bg-muted rounded-md transition-colors"
        >
          <Search class="h-4 w-4" />
          <span class="hidden sm:inline">{config.search.placeholder || 'Search'}</span>
          <kbd class="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-xs font-medium">
            ⌘K
          </kbd>
        </button>
      {/if}

      {#if config.features?.versioning}
        <VersionSwitcher {currentVersion} {versions} />
      {/if}

      <!-- Social Links -->
      {#if config.social?.github}
        <a
          href={config.social.github}
          target="_blank"
          rel="noopener noreferrer"
          class="hidden md:flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted transition-colors"
          aria-label="GitHub"
        >
          <Github class="h-4 w-4" />
        </a>
      {/if}
      {#if config.social?.twitter}
        <a
          href={config.social.twitter}
          target="_blank"
          rel="noopener noreferrer"
          class="hidden md:flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted transition-colors"
          aria-label="Twitter"
        >
          <Twitter class="h-4 w-4" />
        </a>
      {/if}
      {#if config.social?.discord}
        <a
          href={config.social.discord}
          target="_blank"
          rel="noopener noreferrer"
          class="hidden md:flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted transition-colors"
          aria-label="Discord"
        >
          <MessageCircle class="h-4 w-4" />
        </a>
      {/if}

      <ThemeToggle />
    </div>
  </div>

  <!-- Search Modal -->
  <SearchModal isOpen={searchOpen} onClose={() => (searchOpen = false)} {config} />
</header>
