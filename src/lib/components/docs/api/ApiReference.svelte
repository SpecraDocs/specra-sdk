<script lang="ts">
  import type { SpecraApiSpec } from '$lib/api-parser.types.js';
  import { parseApiSpec, type ParserType } from '$lib/parsers/index.js';
  import Accordion from '../Accordion.svelte';
  import AccordionItem from '../AccordionItem.svelte';
  import ApiParams from './ApiParams.svelte';
  import ApiResponseDisplay from './ApiResponse.svelte';
  import ApiPlayground from './ApiPlayground.svelte';
  import CodeBlock from '../CodeBlock.svelte';
  import { Loader2 } from 'lucide-svelte';

  interface Props {
    /**
     * Path to the API spec JSON file (relative to /public or /static)
     * Example: "/api-specs/my-api.json"
     */
    spec: string;

    /**
     * Parser type - auto-detect by default
     * - "auto": Auto-detect format (Specra, OpenAPI, or Postman)
     * - "specra": Native Specra format
     * - "openapi": OpenAPI 3.x / Swagger
     * - "postman": Postman Collection v2.x
     */
    parser?: ParserType;

    /**
     * Show API playground for testing
     */
    showPlayground?: boolean;
  }

  let { spec, parser = 'auto', showPlayground = true }: Props = $props();

  let apiSpec = $state<SpecraApiSpec | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  // Replace environment variables in text
  function interpolateEnv(text: string, env?: Record<string, string>): string {
    if (!env) return text;
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return env[key] || match;
    });
  }

  // Fetch and parse spec reactively when spec or parser changes
  $effect(() => {
    const currentSpec = spec;
    const currentParser = parser;

    loading = true;
    error = null;
    apiSpec = null;

    fetch(currentSpec)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load API spec: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        apiSpec = parseApiSpec(data, currentParser);
      })
      .catch((err) => {
        error = err instanceof Error ? err.message : 'Failed to load API spec';
      })
      .finally(() => {
        loading = false;
      });
  });
</script>

