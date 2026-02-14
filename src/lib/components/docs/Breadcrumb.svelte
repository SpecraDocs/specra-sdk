<script lang="ts">
  import { ChevronRight } from 'lucide-svelte';
  import { getConfigContext } from '$lib/stores/config.js';

  interface Props {
    version: string;
    slug: string;
    title: string;
  }

  let { version, slug, title }: Props = $props();

  const configStore = getConfigContext();
  let config = $derived($configStore);

  let breadcrumbs = $derived.by(() => {
    const i18n = config.features?.i18n;
    const locales = typeof i18n === 'object' ? i18n.locales : i18n ? ['en'] : [];
    const defaultLocale = typeof i18n === 'object' ? i18n.defaultLocale : 'en';

    const parts = slug.split('/');

    // Check if first part is a locale
    const potentialLocale = parts[0];
    const isLc = locales.includes(potentialLocale);

    const homeHref = isLc ? `/docs/${version}/${potentialLocale}` : `/docs/${version}`;

    const crumbs: Array<{ label: string; href: string }> = [
      { label: 'Docs', href: homeHref }
    ];

    // Build breadcrumb path
    let currentPath = '';
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      currentPath += (currentPath ? '/' : '') + part;

      // Skip the locale part in the breadcrumb visual trail if it's the first part
      if (i === 0 && isLc) {
        continue;
      }

      crumbs.push({
        label: part
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        href: `/docs/${version}/${currentPath}`
      });
    }

    // Add current page
    crumbs.push({
      label: title,
      href: `/docs/${version}/${slug}`
    });

    return crumbs;
  });
</script>

<nav class="flex items-center gap-2 text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
  {#each breadcrumbs as crumb, index (crumb.href)}
    <div class="flex items-center gap-2">
      {#if index > 0}
        <ChevronRight class="h-4 w-4" />
      {/if}
      {#if index === breadcrumbs.length - 1}
        <span class="text-foreground font-medium">{crumb.label}</span>
      {:else}
        <a
          href={crumb.href}
          class="hover:text-foreground transition-colors"
        >
          {crumb.label}
        </a>
      {/if}
    </div>
  {/each}
</nav>
