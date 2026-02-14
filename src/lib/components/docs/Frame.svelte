<script lang="ts">
  interface Props {
    src: string;
    title?: string;
    height?: number | string;
    width?: string;
  }

  let {
    src,
    title = 'Embedded content',
    height = 500,
    width = '100%',
  }: Props = $props();
</script>

<div class="my-6 rounded-xl border border-border overflow-hidden bg-muted/30">
  <iframe
    {src}
    {title}
    {width}
    {height}
    class="w-full"
    loading="lazy"
    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
  ></iframe>
</div>
