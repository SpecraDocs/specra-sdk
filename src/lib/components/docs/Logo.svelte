<script lang="ts">
  import { themeStore } from '$lib/stores/theme.js';

  interface Props {
    logo?: string | { light: string; dark: string };
    alt?: string;
    className?: string;
  }

  let { logo, alt = 'Logo', className = 'h-8 w-8 object-contain' }: Props = $props();

  let currentSrc = $derived.by(() => {
    if (!logo) return '';
    if (typeof logo === 'string') return logo;
    return $themeStore === 'dark' ? logo.dark : logo.light;
  });
</script>

{#if logo}
  <img
    src={currentSrc}
    {alt}
    class={className}
  />
{/if}
