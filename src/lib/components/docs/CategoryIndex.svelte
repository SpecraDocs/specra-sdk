<script lang="ts">
  import { FileText, ArrowRight } from 'lucide-svelte';
  import type { SpecraConfig } from '$lib/config.types.js';
  import type { Snippet } from 'svelte';

  interface DocItem {
    slug: string;
    filePath: string;
    version?: string;
    meta?: {
      title?: string;
      description?: string;
      sidebar_position?: number;
      icon?: string;
      [key: string]: unknown;
    };
    title?: string;
    description?: string;
    [key: string]: unknown;
  }

  interface Props {
    categoryPath: string;
    version: string;
    allDocs: DocItem[];
    title?: string;
    description?: string;
    content?: Snippet;
    config: SpecraConfig;
  }

  let { categoryPath, version, allDocs, title, description, content, config }: Props = $props();

  // Filter docs that belong to this category (direct children)
  const childDocs = $derived(() => {
    if (!allDocs || allDocs.length === 0) return [];

    return allDocs
      .filter((doc) => {
        const docPath = doc.filePath || doc.slug;
        // Match direct children of this category path
        if (!docPath.startsWith(categoryPath + '/')) return false;
        const remaining = docPath.slice(categoryPath.length + 1);
        // Only direct children (no further slashes, or is an index)
        return !remaining.includes('/') && remaining !== 'index';
      })
      .sort((a, b) => {
        const posA = a.meta?.sidebar_position ?? 999;
        const posB = b.meta?.sidebar_position ?? 999;
        return posA - posB;
      });
  });

  const baseUrl = $derived(config.site?.baseUrl?.replace(/\/$/, '') || '');
</script>

<div class="space-y-8">
  <!-- Category Header -->
  {#if title}
    <div class="space-y-2">
      <h1 class="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
      {#if description}
        <p class="text-lg text-muted-foreground">{description}</p>
      {/if}
    </div>
  {/if}

  <!-- Rendered mdsvex content via slot -->
  {#if content}
    <div class="prose dark:prose-invert max-w-none">
      {@render content()}
    </div>
  {/if}

  <!-- Child Documents Grid -->
  {#if childDocs().length > 0}
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
      {#each childDocs() as doc}
        {@const docTitle = doc.meta?.title || doc.title || doc.slug.split('/').pop() || 'Untitled'}
        {@const docDescription = doc.meta?.description || doc.description || ''}
        {@const docSlug = doc.slug}

        <a
          href="{baseUrl}/{version}/{docSlug}"
          class="group flex flex-col gap-2 p-5 rounded-lg border border-border bg-card hover:bg-accent/50 hover:border-accent-foreground/20 transition-all duration-200"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2">
              <FileText class="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <h3 class="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {docTitle}
              </h3>
            </div>
            <ArrowRight class="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
          </div>
          {#if docDescription}
            <p class="text-sm text-muted-foreground line-clamp-2 pl-6">
              {docDescription}
            </p>
          {/if}
        </a>
      {/each}
    </div>
  {:else if !content}
    <div class="flex flex-col items-center justify-center py-12 text-center">
      <FileText class="h-10 w-10 text-muted-foreground mb-4" />
      <p class="text-muted-foreground">No documents found in this category.</p>
    </div>
  {/if}
</div>
