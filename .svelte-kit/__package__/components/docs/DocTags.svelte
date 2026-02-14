<script lang="ts">
  import { Tag } from 'lucide-svelte';

  interface Props {
    tags: string[];
  }

  let { tags }: Props = $props();
</script>

{#if tags && tags.length > 0}
  <div class="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-border">
    <Tag class="h-3.5 w-3.5 text-muted-foreground" />
    {#each tags as tag}
      <span
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
      >
        {tag}
      </span>
    {/each}
  </div>
{/if}
