import { useState } from "react";
export const useResizableColumns = (columns: string[]) => {
  const [widths, setWidths] = useState<Record<string, number>>(
    Object.fromEntries(columns.map((c) => [c, 80])) // largeur initiale
  );

  const startResize = (col: string, e: React.MouseEvent) => {
    const startX = e.clientX;
    const startWidth = widths[col];

    const onMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + (e.clientX - startX);
      setWidths((prev) => ({ ...prev, [col]: Math.max(20, newWidth) }));
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return { widths, startResize };
};