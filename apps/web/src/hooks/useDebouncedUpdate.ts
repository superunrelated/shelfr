import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Returns [localValue, setLocalValue] that tracks the source value
 * but debounces calls to onSave so typing isn't interrupted.
 */
export function useDebouncedUpdate<T>(
  sourceValue: T,
  onSave: (value: T) => void,
  delay = 500
): [T, (value: T) => void] {
  const [local, setLocal] = useState(sourceValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  // Sync from source when it changes externally (e.g. selecting a different product)
  useEffect(() => {
    setLocal(sourceValue);
  }, [sourceValue]);

  const setValue = useCallback(
    (value: T) => {
      setLocal(value);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        onSaveRef.current(value);
      }, delay);
    },
    [delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return [local, setValue];
}
