"use client"

import { ReactNode, useEffect, useRef, useMemo } from "react"
import { MobileDocLayout } from "./mobile-doc-layout"
import { useTabContext } from "./tab-context"
import type { SpecraConfig } from "@/lib/config"
import type { Doc } from "@/lib/mdx"

interface DocLayoutWrapperProps {
  header: ReactNode
  docs: Doc[]
  version: string
  children: ReactNode
  toc: ReactNode
  config: SpecraConfig
  currentPageTabGroup?: string
}

export function DocLayoutWrapper({ header, docs, version, children, toc, config, currentPageTabGroup }: DocLayoutWrapperProps) {
  // Use global tab context instead of local state
  const { activeTabGroup, setActiveTabGroup } = useTabContext()
  const lastPageTabGroupRef = useRef<string | undefined>(undefined)
  const hasInitialized = useRef(false)

  // Compute the initial/expected active tab synchronously (runs on both server and client)
  const expectedActiveTab = useMemo(() => {
    if (!config.navigation?.tabGroups || config.navigation.tabGroups.length === 0) {
      return undefined
    }

    // If we have a currentPageTabGroup, that's what should be active
    if (currentPageTabGroup) {
      return currentPageTabGroup
    }

    // Otherwise, default to the first tab
    return config.navigation.tabGroups[0]?.id
  }, [currentPageTabGroup, config.navigation?.tabGroups])

  // Set tab based on page's tab group
  useEffect(() => {
    // If no tab groups configured, nothing to do
    if (!config.navigation?.tabGroups || config.navigation.tabGroups.length === 0) {
      return
    }

    // If we have an expected tab and it's different from current, update it
    if (expectedActiveTab && expectedActiveTab !== activeTabGroup) {
      setActiveTabGroup(expectedActiveTab)
      lastPageTabGroupRef.current = expectedActiveTab
      hasInitialized.current = true
    }
  }, [expectedActiveTab, setActiveTabGroup, activeTabGroup, config.navigation?.tabGroups])

  return (
    <MobileDocLayout
      header={header}
      docs={docs}
      version={version}
      toc={toc}
      config={config}
      activeTabGroup={expectedActiveTab || activeTabGroup}
      onTabChange={setActiveTabGroup}
    >
      {children}
    </MobileDocLayout>
  )
}
