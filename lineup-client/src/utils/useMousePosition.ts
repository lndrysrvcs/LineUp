import { useEffect, useState } from "react";

/** A hook for keeping track of the user's current mouse position.
 *
 * @returns The x and y position of the mouse (in pixels from the top left).
 */
export default function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return pos;
}
