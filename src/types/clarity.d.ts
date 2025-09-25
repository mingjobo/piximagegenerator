interface Window {
  clarity: (
    action: "set" | "identify" | "consent" | "upgrade" | "event" | "metadata",
    ...args: any[]
  ) => void;
}

declare global {
  interface Window {
    clarity: (
      action: "set" | "identify" | "consent" | "upgrade" | "event" | "metadata",
      ...args: any[]
    ) => void;
  }
}

export {};