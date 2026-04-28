declare module "react" {
  export function useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void;
  export function useMemo<T>(factory: () => T, deps: readonly unknown[]): T;
  export function useRef<T>(initialValue: T): { current: T };
  export function useRef<T = undefined>(initialValue?: T): { current: T };
  export function useState<T>(initialValue: T): [T, (next: T) => void];
  export function useState<T = undefined>(initialValue?: T): [T, (next: T) => void];
}
