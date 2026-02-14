<script lang="ts">
  import { sidebarStore } from '../../stores/sidebar.js';
  import type { Snippet } from 'svelte';

  /**
   * HeaderWithMenu wraps a header snippet and provides mobile menu toggle functionality.
   * In Svelte, instead of React's cloneElement pattern, the header component
   * directly accesses the sidebarStore for toggle behavior.
   * This component exists as a thin wrapper for layout composition.
   */
  interface Props {
    /** Header content to render */
    header?: Snippet;
    /** Optional: override the toggle handler */
    onMenuClick?: () => void;
    children?: Snippet;
  }

  let { header, onMenuClick, children }: Props = $props();

  function handleMenuClick() {
    if (onMenuClick) {
      onMenuClick();
    } else {
      sidebarStore.toggle();
    }
  }
</script>

{#if header}
  {@render header()}
{:else if children}
  {@render children()}
{/if}
