"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface UserSettings {
  startDate: string | null;
  endDate: string | null;
  bgImageUrl: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    startDate: null,
    endDate: null,
    bgImageUrl: null,
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Fetch session + settings ───────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      // Fetch current session via next-auth's session endpoint
      const sessionRes = await fetch("/api/auth/session");
      if (!sessionRes.ok) {
        router.push("/login");
        return;
      }
      const session = await sessionRes.json();
      if (!session?.user?.id) {
        router.push("/login");
        return;
      }
      setUserId(session.user.id);

      const settingsRes = await fetch("/api/user");
      if (settingsRes.ok) {
        const data: UserSettings = await settingsRes.json();
        setSettings(data);
        setStartDate(data.startDate ? data.startDate.split("T")[0] : "");
        setEndDate(data.endDate ? data.endDate.split("T")[0] : "");
      }
    }
    load();
  }, [router]);

  const wallpaperUrl =
    typeof window !== "undefined" && userId
      ? `${window.location.origin}/api/wallpaper/${userId}`
      : "";

  // ── Save date settings ────────────────────────────────────────────────────
  async function handleSaveDates(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaveMsg("✓ Dates saved!");
    } catch {
      setSaveMsg("✗ Could not save dates.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
  }

  // ── Upload background image ───────────────────────────────────────────────
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg("");
    try {
      const form = new FormData();
      form.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error ?? "Upload failed");
      }
      const { url } = await uploadRes.json();

      // Persist the URL to the user record
      const patchRes = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bgImageUrl: url }),
      });
      if (!patchRes.ok) throw new Error("Failed to save image URL");

      setSettings((s) => ({ ...s, bgImageUrl: url }));
      setUploadMsg("✓ Background saved!");
    } catch (err) {
      setUploadMsg(`✗ ${err instanceof Error ? err.message : "Upload failed."}`);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadMsg(""), 4000);
    }
  }

  // ── Remove background image ───────────────────────────────────────────────
  async function handleRemoveImage() {
    setUploading(true);
    setUploadMsg("");
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bgImageUrl: null }),
      });
      if (!res.ok) throw new Error("Failed to remove image");
      setSettings((s) => ({ ...s, bgImageUrl: null }));
      if (fileRef.current) fileRef.current.value = "";
      setUploadMsg("✓ Image removed.");
    } catch {
      setUploadMsg("✗ Could not remove image.");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadMsg(""), 3000);
    }
  }

  // ── Copy shortcut URL ─────────────────────────────────────────────────────
  async function handleCopy() {
    if (!wallpaperUrl) return;
    try {
      await navigator.clipboard.writeText(wallpaperUrl);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = wallpaperUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            🔒 Lock Screen Dashboard
          </h1>
          <p className="text-neutral-400 text-sm">
            Configure your personalised dot-grid wallpaper.
          </p>
        </div>

        {/* ── Date Settings ─────────────────────────────────────────────── */}
        <section className="bg-neutral-900 rounded-2xl p-6 mb-6 border border-neutral-800">
          <h2 className="text-lg font-semibold mb-4 text-neutral-100">
            📅 Date Range
          </h2>
          <form onSubmit={handleSaveDates} className="space-y-4">
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
                required
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
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-white text-black font-semibold rounded-lg py-2.5 px-4
                         hover:bg-neutral-200 active:bg-neutral-300 transition-colors duration-150
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : "Save Dates"}
            </button>
            {saveMsg && (
              <p className="text-sm text-center text-neutral-300">{saveMsg}</p>
            )}
          </form>
        </section>

        {/* ── Background Image ───────────────────────────────────────────── */}
        <section className="bg-neutral-900 rounded-2xl p-6 mb-6 border border-neutral-800">
          <h2 className="text-lg font-semibold mb-4 text-neutral-100">
            🖼 Background Image
          </h2>

          {settings.bgImageUrl && (
            <div className="mb-4 rounded-lg overflow-hidden border border-neutral-700 h-32 relative">
              <Image
                src={settings.bgImageUrl}
                alt="Current background"
                fill
                className="object-cover"
              />
            </div>
          )}

          <label
            htmlFor="bg-upload"
            className="block text-sm font-medium text-neutral-300 mb-2"
          >
            {settings.bgImageUrl ? "Replace Image" : "Upload Image"}
          </label>
          <input
            id="bg-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleUpload}
            disabled={uploading}
            ref={fileRef}
            className="block w-full text-sm text-neutral-400
                       file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                       file:text-sm file:font-semibold
                       file:bg-neutral-700 file:text-neutral-100
                       hover:file:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {settings.bgImageUrl && (
            <button
              onClick={handleRemoveImage}
              disabled={uploading}
              className="mt-3 w-full border border-neutral-700 text-neutral-300 font-medium rounded-lg py-2 px-4
                         hover:bg-neutral-800 transition-colors duration-150
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Removing…" : "Remove Image"}
            </button>
          )}

          {uploadMsg && (
            <p className="mt-3 text-sm text-center text-neutral-300">{uploadMsg}</p>
          )}
        </section>

        {/* ── Your Shortcut URL ─────────────────────────────────────────── */}
        <section className="bg-neutral-900 rounded-2xl p-6 mb-6 border border-neutral-800">
          <h2 className="text-lg font-semibold mb-3 text-neutral-100">
            🔗 Your Shortcut URL
          </h2>
          <p className="text-neutral-400 text-xs mb-3">
            This permanent link always generates today&apos;s wallpaper based on your
            saved settings. Use it in iOS Shortcuts.
          </p>

          {userId ? (
            <>
              <div className="bg-neutral-800 rounded-lg px-4 py-3 mb-3 break-all text-xs text-neutral-200 font-mono border border-neutral-700">
                {wallpaperUrl}
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
            <p className="text-neutral-500 text-sm italic">Loading…</p>
          )}
        </section>

        {/* ── iOS Shortcuts Instructions ────────────────────────────────── */}
        <section className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
          <h2 className="text-lg font-semibold mb-4 text-neutral-100">
            📱 iOS Shortcuts Setup
          </h2>
          <p className="text-neutral-400 text-xs mb-4">
            Set this up as a daily automation to automatically update your lock
            screen wallpaper every night.
          </p>
          <ol className="space-y-3">
            {[
              <>Open the <strong>Shortcuts</strong> app → tap <strong>Automation</strong> → tap the <strong>+</strong> button.</>,
              <>Choose <strong>Time of Day</strong>. Set the time to <strong>12:01 AM</strong> and select <strong>Daily</strong>.</>,
              <>Tap <strong>New Blank Automation</strong> → tap <strong>Add Action</strong>.</>,
              <>Search for and add <strong>&ldquo;Get Contents of URL&rdquo;</strong>. Paste your Shortcut URL into the URL field.</>,
              <>Tap <strong>Add Action</strong> again and search for <strong>&ldquo;Set Wallpaper&rdquo;</strong>. Connect it to the contents from the previous step.</>,
              <>Tap on the <strong>Set Wallpaper</strong> action and make sure to select <strong>Lock Screen</strong> only.</>,
              <>Toggle <strong>&ldquo;Show Preview&rdquo; off</strong> so the automation runs silently while you sleep.</>,
            ].map((step, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-neutral-300 text-sm leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <footer className="mt-8 text-center text-neutral-600 text-xs">
          Designed for iPhone 15 Pro (1179 × 2556)
        </footer>
      </div>
    </main>
  );
}
