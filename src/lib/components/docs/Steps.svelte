<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="my-6 ml-4 space-y-6" style="counter-reset: step;">
  {#if children}
    {@render children()}
  {/if}
</div>
