import useMousePosition from "@/utils/useMousePosition";
import { useEffect, useState } from "react";

interface MousePopupProps {
  isOpen: boolean;
  width?: number;
  height?: number;
  fadeDuration?: number;
  children: React.ReactNode;
}

export function MousePopup({ isOpen, width, height, fadeDuration = 150, children }: MousePopupProps) {
  const { x, y } = useMousePosition();
  const [mounted, setMounted] = useState(isOpen);
  const [visible, setVisible] = useState(isOpen);

  // Handles the mounting and visibility of the popup based on the isOpen and fadeDuration props
  useEffect(() => {
    if (isOpen) {
      const t1 = setTimeout(() => setMounted(true), 0);
      const t2 = setTimeout(() => setVisible(true), 10);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      const t1 = setTimeout(() => setVisible(false), 0);
      const t2 = setTimeout(() => setMounted(false), fadeDuration);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isOpen, fadeDuration]);

  // Don't render anything if not mounted
  if (!mounted) return null;

  return (
    <div
      className="mousePopupRoot"
      style={{
        top: y,
        left: x,
        width,
        height,
        opacity: visible ? 1 : 0,
        transition: `opacity ${fadeDuration}ms ease`,
      }}
    >
      {children}
    </div>
  );
}
