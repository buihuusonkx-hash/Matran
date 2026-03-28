import { useEffect, useRef } from 'react';
import renderMathInElement from 'katex/dist/contrib/auto-render';
import 'katex/dist/katex.min.css';

/**
 * Hook to automatically render LaTeX in a component's ref or the whole document.
 * It looks for delimiters like $...$ and $$...$$.
 */
export function useMathRender(dependencies: any[] = []) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const target = containerRef.current || document.body;
    
    renderMathInElement(target, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true },
      ],
      throwOnError: false,
    });
  }, dependencies);

  return containerRef;
}
