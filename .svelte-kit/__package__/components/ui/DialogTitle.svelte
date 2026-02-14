<script lang="ts">
  import { cn } from '../../utils.js';
  import { Dialog as DialogPrimitive } from 'bits-ui';
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    children?: Snippet;
    [key: string]: unknown;
  }

  let { class: className, children, ...restProps }: Props = $props();
</script>

<DialogPrimitive.Title
  data-slot="dialog-title"
  class={cn('text-lg leading-none font-semibold', className)}
  {...restProps}
>
  {@render children?.()}
</DialogPrimitive.Title>
