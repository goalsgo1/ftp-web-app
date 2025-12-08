import { useEffect, RefObject } from 'react';

/**
 * 외부 클릭을 감지하는 커스텀 훅
 * 
 * @param ref 감지할 요소의 ref
 * @param handler 외부 클릭 시 실행할 핸들러 함수
 * 
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * useClickOutside(ref, () => {
 *   setIsOpen(false);
 * });
 * ```
 */
export const useClickOutside = (
  ref: RefObject<HTMLElement>,
  handler: () => void
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler]);
};

