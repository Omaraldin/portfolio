"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/** Intrinsic size of both frames. They share it, so they stack exactly. */
const WIDTH = 800;
const HEIGHT = 1098;

/**
 * The chibi mascot. Two frames — eyes open and eyes closed — stacked in one
 * box, with the closed frame shown briefly at random intervals so he blinks,
 * now and then twice. Hovering shuts his eyes into a happy squint and gives a
 * small hop.
 *
 * Both frames are always in the DOM, so a blink is an opacity flip on an image
 * that is already decoded, never a fetch — no flicker on the first blink.
 */
export function Chibi({
  className = "",
  sizes = "240px",
  priority = false,
  label = "Chibi illustration of Omar",
  decorative = false,
}: {
  /** Sizing lives on the wrapper; the frames fill it. */
  className?: string;
  sizes?: string;
  priority?: boolean;
  label?: string;
  /** Pure garnish: hidden from assistive tech instead of announced. */
  decorative?: boolean;
}) {
  const [blinking, setBlinking] = useState(false);
  const [happy, setHappy] = useState(false);

  useEffect(() => {
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) =>
      timers.push(window.setTimeout(fn, ms));

    const blink = () => {
      setBlinking(true);
      later(() => setBlinking(false), 140);
      // One blink in four is a double, which is what makes it read as alive.
      if (Math.random() < 0.25) {
        later(() => setBlinking(true), 280);
        later(() => setBlinking(false), 420);
      }
      later(blink, 2400 + Math.random() * 3200);
    };

    later(blink, 1200 + Math.random() * 2000);
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const closed = blinking || happy;

  return (
    <div
      {...(decorative
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": label })}
      onPointerEnter={() => setHappy(true)}
      onPointerLeave={() => setHappy(false)}
      className={`relative select-none ${className}`}
      style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
    >
      <div
        className={`absolute inset-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          happy ? "-translate-y-2 -rotate-2" : ""
        }`}
      >
        <Image
          src="/mora-eyes-open.png"
          alt=""
          width={WIDTH}
          height={HEIGHT}
          sizes={sizes}
          priority={priority}
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain"
        />
        <Image
          src="/mora-eyes-closed.png"
          alt=""
          width={WIDTH}
          height={HEIGHT}
          sizes={sizes}
          priority={priority}
          draggable={false}
          className={`absolute inset-0 h-full w-full object-contain ${
            closed ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
    </div>
  );
}
