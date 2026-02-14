<script lang="ts">
  import { setConfigContext } from '$lib/stores/config.js';
  import type { SpecraConfig } from '$lib/config.types.js';

  interface Props {
    config: SpecraConfig;
  }

  let { config }: Props = $props();
  setConfigContext(config);
</script>

<slot />
