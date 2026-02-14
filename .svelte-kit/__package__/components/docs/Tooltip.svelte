<script lang="ts">
  import type { Snippet } from 'svelte';

  type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

  interface Props {
    content: string;
    position?: TooltipPosition;
    children?: Snippet;
  }

  let { content, position = 'top', children }: Props = $props();

  let isVisible = $state(false);

  const positions: Record<TooltipPosition, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };
</script>

<span
  class="relative inline-flex underline decoration-dotted cursor-help"
  onmouseenter={() => (isVisible = true)}
  onmouseleave={() => (isVisible = false)}
  onfocusin={() => (isVisible = true)}
  onfocusout={() => (isVisible = false)}
  role="button"
  tabindex="0"
>
  {#if children}
    {@render children()}
  {/if}
  {#if isVisible}
    <span
      class="absolute {positions[position]} z-50 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded whitespace-nowrap pointer-events-none"
      role="tooltip"
    >
      {content}
    </span>
  {/if}
</span>
