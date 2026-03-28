import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export function useMathRender(dependencies: any[]) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll('.math-tex');
      elements.forEach((el) => {
        const tex = el.getAttribute('data-tex') || el.textContent || '';
        try {
          katex.render(tex, el as HTMLElement, {
            throwOnError: false,
            displayMode: el.classList.contains('display-mode'),
          });
        } catch (err) {
          console.error('KaTeX error:', err);
        }
      });
    }
  }, dependencies);

  return containerRef;
}

export function MathText({ tex, displayMode = false }: { tex: string; displayMode?: boolean }) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (spanRef.current) {
      katex.render(tex, spanRef.current, {
        throwOnError: false,
        displayMode,
      });
    }
  }, [tex, displayMode]);

  return <span ref={spanRef} />;
}
