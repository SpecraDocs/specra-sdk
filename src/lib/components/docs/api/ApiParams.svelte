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

  let filteredParams = $derived(
    Array.isArray(params) ? params.filter(p => p && p.name) : []
  );
</script>

{#if filteredParams.length > 0}
  <div class="mb-6">
    <h4 class="text-sm font-semibold text-foreground mb-3">{title}</h4>
    <div class="specra-params-table">
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Type</th>
            <th>Required</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredParams as param, index}
            <tr>
              <td>
                <code>{param.name}</code>
              </td>
              <td>
                <span class="font-mono">{param.type}</span>
              </td>
              <td>
                {#if param.required}
                  <span class="text-red-600 dark:text-red-400">Yes</span>
                {:else}
                  No
                {/if}
              </td>
              <td>
                {#if param.default}
                  <code>{param.default}</code>
                {:else}
                  -
                {/if}
              </td>
              <td>
                {#if param.description}
                  {param.description}
                {:else}
                  -
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
{/if}

<style>
  .specra-params-table table {
    border-collapse: separate;
    border-spacing: 0;
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    overflow: hidden;
    width: max-content;
    max-width: 100%;
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .specra-params-table thead {
    background: var(--muted);
  }

  .specra-params-table thead th {
    border-bottom: 1px solid var(--border);
    border-right: 1px solid var(--border);
    padding: 0.625rem 1rem;
    font-weight: 600;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    text-align: left;
    color: var(--muted-foreground);
    white-space: nowrap;
  }

  .specra-params-table thead th:last-child {
    border-right: none;
  }

  .specra-params-table tbody td {
    border-bottom: 1px solid var(--border);
    border-right: 1px solid var(--border);
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }

  .specra-params-table tbody td:last-child {
    border-right: none;
  }

  .specra-params-table tbody tr:last-child td {
    border-bottom: none;
  }

  .specra-params-table tbody tr:hover {
    background: var(--muted);
  }

  .specra-params-table code {
    font-size: 0.8125rem;
    font-family: var(--font-mono, ui-monospace, monospace);
    color: var(--foreground);
    background: var(--muted);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    border: 1px solid var(--border);
  }
</style>
