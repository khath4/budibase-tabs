<script>
  // tab: { id, title, icon }
  let {
    tab,
    iconsOnly = false,
    iconSize = "1em",
    legacyIconSize = "ri-1x",
    selectedColor,
    isSelected = false,
    onselect,
    register,
  } = $props()

  let element = $state()

  $effect(() => {
    register?.(element)
  })

  // Remix icons (ri-*) come from apps built on Budibase 2.x,
  // Phosphor icon names come from the 3.x icon picker
  let isLegacyIcon = $derived(
    !!tab.icon && (tab.icon.startsWith("ri-") || tab.icon.includes("remix"))
  )
  let iconClass = $derived(
    !tab.icon
      ? ""
      : isLegacyIcon
        ? `${tab.icon} ${legacyIconSize}`
        : `ph ph-${tab.icon.replace(/^ph-/, "")}`
  )
  let color = $derived(
    isSelected ? selectedColor : "var(--spectrum-global-color-gray-600)"
  )

  const onKeydown = e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onselect?.()
    }
  }
</script>

<div
  bind:this={element}
  onclick={() => onselect?.()}
  onkeydown={onKeydown}
  class="spectrum-Tabs-item"
  class:is-selected={isSelected}
  role="tab"
  aria-selected={isSelected}
  tabindex="0"
  style="color: {color};"
>
  {#if tab.icon}
    <i class={iconClass} style="font-size: {iconSize};"></i>
  {/if}
  {#if !iconsOnly}
    <span class="spectrum-Tabs-itemLabel">{tab.title}</span>
  {/if}
</div>

<style>
  .spectrum-Tabs-item {
    display: flex;
    flex-direction: row;
    padding: 0px 4px;
    color: var(--spectrum-global-color-gray-600);
    align-items: center;
    gap: 8px;
  }
</style>
