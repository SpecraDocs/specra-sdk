<script lang="ts">
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';

  interface NavDoc {
    title: string;
    slug: string;
  }

  interface Props {
    previousDoc?: NavDoc;
    nextDoc?: NavDoc;
    version: string;
  }

  let { previousDoc, nextDoc, version }: Props = $props();
</script>

{#if previousDoc || nextDoc}
  <div class="mt-12 pt-8 border-t border-border grid grid-cols-2 gap-4">
    {#if previousDoc}
      <a
        href="/docs/{version}/{previousDoc.slug}"
        class="group flex flex-col gap-2 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all"
        style="text-decoration: none !important;"
      >
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <ChevronLeft class="h-4 w-4" />
          <span>Previous</span>
        </div>
        <div class="text-base font-medium text-foreground group-hover:text-primary transition-colors">
          {previousDoc.title}
        </div>
      </a>
    {:else}
      <div></div>
    {/if}

    {#if nextDoc}
      <a
        href="/docs/{version}/{nextDoc.slug}"
        class="group flex flex-col gap-2 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-right"
        style="text-decoration: none !important;"
      >
        <div class="flex items-center justify-end gap-2 text-sm text-muted-foreground">
          <span>Next</span>
          <ChevronRight class="h-4 w-4" />
        </div>
        <div class="text-base font-medium text-foreground group-hover:text-primary transition-colors">
          {nextDoc.title}
        </div>
      </a>
    {:else}
      <div></div>
    {/if}
  </div>
{/if}
