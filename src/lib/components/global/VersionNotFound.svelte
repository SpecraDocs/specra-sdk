<script lang="ts">
  import { AlertTriangle } from 'lucide-svelte';

  interface Props {
    version?: string;
    availableVersions?: string[];
  }

  let { version, availableVersions = [] }: Props = $props();
</script>

<div class="flex min-h-screen items-center justify-center px-4">
  <div class="text-center">
    <div class="mb-4 flex justify-center">
      <AlertTriangle class="h-16 w-16 text-yellow-500" />
    </div>
    <h1 class="mb-2 text-4xl font-bold">Version Not Found</h1>
    <p class="mb-6 text-muted-foreground">
      {#if version}
        The documentation version "{version}" doesn't exist.
      {:else}
        The documentation version you're looking for doesn't exist.
      {/if}
    </p>
    {#if availableVersions.length > 0}
      <div class="mb-6">
        <p class="mb-3 text-sm text-muted-foreground">Available versions:</p>
        <div class="flex flex-wrap justify-center gap-2">
          {#each availableVersions as ver}
            <a
              href="/docs/{ver}"
              class="inline-flex items-center rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              {ver}
            </a>
          {/each}
        </div>
      </div>
    {:else}
      <a
        href="/docs/v1.0.0"
        class="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Go to Latest Version
      </a>
    {/if}
  </div>
</div>
