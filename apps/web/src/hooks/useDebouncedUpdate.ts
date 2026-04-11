import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Returns [localValue, setLocalValue] that tracks the source value
 * but debounces calls to onSave so typing isn't interrupted.
 * Flushes pending saves when sourceValue changes (e.g. switching products)
 * or on unmount.
 */
export function useDebouncedUpdate<T>(
  sourceValue: T,
  onSave: (value: T) => void,
  delay = 500
): [T, (value: T) => void] {
  const [local, setLocal] = useState(sourceValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<T | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  // Flush any pending save
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (pendingRef.current !== null) {
      onSaveRef.current(pendingRef.current);
      pendingRef.current = null;
    }
  }, []);

  // Sync from source when it changes externally — flush pending first
  useEffect(() => {
    flush();
    setLocal(sourceValue);
  }, [sourceValue, flush]);

  const setValue = useCallback(
    (value: T) => {
      setLocal(value);
      pendingRef.current = value;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        onSaveRef.current(value);
        pendingRef.current = null;
        timeoutRef.current = null;
      }, delay);
    },
    [delay]
  );

  // Flush on unmount
  useEffect(() => {
    return flush;
  }, [flush]);

  return [local, setValue];
}
