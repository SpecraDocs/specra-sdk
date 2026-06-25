<script lang="ts">
  import MdxContent from './MdxContent.svelte';
  import type { Component } from 'svelte';
  import type { MdxNode } from '$lib/mdx.js';
  import { base } from '$app/paths';

  interface Props {
    nodes: MdxNode[];
    components: Record<string, Component>;
  }

  let { nodes, components }: Props = $props();

  // Prefix absolute href/src in raw content HTML with the deployment base path.
  // The content nodes are pre-rendered HTML emitted via {@html}, which bypasses
  // rehypeBasePath, so links like /docs/... would otherwise be base-less under a
  // subpath deployment. Skips protocol-relative (//) and already-based URLs.
  function withBase(html: string): string {
    if (!base || !html) return html;
    return html.replace(
      /(href|src)="(\/[^"]*)"/g,
      (m, attr, p) =>
        p.startsWith('//') || p === base || p.startsWith(base + '/')
          ? m
          : `${attr}="${base}${p}"`
    );
  }
</script>

{#each nodes as node}
  {#if node.type === 'html'}
    {@html withBase(node.content)}
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
