import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Route, Routes } from "react-router-dom";

const initialValues = {
  GC_Content: "",
  AT_Content: "",
  Num_A: "",
  Num_T: "",
  Num_C: "",
  Num_G: "",
  kmer_3_freq: "",
  Mutation_Flag: "0",
  Class_Label: "",
};

export default function App() {
  return (
    <div className="min-h-dvh text-slate-200 relative overflow-hidden site-bg">
      <style>{`
        :root { --primary-color: #135bec; }
        @keyframes subtle-rotate { 0% { transform: translateX(-50%) rotate(0deg);} 100% { transform: translateX(-50%) rotate(360deg);} }
        .dna-background-animation { animation: subtle-rotate 240s linear infinite; will-change: transform; }
        @media (prefers-reduced-motion: reduce) {
          .dna-background-animation { animation: none; }
        }
        /* Global site gradient background to match the provided design */
        .site-bg { 
          background: radial-gradient(120% 120% at 50% 0%, #0b0f1f 0%, #0c1226 35%, #0e1630 65%, #0f1937 85%, #101c3d 100%);
        }
        /* Enhance DNA overlay visibility on dark gradient */
        .dna-visual { filter: brightness(1.2) contrast(1.05) saturate(1.1); mix-blend-mode: screen; }
      `}</style>
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold tracking-tight">DNA Predictor</Link>
          <nav className="flex items-center gap-6 text-sm">
            <NavLink to="/" end className={({isActive})=>isActive?"text-white":"text-slate-400 hover:text-slate-200"}>Home</NavLink>
          </nav>
        </div>
      </header>

      {/* Global subtle DNA background for all pages */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-100">
        <img
          alt="DNA background"
          className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[160%] max-w-none h-auto opacity-25 dna-background-animation dna-visual"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWFD_AD_8NWcwpLpWX16WXu9zmfQmBx5P2qD04-ivbEgDShMKiWsaU5eNuaxmJ72HHhlIXJbLJqHu7-SJgHVXjQphdlrKrhyR2bvh78hxiadSOA_Jsxc9w0dHr-6POB7QthAcHTCySsNIjbtz_wkz069wev-5Ku395yXnUoHakwS4TvpYItLAc-B3wELD9ooc2Bvv2IssRU5ySURrLIcodt-YivsaRmfQv1ngTR-li-VHm0b0bxNOCNLyTmR5qDrNw42J_21OUQjE"
        />
        <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[140%] opacity-15 dna-background-animation dna-visual">
          <svg className="w-full h-auto text-gray-500" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <path d="M25,10 C50,25 50,75 25,90" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M75,10 C50,25 50,75 75,90" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="30" y1="20" x2="70" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="32" y1="30" x2="68" y2="30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="35" y1="40" x2="65" y2="40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="38" y1="50" x2="62" y2="50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="35" y1="60" x2="65" y2="60" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="32" y1="70" x2="68" y2="70" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="30" y1="80" x2="70" y2="80" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>

      <footer className="py-8 text-center text-slate-500 text-sm border-t border-white/10 mt-12">
        © 2025 DNA Predictor. All rights reserved.
      </footer>
    </div>
  );
}

function Dashboard() {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [meta, setMeta] = useState(null);
  const [classOptions, setClassOptions] = useState([]);
  const apiBase = useMemo(() => "", []);

  useEffect(() => {
    fetch(`${apiBase}/meta`).then(async (r) => {
      if (r.ok) {
        const m = await r.json();
        setMeta(m);
        const mapping = m?.feature_label_to_int?.Class_Label;
        if (mapping && typeof mapping === "object") {
          const opts = Object.keys(mapping);
          setClassOptions(opts);
          setValues((v) => ({ ...v, Class_Label: v.Class_Label || opts[0] || "" }));
        }
      }
    }).catch(() => {});
  }, [apiBase]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPrediction(null);
    try {
      const numericFields = [
        "GC_Content",
        "AT_Content",
        "Num_A",
        "Num_T",
        "Num_C",
        "Num_G",
        "kmer_3_freq",
        "Mutation_Flag",
      ];
      const payload = Object.fromEntries(
        Object.entries(values).map(([k, v]) => {
          if (v === "") return [k, null];
          return [k, numericFields.includes(k) ? Number(v) : v];
        })
      );
      const res = await fetch(`${apiBase}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setPrediction(json);
    } catch (err) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative">
      <style>{`
        :root { --primary-color: #135bec; }
        @keyframes dna-spinner { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        .loading-dna { animation: dna-spinner 2s linear infinite; }
      `}</style>

      <div className="mx-auto max-w-4xl px-4 py-10 space-y-12">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter">DNA Disease Risk Predictor</h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-400">AI-powered DNA risk analysis with FastAPI + React</p>
        </div>

        <section className="bg-[#1c1f27]/50 backdrop-blur-sm shadow-2xl rounded-2xl p-6 sm:p-8">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                <span className="material-symbols-outlined text-[var(--primary-color)]">genetics</span>
                Input Your DNA Data
              </h2>
              <p className="text-gray-400 mt-2">Enter the DNA sequence features below to get a risk prediction.</p>
            </div>

            <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <FieldDark icon="percent" label="GC_Content (%)" name="GC_Content" value={values.GC_Content} onChange={onChange} step="0.01" placeholder="e.g., 45.5" />
              <FieldDark icon="percent" label="AT_Content (%)" name="AT_Content" value={values.AT_Content} onChange={onChange} step="0.01" placeholder="e.g., 54.5" />
              <FieldDark icon="looks_one" label="Num_A" name="Num_A" value={values.Num_A} onChange={onChange} step="1" placeholder="e.g., 120" />
              <FieldDark icon="looks_two" label="Num_T" name="Num_T" value={values.Num_T} onChange={onChange} step="1" placeholder="e.g., 130" />
              <FieldDark icon="looks_3" label="Num_C" name="Num_C" value={values.Num_C} onChange={onChange} step="1" placeholder="e.g., 110" />
              <FieldDark icon="looks_4" label="Num_G" name="Num_G" value={values.Num_G} onChange={onChange} step="1" placeholder="e.g., 115" />
              <FieldDark icon="grain" label="kmer_3_freq" name="kmer_3_freq" value={values.kmer_3_freq} onChange={onChange} step="0.0001" placeholder="e.g., 0.0123" />
              <FieldDark icon="flag" label="Mutation_Flag (0/1)" name="Mutation_Flag" value={values.Mutation_Flag} onChange={onChange} step="1" min="0" max="1" placeholder="0 or 1" />
              <div className="flex flex-col">
                <span className="font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">category</span>
                  Class_Label
                </span>
                <select
                  name="Class_Label"
                  value={values.Class_Label}
                  onChange={onChange}
                  className="form-select flex w-full min-w-0 flex-1 rounded-lg text-white bg-[#111318] border border-gray-700 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] p-3 text-base font-normal leading-relaxed transition-all duration-300"
                >
                  {classOptions.length === 0 ? (
                    <option value="" disabled>Loading options...</option>
                  ) : (
                    classOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-3 flex justify-center gap-3">
                <button type="submit" disabled={loading} className="flex w-full sm:w-auto items-center justify-center overflow-hidden rounded-lg h-12 px-8 bg-[var(--primary-color)] text-white text-base font-bold tracking-wide hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] focus:ring-offset-[#1c1f27] transition-all duration-300 transform hover:scale-105">
                  <span className="material-symbols-outlined mr-2">bolt</span>
                  {loading ? "Predicting..." : "Predict Risk"}
                </button>
                <button type="button" onClick={() => { setValues(initialValues); setPrediction(null); setError(""); }} className="inline-flex items-center justify-center rounded-lg border border-white/10 px-4 py-2 hover:bg-white/5">
                  Reset
                </button>
              </div>

              {error && (
                <div className="sm:col-span-2 lg:col-span-3 rounded-lg border border-red-400/20 bg-red-900/20 p-3 text-sm text-red-200">
                  {error}
                </div>
              )}
            </form>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <span className="material-symbols-outlined text-[var(--primary-color)]">science</span>
            Prediction Result
          </h2>
          <div className="mt-6 bg-gray-800/60 rounded-xl p-6 text-center flex flex-col items-center justify-center min-h-[144px]">
            {!prediction ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <svg className="loading-dna h-12 w-12 text-[var(--primary-color)]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4C8 8 8 16 4 20"></path>
                  <path d="M20 4c-4 4-4 12 0 16"></path>
                  <path d="M6.5 6.5h11"></path>
                  <path d="M6.5 17.5h11"></path>
                  <path d="M8 9.5h8"></path>
                  <path d="M8 14.5h8"></path>
                  <path d="M9.5 12h5"></path>
                </svg>
                <p className="text-lg text-gray-400">Processing your DNA data...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-2xl font-semibold text-white">Disease Risk: {prediction.prediction}</div>
                {prediction.classes && (
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Risk Categories</div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {prediction.classes.map((c, i) => (
                        <span key={c} className={`inline-flex items-center rounded-full border border-white/10 px-2.5 py-1 text-sm ${prediction.class_index === i ? "bg-blue-600 text-white" : "bg-slate-900/40 text-slate-300"}`}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section>
          <details className="bg-[#111318]/50 rounded-xl border border-gray-800 group" open>
            <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 list-none">
              <h3 className="text-lg font-semibold flex items-center gap-3">
                <span className="material-symbols-outlined text-[var(--primary-color)]">model_training</span>
                Model Details
              </h3>
              <div className="text-gray-400 group-open:rotate-180 transition-transform duration-300">
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </summary>
            <div className="border-t border-gray-800 p-4">
              {!meta ? (
                <div className="text-slate-500 text-sm">Loading...</div>
              ) : (
                <div className="text-gray-400">
                  This model uses a deep learning algorithm trained on a large dataset of DNA sequence features and associated disease risks. It provides a probabilistic risk assessment based on the input data. The architecture is a multi-layer perceptron (MLP) optimized for tabular data.
                  <div className="mt-3 text-sm text-slate-400 space-y-1">
                    <div>Target: <span className="font-medium text-white">{meta.target}</span></div>
                    <div className="truncate">Features: <span className="font-medium text-white">{meta.features?.join(", ")}</span></div>
                  </div>
                </div>
              )}
            </div>
          </details>
        </section>
      </div>
    </main>
  );
}

function Welcome() {
  return (
    <main className="relative min-h-[calc(100dvh-64px-96px)] flex items-center justify-center text-white overflow-hidden">
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0);    opacity: 0.35; }
          40%            { transform: translateY(-7px); opacity: 1;    }
        }
        .anim-1 { animation: fade-in-up 0.7s ease-out 0.05s both; }
        .anim-2 { animation: fade-in-up 0.7s ease-out 0.2s  both; }
        .anim-3 { animation: fade-in-up 0.7s ease-out 0.4s  both; }
        .anim-4 { animation: fade-in-up 0.7s ease-out 0.55s both; }
        .shimmer-text {
          background: linear-gradient(90deg,
            #7dd3fc 0%, #bae6fd 30%, #ffffff 50%, #bae6fd 70%, #7dd3fc 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 5s linear infinite;
        }
        .dot { animation: dot-bounce 1.4s ease-in-out infinite; }
        .dot:nth-child(2) { animation-delay: 0.18s; }
        .dot:nth-child(3) { animation-delay: 0.36s; }
      `}</style>

      <div className="flex flex-col items-center text-center px-6 max-w-lg mx-auto">

        {/* Icon */}
        <span className="anim-1 material-symbols-outlined text-5xl mb-8"
              style={{ color: '#7dd3fc', filter: 'drop-shadow(0 0 16px rgba(125,211,252,0.45))' }}>
          genetics
        </span>

        {/* Status pill */}
        <div className="anim-2 mb-8">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest"
                style={{ background: 'rgba(125,211,252,0.07)', border: '1px solid rgba(125,211,252,0.18)', color: '#7dd3fc' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse inline-block" />
            Under Reconstruction
          </span>
        </div>

        {/* Headline */}
        <h1 className="anim-3 font-black tracking-tighter leading-[1.08] mb-5"
            style={{ fontSize: 'clamp(2.4rem, 7vw, 3.75rem)' }}>
          <span className="shimmer-text">Something new</span>
          <span className="text-white"> & more accurate</span>
          <br />
          <span className="text-white">is coming.</span>
        </h1>

        {/* Subtext */}
        <p className="anim-3 text-slate-400 text-[15px] leading-relaxed max-w-xs">
          Rebuilding from the ground up — sharper models, cleaner insights.
        </p>

        {/* Dots */}
        <div className="anim-4 flex items-center gap-2 mt-10">
          <span className="dot w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />
          <span className="dot w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />
          <span className="dot w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />
        </div>

      </div>
    </main>
  );
}



function Field({ label, name, value, onChange, ...rest }) {
  return (
    <label className="col-span-2 sm:col-span-1 text-sm">
      <span className="mb-1 block text-slate-600">{label}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type="number"
        className="w-full rounded-lg border px-3 py-2 outline-none ring-0 focus:border-slate-400 focus:bg-white bg-slate-50"
        {...rest}
      />
    </label>
  );
}

function FieldDark({ icon, label, name, value, onChange, placeholder, ...rest }) {
  return (
    <label className="flex flex-col">
      <span className="font-medium text-gray-300 mb-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-base">{icon}</span>
        {label}
      </span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type="number"
        placeholder={placeholder}
        className="form-input flex w-full min-w-0 flex-1 rounded-lg text-white bg-[#111318] border border-gray-700 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] placeholder:text-gray-500 p-3 text-base font-normal leading-relaxed transition-all duration-300"
        {...rest}
      />
    </label>
  );
}
