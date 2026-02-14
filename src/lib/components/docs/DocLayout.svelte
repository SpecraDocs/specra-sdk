<script lang="ts">
  import { dev } from '$app/environment';
  import { ExternalLink, FileEdit } from 'lucide-svelte';
  import DocNavigation from './DocNavigation.svelte';
  import Breadcrumb from './Breadcrumb.svelte';
  import DocMetadata from './DocMetadata.svelte';
  import DraftBadge from './DraftBadge.svelte';
  import DocTags from './DocTags.svelte';
  import type { SpecraConfig } from '$lib/config.types.js';
  import type { Snippet } from 'svelte';

  interface DocMeta {
    title: string;
    description?: string;
    draft?: boolean;
    reading_time?: number;
    last_updated?: string;
    locale?: string;
    authors?: Array<{ id: string; name?: string }>;
    tags?: string[];
    [key: string]: any;
  }

  interface NavDoc {
    title: string;
    slug: string;
  }

  interface Props {
    meta: DocMeta;
    previousDoc?: NavDoc;
    nextDoc?: NavDoc;
    version: string;
    slug: string;
    config: SpecraConfig;
    children: Snippet;
  }

  let { meta, previousDoc, nextDoc, version, slug, config, children }: Props = $props();

  let isDevelopment = $derived(dev);

  // Build edit URL if configured
  let editUrl = $derived(
    config.features?.editUrl && typeof config.features.editUrl === 'string'
      ? `${config.features.editUrl}/${version}/${slug}.mdx`
      : null
  );
</script>

<article class="flex-1 min-w-0">
  {#if config.navigation?.showBreadcrumbs}
    <Breadcrumb {version} {slug} title={meta.title} />
  {/if}

  {#if isDevelopment && meta.draft}
    <DraftBadge />
  {/if}

  <div class="mb-8">
    <h1 class="text-4xl font-bold tracking-tight mb-3 text-foreground">{meta.title}</h1>
    {#if meta.description}
      <p class="text-lg text-muted-foreground leading-relaxed">{meta.description}</p>
    {/if}
  </div>

  <DocMetadata {meta} {config} />

  <div class="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-headings:font-semibold prose-h1:text-4xl prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-base prose-p:leading-7 prose-p:text-muted-foreground prose-p:mb-4 prose-a:font-normal prose-a:transition-all prose-code:text-primary prose-code:bg-muted/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[13px] prose-code:font-mono prose-code:border prose-code:border-border/50 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-transparent prose-pre:p-0 prose-ul:list-disc prose-ul:list-inside prose-ul:space-y-2 prose-ul:mb-4 prose-ol:list-decimal prose-ol:list-inside prose-ol:space-y-2 prose-ol:mb-4 prose-li:leading-7 prose-li:text-muted-foreground prose-strong:text-foreground prose-strong:font-semibold">
    {@render children()}
  </div>

  {#if config.features?.showTags && meta.tags && meta.tags.length > 0}
    <DocTags tags={meta.tags} />
  {/if}

  {#if editUrl || config.social?.github}
    <div class="mt-12 pt-6 border-t border-border flex items-center justify-between">
      {#if editUrl}
        <a
          href={editUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <FileEdit class="h-4 w-4" />
          Edit this page
        </a>
      {:else}
        <div></div>
      {/if}
      {#if config.social?.github}
        <a
          href="{config.social.github}/issues/new"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink class="h-4 w-4" />
          Report an issue
        </a>
      {/if}
    </div>
  {/if}

  <DocNavigation {previousDoc} {nextDoc} {version} />
</article>
