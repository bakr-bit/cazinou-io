export type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassValue[]
  | {[key: string]: boolean | string | number | null | undefined}

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = []

  const parse = (value: ClassValue) => {
    if (!value) return

    if (typeof value === 'string' || typeof value === 'number') {
      classes.push(String(value))
      return
    }

    if (Array.isArray(value)) {
      value.forEach(parse)
      return
    }

    if (typeof value === 'object') {
      for (const [key, condition] of Object.entries(value)) {
        if (condition) {
          classes.push(key)
        }
      }
    }
  }

  inputs.forEach(parse)

  return classes.join(' ')
}
