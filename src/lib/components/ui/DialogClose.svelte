<script lang="ts">
  import { Dialog as DialogPrimitive } from 'bits-ui';
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    children?: Snippet;
    [key: string]: unknown;
  }

  let { class: className, children, ...restProps }: Props = $props();
</script>

<DialogPrimitive.Close data-slot="dialog-close" class={className} {...restProps}>
  {@render children?.()}
</DialogPrimitive.Close>