{#if loading}
  <div class="flex items-center justify-center py-12">
    <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
    <span class="ml-2 text-muted-foreground">Loading API specification...</span>
  </div>
{:else if error}
  <div class="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
    <p class="text-sm text-red-600 dark:text-red-400">Error: {error}</p>
  </div>
{:else if apiSpec}
  <div class="space-y-6">
    <!-- API Info -->
    {#if apiSpec.title || apiSpec.description}
      <div class="mb-8">
        {#if apiSpec.title}
          <h2 class="text-2xl font-semibold mb-2 text-foreground">{apiSpec.title}</h2>
        {/if}
        {#if apiSpec.description}
          <p class="text-muted-foreground">{apiSpec.description}</p>
        {/if}
        {#if apiSpec.baseUrl}
          <div class="mt-4">
            <p class="text-sm font-semibold text-muted-foreground mb-1">Base URL</p>
            <code class="text-sm px-2 py-1 bg-muted rounded">{apiSpec.baseUrl}</code>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Authentication -->
    {#if apiSpec.auth}
      <div class="rounded-lg border border-border bg-card/30 p-4 mb-6">
        <h3 class="text-lg font-semibold mb-2 text-foreground">Authentication</h3>
        <p class="text-sm text-muted-foreground mb-2">
          {apiSpec.auth.description || `This API uses ${apiSpec.auth.type} authentication.`}
        </p>
        {#if apiSpec.auth.type === 'bearer'}
          <CodeBlock
            code={`Authorization: ${apiSpec.auth.tokenPrefix || 'Bearer'} {YOUR_TOKEN}`}
            language="bash"
          />
        {/if}
        {#if apiSpec.auth.type === 'apiKey'}
          <CodeBlock
            code={`${apiSpec.auth.headerName || 'X-API-Key'}: {YOUR_API_KEY}`}
            language="bash"
          />
        {/if}
      </div>
    {/if}

    <!-- Endpoints -->
    <Accordion class="space-y-4">
      {#each apiSpec.endpoints as endpoint, index}
        {@const allHeaders = [
          ...(apiSpec.globalHeaders || []),
          ...(endpoint.headers || []),
        ].map((header) => ({
          ...header,
          value: interpolateEnv(header.value, apiSpec?.env),
        }))}

        <AccordionItem
          title={`${endpoint.method} ${endpoint.path} - ${endpoint.title || ''}`}
        >
          {#snippet children()}
            <div class="space-y-6 pt-4">
              <!-- Method + Path Badge -->
              <div class="flex items-center gap-3">
                <span
                  class="text-xs font-semibold px-2 py-0.5 rounded {endpoint.method === 'GET'
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : endpoint.method === 'POST'
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : endpoint.method === 'PUT'
                        ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                        : endpoint.method === 'PATCH'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400'}"
                >
                  {endpoint.method}
                </span>
                <code class="text-sm font-mono">{endpoint.path}</code>
                {#if endpoint.title}
                  <span class="text-sm text-muted-foreground ml-auto">{endpoint.title}</span>
                {/if}
              </div>

              <!-- Description -->
              {#if endpoint.description}
                <p class="text-sm text-muted-foreground">{endpoint.description}</p>
              {/if}

              <!-- Path Parameters -->
              {#if endpoint.pathParams && endpoint.pathParams.length > 0}
                <ApiParams title="Path Parameters" params={endpoint.pathParams} />
              {/if}

              <!-- Query Parameters -->
              {#if endpoint.queryParams && endpoint.queryParams.length > 0}
                <ApiParams title="Query Parameters" params={endpoint.queryParams} />
              {/if}

              <!-- Headers -->
              {#if allHeaders.length > 0}
                <div>
                  <h4 class="text-sm font-semibold text-foreground mb-3">Headers</h4>
                  <div class="space-y-2">
                    {#each allHeaders as header, idx}
                      <div class="flex flex-col gap-1">
                        <div class="flex items-center gap-2">
                          <code class="text-sm font-mono text-foreground">{header.name}</code>
                          <span class="text-xs text-muted-foreground">{header.value}</span>
                        </div>
                        {#if header.description}
                          <p class="text-sm text-muted-foreground">{header.description}</p>
                        {/if}
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}

              <!-- Request Body -->
              {#if endpoint.body}
                <div>
                  <h4 class="text-sm font-semibold text-foreground mb-3">Request Body</h4>
                  {#if endpoint.body.description}
                    <p class="text-sm text-muted-foreground mb-2">
                      {endpoint.body.description}
                    </p>
                  {/if}
                  {#if endpoint.body.example}
                    <CodeBlock
                      code={typeof endpoint.body.example === 'string'
                        ? endpoint.body.example
                        : JSON.stringify(endpoint.body.example, null, 2)}
                      language="json"
                    />
                  {/if}
                </div>
              {/if}

              <!-- Responses -->
              <div>
                <h4 class="text-sm font-semibold text-foreground mb-3">Responses</h4>
                {#if endpoint.successResponse}
                  <ApiResponseDisplay
                    status={endpoint.successResponse.status}
                    description={endpoint.successResponse.description}
                    example={endpoint.successResponse.example}
                    schema={endpoint.successResponse.schema}
                  />
                {/if}
                {#if endpoint.errorResponses}
                  {#each endpoint.errorResponses as response, idx}
                    <ApiResponseDisplay
                      status={response.status}
                      description={response.description}
                      example={response.example}
                      schema={response.schema}
                    />
                  {/each}
                {/if}
              </div>

              <!-- Code Examples -->
              {#if endpoint.examples && endpoint.examples.length > 0}
                <div>
                  <h4 class="text-sm font-semibold text-foreground mb-3">Examples</h4>
                  {#each endpoint.examples as example, idx}
                    <div class="mb-3">
                      <p class="text-xs font-semibold text-muted-foreground mb-2">
                        {example.title}
                      </p>
                      <CodeBlock code={example.code} language={example.language} />
                    </div>
                  {/each}
                </div>
              {/if}

              <!-- API Playground -->
              {#if showPlayground}
                <ApiPlayground
                  method={endpoint.method}
                  path={endpoint.path}
                  baseUrl={apiSpec?.baseUrl}
                  headers={Object.fromEntries(allHeaders.map((h) => [h.name, h.value]))}
                  pathParams={endpoint.pathParams}
                  defaultBody={endpoint.body?.example
                    ? typeof endpoint.body.example === 'string'
                      ? endpoint.body.example
                      : JSON.stringify(endpoint.body.example, null, 2)
                    : undefined}
                />
              {/if}
            </div>
          {/snippet}
        </AccordionItem>
      {/each}
    </Accordion>
  </div>
{/if}
