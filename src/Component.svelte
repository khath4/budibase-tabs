<script>
  import "@spectrum-css/tabs/dist/index-vars.css"
  import { getContext, setContext, onDestroy } from "svelte"
  import { get, writable } from "svelte/store"
  import Tab from "./Tab.svelte"
  import { TABS_CONTEXT_KEY, TAB_CONTAINER_CONTEXT_KEY } from "./tabsContext.js"

  let {
    size = "M",
    direction = "horizontal",
    centered = false,
    quiet = false,
    compact = false,
    emphasized = false,
    iconsOnly = false,
    emphasizedColor = "var(--spectrum-global-color-indigo-600)",
    children,
  } = $props()

  const { styleable, builderStore } = getContext("sdk")
  const component = getContext("component")

  // Tab list and selection, shared with the Tab Containers through context
  const tabs = writable([])
  const selected = writable(null)

  const sameInfo = (a, b) => a.title === b.title && a.icon === b.icon

  setContext(TABS_CONTEXT_KEY, {
    tabs: { subscribe: tabs.subscribe },
    selected: { subscribe: selected.subscribe },
    register(id, info) {
      tabs.update(list =>
        list.some(tab => tab.id === id) ? list : [...list, { id, ...info }]
      )
      // the first tab is selected; tabs shown later (e.g. by conditions) do
      // not take the selection away from the current one
      selected.update(current => current ?? id)
    },
    update(id, info) {
      tabs.update(list => {
        const index = list.findIndex(tab => tab.id === id)
        if (index === -1 || sameInfo(list[index], info)) {
          return list
        }
        const next = list.slice()
        next[index] = { id, ...info }
        return next
      })
    },
    unregister(id) {
      let remaining = []
      tabs.update(list => (remaining = list.filter(tab => tab.id !== id)))
      selected.update(current =>
        current === id ? (remaining[0]?.id ?? null) : current
      )
    },
    select(id) {
      selected.set(id)
    },
  })

  // A Tabs component inside a Tab Container starts a new level of tabs
  setContext(TAB_CONTAINER_CONTEXT_KEY, false)

  const iconSizes = { S: "0.875em", M: "1em", L: "1.3333em", XL: "1.5em" }
  const legacyIconSizes = { S: "ri-sm", M: "ri-1x", L: "ri-lg", XL: "ri-xl" }

  let isVertical = $derived(direction === "vertical")
  let selectedColor = $derived(
    emphasized
      ? emphasizedColor || "var(--spectrum-global-color-indigo-600)"
      : "var(--spectrum-global-color-gray-900)"
  )

  // Selection indicator position, measured from the rendered tab items
  let container = $state()
  let itemElements = {}
  let indicator = $state(null)

  const measure = () => {
    const element = itemElements[get(selected)]
    if (!container || !element) {
      indicator = null
      return
    }
    const box = container.getBoundingClientRect()
    const item = element.getBoundingClientRect()
    indicator = isVertical
      ? {
          top: item.top - box.top,
          left: item.left - box.left - 8,
          width: 2,
          height: item.height,
        }
      : {
          top: item.bottom - box.top,
          left: item.left - box.left,
          width: item.width,
          height: 2,
        }
  }

  let frame
  const scheduleMeasure = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(measure)
  }

  $effect(() => {
    // re-measure when anything that moves the tab items changes
    $selected
    $tabs
    isVertical
    size
    quiet
    compact
    centered
    iconsOnly
    scheduleMeasure()
  })

  $effect(() => {
    if (!container || typeof ResizeObserver === "undefined") {
      return
    }
    const observer = new ResizeObserver(scheduleMeasure)
    observer.observe(container)
    return () => observer.disconnect()
  })

  onDestroy(() => cancelAnimationFrame(frame))
</script>

<div
  use:styleable={$component.styles}
  class="outer_container"
  class:vertical={isVertical}
>
  {#if $tabs.length > 0}
    <div
      bind:this={container}
      class:spectrum-Tabs--quiet={quiet}
      class:spectrum-Tabs--vertical={isVertical}
      class:spectrum-Tabs--horizontal={!isVertical}
      class:spectrum-Tabs--compact={compact}
      class="spectrum-Tabs spectrum-Tabs--size{size}"
      style="--pos_justify: {centered ? 'center' : 'flex-start'}"
    >
      {#each $tabs as tab (tab.id)}
        <Tab
          {tab}
          {iconsOnly}
          iconSize={iconSizes[size] || iconSizes.M}
          legacyIconSize={legacyIconSizes[size] || legacyIconSizes.M}
          {selectedColor}
          isSelected={$selected === tab.id}
          onselect={() => selected.set(tab.id)}
          register={element => (itemElements[tab.id] = element)}
        />
      {/each}

      {#if indicator}
        <div
          class="spectrum-Tabs-selectionIndicator"
          style="background-color: {selectedColor}; width: {indicator.width}px; height: {indicator.height}px; left: {indicator.left}px; top: {indicator.top}px;"
        ></div>
      {/if}
    </div>
  {:else if $builderStore.inBuilder}
    <div>Please add some Tab Containers to get started</div>
  {/if}
  <div class="spectrum-Tabs-content">
    {@render children?.()}
  </div>
</div>

<style>
  .outer_container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .vertical {
    flex-direction: row;
  }
  .spectrum-Tabs--quiet {
    display: flex;
    border-color: transparent !important;
    justify-content: var(--pos_justify) !important;
  }
  .spectrum-Tabs {
    position: relative;
    border-bottom-color: var(--spectrum-global-color-gray-200);
    justify-content: var(--pos_justify);
  }
  .spectrum-Tabs-content {
    flex-grow: 1;
  }
  .spectrum-Tabs-selectionIndicator {
    position: absolute;
    transition: all 200ms;
    background-color: var(--spectrum-global-color-gray-900);
  }
  .spectrum-Tabs--vertical {
    border-color: var(--spectrum-global-color-gray-200);
  }
</style>
