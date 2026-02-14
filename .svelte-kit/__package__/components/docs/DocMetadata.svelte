<script lang="ts">
  import { Clock, Calendar, User } from 'lucide-svelte';
  import type { SpecraConfig } from '../../config.types.js';

  interface DocMeta {
    readingTime?: number;
    lastUpdated?: string;
    authors?: Array<string | { name: string; avatar?: string; url?: string }>;
    [key: string]: unknown;
  }

  interface Props {
    meta: DocMeta;
    config: SpecraConfig;
  }

  let { meta, config }: Props = $props();

  const showReadingTime = $derived(config.features?.showReadingTime !== false && meta.readingTime);
  const showLastUpdated = $derived(config.features?.showLastUpdated !== false && meta.lastUpdated);
  const showAuthors = $derived(config.features?.showAuthors && meta.authors && meta.authors.length > 0);

  function formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  function getAuthorName(author: string | { name: string }): string {
    return typeof author === 'string' ? author : author.name;
  }

  function getAuthorUrl(author: string | { name: string; url?: string }): string | undefined {
    return typeof author === 'string' ? undefined : author.url;
  }

  function getAuthorAvatar(author: string | { name: string; avatar?: string }): string | undefined {
    return typeof author === 'string' ? undefined : author.avatar;
  }
</script>

{#if showReadingTime || showLastUpdated || showAuthors}
  <div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
    {#if showReadingTime}
      <span class="inline-flex items-center gap-1.5">
        <Clock class="h-3.5 w-3.5" />
        <span>{meta.readingTime} min read</span>
      </span>
    {/if}

    {#if showLastUpdated && meta.lastUpdated}
      <span class="inline-flex items-center gap-1.5">
        <Calendar class="h-3.5 w-3.5" />
        <span>Updated {formatDate(meta.lastUpdated)}</span>
      </span>
    {/if}

    {#if showAuthors && meta.authors}
      <span class="inline-flex items-center gap-1.5">
        <User class="h-3.5 w-3.5" />
        <span class="flex items-center gap-1">
          {#each meta.authors as author, index}
            {#if getAuthorUrl(author)}
              <a
                href={getAuthorUrl(author)}
                class="hover:text-foreground transition-colors underline-offset-2 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {#if getAuthorAvatar(author)}
                  <img
                    src={getAuthorAvatar(author)}
                    alt={getAuthorName(author)}
                    class="inline-block h-5 w-5 rounded-full mr-1"
                  />
                {/if}
                {getAuthorName(author)}
              </a>
            {:else}
              <span>
                {#if getAuthorAvatar(author)}
                  <img
                    src={getAuthorAvatar(author)}
                    alt={getAuthorName(author)}
                    class="inline-block h-5 w-5 rounded-full mr-1"
                  />
                {/if}
                {getAuthorName(author)}
              </span>
            {/if}
            {#if index < meta.authors.length - 1}
              <span>,</span>
            {/if}
          {/each}
        </span>
      </span>
    {/if}
  </div>
{/if}
