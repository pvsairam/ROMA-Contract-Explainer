export function cn(...cls: any[]) {
  return cls.filter(Boolean).join(" ");
}
