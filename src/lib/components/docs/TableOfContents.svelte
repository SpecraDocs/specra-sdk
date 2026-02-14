<script lang="ts">
  import { browser } from '$app/environment';
  import type { SpecraConfig } from '$lib/config.types.js';
  import type { TOCItem } from '$lib/toc.js';

  interface Props {
    items: TOCItem[];
    config: SpecraConfig;
  }

  let { items, config }: Props = $props();

  let activeId = $state('');

  const showToc = $derived(config.navigation?.showTableOfContents !== false);
  const maxDepth = $derived(config.navigation?.tocMaxDepth ?? 3);
  const filteredItems = $derived(items.filter((item) => item.level <= maxDepth));

  // Check if tab groups are configured
  const hasTabGroups = $derived(
    config.navigation?.tabGroups != null && config.navigation.tabGroups.length > 0
  );

  // Adjust top position based on whether tabs are present
  const stickyTop = $derived(hasTabGroups ? 'top-[7.5rem]' : 'top-24');
  const maxHeight = $derived(hasTabGroups ? 'max-h-[calc(100vh-10rem)]' : 'max-h-[calc(100vh-7rem)]');

  $effect(() => {
    if (!browser || !showToc || filteredItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            activeId = entry.target.id;
            break;
          }
        }
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0,
      }
    );

    // Observe all heading elements
    const headingElements = filteredItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    headingElements.forEach((el) => observer.observe(el));

    return () => {
      headingElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  });

  function handleClick(e: MouseEvent, id: string) {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // Update URL without jumping
      window.history.replaceState(null, '', `#${id}`);

      // Manually set active ID after scroll
      activeId = id;
    }
  }
</script>

{#if showToc && filteredItems.length > 0}
  <aside class="w-64 hidden xl:block shrink-0 sticky {stickyTop} self-start">
    <div class="{maxHeight} overflow-y-auto bg-muted/30 dark:bg-muted/10 rounded-2xl p-4 border border-border/50">
      <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">On this page</h3>
      <nav class="space-y-1">
        {#each filteredItems as item, index}
          <a
            href="#{item.id}"
            onclick={(e) => handleClick(e, item.id)}
            class="block text-sm transition-all cursor-pointer rounded-xl px-3 py-2 {item.level === 3 ? 'ml-3' : ''} {activeId === item.id
              ? 'text-primary font-medium'
              : 'text-foreground hover:bg-accent/50'}"
          >
            {item.title}
          </a>
        {/each}
      </nav>
    </div>
  </aside>
{/if}
