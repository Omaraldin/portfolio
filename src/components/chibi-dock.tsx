"use client";

import { useEffect, useRef, useState } from "react";
import { Chibi } from "./chibi";
import { Emoji } from "./emoji";

/**
 * The chibi who stands on the footer card.
 *
 * The strip he stands in sits between the page and the footer, and on phones
 * it is `position: sticky; bottom: 0`. So while you scroll he rides along the
 * bottom of the screen — only his head peeking up from the edge, ignoring
 * taps. When the footer arrives, the strip reaches its own place in the page,
 * stops sticking, and he rises to stand on the card with his speech bubble. No scroll maths — the landing is
 * just sticky positioning running out of room.
 *
 * On wider screens the strip is static: he simply stands on the footer, and
 * the header peek does the travelling.
 */
export function ChibiDock() {
  const sentinel = useRef<HTMLDivElement>(null);
  /*
    Starts travelling: on a phone the first paint is almost always mid-page,
    and a full-size chibi with a goodbye bubble there would be wrong until
    scripts run. Desktop never travels, so its landed look is set in CSS (md:)
    rather than waiting on this state.
  */
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;

    /*
      The sentinel sits where the strip ends, at the footer's top edge. Once
      that point is on screen (or scrolled past), the strip is in its natural
      place — he has landed.
    */
    const observer = new IntersectionObserver(([entry]) => {
      setDocked(
        entry.isIntersecting ||
          entry.boundingClientRect.top < window.innerHeight,
      );
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        aria-hidden
        className="no-print pointer-events-none sticky bottom-0 z-40 h-28 overflow-hidden px-3 sm:h-36 sm:px-6 md:static"
      >
        <div className="relative mx-auto h-full w-full max-w-[1240px]">
          <div className="absolute right-6 bottom-0 flex items-end gap-2 sm:right-16">
            <p
              style={{ fontFamily: "var(--font-hand)" }}
              className={`mb-16 rounded-[16px] rounded-br-sm border-[1.5px] border-ink bg-[color:var(--wb-bg)] px-4 py-1.5 text-[18px] whitespace-nowrap text-ink transition-all duration-300 ${
                docked
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-2 opacity-0 md:pointer-events-auto md:translate-y-0 md:opacity-100"
              }`}
            >
              see you next post <Emoji char="👋" />
            </p>
            {/*
              Travelling, he sinks below the strip's bottom edge — which, while
              the strip is stuck, is the bottom of the screen — so only his hair
              and eyes peek up, the same way the header peek hangs down. The
              strip clips him, so nothing of him spills over the page. Landed,
              he rises to stand on the card.
            */}
            <div
              className={`transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                docked
                  ? "pointer-events-auto translate-y-0"
                  : "translate-y-[52%] md:pointer-events-auto md:translate-y-0"
              }`}
            >
              <Chibi decorative className="h-28 sm:h-36" sizes="110px" />
            </div>
          </div>
        </div>
      </div>
      <div ref={sentinel} aria-hidden className="h-0" />
    </>
  );
}
