<script lang="ts">
  import CodeBlock from '../CodeBlock.svelte';

  interface Props {
    status: number;
    description?: string;
    example?: any;
    schema?: any;
  }

  let { status, description, example, schema }: Props = $props();

  const statusColors: Record<string, string> = {
    '2': 'text-green-600 dark:text-green-400',
    '3': 'text-blue-600 dark:text-blue-400',
    '4': 'text-orange-600 dark:text-orange-400',
    '5': 'text-red-600 dark:text-red-400',
  };

  let statusClass = $derived(statusColors[String(status)[0]] || 'text-muted-foreground');

  let exampleCode = $derived(
    example
      ? typeof example === 'string'
        ? example
        : JSON.stringify(example, null, 2)
      : ''
  );

  let schemaCode = $derived(
    schema
      ? typeof schema === 'string'
        ? schema
        : JSON.stringify(schema, null, 2)
      : ''
  );
</script>

<div class="mb-4">
  <div class="flex items-center gap-2 mb-2">
    <span class="text-sm font-semibold {statusClass}">{status}</span>
    {#if description}
      <span class="text-sm text-muted-foreground">{description}</span>
    {/if}
  </div>

  {#if example}
    <div class="mb-3">
      <p class="text-xs font-semibold text-muted-foreground mb-2">Example Response</p>
      <CodeBlock
        code={exampleCode}
        language="json"
      />
    </div>
  {/if}

  {#if schema}
    <div>
      <p class="text-xs font-semibold text-muted-foreground mb-2">Schema</p>
      <CodeBlock
        code={schemaCode}
        language="json"
      />
    </div>
  {/if}
</div>
