<script lang="ts">
  import { Wrench } from 'lucide-svelte';
  import { browser } from '$app/environment';
  import { dev } from '$app/environment';
</script>

{#if dev}
  <div
    class="fixed bottom-4 left-4 z-50 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/90 text-white text-xs font-medium shadow-lg backdrop-blur-sm"
    title="Development mode"
  >
    <Wrench class="h-3 w-3" />
    <span>Dev</span>
  </div>
{/if}
