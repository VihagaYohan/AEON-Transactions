import { useCallback, useEffect, useRef, useState } from 'react';

/** A boolean that resets after the duration. Its timer is cleared on unmount. */
export const useTransientFlag = (durationMs = 2000) => {
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const trigger = useCallback(() => {
    clearTimeout(timer.current);
    setActive(true);
    timer.current = setTimeout(() => setActive(false), durationMs);
  }, [durationMs]);

  return [active, trigger] as const;
};
