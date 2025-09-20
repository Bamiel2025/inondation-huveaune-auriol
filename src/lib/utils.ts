// Simple classnames combiner compatible with shadcn/ui components
// No external deps to avoid install requirements
export type ClassValue =
  | string
  | number
  | null
  | undefined
  | ClassDictionary
  | ClassArray

interface ClassDictionary {
  [id: string]: any
}

interface ClassArray extends Array<ClassValue> {}

function toVal(mix: ClassValue): string {
  let k: string
  let y: string[] = []

  if (typeof mix === "string" || typeof mix === "number") return String(mix)

  if (Array.isArray(mix)) {
    for (let i = 0; i < mix.length; i++) {
      const x = toVal(mix[i])
      if (x) y.push(x)
    }
    return y.join(" ")
  }

  if (mix && typeof mix === "object") {
    for (k in mix as ClassDictionary) {
      if ((mix as ClassDictionary)[k]) y.push(k)
    }
    return y.join(" ")
  }

  return ""
}

export function cn(...inputs: ClassValue[]): string {
  return inputs.map(toVal).filter(Boolean).join(" ")
}