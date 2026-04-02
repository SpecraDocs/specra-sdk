<script lang="ts">
  import MdxContent from './MdxContent.svelte';
  import type { Component } from 'svelte';
  import type { MdxNode } from '$lib/mdx.js';

  interface Props {
    nodes: MdxNode[];
    components: Record<string, Component>;
  }

  let { nodes, components }: Props = $props();
</script>

{#each nodes as node}
  {#if node.type === 'html'}
    {@html node.content}
  {:else if node.type === 'component' && node.name}
    {@const Comp = components[node.name]}
    {#if Comp}
      {#if node.children && node.children.length > 0}
        <svelte:component this={Comp} {...node.props}>
          {#snippet children()}
            <MdxContent nodes={node.children} {components} />
          {/snippet}
        </svelte:component>
      {:else}
        <svelte:component this={Comp} {...node.props} />
      {/if}
    {:else}
      <!-- Unknown component: {node.name} -->
      {#if node.children}
        <MdxContent nodes={node.children} {components} />
      {/if}
    {/if}
  {/if}
{/each}
