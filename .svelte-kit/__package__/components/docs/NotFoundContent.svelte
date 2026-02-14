<script lang="ts">
  import { FileQuestion, Home, ArrowLeft } from 'lucide-svelte';

  interface Props {
    version?: string;
  }

  let { version = '' }: Props = $props();

  const homeLink = $derived(version ? `/${version}` : '/');
</script>

<div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
  <div class="flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
    <FileQuestion class="h-10 w-10 text-muted-foreground" />
  </div>

  <h1 class="text-4xl font-bold text-foreground mb-2">404</h1>
  <h2 class="text-xl font-semibold text-foreground mb-4">Page Not Found</h2>
  <p class="text-muted-foreground max-w-md mb-8">
    The page you are looking for does not exist or has been moved. Check the URL or navigate back to the documentation.
  </p>

  <div class="flex items-center gap-3">
    <a
      href={homeLink}
      class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
    >
      <Home class="h-4 w-4" />
      <span>Go to Docs Home</span>
    </a>
    <button
      onclick={() => history.back()}
      class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-border bg-background hover:bg-accent transition-colors text-foreground"
    >
      <ArrowLeft class="h-4 w-4" />
      <span>Go Back</span>
    </button>
  </div>
</div>
