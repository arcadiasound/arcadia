import { useEffect, useMemo, useRef } from "react";
import debounce from "lodash.debounce";

export type CallbackType = () => void;

export const useDebounce = (
  callback: CallbackType,
  delay: number = 1000
): CallbackType => {
  const ref = useRef<CallbackType | null>(null);

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    const func = () => {
      ref.current?.();
    };

    return debounce(func, delay);
  }, [delay]);

  return debouncedCallback;
};
