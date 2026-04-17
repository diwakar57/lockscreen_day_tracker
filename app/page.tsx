"use client";

import { useState, useMemo } from "react";

export default function Home() {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState("");
  const [copied, setCopied] = useState(false);

  const apiUrl = useMemo(() => {
    if (typeof window === "undefined" || !startDate || !endDate) return "";
    // Only accept YYYY-MM-DD pattern to prevent any injection
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(startDate) || !datePattern.test(endDate)) return "";
    const origin = window.location.origin;
    // Ensure origin is a safe https/http URL before constructing the link
    if (!/^https?:\/\//.test(origin)) return "";
    return `${origin}/api/wallpaper?start=${startDate}&end=${endDate}`;
  }, [startDate, endDate]);

  async function handleCopy() {
    if (!apiUrl) return;
    try {
      await navigator.clipboard.writeText(apiUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = apiUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            🔒 Lock Screen Widget Generator
          </h1>
          <p className="text-neutral-400 text-sm">
            Generate a dynamic dot-grid wallpaper for your iPhone 15 Pro lock screen.
          </p>
        </div>

        {/* Form */}
        <div className="bg-neutral-900 rounded-2xl p-6 mb-6 border border-neutral-800">
          <h2 className="text-lg font-semibold mb-4 text-neutral-100">
            Set Your Date Range
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="start-date"
                className="block text-sm font-medium text-neutral-300 mb-1"
              >
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white
                           focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-neutral-500
                           [color-scheme:dark]"
              />
            </div>

            <div>
              <label
                htmlFor="end-date"
                className="block text-sm font-medium text-neutral-300 mb-1"
              >
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white
                           focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-neutral-500
                           [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* Generated URL */}
        <div className="bg-neutral-900 rounded-2xl p-6 mb-6 border border-neutral-800">
          <h2 className="text-lg font-semibold mb-3 text-neutral-100">
            Your Wallpaper API URL
          </h2>

          {apiUrl ? (
            <>
              <div className="bg-neutral-800 rounded-lg px-4 py-3 mb-3 break-all text-xs text-neutral-200 font-mono border border-neutral-700">
                {apiUrl}
              </div>
              <button
                onClick={handleCopy}
                className="w-full bg-white text-black font-semibold rounded-lg py-2.5 px-4
                           hover:bg-neutral-200 active:bg-neutral-300 transition-colors duration-150"
              >
                {copied ? "✓ Copied!" : "Copy to Clipboard"}
              </button>
            </>
          ) : (
            <p className="text-neutral-500 text-sm italic">
              Select both a start and end date to generate your URL.
            </p>
          )}
        </div>

        {/* Preview link */}
        {apiUrl && (
          <div className="mb-6 text-center">
            <a
              href={apiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-neutral-400 hover:text-white underline underline-offset-2 transition-colors"
            >
              Preview wallpaper in new tab →
            </a>
          </div>
        )}

        {/* iOS Shortcuts Instructions */}
        <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
          <h2 className="text-lg font-semibold mb-4 text-neutral-100">
            📱 iOS Shortcuts Setup
          </h2>
          <p className="text-neutral-400 text-xs mb-4">
            Set this up as a daily automation to automatically update your lock
            screen wallpaper every night.
          </p>
          <ol className="space-y-3">
            {[
              <>
                Open the{" "}
                <span className="text-white font-medium">Shortcuts</span> app →
                tap{" "}
                <span className="text-white font-medium">Automation</span> →
                tap the{" "}
                <span className="text-white font-medium">+</span> button.
              </>,
              <>
                Choose{" "}
                <span className="text-white font-medium">Time of Day</span>.
                Set the time to{" "}
                <span className="text-white font-medium">12:01 AM</span> and
                select <span className="text-white font-medium">Daily</span>.
              </>,
              <>
                Tap{" "}
                <span className="text-white font-medium">New Blank Automation</span>{" "}
                → tap{" "}
                <span className="text-white font-medium">Add Action</span>.
              </>,
              <>
                Search for and add{" "}
                <span className="text-white font-medium">
                  {'"'}Get Contents of URL{'"'}
                </span>
                . Paste the copied API link into the URL field.
              </>,
              <>
                Tap{" "}
                <span className="text-white font-medium">Add Action</span>{" "}
                again and search for{" "}
                <span className="text-white font-medium">
                  {'"'}Set Wallpaper{'"'}
                </span>
                . Connect it to the contents from the previous step.
              </>,
              <>
                Tap on the{" "}
                <span className="text-white font-medium">Set Wallpaper</span>{" "}
                action and make sure to select{" "}
                <span className="text-white font-medium">Lock Screen</span>{" "}
                only.
              </>,
              <>
                Toggle{" "}
                <span className="text-white font-medium">
                  {'"'}Show Preview{'"'} off
                </span>{" "}
                so the automation runs silently while you sleep.
              </>,
            ].map((step, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-neutral-300 text-sm leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <footer className="mt-8 text-center text-neutral-600 text-xs">
          Designed for iPhone 15 Pro (1179 × 2556)
        </footer>
      </div>
    </main>
  );
}
