<script lang="ts">
  /**
   * mdsvex layout component for documentation pages.
   * This provides default styling for all markdown content elements.
   *
   * Usage in mdsvex config:
   * ```js
   * mdsvex({ layout: 'specra/components/MdxLayout' })
   * ```
   */
  let { children }: { children?: import('svelte').Snippet } = $props()
</script>

<div class="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-headings:font-semibold prose-h1:text-4xl prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-base prose-p:leading-7 prose-p:text-muted-foreground prose-p:mb-4 prose-a:font-normal prose-a:transition-all prose-code:text-primary prose-code:bg-muted/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[13px] prose-code:font-mono prose-code:border prose-code:border-border/50 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-transparent prose-pre:p-0 prose-ul:list-disc prose-ul:list-inside prose-ul:space-y-2 prose-ul:mb-4 prose-ol:list-decimal prose-ol:list-inside prose-ol:space-y-2 prose-ol:mb-4 prose-li:leading-7 prose-li:text-muted-foreground prose-strong:text-foreground prose-strong:font-semibold">
  {@render children?.()}
</div>
