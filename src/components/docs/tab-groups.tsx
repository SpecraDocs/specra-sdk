"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Icon } from "./icon"
import type { TabGroup } from "@/lib/config.types"

interface TabGroupsProps {
  tabGroups: TabGroup[]
  activeTabId?: string
  onTabChange?: (tabId: string) => void
}

export function TabGroups({ tabGroups, activeTabId, onTabChange }: TabGroupsProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const activeTab = activeTabId || tabGroups[0]?.id || ""
  const activeTabData = tabGroups.find(tab => tab.id === activeTab)

  const handleTabChange = (tabId: string) => {
    onTabChange?.(tabId)
    setDropdownOpen(false)
  }

  if (!tabGroups || tabGroups.length === 0) {
    return null
  }

  return (
    <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6">
        {/* Mobile Dropdown */}
        <div className="md:hidden relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-foreground"
            aria-label="Select tab"
            aria-expanded={dropdownOpen}
          >
            <div className="flex items-center gap-2">
              {activeTabData?.icon && <Icon icon={activeTabData.icon} size={16} className="shrink-0" />}
              {activeTabData?.label}
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 right-0 bg-background border border-border shadow-lg z-50 max-h-[60vh] overflow-y-auto">
                {tabGroups.map((tab) => {
                  const isActive = tab.id === activeTab

                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-left transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      {tab.icon && <Icon icon={tab.icon} size={16} className="shrink-0" />}
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Desktop Tabs */}
        <nav className="hidden md:flex gap-1" aria-label="Documentation tabs">
          {tabGroups.map((tab) => {
            const isActive = tab.id === activeTab

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.icon && <Icon icon={tab.icon} size={16} className="shrink-0" />}
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
