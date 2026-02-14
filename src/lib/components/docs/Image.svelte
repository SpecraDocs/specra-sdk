<script lang="ts">
  import { ZoomIn, X } from 'lucide-svelte';

  interface Props {
    src: string;
    alt: string;
    caption?: string;
    width?: number;
    height?: number;
    zoom?: boolean;
  }

  let {
    src,
    alt,
    caption,
    width,
    height,
    zoom = true,
  }: Props = $props();

  let isZoomed = $state(false);

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isZoomed) {
      isZoomed = false;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<figure class="my-6">
  <div class="relative group rounded-xl border border-border overflow-hidden bg-muted/30">
    <img
      {src}
      {alt}
      width={width || 1200}
      height={height || 675}
      class="w-full h-auto"
      loading="lazy"
    />
    {#if zoom}
      <button
        onclick={() => (isZoomed = true)}
        class="absolute top-3 right-3 p-2 rounded-md bg-background/80 backdrop-blur-sm border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
        aria-label="Zoom image"
      >
        <ZoomIn class="h-4 w-4 text-foreground" />
      </button>
    {/if}
  </div>
  {#if caption}
    <figcaption class="mt-2 text-center text-sm text-muted-foreground italic">
      {caption}
    </figcaption>
  {/if}
</figure>

<!-- Zoom Modal -->
{#if isZoomed}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
    onclick={() => (isZoomed = false)}
    onkeydown={(e) => { if (e.key === 'Escape') isZoomed = false; }}
  >
    <button
      onclick={() => (isZoomed = false)}
      class="absolute top-4 right-4 p-2 rounded-md bg-muted hover:bg-muted/80 transition-colors"
      aria-label="Close"
    >
      <X class="h-5 w-5 text-foreground" />
    </button>
    <div class="max-w-7xl max-h-[90vh] overflow-auto">
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <img
        {src}
        {alt}
        width={width || 1920}
        height={height || 1080}
        class="w-full h-auto"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => { if (e.key === 'Enter') e.stopPropagation(); }}
      />
    </div>
  </div>
{/if}
