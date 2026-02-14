<script lang="ts">
  interface Props {
    src: string;
    alt: string;
    title?: string;
    description?: string;
    href?: string;
    external?: boolean;
    aspectRatio?: 'square' | 'video' | 'portrait';
  }

  let {
    src,
    alt,
    title,
    description,
    href,
    external = false,
    aspectRatio = 'video',
  }: Props = $props();

  const aspectRatios: Record<string, string> = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
  };

  let aspectClass = $derived(aspectRatios[aspectRatio] || aspectRatios.video);
  let hasInfo = $derived(!!title || !!description);
</script>

{#if href}
  <a
    {href}
    class="image-card-link group block rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all overflow-hidden p-0"
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}
  >
    <div class="flex flex-col gap-0 p-0">
      <div class="w-full {aspectClass} overflow-hidden {hasInfo ? 'rounded-t-xl' : 'rounded-xl'} bg-muted relative">
        <img
          {src}
          {alt}
          class="object-cover transition-transform duration-300 group-hover:scale-105 absolute inset-0 w-full h-full"
          loading="lazy"
        />
      </div>
      {#if hasInfo}
        <div class="p-3 flex flex-col gap-1">
          {#if title}
            <h3 class="font-semibold text-foreground mb-0 no-underline group-hover:text-primary transition-colors">
              {title}
            </h3>
          {/if}
          {#if description}
            <p class="text-sm text-muted-foreground line-clamp-2 no-underline mb-0">
              {description}
            </p>
          {/if}
        </div>
      {/if}
    </div>
  </a>
{:else}
  <div class="block rounded-xl border border-border overflow-hidden bg-card p-0">
    <div class="flex flex-col gap-0 p-0">
      <div class="w-full {aspectClass} overflow-hidden {hasInfo ? 'rounded-t-xl' : 'rounded-xl'} bg-muted relative">
        <img
          {src}
          {alt}
          class="object-cover absolute inset-0 w-full h-full"
          loading="lazy"
        />
      </div>
      {#if hasInfo}
        <div class="p-3 flex flex-col gap-1">
          {#if title}
            <h3 class="font-semibold text-foreground mb-0 no-underline">
              {title}
            </h3>
          {/if}
          {#if description}
            <p class="text-sm text-muted-foreground line-clamp-2 no-underline mb-0">
              {description}
            </p>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}
