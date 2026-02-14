<script lang="ts">
  import { Moon, Sun } from 'lucide-svelte';
  import { themeStore } from '../../stores/theme.js';
</script>

<button
  onclick={() => themeStore.toggle()}
  class="flex items-center justify-center w-9 h-9 rounded-md border border-border bg-background hover:bg-accent transition-colors"
  aria-label="Toggle theme"
>
  {#if $themeStore === 'dark'}
    <Sun class="h-4 w-4 text-foreground" />
  {:else}
    <Moon class="h-4 w-4 text-foreground" />
  {/if}
</button>
