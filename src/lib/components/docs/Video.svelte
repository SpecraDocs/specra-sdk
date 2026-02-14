<script lang="ts">
  interface Props {
    src: string;
    caption?: string;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    controls?: boolean;
    poster?: string;
  }

  let {
    src,
    caption,
    autoplay = false,
    loop = false,
    muted = false,
    controls = true,
    poster,
  }: Props = $props();

  // YouTube URL detection
  function getYouTubeId(url: string): string | null {
    const match = url.match(
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    );
    return match ? match[1] : null;
  }

  // Vimeo URL detection
  function getVimeoId(url: string): string | null {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  }

  let isYouTube = $derived(src.includes('youtube.com') || src.includes('youtu.be'));
  let isVimeo = $derived(src.includes('vimeo.com'));
  let youtubeId = $derived(getYouTubeId(src));
  let vimeoId = $derived(getVimeoId(src));
</script>

<figure class="my-6">
  <div class="relative rounded-xl border border-border overflow-hidden bg-muted/30">
    {#if isYouTube && youtubeId}
      <div class="relative w-full" style="padding-bottom: 56.25%;">
        <iframe
          class="absolute top-0 left-0 w-full h-full"
          src="https://www.youtube.com/embed/{youtubeId}{autoplay ? '?autoplay=1' : ''}"
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    {:else if isVimeo && vimeoId}
      <div class="relative w-full" style="padding-bottom: 56.25%;">
        <iframe
          class="absolute top-0 left-0 w-full h-full"
          src="https://player.vimeo.com/video/{vimeoId}{autoplay ? '?autoplay=1' : ''}"
          title="Vimeo video"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    {:else}
      <video
        {src}
        {controls}
        autoplay={autoplay}
        {loop}
        {muted}
        {poster}
        class="w-full h-auto"
      >
        Your browser does not support the video tag.
        <track kind="captions" />
      </video>
    {/if}
  </div>
  {#if caption}
    <figcaption class="mt-2 text-center text-sm text-muted-foreground italic">
      {caption}
    </figcaption>
  {/if}
</figure>
