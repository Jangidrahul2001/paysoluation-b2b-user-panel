
import { useEffect } from "react";

export function useClickOutside(ref, handler, ignoreSelector) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        if (ignoreSelector && event.target.closest(ignoreSelector)) {
          return;
        }
        handler();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, handler]);
}
