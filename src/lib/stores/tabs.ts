import { writable, get } from 'svelte/store'
import { browser } from '$app/environment'

const TAB_STORAGE_KEY = 'specra-active-tab-group'

function getInitialTab(defaultTab: string): string {
  if (!browser) return defaultTab
  try {
    const stored = localStorage.getItem(TAB_STORAGE_KEY)
    if (stored) return stored
  } catch {
    // Ignore localStorage errors
  }
  return defaultTab
}

function createTabStore() {
  const { subscribe, set, update } = writable<string>('')

  function initialize(defaultTab: string) {
    const initial = getInitialTab(defaultTab)
    set(initial)
  }

  function setActiveTab(tabId: string) {
    set(tabId)
    if (browser) {
      try {
        localStorage.setItem(TAB_STORAGE_KEY, tabId)
      } catch {
        // Ignore localStorage errors
      }
    }
  }

  return {
    subscribe,
    set: setActiveTab,
    initialize,
    get: () => get({ subscribe })
  }
}

export const tabStore = createTabStore()
