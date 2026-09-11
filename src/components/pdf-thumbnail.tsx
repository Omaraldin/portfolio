"use client";

import { useEffect, useRef, useState } from "react";

/** Width the first page is rendered at. Height follows the page's own ratio. */
const RENDER_WIDTH = 600;

type State = "loading" | "ready" | "failed";

/**
 * Renders the first page of a PDF to a canvas.
 *
 * pdf.js is imported dynamically so its ~350KB never enters the main bundle,
 * and the work only happens once the card scrolls into view — a page of
 * certificates would otherwise decode every document on load.
 */
export function PdfThumbnail({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const render = async () => {
      try {
        const pdfjs = await import("pdfjs-dist");

        // The worker is served as a static file rather than bundled, which is
        // what pdf.js expects and keeps it out of the main chunk.
        pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdf.worker.min.mjs";

        const task = pdfjs.getDocument({ url: src });
        cleanup = () => void task.destroy();

        const pdf = await task.promise;
        if (cancelled) return;

        const page = await pdf.getPage(1);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: RENDER_WIDTH / base.width });

        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // A PDF page carries no background of its own, and pdf.js clears the
        // canvas before drawing — so the white sheet has to come from the
        // element's CSS background rather than from a fill painted here.
        await page.render({ canvas, canvasContext: context, viewport }).promise;
        if (cancelled) return;

        setState("ready");
      } catch (error) {
        // A missing or corrupt file falls back to a label rather than leaving a
        // permanent blank. The reason is logged because a silent failure here
        // is indistinguishable from a document that simply has not loaded.
        if (!cancelled) {
          console.error(`[PdfThumbnail] Could not render ${src}:`, error);
          setState("failed");
        }
      }
    };

    /*
      The observer fires once with the element's initial state, which is what
      starts the render for a card that is already on screen. Effects run before
      the browser has laid the grid out, so that first callback can report a
      zero-height box as not intersecting — hence the explicit check rather than
      relying on the callback alone.
    */
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        void render();
      },
      { rootMargin: "300px" },
    );

    observer.observe(wrap);

    // A layout pass may not have happened yet when the observer is attached, so
    // anything already within the viewport is started directly.
    const rect = wrap.getBoundingClientRect();
    const nearViewport =
      rect.top < window.innerHeight + 300 && rect.bottom > -300;
    if (nearViewport || rect.height === 0) {
      observer.disconnect();
      void render();
    }

    return () => {
      cancelled = true;
      observer.disconnect();
      cleanup?.();
    };
  }, [src]);

  return (
    <div ref={wrapRef} className={className}>
      {state === "failed" ? (
        <span className="grid h-full w-full place-items-center font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">
          PDF
        </span>
      ) : (
        // `contain` rather than `cover`: a certificate cropped to fill the box
        // loses exactly the border and seal that make it recognisable.
        <canvas
          ref={canvasRef}
          className={`h-full w-full bg-white object-contain transition-opacity duration-300 ${
            state === "ready" ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
