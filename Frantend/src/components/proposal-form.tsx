"use client";

import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { saveProposal, type ProposalData, type PhotoItem } from "@/lib/proposal-storage";

// ── Types ─────────────────────────────────────────────────────────────────────
const MAX_GALLERY_IMAGES = 6;

function createPhotoItem(): PhotoItem {
  return {
    id: `g-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    image: "",
    caption: "",
  };
}

const blank: ProposalData = {
  boyName: "",
  girlName: "",
  message: "",
  relationshipType: "GF",
  templateId: "",
  howWeMet: "",
  firstMeetingDate: "",
  nickname: "",
  whyILoveYou: "",
  futureDreams: "",
  heroImage: "",
  heroImageCaption: "",
  gallery: [],
  voiceNote: "",
  publishDurationId: "",
  publishDurationLabel: "",
  publishHours: 0,
  publishPrice: 0,
  allTemplateAccess: false,
  purchasedTemplateIds: [],
  publishExpiresAt: "",
  customerDetails: {
    fullName: "",
    email: "",
    phone: "",
    occasion: "",
    notes: "",
    password: "",
  },
};

function toDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result ?? ""));
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });
}

async function optimizeImage(file: File, maxSize = 1600, quality = 0.82): Promise<string> {
  const source = await toDataUrl(file);

  if (typeof window === "undefined") {
    return source;
  }

  return new Promise((resolve) => {
    const image = new Image();

    image.onload = () => {
      const longestSide = Math.max(image.width, image.height);
      const scale = longestSide > maxSize ? maxSize / longestSide : 1;
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      if (!context) {
        resolve(source);
        return;
      }

      context.drawImage(image, 0, 0, width, height);

      try {
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch {
        resolve(source);
      }
    };

    image.onerror = () => resolve(source);
    image.src = source;
  });
}

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, roman: "I",   label: "The Names",    sub: "Who is this love story about?" },
  { id: 2, roman: "II",  label: "Your Story",   sub: "Tell them everything" },
  { id: 3, roman: "III", label: "The Words",    sub: "Write from your heart" },
  { id: 4, roman: "IV",  label: "Memories",     sub: "Photos that say it all" },
  { id: 5, roman: "V",   label: "Voice",        sub: "Your voice, preserved" },
];

// ── Field components ──────────────────────────────────────────────────────────
function Field({
  label, hint, children,
}: {
  label: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "1.8rem" }}>
      <label style={{
        display: "block", marginBottom: "0.5rem",
        fontFamily: "'Syne', sans-serif", fontSize: 10,
        letterSpacing: "0.22em", color: "#a8956a",
        textTransform: "uppercase", fontWeight: 700,
      }}>{label}</label>
      {children}
      {hint && <p style={{ marginTop: 6, fontSize: "0.78rem", color: "rgba(255,255,255,0.22)", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>{hint}</p>}
    </div>
  );
}

const inputBase: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 14, padding: "13px 16px",
  color: "#f5f0e8", fontFamily: "'Cormorant Garamond', serif",
  fontSize: "1.05rem", outline: "none",
  transition: "border-color 0.25s, background 0.25s",
};

function TextInput({
  value, onChange, placeholder, required = false,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputBase,
        borderColor: focused ? "rgba(168,149,106,0.6)" : "rgba(255,255,255,0.1)",
        background: focused ? "rgba(168,149,106,0.06)" : "rgba(255,255,255,0.04)",
      }}
    />
  );
}

function TextArea({
  value, onChange, placeholder, rows = 4, required = false,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputBase,
        resize: "none", lineHeight: 1.75,
        borderColor: focused ? "rgba(168,149,106,0.6)" : "rgba(255,255,255,0.1)",
        background: focused ? "rgba(168,149,106,0.06)" : "rgba(255,255,255,0.04)",
      }}
    />
  );
}

function SelectInput({
  value, onChange, options,
}: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        ...inputBase,
        cursor: "pointer", appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23a8956a' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 16px center",
        paddingRight: 40,
      }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value} style={{ background: "#0f0f0f", color: "#f5f0e8" }}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ── Image upload zone ─────────────────────────────────────────────────────────
function ImageZone({
  src, onFile, label, height = 200,
}: {
  src: string; onFile: (f: File | null) => void; label: string; height?: number;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      {src ? (
        <div style={{ position: "relative", borderRadius: 16, overflow: "hidden" }}>
          <img src={src} alt="" style={{ width: "100%", height, objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 50%)" }} />
          <button
            type="button"
            onClick={() => {
              if (ref.current) {
                ref.current.value = "";
              }
              onFile(null);
            }}
            style={{
              position: "absolute", top: 10, right: 10,
              width: 30, height: 30, borderRadius: "50%",
              background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff", cursor: "pointer", fontSize: 13,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >✕</button>
          <button
            type="button"
            onClick={() => ref.current?.click()}
            style={{
              position: "absolute", bottom: 10, right: 10,
              padding: "5px 12px", borderRadius: 999,
              background: "rgba(0,0,0,0.65)", border: "1px solid rgba(168,149,106,0.4)",
              color: "#a8956a", cursor: "pointer", fontSize: 10,
              fontFamily: "'Syne', sans-serif", letterSpacing: "0.15em", textTransform: "uppercase",
            }}
          >Change</button>
        </div>
      ) : (
        <div
          onClick={() => ref.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault(); setDrag(false);
            const f = e.dataTransfer.files[0];
            if (f?.type.startsWith("image/")) onFile(f);
          }}
          style={{
            height, borderRadius: 16, cursor: "pointer",
            border: `2px dashed ${drag ? "rgba(168,149,106,0.7)" : "rgba(255,255,255,0.1)"}`,
            background: drag ? "rgba(168,149,106,0.05)" : "rgba(255,255,255,0.02)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 10, transition: "all 0.25s ease",
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: "rgba(168,149,106,0.1)", border: "1px solid rgba(168,149,106,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
          }}>🖼️</div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, letterSpacing: "0.15em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>{label}</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.8rem", color: "rgba(255,255,255,0.2)", marginTop: 4 }}>Click or drag & drop</p>
          </div>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
    </div>
  );
}

// ── Progress line ─────────────────────────────────────────────────────────────
function StepDot({ step, current, onClick }: { step: typeof STEPS[0]; current: number; onClick: () => void }) {
  const done = current > step.id;
  const active = current === step.id;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        background: "none", border: "none", cursor: "pointer", padding: "4px 8px",
      }}
    >
      <div style={{
        width: active ? 36 : done ? 28 : 24,
        height: active ? 36 : done ? 28 : 24,
        borderRadius: "50%",
        border: `1.5px solid ${active ? "#a8956a" : done ? "rgba(168,149,106,0.5)" : "rgba(255,255,255,0.12)"}`,
        background: active ? "rgba(168,149,106,0.15)" : done ? "rgba(168,149,106,0.08)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
        fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
        fontSize: active ? "0.85rem" : "0.72rem",
        color: active ? "#c8a96e" : done ? "rgba(168,149,106,0.7)" : "rgba(255,255,255,0.2)",
      }}>
        {done ? "✓" : step.roman}
      </div>
      <span style={{
        fontFamily: "'Syne', sans-serif", fontSize: 8,
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: active ? "#a8956a" : "rgba(255,255,255,0.2)",
        transition: "color 0.3s",
        display: "none", // hidden on small — shown via @media below
      }}>{step.label}</span>
    </button>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export function ProposalForm() {
  const router = useRouter();
  const [form, setForm] = useState<ProposalData>(blank);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // slide direction
  const [dir, setDir] = useState<"forward" | "back">("forward");
  const [animKey, setAnimKey] = useState(0);

  const upd = <K extends keyof ProposalData>(k: K, v: ProposalData[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const go = (next: number) => {
    setDir(next > step ? "forward" : "back");
    setStep(next);
    setAnimKey(k => k + 1);
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Image handlers
  const handleHero = async (file: File | null) => {
    if (!file) { upd("heroImage", ""); return; }
    upd("heroImage", await optimizeImage(file));
  };
  const handleGallery = async (file: File | null, idx: number) => {
    if (!file) {
      setForm(f => ({ ...f, gallery: f.gallery.filter((_, i) => i !== idx) }));
      return;
    }

    const image = await optimizeImage(file);
    setForm(f => ({ ...f, gallery: f.gallery.map((g, i) => i === idx ? { ...g, image } : g) }));
  };
  const handleGalleryAdd = async (files: FileList | null) => {
    if (!files?.length) return;

    const currentCount = form.gallery.length;
    const imageFiles = Array.from(files)
      .filter(file => file.type.startsWith("image/"))
      .slice(0, Math.max(MAX_GALLERY_IMAGES - currentCount, 0));

    if (!imageFiles.length) return;

    const newItems = await Promise.all(
      imageFiles.map(async (file) => ({
        ...createPhotoItem(),
        image: await optimizeImage(file),
      })),
    );

    setForm(f => ({
      ...f,
      gallery: [...f.gallery, ...newItems].slice(0, MAX_GALLERY_IMAGES),
    }));
  };

  // Voice recording
  const startRec = async () => {
    if (!navigator.mediaDevices?.getUserMedia) { setVoiceStatus("Not supported in this browser"); return; }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    chunksRef.current = []; streamRef.current = stream; recorderRef.current = rec;
    rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const fr = new FileReader();
      fr.onloadend = () => { upd("voiceNote", String(fr.result ?? "")); setVoiceStatus("Saved ✓"); };
      fr.readAsDataURL(blob);
      stream.getTracks().forEach(t => t.stop());
    };
    rec.start(); setIsRecording(true); setVoiceStatus("Recording…");
  };
  const stopRec = () => { recorderRef.current?.stop(); setIsRecording(false); };

  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true); setError("");
      await saveProposal(form);
      router.push("/templates");
    } catch {
      setError("Local save failed. Browser storage ya tab state check karo.");
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse 120% 80% at 20% 0%, #1a1510 0%, #0f0f0f 45%, #000000 100%)",
      color: "#f5f0e8",
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      position: "relative",
      overflowX: "hidden",
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Syne:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::placeholder{color:rgba(255,255,255,0.18);font-style:italic}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(168,149,106,0.25);border-radius:3px}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.5) sepia(1) saturate(0.5) hue-rotate(5deg)}
        @keyframes slideInRight{from{opacity:0;transform:translateX(48px)}to{opacity:1;transform:translateX(0)}}
        @keyframes slideInLeft{from{opacity:0;transform:translateX(-48px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
      `}</style>

      {/* Ambient texture */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", right: "-15%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(168,149,106,0.05) 0%,transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: "-15%", left: "-10%", width: "45vw", height: "45vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(212,175,55,0.08) 0%,transparent 65%)" }} />
        {/* Decorative grid lines */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.03 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#a8956a" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header style={{ position: "relative", zIndex: 10, padding: "2.5rem 2rem 0", textAlign: "center", animation: "fadeUp 0.8s ease both" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: "1.2rem" }}>
          <div style={{ width: 24, height: 1, background: "rgba(168,149,106,0.5)" }} />
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 9, letterSpacing: "0.35em", color: "rgba(168,149,106,0.7)", textTransform: "uppercase" }}>Love Proposal Studio</span>
          <div style={{ width: 24, height: 1, background: "rgba(168,149,106,0.5)" }} />
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(2rem,5vw,3.2rem)", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: "0.4rem" }}>
          Craft Your <em style={{
            background: "linear-gradient(135deg,#c8a96e,#e8c98e,#c8a96e)",
            backgroundSize: "200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            animation: "shimmer 4s linear infinite",
          }}>Love Story</em>
        </h1>
        <p style={{ fontStyle: "italic", fontSize: "1rem", color: "rgba(255,255,255,0.35)" }}>
          Fill each chapter. Create something unforgettable.
        </p>
      </header>

      {/* ── STEP PROGRESS ────────────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 10, padding: "2.5rem 2rem 0", maxWidth: 680, margin: "0 auto" }}>
        {/* Progress bar */}
        <div style={{ position: "relative", height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginBottom: "1.5rem" }}>
          <div style={{
            position: "absolute", left: 0, top: 0, height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg,#a8956a,#c8a96e)",
            borderRadius: 2, transition: "width 0.5s cubic-bezier(0.16,1,0.3,1)",
          }} />
        </div>
        {/* Step dots */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
          {STEPS.map(s => (
            <StepDot
              key={s.id}
              step={s}
              current={step}
              onClick={() => { if (s.id < step) go(s.id); }}
            />
          ))}
        </div>
      </div>

      {/* ── FORM AREA ────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit}>
        <div
          ref={containerRef}
          style={{
            position: "relative", zIndex: 10,
            maxWidth: 680, margin: "2.5rem auto 0",
            padding: "0 1.5rem 6rem",
          }}
        >
          {/* Chapter heading */}
          <div
            key={`heading-${animKey}`}
            style={{
              marginBottom: "2.5rem",
              animation: `${dir === "forward" ? "slideInRight" : "slideInLeft"} 0.55s cubic-bezier(0.16,1,0.3,1) both`,
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 8 }}>
              <span style={{
                fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                fontSize: "clamp(3rem,8vw,5rem)", fontWeight: 300, lineHeight: 1,
                color: "rgba(168,149,106,0.15)",
              }}>{STEPS[step - 1].roman}</span>
              <div>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(1rem,3vw,1.3rem)", fontWeight: 700, color: "#f5f0e8", letterSpacing: "-0.01em" }}>
                  {STEPS[step - 1].label}
                </h2>
                <p style={{ fontStyle: "italic", fontSize: "0.88rem", color: "rgba(255,255,255,0.35)", marginTop: 3 }}>
                  {STEPS[step - 1].sub}
                </p>
              </div>
            </div>
            <div style={{ height: 1, background: "linear-gradient(90deg,rgba(168,149,106,0.35),transparent)" }} />
          </div>

          {/* ── Step content ── */}
          <div
            key={`content-${animKey}`}
            style={{
              animation: `${dir === "forward" ? "slideInRight" : "slideInLeft"} 0.6s cubic-bezier(0.16,1,0.3,1) 0.04s both`,
            }}
          >

            {/* STEP 1 — Names */}
            {step === 1 && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", marginBottom: "1.2rem" }}>
                  <Field label="His Name">
                    <TextInput required value={form.boyName} onChange={v => upd("boyName", v)} placeholder="Aryan" />
                  </Field>
                  <Field label="Her Name">
                    <TextInput required value={form.girlName} onChange={v => upd("girlName", v)} placeholder="Meera" />
                  </Field>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
                  <Field label="Relationship" hint="Sets the tone of the proposal">
                    <SelectInput
                      value={form.relationshipType}
                      onChange={v => upd("relationshipType", v as ProposalData["relationshipType"])}
                      options={[
                        { value: "GF", label: "💝 Girlfriend" },
                        { value: "Crush", label: "🌸 Crush" },
                        { value: "Wife", label: "💍 Wife" },
                      ]}
                    />
                  </Field>
                  <Field label="Special Nickname" hint="Baby, jaan, sunshine…">
                    <TextInput value={form.nickname} onChange={v => upd("nickname", v)} placeholder="Meri Jaan" />
                  </Field>
                </div>
                <Field label="First Meeting Date" hint="The day it all began">
                  <input
                    type="date"
                    value={form.firstMeetingDate}
                    onChange={e => upd("firstMeetingDate", e.target.value)}
                    style={{ ...inputBase }}
                  />
                </Field>
              </div>
            )}

            {/* STEP 2 — Story */}
            {step === 2 && (
              <div>
                <Field label="How We Met" hint="The beginning of your story">
                  <TextArea rows={4} value={form.howWeMet} onChange={v => upd("howWeMet", v)} placeholder="We met in that old college canteen…" />
                </Field>
                <Field label="Why I Love You" hint="Make it specific, make it real">
                  <TextArea rows={4} value={form.whyILoveYou} onChange={v => upd("whyILoveYou", v)} placeholder="Because you make ordinary Tuesdays feel like holidays…" />
                </Field>
                <Field label="Future Dreams" hint="Where do you see yourselves?">
                  <TextArea rows={4} value={form.futureDreams} onChange={v => upd("futureDreams", v)} placeholder="A house with too many plants…" />
                </Field>
              </div>
            )}

            {/* STEP 3 — Message */}
            {step === 3 && (
              <div>
                <Field label="Love Message" hint="This will be typewritten on the proposal page — make it count">
                  <TextArea required rows={6} value={form.message} onChange={v => upd("message", v)}
                    placeholder="Every morning I wake up grateful that the universe was careless enough to put us in the same orbit…" />
                </Field>
                {/* Preview card */}
                {form.message && (
                  <div style={{
                    padding: "1.5rem 1.8rem", borderRadius: 18,
                    background: "rgba(168,149,106,0.05)",
                    border: "1px solid rgba(168,149,106,0.15)",
                    borderLeft: "3px solid rgba(168,149,106,0.5)",
                    marginTop: "0.5rem",
                  }}>
                    <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 8, letterSpacing: "0.25em", color: "rgba(168,149,106,0.6)", textTransform: "uppercase", marginBottom: 10 }}>Preview</p>
                    <p style={{ fontStyle: "italic", fontSize: "1.05rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.85 }}>
                      &ldquo;{form.message}&rdquo;
                    </p>
                    {(form.boyName || form.girlName) && (
                      <p style={{ marginTop: 14, fontFamily: "'Syne', sans-serif", fontSize: 10, color: "rgba(168,149,106,0.5)", letterSpacing: "0.15em" }}>
                        — {form.boyName}{form.girlName ? ` → ${form.girlName}` : ""}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 4 — Memories */}
            {step === 4 && (
              <div>
                <Field label="Hero Photo" hint="Full-width cinematic shot — the crown jewel of your proposal">
                  <ImageZone src={form.heroImage} onFile={handleHero} label="Upload hero image" height={220} />
                  {form.heroImage && (
                    <input
                      value={form.heroImageCaption}
                      onChange={e => upd("heroImageCaption", e.target.value)}
                      placeholder="The day everything changed…"
                      style={{ ...inputBase, marginTop: 10 }}
                    />
                  )}
                </Field>

                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "2rem 0" }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: "1.2rem", flexWrap: "wrap" }}>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 9, letterSpacing: "0.22em", color: "rgba(168,149,106,0.6)", textTransform: "uppercase" }}>
                    Photo Gallery - up to 6 memories
                  </p>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={form.gallery.length >= MAX_GALLERY_IMAGES}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 999,
                      border: "1px solid rgba(168,149,106,0.35)",
                      background: form.gallery.length >= MAX_GALLERY_IMAGES ? "rgba(255,255,255,0.03)" : "rgba(168,149,106,0.12)",
                      color: form.gallery.length >= MAX_GALLERY_IMAGES ? "rgba(255,255,255,0.28)" : "#c8a96e",
                      cursor: form.gallery.length >= MAX_GALLERY_IMAGES ? "not-allowed" : "pointer",
                      fontFamily: "'Syne', sans-serif",
                      fontSize: 10,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                    }}
                  >
                    + Add Photos ({form.gallery.length}/{MAX_GALLERY_IMAGES})
                  </button>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                    onChange={(e) => {
                      void handleGalleryAdd(e.target.files);
                      e.currentTarget.value = "";
                    }}
                  />
                </div>
                {form.gallery.length === 0 && (
                  <div style={{
                    padding: "1.2rem",
                    borderRadius: 16,
                    border: "1px dashed rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.02)",
                    marginBottom: "1rem",
                  }}>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.95rem", color: "rgba(255,255,255,0.36)", textAlign: "center" }}>
                      Add button se gallery me ek saath multiple photos upload kar sakte ho.
                    </p>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,180px),1fr))", gap: "1rem" }}>
                  {form.gallery.map((photo, idx) => (
                    <div key={photo.id}>
                      <ImageZone
                        src={photo.image}
                        onFile={f => void handleGallery(f, idx)}
                        label={`Memory ${idx + 1}`}
                        height={150}
                      />
                      {photo.image && (
                        <input
                          value={photo.caption}
                          onChange={e => setForm(f => ({ ...f, gallery: f.gallery.map((g, i) => i === idx ? { ...g, caption: e.target.value } : g) }))}
                          placeholder="Caption…"
                          style={{ ...inputBase, marginTop: 8, fontSize: "0.88rem", padding: "9px 12px" }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5 — Voice */}
            {step === 5 && (
              <div>
                <div style={{ padding: "2.5rem", borderRadius: 22, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", textAlign: "center", marginBottom: "2rem" }}>
                  {/* Waveform visual */}
                  <div style={{ display: "flex", gap: 4, justifyContent: "center", alignItems: "center", height: 52, marginBottom: "1.5rem" }}>
                    {Array.from({ length: 18 }, (_, i) => (
                      <div key={i} style={{
                        width: 3, borderRadius: 3,
                        height: isRecording
                          ? `${12 + Math.abs(Math.sin(i * 0.7)) * 32}px`
                          : form.voiceNote ? `${8 + Math.abs(Math.sin(i * 0.5)) * 24}px` : "8px",
                        background: isRecording
                          ? `rgba(212,175,55,${0.4 + Math.abs(Math.sin(i * 0.7)) * 0.6})`
                          : form.voiceNote ? `rgba(168,149,106,${0.3 + Math.abs(Math.sin(i * 0.5)) * 0.5})`
                          : "rgba(255,255,255,0.08)",
                        transition: "height 0.15s ease, background 0.3s",
                        animation: isRecording ? `pulse ${0.5 + (i % 3) * 0.2}s ease-in-out infinite alternate` : "none",
                      }} />
                    ))}
                  </div>

                  <p style={{ fontStyle: "italic", fontSize: "0.9rem", color: "rgba(255,255,255,0.35)", marginBottom: "1.5rem" }}>
                    {voiceStatus || (form.voiceNote ? "Voice note saved" : "Record a personal voice message for her")}
                  </p>

                  <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                    {!isRecording ? (
                      <button type="button" onClick={startRec} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "11px 28px", borderRadius: 999,
                        background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.35)",
                        color: "#d4af37", cursor: "pointer",
                        fontFamily: "'Syne', sans-serif", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
                        transition: "all 0.25s ease",
                      }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#d4af37", flexShrink: 0 }} />
                        {form.voiceNote ? "Re-record" : "Start Recording"}
                      </button>
                    ) : (
                      <button type="button" onClick={stopRec} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "11px 28px", borderRadius: 999,
                        background: "rgba(212,175,55,0.18)", border: "1px solid rgba(212,175,55,0.45)",
                        color: "#d4af37", cursor: "pointer",
                        fontFamily: "'Syne', sans-serif", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
                        animation: "pulse 1.5s ease infinite",
                      }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: "#d4af37", flexShrink: 0 }} />
                        Stop
                      </button>
                    )}
                    {form.voiceNote && (
                      <button type="button" onClick={() => { upd("voiceNote", ""); setVoiceStatus("Removed"); }}
                        style={{
                          padding: "11px 20px", borderRadius: 999,
                          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.35)", cursor: "pointer",
                          fontFamily: "'Syne', sans-serif", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
                        }}>Remove</button>
                    )}
                  </div>

                  {form.voiceNote && (
                    <div style={{ marginTop: "1.5rem" }}>
                      <audio controls style={{ width: "100%", accentColor: "#a8956a" }}>
                        <source src={form.voiceNote} type="audio/webm" />
                      </audio>
                    </div>
                  )}
                </div>

                {error && (
                  <div style={{
                    padding: "12px 16px", borderRadius: 12,
                    background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.22)",
                    color: "#d4af37", fontFamily: "'Syne', sans-serif", fontSize: 11, letterSpacing: "0.1em", marginBottom: "1.5rem",
                  }}>{error}</div>
                )}
              </div>
            )}
          </div>

          {/* ── Navigation buttons ── */}
          <div
            key={`nav-${step}`}
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginTop: "3rem", paddingTop: "2rem",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              animation: "fadeUp 0.5s ease 0.1s both",
            }}
          >
            {step > 1 ? (
              <button
                type="button"
                onClick={() => go(step - 1)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "11px 22px", borderRadius: 999,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)",
                  color: "rgba(255,255,255,0.45)", cursor: "pointer",
                  fontFamily: "'Syne', sans-serif", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(168,149,106,0.35)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(168,149,106,0.7)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.09)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.45)"; }}
              >
                ← Back
              </button>
            ) : <div />}

            {/* Step indicator */}
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.82rem", color: "rgba(255,255,255,0.2)" }}>
              {step} of {STEPS.length}
            </span>

            {step < STEPS.length ? (
              <button
                type="button"
                onClick={() => go(step + 1)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "12px 28px", borderRadius: 999,
                  background: "rgba(168,149,106,0.12)", border: "1px solid rgba(168,149,106,0.35)",
                  color: "#c8a96e", cursor: "pointer",
                  fontFamily: "'Syne', sans-serif", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(168,149,106,0.2)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(168,149,106,0.6)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(168,149,106,0.12)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(168,149,106,0.35)"; }}
              >
                Continue →
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "14px 36px", borderRadius: 999,
                  background: submitting ? "rgba(168,149,106,0.1)" : "linear-gradient(135deg,#a8956a,#c8a96e,#a8956a)",
                  backgroundSize: submitting ? undefined : "200%",
                  animation: submitting ? undefined : "shimmer 3s linear infinite",
                  border: "none", color: submitting ? "rgba(255,255,255,0.4)" : "#000000",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontFamily: "'Syne', sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700,
                  boxShadow: submitting ? "none" : "0 8px 32px rgba(168,149,106,0.25)",
                  transition: "all 0.3s ease",
                }}
              >
                {submitting ? "Saving…" : "Create Proposal ❤️"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default ProposalForm;
