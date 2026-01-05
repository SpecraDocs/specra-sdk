"use client"

import { cloneElement, isValidElement, ReactNode } from "react"
import { useSidebarState } from "./sidebar-state-provider"

interface HeaderWithMenuProps {
  header: ReactNode
}

/**
 * Client component that wraps the header and injects mobile menu toggle.
 * This is a small client island that doesn't wrap the main content.
 */
export function HeaderWithMenu({ header }: HeaderWithMenuProps) {
  const { toggle } = useSidebarState()

  // Clone header and pass onMenuClick prop if it's a valid React element
  const headerWithProps = isValidElement(header)
    ? cloneElement(header as React.ReactElement<any>, {
        onMenuClick: toggle,
      })
    : header

  return <>{headerWithProps}</>
}
