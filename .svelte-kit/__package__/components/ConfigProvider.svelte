<script lang="ts">
  import { setConfigContext } from '../stores/config.js';
  import type { SpecraConfig } from '../config.types.js';

  interface Props {
    config: SpecraConfig;
  }

  let { config }: Props = $props();
  setConfigContext(config);
</script>

<slot />
