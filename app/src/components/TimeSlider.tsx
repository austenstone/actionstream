"use client";

import { useState } from "react";

/**
 * DVR-style time slider for scrubbing through workflow history.
 */
export function TimeSlider() {
  const [isLive, setIsLive] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Time range: last 24 hours
  const rangeStart = Date.now() - 24 * 60 * 60 * 1000;
  const rangeEnd = Date.now();

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setCurrentTime(value);
    if (value < rangeEnd - 60000) {
      setIsLive(false);
    }
  };

  const goLive = () => {
    setIsLive(true);
    setCurrentTime(Date.now());
  };

  return (
    <div className="border border-gh-border rounded-lg bg-gh-dark p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={goLive}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              isLive
                ? "bg-gh-danger text-white"
                : "bg-gh-border text-gh-text-secondary hover:text-gh-text"
            }`}
          >
            {isLive ? "● LIVE" : "○ GO LIVE"}
          </button>
          <span className="text-sm text-gh-text-secondary">
            {formatDate(currentTime)} {formatTime(currentTime)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gh-text-secondary">
          <button className="hover:text-gh-text p-1" title="Rewind">⏪</button>
          <button className="hover:text-gh-text p-1" title="Play/Pause">
            {isLive ? "⏸" : "▶️"}
          </button>
          <button className="hover:text-gh-text p-1" title="Fast Forward">⏩</button>
        </div>
      </div>

      <input
        type="range"
        min={rangeStart}
        max={rangeEnd}
        value={isLive ? rangeEnd : currentTime}
        onChange={handleSliderChange}
        className="w-full cursor-pointer"
        disabled={isLive}
      />

      <div className="flex justify-between text-xs text-gh-text-secondary mt-1">
        <span>{formatTime(rangeStart)}</span>
        <span>24h ago</span>
        <span>{formatTime(rangeEnd)}</span>
      </div>
    </div>
  );
}
