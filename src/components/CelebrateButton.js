"use client";

import { useState } from "react";

export default function CelebrateButton() {
  // the tapping-hand hint shows until the button has been clicked once
  const [clicked, setClicked] = useState(false);

  const celebrate = (e) => {
    setClicked(true);
    const r = e.currentTarget.getBoundingClientRect();
    window.dispatchEvent(
      new CustomEvent("pfec:celebrate", {
        detail: { x: r.left + r.width / 2, y: r.top, count: 10, confetti: true },
      })
    );
  };

  return (
    <span className="celebrate-wrap">
      {/* pulsing ring behind the button: animates transform/opacity only (no per-frame repaint) */}
      <span className="celebrate-ring" aria-hidden="true" />
      <button type="button" onClick={celebrate} className="celebrate-btn">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5.8 11.3 2 22l10.7-3.8" />
          <path d="M4 3h.01M22 8h.01M15 2h.01M22 20h.01" />
          <path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" />
          <path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17" />
          <path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98c-.7.1-1.22.72-1.22 1.43V7" />
          <path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z" />
        </svg>
        Celebrate with us
      </button>

      {/* animated hand: glides in, taps the button (gold ripple at the fingertip), glides away — on a loop */}
      {!clicked && (
        <span className="tap-hint" aria-hidden="true">
          <span className="tap-ripple" />
          <svg className="tap-hand" viewBox="0 0 24 24" width="34" height="34">
            <path
              d="M10 9.5V4a2 2 0 0 0-4 0v10l-1.59-1.59a2 2 0 0 0-2.83 2.82l3.6 3.6C6.67 20.31 8.37 22 11.17 22H14a8 8 0 0 0 8-8v-3a2 2 0 0 0-4 0v-1a2 2 0 0 0-4 0V9a2 2 0 0 0-4 0z"
              fill="#ffffff"
              stroke="#0b0b2b"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M14 10v2M18 11v2M10 9.5V12" fill="none" stroke="#0b0b2b" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </span>
      )}
    </span>
  );
}
