// Shared contract between the Tabs and Tab Container plugins.
// Both plugins are separate bundles, so they only share these string keys and
// the shape of the object stored under TABS_CONTEXT_KEY:
//   register(id, { title, icon }), update(id, { title, icon }), unregister(id),
//   select(id), tabs (readable list), selected (readable id)
export const TABS_CONTEXT_KEY = "bb-plugin-tabs:context"
export const TAB_CONTAINER_CONTEXT_KEY = "bb-plugin-tabs:in-tab-container"
