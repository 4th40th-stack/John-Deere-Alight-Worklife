"use client"

import { createContext, useContext, type ReactNode } from "react"

type Ctx = { allowLocalTesting: boolean }

const TargetFlowGateContext = createContext<Ctx | null>(null)

export function TargetFlowGateProvider({
  children,
  allowLocalTesting,
}: {
  children: ReactNode
  allowLocalTesting: boolean
}) {
  return (
    <TargetFlowGateContext.Provider value={{ allowLocalTesting }}>
      {children}
    </TargetFlowGateContext.Provider>
  )
}

export function useTargetFlowGate(): Ctx {
  const v = useContext(TargetFlowGateContext)
  return v ?? { allowLocalTesting: false }
}
