<script lang="ts">
  import { ArrowRight, ExternalLink } from 'lucide-svelte';
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';

  interface Props {
    title: string;
    description?: string;
    href?: string;
    icon?: string;
    external?: boolean;
    children?: Snippet;
  }

  let { title, description, href, icon, external = false, children }: Props = $props();
</script>

{#snippet cardContent(isLink: boolean)}
  <div class="flex items-center gap-3">
    {#if icon}
      <div class="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        <Icon {icon} size={20} />
      </div>
    {/if}
    <div class="flex-1 min-w-0">
      <h3 class="font-semibold text-foreground mb-1 no-underline {isLink ? 'group-hover:text-primary transition-colors' : ''}">
        {title}
      </h3>
      {#if description}
        <p class="text-sm text-muted-foreground line-clamp-2 no-underline">{description}</p>
      {/if}
      {#if children}
        <div class="mt-2 text-sm text-muted-foreground no-underline">
          {@render children()}
        </div>
      {/if}
    </div>
    {#if href}
      <div class="shrink-0 self-start mt-1">
        {#if external}
          <ExternalLink class="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        {:else}
          <ArrowRight class="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        {/if}
      </div>
    {/if}
  </div>
{/snippet}

{#if href}
  <a
    {href}
    class="card-link group block p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all"
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}
  >
    {@render cardContent(true)}
  </a>
{:else}
  <div class="p-4 rounded-xl border border-border bg-muted/30 no-underline">
    {@render cardContent(false)}
  </div>
{/if}
