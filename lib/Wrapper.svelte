<script>
  import Component from "../src/Component.svelte"

  let { children, ...props } = $props()
</script>

<svelte:boundary>
  <Component {...props} {children} />
  {#snippet failed(error)}
    <div class="plugin-error">
      <b>There was an error running the "bb-plugin-Tabs" plugin:</b>
      <div class="detail">{error?.message || error}</div>
    </div>
  {/snippet}
</svelte:boundary>

<style>
  .plugin-error {
    background: var(--spectrum-global-color-red-400);
    color: white;
    border-radius: 4px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .detail {
    font-family: monospace;
    font-size: 10px;
    padding: 8px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    max-height: 100px;
    overflow: auto;
  }
</style>
