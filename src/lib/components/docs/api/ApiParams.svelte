<script lang="ts">
  export interface ApiParam {
    name: string;
    type: string;
    required?: boolean;
    description?: string;
    default?: string;
  }

  interface Props {
    title?: string;
    params: ApiParam[];
  }

  let { title = 'Parameters', params }: Props = $props();
</script>

{#if params && params.length > 0}
  <div class="mb-6">
    <h4 class="text-sm font-semibold text-foreground mb-3">{title}</h4>
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-border">
            <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Property
            </th>
            <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Type
            </th>
            <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Required
            </th>
            <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Default
            </th>
            <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {#each params as param, index}
            <tr
              class={index !== params.length - 1 ? 'border-b border-border/50' : ''}
            >
              <td class="py-2.5 px-3">
                <code class="text-sm font-mono text-foreground">{param.name}</code>
              </td>
              <td class="py-2.5 px-3">
                <span class="text-sm text-muted-foreground font-mono">{param.type}</span>
              </td>
              <td class="py-2.5 px-3">
                {#if param.required}
                  <span class="text-sm text-red-600 dark:text-red-400">Yes</span>
                {:else}
                  <span class="text-sm text-muted-foreground">No</span>
                {/if}
              </td>
              <td class="py-2.5 px-3">
                {#if param.default}
                  <code class="text-sm font-mono text-muted-foreground">{param.default}</code>
                {:else}
                  <span class="text-sm text-muted-foreground">-</span>
                {/if}
              </td>
              <td class="py-2.5 px-3">
                {#if param.description}
                  <span class="text-sm text-muted-foreground">{param.description}</span>
                {:else}
                  <span class="text-sm text-muted-foreground">-</span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
{/if}
