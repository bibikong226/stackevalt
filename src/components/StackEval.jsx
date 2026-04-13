import { useState, useCallback, useRef, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS — StackEval v5
   Clean dark neutral surfaces. Blue + violet — accent only.
───────────────────────────────────────────────────────────── */
const T = {
  base:    "#0D0D10",
  surface: "#141417",
  elev:    "#1C1C22",
  high:    "#26262F",
  border:  "#2E2E3C",
  borderS: "#22222C",

  blue:    "#5B8EF0",
  blueBtn: "#2B5ECC",   // button bg: 5.8:1 with white ✓
  blueHov: "#4A7AE0",
  blueSub: "rgba(91,142,240,0.12)",
  blueTxt: "#8FBCFF",   // 7.8:1 on base ✓

  violet:    "#5B8EF0",
  violetSub: "rgba(91,142,240,0.12)",
  violetTxt: "#8FBCFF",

  hi:  "#F4F4F6",
  mid: "#9494A8",
  lo:  "#5A5A70",
  dis: "#383848",

  green: "#22C55E",
  amber: "#F59E0B",
  red:   "#EF4444",

  mBlue:   { bg:"rgba(91,142,240,0.15)",  bd:"rgba(91,142,240,0.45)",  tx:"#8FBCFF"  },
  mTeal:   { bg:"rgba(20,184,166,0.15)",  bd:"rgba(20,184,166,0.45)",  tx:"#2DD4BF"  },
  mAmber:  { bg:"rgba(245,158,11,0.15)",  bd:"rgba(245,158,11,0.45)",  tx:"#FBBF24"  },
  mGreen:  { bg:"rgba(34,197,94,0.15)",   bd:"rgba(34,197,94,0.45)",   tx:"#4ADE80"  },
  mCustom: { bg:"rgba(91,142,240,0.15)", bd:"rgba(91,142,240,0.45)", tx:"#8FBCFF"  },
  mPurple: { bg:"rgba(91,142,240,0.15)", bd:"rgba(91,142,240,0.45)", tx:"#8FBCFF"  },

  rGreen:  { bg:"rgba(34,197,94,0.12)",   bd:"rgba(34,197,94,0.4)",    tx:"#4ADE80"  },
  rBlue:   { bg:"rgba(91,142,240,0.12)",  bd:"rgba(91,142,240,0.4)",   tx:"#8FBCFF"  },
  rTeal:   { bg:"rgba(20,184,166,0.12)",  bd:"rgba(20,184,166,0.4)",   tx:"#2DD4BF"  },
  rAmber:  { bg:"rgba(245,158,11,0.12)",  bd:"rgba(245,158,11,0.4)",   tx:"#FBBF24"  },
  rPurple: { bg:"rgba(91,142,240,0.12)", bd:"rgba(91,142,240,0.4)",  tx:"#8FBCFF"  },
  rNeut:   { bg:"rgba(148,163,184,0.1)",  bd:"rgba(148,163,184,0.3)",  tx:"#94A3B8"  },

  dotQA:  "#5B8EF0",
  dotSum: "#8B6FFF",
  dotRAG: "#06B6D4",
  dotLoc: "#F59E0B",
}
const MONO = "'JetBrains Mono',monospace";
const UI   = "'Inter',-apple-system,sans-serif";

/* ─────────────────────────────────────────────────────────────
   PRIMITIVE COMPONENTS
───────────────────────────────────────────────────────────── */
const Badge = ({ label, score, color, style = {} }) => (
  <span style={{
    display:"inline-flex", alignItems:"center", gap:5, height:22, padding:"0 8px",
    borderRadius:5, background:color.bg,
    border:`1px ${color.dash?"dashed":"solid"} ${color.bd}`,
    fontSize:11, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase",
    color:color.tx, fontFamily:UI, whiteSpace:"nowrap", flexShrink:0, ...style
  }}>
    {label}
    {score != null && <span style={{ fontFamily:MONO, fontSize:12, fontWeight:500 }}>{score}</span>}
  </span>
);

const Chip = ({ name, active, onClick }) => (
  <button onClick={onClick} style={{
    display:"inline-flex", alignItems:"center", height:20, padding:"0 8px",
    borderRadius:4, border:`1px solid ${active?T.blue:T.border}`,
    background:active?T.blueSub:T.elev, color:active?T.blueTxt:T.mid,
    fontSize:10, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase",
    fontFamily:UI, cursor:onClick?"pointer":"default", whiteSpace:"nowrap",
  }}>{name}</button>
);

const Btn = ({ children, onClick, disabled, variant="primary", small, style={} }) => {
  const [hov, setHov] = useState(false);
  const base = {
    padding: small?"5px 12px":"7px 16px", borderRadius:6, fontSize:small?12:14,
    fontWeight:500, fontFamily:UI, cursor:disabled?"not-allowed":"pointer",
    transition:"background .15s, border-color .15s", border:"none", ...style
  };
  if (variant==="primary") return (
    <button onClick={onClick} disabled={disabled} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{ ...base, background:disabled?T.elev:hov?T.blueHov:T.blueBtn, color:disabled?T.lo:"#fff" }}>{children}</button>
  );
  if (variant==="ghost") return (
    <button onClick={onClick} disabled={disabled} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{ ...base, background:hov?T.elev:"transparent", border:`1px solid ${hov?T.blue:T.border}`, color:hov?T.hi:T.mid }}>{children}</button>
  );
  if (variant==="link") return (
    <button onClick={onClick} style={{ ...base, background:"none", border:"none", color:hov?T.hi:T.mid, padding:0 }} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>{children}</button>
  );
};

const Card = ({ children, style={} }) => (
  <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:18, ...style }}>{children}</div>
);

const Mono = ({ children }) => <span style={{ fontFamily:MONO, fontSize:12, color:T.hi }}>{children}</span>;

const SubLabel = ({ children, style={} }) => (
  <div style={{ fontSize:11, fontWeight:700, color:T.lo, letterSpacing:"0.07em", textTransform:"uppercase", fontFamily:UI, marginBottom:8, ...style }}>{children}</div>
);

const Divider = ({ my=16 }) => <div style={{ height:1, background:T.border, margin:`${my}px 0` }} />;

const Input = ({ value, onChange, placeholder, style={} }) => (
  <input value={value} onChange={onChange} placeholder={placeholder} style={{
    width:"100%", padding:"7px 10px", background:T.elev, border:`1px solid ${T.border}`,
    borderRadius:6, fontSize:13, color:T.hi, outline:"none", boxSizing:"border-box",
    fontFamily:UI, ...style
  }} />
);

const Textarea = ({ value, onChange, placeholder, rows=3, style={} }) => (
  <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={{
    width:"100%", padding:"7px 10px", background:T.elev, border:`1px solid ${T.border}`,
    borderRadius:6, fontSize:13, color:T.hi, outline:"none", boxSizing:"border-box",
    fontFamily:UI, resize:"vertical", ...style
  }} />
);

const CheckBox = ({ checked, onClick }) => (
  <button onClick={onClick} style={{
    width:16, height:16, borderRadius:3, border:`2px solid ${checked?T.blue:T.border}`,
    background:checked?T.blue:T.elev, cursor:"pointer", display:"flex",
    alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .15s",
  }}>
    {checked && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
  </button>
);

const Toggle = ({ on, onClick }) => (
  <button onClick={onClick} style={{
    width:40, height:22, borderRadius:11, border:"none", cursor:"pointer",
    background:on?T.blue:T.elev, position:"relative", transition:"background .2s", flexShrink:0,
  }}>
    <div style={{ width:16, height:16, background:"#fff", borderRadius:"50%", position:"absolute", top:3, left:on?21:3, transition:"left .2s", boxShadow:"0 1px 3px rgba(0,0,0,.4)" }} />
  </button>
);

const Select = ({ value, onChange, options, style={} }) => (
  <select value={value} onChange={e=>onChange(e.target.value)} style={{
    padding:"6px 10px", background:T.elev, border:`1px solid ${T.border}`, borderRadius:6,
    color:T.hi, fontSize:13, fontFamily:UI, outline:"none", cursor:"pointer", ...style
  }}>
    {options.map(([v,l])=><option key={v} value={v} style={{background:T.surface}}>{l}</option>)}
  </select>
);

const MetricTip = ({ metKey }) => {
  const [open, setOpen] = useState(false);
  const def = METRIC_DEFS[metKey];
  if (!def) return null;
  return (
    <span style={{ position:"relative", display:"inline-flex", alignItems:"center", marginLeft:4 }}>
      <button
        onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)}
        style={{ background:"rgba(59,130,246,0.15)", border:`1px solid rgba(91,142,240,0.4)`, borderRadius:"50%", width:15, height:15, cursor:"default", display:"flex", alignItems:"center", justifyContent:"center", color:T.blueTxt, fontSize:9, padding:0, flexShrink:0, fontWeight:700 }}
      >?</button>
      {open && (
        <div style={{ position:"absolute", bottom:"calc(100% + 8px)", left:0, width:220, background:T.elev, border:`1px solid ${T.border}`, borderRadius:8, padding:"10px 12px", fontSize:12, color:T.hi, lineHeight:1.6, zIndex:200, boxShadow:"0 8px 24px rgba(0,0,0,0.7)", pointerEvents:"none" }}>
          <div style={{ fontSize:10,fontWeight:700,color:T.blueTxt,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:4,fontFamily:UI }}>{metKey}</div>
          {def}
        </div>
      )}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const TASK_OPTIONS = [
  { id:"qa",            name:"Standard QA",   desc:"Find or produce the exact answer to a posed question from a knowledge base.",   dot:T.dotQA  },
  { id:"summarization", name:"Summarization",  desc:"Compress a long document into a shorter form that preserves key information.",  dot:T.dotSum },
  { id:"rag-qa",        name:"RAG QA",         desc:"Fetch relevant docs, then generate a grounded response from retrieved context.", dot:T.dotRAG },
  { id:"locomo",        name:"LoCoMo",          desc:"Answer questions requiring chaining facts across a very long context window.",  dot:T.dotLoc },
];

const TASK_EXAMPLES = {
  qa:           { input:"What is the capital of France?", output:"The capital of France is Paris." },
  summarization:{ input:"The quarterly earnings report shows significant growth across all major product lines. Revenue increased 23% YoY, driven by strong cloud services performance. Operating expenses grew only 12%.", output:"Quarterly earnings showed 23% revenue growth driven by cloud services. Operating expenses grew 12%." },
  "rag-qa":     { input:"How long do I have to take parental leave after my child is born?", output:"You have 12 months from the date of your child's birth or adoption." },
  locomo:       { input:"Who is Alice Chen's manager's boss and what is their title?", output:"Emma Thompson, VP Engineering." },
};

const INIT_METRICS = [
  { id:"f1",          name:"F1 Score",           enabled:true,  desc:"Harmonic mean of precision and recall over word tokens",                     color:T.mBlue,   llm:false },
  { id:"bleu",        name:"BLEU",               enabled:true,  desc:"N-gram overlap against reference — original MT metric",                      color:T.mBlue,   llm:false },
  { id:"rouge",       name:"ROUGE-L",            enabled:true,  desc:"Longest common subsequence recall between output and reference",              color:T.mBlue,   llm:false },
  { id:"exact",       name:"Exact Match",        enabled:false, desc:"Binary 0/1 — output must exactly match reference after normalization",        color:T.mBlue,   llm:false },
  { id:"meteor",      name:"METEOR",             enabled:false, desc:"Incorporates stemming and synonym matching — more robust than BLEU",          color:T.mBlue,   llm:false },
  { id:"bert",        name:"BERTScore",          enabled:false, desc:"Contextual embedding similarity using BERT — better for open-ended output",   color:T.mTeal,   llm:false },
  { id:"answer_rel",  name:"Answer Relevance",   enabled:false, desc:"Checks whether the output actually answers the input question",               color:T.mTeal,   llm:true  },
  { id:"faithfulness",name:"Faithfulness",       enabled:false, desc:"Checks if output is grounded in retrieved context — essential for RAG",       color:T.mTeal,   llm:true  },
  { id:"judge",       name:"LLM-as-Judge",       enabled:false, desc:"Uses an LLM to score outputs against criteria you define",                    color:T.mAmber,  llm:true  },
  { id:"human",       name:"Human Evaluation",   enabled:false, desc:"Human annotation scores — results imported via CSV",                          color:T.mGreen,  llm:false },
];

const ALL_MODELS = [
  { id:"gpt-4-turbo",    name:"GPT-4 Turbo",    provider:"OpenAI",    ctx:128000, oss:false, cost:10.0, speed:120, lmsys:1251, mmlu:86.4, matchPct:95, released:2024 },
  { id:"claude-3-opus",  name:"Claude 3 Opus",  provider:"Anthropic", ctx:200000, oss:false, cost:15.0, speed:90,  lmsys:1263, mmlu:86.8, matchPct:92, released:2024 },
  { id:"claude-3-sonnet",name:"Claude 3 Sonnet",provider:"Anthropic", ctx:200000, oss:false, cost:3.0,  speed:150, lmsys:1202, mmlu:79.0, matchPct:87, released:2024 },
  { id:"claude-3-haiku", name:"Claude 3 Haiku", provider:"Anthropic", ctx:200000, oss:false, cost:0.25, speed:250, lmsys:1179, mmlu:75.2,              released:2024 },
  { id:"gemini-ultra",   name:"Gemini Ultra",   provider:"Google",    ctx:32768,  oss:false, cost:18.0, speed:100, lmsys:1258, mmlu:90.0,              released:2024 },
  { id:"gemini-pro",     name:"Gemini Pro",     provider:"Google",    ctx:32768,  oss:false, cost:0.5,  speed:130, lmsys:1215, mmlu:79.1,              released:2023 },
  { id:"gpt-4",          name:"GPT-4",          provider:"OpenAI",    ctx:8192,   oss:false, cost:30.0, speed:80,  lmsys:1247, mmlu:86.4, matchPct:88, released:2023 },
  { id:"gpt-3.5-turbo",  name:"GPT-3.5 Turbo", provider:"OpenAI",    ctx:16385,  oss:false, cost:0.5,  speed:200, lmsys:1105, mmlu:70.0,              released:2022 },
  { id:"llama-3-70b",    name:"Llama 3 70B",    provider:"Meta",      ctx:8192,   oss:true,  cost:0.9,  speed:110, lmsys:1213, mmlu:79.5,              released:2024 },
  { id:"llama-3-8b",     name:"Llama 3 8B",     provider:"Meta",      ctx:8192,   oss:true,  cost:0.06, speed:300, lmsys:1155, mmlu:66.6,              released:2024 },
  { id:"mixtral-8x7b",   name:"Mixtral 8x7B",   provider:"Mistral",   ctx:32768,  oss:true,  cost:0.6,  speed:140, lmsys:1191, mmlu:70.6,              released:2023 },
  { id:"mistral-7b",     name:"Mistral 7B",     provider:"Mistral",   ctx:8192,   oss:true,  cost:0.25, speed:220, lmsys:1141, mmlu:62.5,              released:2023 },
  { id:"command-r-plus", name:"Command R+",     provider:"Cohere",    ctx:128000, oss:false, cost:2.5,  speed:115, lmsys:1225, mmlu:75.0,              released:2024 },
  { id:"command-r",      name:"Command R",      provider:"Cohere",    ctx:128000, oss:false, cost:0.15, speed:135, lmsys:1186, mmlu:72.3,              released:2024 },
];

const CHALLENGERS = [
  { id:"phi-3-mini", name:"Phi-3 Mini",  provider:"Microsoft", ctx:4096,  oss:true,  cost:0.04, speed:350, lmsys:1180, mmlu:68.8 },
  { id:"falcon-40b", name:"Falcon 40B",  provider:"TII",       ctx:2048,  oss:true,  cost:0.35, speed:160, lmsys:1165, mmlu:55.4 },
  { id:"vicuna-13b", name:"Vicuna 13B",  provider:"LMSYS",     ctx:2048,  oss:true,  cost:0.13, speed:180, lmsys:1121, mmlu:56.0 },
];

const MOCK_RESULTS = [
  { input:"Classify: 'This product exceeded expectations!'", golden:"Positive",
    out:{ "gpt-4-turbo":{text:"Positive",f1:1.0,bleu:1.0,rouge:1.0,ms:245,cost:0.03},
          "claude-3-opus":{text:"Positive",f1:1.0,bleu:1.0,rouge:1.0,ms:312,cost:0.05},
          "claude-3-sonnet":{text:"Positive",f1:1.0,bleu:1.0,rouge:1.0,ms:198,cost:0.02} }},
  { input:"Summarize: 'The quick brown fox jumps over the lazy dog.'", golden:"Pangram sentence",
    out:{ "gpt-4-turbo":{text:"A pangram using every letter",f1:0.85,bleu:0.72,rouge:0.81,ms:298,cost:0.04},
          "claude-3-opus":{text:"Contains all alphabet letters",f1:0.90,bleu:0.68,rouge:0.78,ms:356,cost:0.06},
          "claude-3-sonnet":{text:"Sentence with every letter",f1:0.92,bleu:0.88,rouge:0.91,ms:223,cost:0.03} }},
  { input:"What is the capital of France?", golden:"Paris",
    out:{ "gpt-4-turbo":{text:"Paris",f1:1.0,bleu:1.0,rouge:1.0,ms:156,cost:0.02},
          "claude-3-opus":{text:"Paris",f1:1.0,bleu:1.0,rouge:1.0,ms:198,cost:0.04},
          "claude-3-sonnet":{text:"Paris",f1:1.0,bleu:1.0,rouge:1.0,ms:134,cost:0.01} }},
  { input:"Translate to French: 'Good morning'", golden:"Bonjour",
    out:{ "gpt-4-turbo":{text:"Bonjour",f1:1.0,bleu:1.0,rouge:1.0,ms:180,cost:0.02},
          "claude-3-opus":{text:"Bonjour",f1:1.0,bleu:1.0,rouge:1.0,ms:220,cost:0.03},
          "claude-3-sonnet":{text:"Bonjour",f1:1.0,bleu:1.0,rouge:1.0,ms:155,cost:0.01} }},
];

const PRESETS = {
  chatbot:         { high:["cost","speed"],          medium:["contextWindow"], low:[] },
  rag:             { high:["contextWindow"],          medium:["cost","speed"],  low:[] },
  "code-assistant":{ high:["speed","contextWindow"],  medium:["cost"],          low:[] },
};

const PRIORITY_CFG = {
  accuracy:      { label:"Accuracy",       desc:"Prefer highest-scoring models on benchmarks" },
  cost:          { label:"Cost",           desc:"Prefer lower-cost models" },
  speed:         { label:"Speed",          desc:"Prefer faster inference" },
  contextWindow: { label:"Context Window", desc:"Prefer larger context windows" },
};

const METRIC_DEFS = {
  rouge: "ROUGE-L measures the longest common word sequence between output and reference. Higher = more coverage. Note: unreliable for open-ended generative tasks.",
  cost:  "Estimated API cost for this evaluation run across all rows. Compare at scale: a 2× difference on 1,000 rows adds up fast.",
  lat:   "Average response latency per model call. Lower is faster to return results.",
  f1:    "F1 Score is the harmonic mean of precision and recall over word tokens. Good for exact-match tasks.",
  bleu:  "BLEU counts n-gram overlaps vs. a reference string. Originally designed for machine translation.",
  bert:  "BERTScore compares output and reference using contextual embeddings — better than n-gram methods for open-ended tasks.",
};

const STEPS_B = [
  { id:1, label:"Define Task" }, { id:2, label:"Define Metrics" }, { id:3, label:"Model Selection" }, { id:4, label:"Run" },
];

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function getRecBadge(m, criteria) {
  const hi = criteria.priorities?.high || [];
  if (hi.includes("accuracy") && m.lmsys >= 1255)     return { color:T.rBlue,   label:"Most Accurate" };
  if (hi.includes("contextWindow") && m.ctx >= 100000) return { color:T.rPurple, label:"Largest Context" };
  if (hi.includes("cost") && m.cost <= 2)              return { color:T.rGreen,  label:"Cheapest" };
  if (hi.includes("speed") && m.speed >= 200)          return { color:T.rTeal,   label:"Fastest" };
  if (m.lmsys >= 1255)                                  return { color:T.rAmber,  label:"Best Overall" };
  if (m.lmsys >= 1210)                                  return { color:T.rBlue,   label:"Most Accurate" };
  if (m.oss)                                            return { color:T.rNeut,   label:"Challenger" };
  return null;
}

function calcAgg(models) {
  return models.map(m => {
    const rows = MOCK_RESULTS.map(r => r.out[m.id] || r.out["gpt-4-turbo"]);
    return {
      name: m.name.split(" ").slice(-2).join(" "),
      full: m.name,
      F1:  +(rows.reduce((s,r)=>s+r.f1,0)/rows.length).toFixed(3),
      BLEU:+(rows.reduce((s,r)=>s+r.bleu,0)/rows.length).toFixed(3),
      ROUGE:+(rows.reduce((s,r)=>s+r.rouge,0)/rows.length).toFixed(3),
      Latency: Math.round(rows.reduce((s,r)=>s+r.ms,0)/rows.length),
      Cost: +(rows.reduce((s,r)=>s+r.cost,0)).toFixed(3),
    };
  });
}

/* ─────────────────────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────────────────────── */
const STEPS = STEPS_B;

function Sidebar({ step, nav, taskType, selModels, metrics }) {
  const done = id => ({ 1: step > 1 && !!taskType, 2: step > 2 && metrics.some(m=>m.enabled), 3: step > 3 && selModels.length>0, 4:false }[id]);
  return (
    <aside style={{ width:180, background:T.base, borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column", flexShrink:0 }}>
      <div style={{ padding:"12px 14px 10px", borderBottom:`1px solid ${T.border}`, display:"flex", gap:8, alignItems:"center" }}>
        <div style={{ width:24, height:24, background:T.blue, borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><polygon points="7,1 9.5,5.5 14,5.5 10.5,8.5 12,13 7,10 2,13 3.5,8.5 0,5.5 4.5,5.5" fill="white"/></svg>
        </div>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:T.hi, fontFamily:UI, letterSpacing:"-0.2px" }}>StackEval</div>
          <div style={{ fontSize:10, color:T.lo, fontFamily:UI }}>LLM Evaluation</div>
        </div>
      </div>
      <nav style={{ flex:1, padding:"8px", overflowY:"auto" }}>
        {STEPS.map(s => {
          const active = step===s.id;
          const complete = done(s.id);
          return (
            <button key={s.id} onClick={()=>nav(s.id)} style={{
              width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"9px 10px", borderRadius:6, border:"none", marginBottom:1,
              background:active ? T.blueSub : "transparent",
              borderLeft:active ? `2px solid ${T.blue}` : "2px solid transparent",
              cursor:"pointer", textAlign:"left", transition:"all .12s",
            }}
              onMouseEnter={e=>{ if(!active) e.currentTarget.style.background=T.elev; }}
              onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}
            >
              <span style={{ fontSize:13, fontFamily:UI, fontWeight:active?600:400, color:active?T.hi:T.mid }}>
                {s.label}
              </span>
              {active && !complete && (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink:0 }}>
                  <path d="M2 6.5L5.5 10L11 3" stroke={T.blue} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {!active && complete && (
                <div style={{ width:16,height:16,borderRadius:"50%",background:T.blue,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path d="M1 4.5L3.5 7L8 2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </nav>
      <div style={{ padding:"10px 14px", borderTop:`1px solid ${T.border}`, fontSize:10, color:T.lo, fontFamily:UI }}>
        © 2026 Backboard.io
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────────────────────────
   VARIANT B — STEP 1: DEFINE TASK
───────────────────────────────────────────────────────────── */
function DefineTaskStep({ taskType, setTaskType, taskContext, setTaskContext, aiSuggested, dismissAi, onNext }) {
  const [tcPending, setTcPending] = useState(false);
  const [tcPrev,    setTcPrev]    = useState(null);

  const draftTc = () => {
    setTcPrev(taskContext);
    setTaskContext(TASK_CONTEXT_DRAFTS[taskType] || "Evaluating model output quality and accuracy against a reference answer.");
    setTcPending(true);
  };

  return (
    <div style={{ maxWidth:860, margin:"0 auto", padding:"32px 28px" }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:24,fontWeight:700,color:T.hi,letterSpacing:"-0.24px",margin:"0 0 6px",fontFamily:UI }}>Define Task</h1>
        <p style={{ fontSize:14,color:T.mid,margin:0,fontFamily:UI }}>Select a task type and write an evaluation system prompt.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
        {TASK_OPTIONS.map(t => {
          const sel = taskType===t.id;
          const aiHit = sel && aiSuggested?.has("taskType");
          return (
            <button key={t.id} onClick={()=>setTaskType(t.id)} style={{
              background:sel?T.blueSub:T.surface, border:`1px solid ${sel?T.blue:T.border}`,
              outline:sel?`1px solid ${T.blue}`:"none", borderRadius:8, padding:16,
              textAlign:"left", cursor:"pointer", transition:"all .15s", position:"relative",
            }}
              onMouseEnter={e=>{ if(!sel){e.currentTarget.style.borderColor=T.blue;e.currentTarget.style.background=T.elev;} }}
              onMouseLeave={e=>{ if(!sel){e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background=T.surface;} }}
            >
              {aiHit && (
                <div style={{ position:"absolute",inset:0,pointerEvents:"none",borderRadius:8,border:"2px solid rgba(91,142,240,0.5)",background:"rgba(91,142,240,0.08)",boxShadow:"0 0 14px rgba(91,142,240,0.22)" }} />
              )}
              {aiHit && (
                <div style={{ position:"absolute",top:-10,right:8,display:"flex",alignItems:"center",gap:4,background:"rgba(91,142,240,0.9)",borderRadius:5,padding:"3px 8px",boxShadow:"0 2px 8px rgba(91,142,240,0.5)",zIndex:2 }}>
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M5 0.5L6 3.5H9L6.5 5.5L7.5 8.5L5 7L2.5 8.5L3.5 5.5L1 3.5H4L5 0.5Z" fill="#fff"/></svg>
                  <span style={{ fontSize:10,color:"#fff",fontFamily:UI,fontWeight:700 }}>AI</span>
                  <button onClick={e=>{e.stopPropagation();dismissAi("taskType");}} style={{ background:"rgba(255,255,255,0.2)",border:"none",cursor:"pointer",color:"#fff",fontSize:10,padding:"1px 3px",lineHeight:1,borderRadius:2 }}>×</button>
                </div>
              )}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <div style={{ width:6,height:6,borderRadius:"50%",background:t.dot,marginTop:4 }} />
                {sel && (
                  <div style={{ width:16,height:16,borderRadius:"50%",background:T.blue,display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1 4.5L3.5 7L8 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                )}
              </div>
              <div style={{ fontSize:14,fontWeight:600,color:T.hi,marginBottom:5,fontFamily:UI }}>{t.name}</div>
              <div style={{ fontSize:12,color:T.mid,lineHeight:1.5,fontFamily:UI }}>{t.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Evaluation System Prompt */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"flex",alignItems:"baseline",gap:8,marginBottom:8 }}>
          <SubLabel style={{ margin:0 }}>Evaluation System Prompt</SubLabel>
          <span style={{ fontSize:11,color:T.lo,fontFamily:UI }}>— optional</span>
          <div style={{ marginLeft:"auto", display:"flex", gap:3 }}>
            {["{{input}}","{{output}}","{{golden_output}}"].map(v => (
              <button key={v} onClick={()=>setTaskContext(p=>(p?p+"\n":"")+v)} style={{
                padding:"2px 7px", background:T.elev, border:`1px solid ${T.border}`, borderRadius:4,
                fontSize:10, fontFamily:MONO, color:T.mid, cursor:"pointer",
              }}>{v}</button>
            ))}
          </div>
        </div>
        <div style={{ position:"relative" }}>
          <textarea value={taskContext}
            onChange={e=>{ setTaskContext(e.target.value); if(tcPending) setTcPending(false); }}
            placeholder={"You are evaluating a customer support AI assistant.\n\nScore the output on:\n- Factual accuracy vs the reference\n- Tone: professional and helpful\n- Completeness\n\nReturn a score 0–1 with a one-sentence reason.\n\nInput: {{input}}\nOutput: {{output}}\nReference: {{golden_output}}"}
            rows={10}
            style={{ width:"100%", padding:"12px 14px", paddingBottom:36, background:tcPending?"rgba(91,142,240,0.08)":"rgba(255,255,255,0.06)", border:`2px solid ${tcPending?"rgba(91,142,240,0.5)":taskContext?T.blue+"66":T.border}`, borderRadius:8, resize:"vertical", fontSize:13, color:T.hi, outline:"none", boxSizing:"border-box", fontFamily:MONO, lineHeight:1.6, transition:"all .15s" }}
            onFocus={e=>{ if(!tcPending) e.target.style.borderColor=T.blue; }}
            onBlur={e=>{ if(!tcPending) e.target.style.borderColor=taskContext?T.blue+"66":T.border; }}
          />
          {tcPending && (
            <div style={{ position:"absolute",top:-11,left:0,display:"flex",alignItems:"center",gap:5,background:"rgba(91,142,240,0.9)",borderRadius:"4px 4px 0 0",padding:"3px 10px",zIndex:1 }}>
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M5 0.5L6 3.5H9L6.5 5.5L7.5 8.5L5 7L2.5 8.5L3.5 5.5L1 3.5H4L5 0.5Z" fill="#fff"/></svg>
              <span style={{ fontSize:10,color:"#fff",fontFamily:UI,fontWeight:700 }}>AI suggested · edit to accept or</span>
              <button onClick={()=>{ setTaskContext(tcPrev??""); setTcPending(false); }} style={{ background:"rgba(255,255,255,0.2)",border:"none",cursor:"pointer",color:"#fff",fontSize:10,padding:"1px 6px",lineHeight:1.4,borderRadius:3,fontFamily:UI }}>revert ×</button>
            </div>
          )}
          <div style={{ position:"absolute", bottom:8, right:8 }}>
            <DraftButton value={taskContext} pending={tcPending}
              onDraft={draftTc}
              onRevert={()=>{ setTaskContext(tcPrev??""); setTcPending(false); }} />
          </div>
        </div>
        <div style={{ marginTop:5, fontSize:11, color:T.lo, fontFamily:UI }}>
          Variables <span style={{ fontFamily:MONO, color:T.mid }}>{"{{input}}"}</span>, <span style={{ fontFamily:MONO, color:T.mid }}>{"{{output}}"}</span>, <span style={{ fontFamily:MONO, color:T.mid }}>{"{{golden_output}}"}</span> are replaced per evaluation row
        </div>
      </div>

      <div style={{ display:"flex",justifyContent:"flex-end" }}>
        <Btn onClick={onNext} disabled={!taskType}>Continue to Metrics →</Btn>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CUSTOM METRIC PANEL
───────────────────────────────────────────────────────────── */
function CustomMetricPanel({ isOpen, onClose, onSave, editMetric }) {
  const [name, setName]           = useState(editMetric?.name || "");
  const [desc, setDesc]           = useState(editMetric?.description || "");
  const [method, setMethod]       = useState(editMetric?.method || "llm-judge");
  const [epPending, setEpPending] = useState(false);
  const [epPrev,    setEpPrev]    = useState(null);
  const [prompt, setPrompt]       = useState(editMetric?.config?.promptTemplate || `First, describe the persona of your evaluator (e.g. "You are an expert at comparing two answers")

<Rubric>
Provide bullet points for how the LLM should score both correct and incorrect examples, e.g.:
A correct answer:
- Matches the reference answer exactly
- etc.

An incorrect answer:
- Differs from the reference answer
- etc.
</Rubric>

<Instructions>
Score the output on a scale of 0-1 based on the rubric above.
Input: {{input}}
Output: {{output}}
Reference: {{golden_output}}
Score (0-1):
</Instructions>`);
  const [judgeModel, setJudgeModel] = useState(editMetric?.config?.judgeModel || "gpt-4");
  const [scoreFormat, setScoreFormat] = useState(editMetric?.config?.scoreFormat || "numeric");
  const [code, setCode]           = useState(editMetric?.config?.code || "");
  const [threshold, setThreshold] = useState(editMetric?.config?.threshold ?? 0.8);
  const [applyPast, setApplyPast] = useState(false);

  if (!isOpen) return null;

  const save = () => {
    if (!name.trim()) return;
    onSave({ id:editMetric?.id||Date.now().toString(), name, description:desc, enabled:true, method,
      config:{ promptTemplate:prompt, judgeModel, scoreFormat, code, threshold } });
    onClose();
  };

  return (
    <div style={{ position:"fixed",inset:0,zIndex:50,display:"flex",justifyContent:"flex-end" }}>
      <div onClick={onClose} style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.5)" }} />
      <div style={{ position:"relative",width:860,background:T.surface,borderLeft:`1px solid ${T.border}`,display:"flex",flexDirection:"column",overflow:"hidden" }}>
        {/* Header */}
        <div style={{ padding:"16px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0 }}>
          <div style={{ fontSize:15,fontWeight:600,color:T.hi,fontFamily:UI }}>{editMetric?"Edit Custom Metric":"Custom Metrics"}</div>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:T.mid,padding:4,display:"flex",alignItems:"center" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Body: two-column */}
        <div style={{ flex:1,overflow:"hidden",display:"flex" }}>
          {/* Left: main form */}
          <div style={{ flex:1,overflow:"auto",padding:"20px 24px",borderRight:`1px solid ${T.border}` }}>
            {/* Evaluator Name */}
            <div style={{ marginBottom:20 }}>
              <SubLabel>Evaluator Name</SubLabel>
              <Input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Correctness" />
            </div>

            {/* Apply to past runs */}
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:20 }}>
              <button onClick={()=>setApplyPast(p=>!p)} style={{
                width:34,height:18,borderRadius:9,border:"none",cursor:"pointer",padding:2,
                background:applyPast?T.blue:T.elev,transition:"background .15s",flexShrink:0,
                display:"flex",alignItems:"center",justifyContent:applyPast?"flex-end":"flex-start"
              }}>
                <div style={{ width:14,height:14,borderRadius:"50%",background:"#fff" }} />
              </button>
              <span style={{ fontSize:13,color:T.mid,fontFamily:UI }}>Apply to past runs</span>
            </div>

            <Divider my={0} />

            {/* Prompt & Model */}
            <div style={{ marginTop:20 }}>
              <div style={{ fontSize:14,fontWeight:600,color:T.hi,fontFamily:UI,marginBottom:6 }}>Prompt &amp; Model</div>
              <p style={{ fontSize:12,color:T.mid,fontFamily:UI,margin:"0 0 16px" }}>
                Define the criteria you want to evaluate in your prompt. Use a saved prompt from Prompt Hub or write your own.
              </p>

              {/* Method tabs */}
              <div style={{ marginBottom:16 }}>
                <SubLabel>Evaluation Method</SubLabel>
                <div style={{ display:"flex",gap:6 }}>
                  {[["llm-judge","LLM Judge"],["code","Code"],["embedding","Embedding"]].map(([v,l])=>(
                    <button key={v} onClick={()=>setMethod(v)} style={{
                      flex:1,padding:"7px 0",borderRadius:6,fontSize:13,cursor:"pointer",fontFamily:UI,
                      background:method===v?T.blue:T.elev, color:method===v?"#fff":T.mid,
                      border:`1px solid ${method===v?T.blue:T.border}`,
                    }}>{l}</button>
                  ))}
                </div>
              </div>

              {method==="llm-judge" && (
                <>
                  {/* Model + Score Format row */}
                  <div style={{ display:"flex",gap:12,marginBottom:16 }}>
                    <div style={{ flex:1 }}>
                      <SubLabel>Judge Model</SubLabel>
                      <Select value={judgeModel} onChange={setJudgeModel} style={{ width:"100%" }} options={[["gpt-4","GPT-4"],["gpt-4-turbo","GPT-4 Turbo"],["claude-3-opus","Claude 3 Opus"],["claude-3-sonnet","Claude 3 Sonnet"]]} />
                    </div>
                    <div style={{ flex:1 }}>
                      <SubLabel>Score Format</SubLabel>
                      <div style={{ display:"flex",gap:6 }}>
                        {[["numeric","0–1"],["binary","Binary"],["likert","1–5"]].map(([v,l])=>(
                          <button key={v} onClick={()=>setScoreFormat(v)} style={{
                            flex:1,padding:"6px 0",borderRadius:5,fontSize:12,cursor:"pointer",fontFamily:UI,
                            background:T.elev, color:scoreFormat===v?T.hi:T.mid,
                            border:`1px solid ${scoreFormat===v?T.blue:T.border}`,
                          }}>{l}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* System prompt */}
                  <div>
                    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}>
                      <SubLabel>System Prompt</SubLabel>
                      <span style={{ fontSize:11,color:T.lo,fontFamily:UI }}>Use {"{{input}}"}, {"{{output}}"}, {"{{golden_output}}"} as variables</span>
                    </div>
                    <div style={{ background:T.elev,border:`1px solid ${T.border}`,borderRadius:6,overflow:"hidden" }}>
                      <div style={{ padding:"6px 12px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:6 }}>
                        <span style={{ fontSize:11,fontWeight:600,letterSpacing:"0.06em",color:T.lo,fontFamily:UI,textTransform:"uppercase" }}>System</span>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5l3 3 3-3" stroke={T.lo} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <div style={{ position:"relative" }}>
                        <Textarea value={prompt}
                          onChange={e=>{ setPrompt(e.target.value); if(epPending) setEpPending(false); }} rows={12}
                          style={{ border:epPending?"2px solid rgba(91,142,240,0.5)":"none", borderRadius:epPending?6:0, background:epPending?"rgba(91,142,240,0.08)":"transparent", resize:"vertical", fontFamily:UI, fontSize:13, lineHeight:1.6, paddingBottom:36 }} />
                        {epPending && (
                          <div style={{ position:"absolute",top:-11,left:0,display:"flex",alignItems:"center",gap:5,background:"rgba(91,142,240,0.9)",borderRadius:"4px 4px 0 0",padding:"3px 10px",zIndex:1 }}>
                            <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M5 0.5L6 3.5H9L6.5 5.5L7.5 8.5L5 7L2.5 8.5L3.5 5.5L1 3.5H4L5 0.5Z" fill="#fff"/></svg>
                            <span style={{ fontSize:10,color:"#fff",fontFamily:UI,fontWeight:700 }}>AI suggested · edit to accept or</span>
                            <button onClick={()=>{ setPrompt(epPrev??""); setEpPending(false); }} style={{ background:"rgba(255,255,255,0.2)",border:"none",cursor:"pointer",color:"#fff",fontSize:10,padding:"1px 6px",lineHeight:1.4,borderRadius:3,fontFamily:UI }}>revert ×</button>
                          </div>
                        )}
                        <div style={{ position:"absolute", bottom:8, right:8 }}>
                          <DraftButton value={prompt} pending={epPending}
                            onDraft={()=>{ setEpPrev(prompt); setPrompt(draftEvaluatorPrompt(name)); setEpPending(true); }}
                            onRevert={()=>{ setPrompt(epPrev??""); setEpPending(false); }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop:10,padding:"8px 10px",background:"rgba(252,211,77,0.05)",border:`1px solid rgba(252,211,77,0.15)`,borderRadius:6,display:"flex",gap:8,alignItems:"flex-start" }}>
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ flexShrink:0,marginTop:1 }}><path d="M7 2L12.5 11.5H1.5L7 2Z" stroke="#FCD34D" strokeWidth="1.2"/><path d="M7 6v3M7 10.5h.01" stroke="#FCD34D" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    <span style={{ fontSize:11,color:"#FCD34D",fontFamily:UI }}>LLM Judge adds one model call per evaluation row — affects cost and latency.</span>
                  </div>
                </>
              )}

              {method==="code" && (
                <div>
                  <SubLabel>Evaluation Function</SubLabel>
                  <Textarea value={code} onChange={e=>setCode(e.target.value)} rows={12}
                    placeholder={`# Return a float 0-1\ndef evaluate(input, output, golden_output):\n    # your logic here\n    return 1.0 if output == golden_output else 0.0`}
                    style={{ fontFamily:MONO, fontSize:12 }} />
                </div>
              )}

              {method==="embedding" && (
                <div>
                  <SubLabel>Similarity Threshold</SubLabel>
                  <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:6 }}>
                    <input type="range" min={0} max={1} step={0.05} value={threshold}
                      onChange={e=>setThreshold(parseFloat(e.target.value))}
                      style={{ flex:1,accentColor:T.blue }} />
                    <span style={{ fontFamily:MONO,fontSize:13,color:T.hi,width:36 }}>{threshold.toFixed(2)}</span>
                  </div>
                  <div style={{ fontSize:11,color:T.lo,fontFamily:UI }}>Cosine similarity threshold to consider a match.</div>
                </div>
              )}
            </div>
          </div>

          {/* Right: example panel */}
          <div style={{ width:280,overflow:"auto",padding:"20px 20px",flexShrink:0 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
              <div style={{ fontSize:13,fontWeight:600,color:T.hi,fontFamily:UI }}>Example</div>
              <span style={{ fontSize:11,color:T.blueTxt,fontFamily:UI,cursor:"pointer" }}>Test</span>
            </div>
            <p style={{ fontSize:12,color:T.mid,fontFamily:UI,margin:"0 0 16px",lineHeight:1.5 }}>
              Use an example from your dataset to help map variables to inputs, outputs, and reference outputs.
            </p>

            {[["INPUT","e.g. user question or context"],["OUTPUT","e.g. model response"],["REFERENCE OUTPUT","e.g. ground truth answer"]].map(([label,hint])=>(
              <div key={label} style={{ marginBottom:14 }}>
                <div style={{ fontSize:11,fontWeight:600,letterSpacing:"0.08em",color:T.lo,fontFamily:UI,textTransform:"uppercase",marginBottom:6 }}>{label}</div>
                <div style={{ background:T.elev,border:`1px solid ${T.border}`,borderRadius:6,padding:"10px 12px",minHeight:40 }}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="10" height="10" rx="2" stroke={T.lo} strokeWidth="1.2"/><path d="M4.5 7h5M4.5 4.5h5M4.5 9.5h3" stroke={T.lo} strokeWidth="1.2" strokeLinecap="round"/></svg>
                    <span style={{ fontSize:11,color:T.lo,fontFamily:UI,fontStyle:"italic" }}>{hint}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:"12px 20px",borderTop:`1px solid ${T.border}`,display:"flex",gap:8,justifyContent:"flex-end",flexShrink:0 }}>
          <Btn onClick={onClose} variant="ghost">Cancel</Btn>
          <Btn onClick={save}>Save Evaluator</Btn>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   VARIANT B — STEP 2 / SHARED: DEFINE METRICS
───────────────────────────────────────────────────────────── */
function DefineMetricsStep({ metrics, setMetrics, taskType, taskContext, customMetrics, setCustomMetrics, aiSuggested, dismissAi, onNext, onBack }) {
  const [panelOpen, setPanelOpen]   = useState(false);
  const [editMetric, setEditMetric] = useState(null);
  const [showPresets, setShowPresets] = useState(false);

  const toggle = id => setMetrics(p => p.map(m => m.id===id?{...m,enabled:!m.enabled}:m));
  const hasEnabled = metrics.some(m=>m.enabled) || customMetrics.some(m=>m.enabled);
  const hasLLM = metrics.find(m=>m.id==="judge")?.enabled || customMetrics.some(m=>m.enabled&&m.method==="llm-judge");

  const METRIC_DESC = {
    f1:          "Token-level precision/recall. Good for short exact-match answers.",
    bleu:        "N-gram overlap vs. reference. Originally for machine translation — not great for open-ended responses.",
    rouge:       "Longest common subsequence vs. reference. Captures coverage, but unreliable for generative tasks.",
    exact:       "Binary match after normalization. Only useful when the correct answer is a single string.",
    meteor:      "Incorporates stemming and synonym matching — more robust than BLEU for varied phrasing.",
    bert:        "Semantic similarity via BERT embeddings — better than n-gram metrics for open-ended output.",
    answer_rel:  "LLM checks if the output actually answers the input question. Good for QA evaluation.",
    faithfulness:"LLM checks if output is grounded in retrieved context. Essential for RAG pipelines.",
    judge:       "Custom LLM judge — score against criteria you define. Most flexible, adds one model call per row.",
    human:       "Human annotation scores imported via CSV. Gold standard — slow but most reliable.",
  };

  const saveCustom = m => {
    if (editMetric) setCustomMetrics(p=>p.map(x=>x.id===editMetric.id?m:x));
    else setCustomMetrics(p=>[...p,m]);
    setEditMetric(null);
  };

  const methodColor = { "llm-judge":T.mAmber, "code":T.mBlue, "embedding":T.mTeal };
  const taskLabel = TASK_OPTIONS.find(t=>t.id===taskType)?.name;

  return (
    <>
      <div style={{ maxWidth:720,margin:"0 auto",padding:"32px 28px" }}>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:24,fontWeight:700,color:T.hi,letterSpacing:"-0.24px",margin:"0 0 6px",fontFamily:UI }}>Define Evaluation Metrics</h1>
          <p style={{ fontSize:14,color:T.mid,margin:0,fontFamily:UI }}>Choose how outputs will be scored. Custom evaluators work best for open-ended tasks.</p>
        </div>

        {/* Task + Context + System Prompt Summary — always visible */}
        <div style={{ marginBottom:24, background:T.elev, border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden" }}>
          <div style={{ padding:"8px 14px", borderBottom:`1px solid ${T.borderS}`, display:"flex", alignItems:"center", gap:8 }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1 2h10M1 6h7M1 10h4" stroke={T.mid} strokeWidth="1.3" strokeLinecap="round"/></svg>
            <span style={{ fontSize:10,fontWeight:600,color:T.mid,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:UI }}>Evaluation Setup</span>
            <button onClick={onBack} style={{ marginLeft:"auto",background:"none",border:`1px solid ${T.border}`,borderRadius:4,cursor:"pointer",fontSize:11,color:T.mid,fontFamily:UI,padding:"2px 8px" }}>← Edit</button>
          </div>
          <div style={{ padding:"12px 14px", display:"flex", flexDirection:"column", gap:10 }}>
            {/* Task type */}
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:80,flexShrink:0,fontSize:10,fontWeight:600,color:T.lo,letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:UI }}>Task</div>
              {taskType ? (
                <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                  <div style={{ width:7,height:7,borderRadius:"50%",background:TASK_OPTIONS.find(t=>t.id===taskType)?.dot||T.mid,flexShrink:0 }} />
                  <span style={{ fontSize:13,fontWeight:600,color:T.hi,fontFamily:UI }}>{TASK_OPTIONS.find(t=>t.id===taskType)?.name}</span>
                </div>
              ) : (
                <span style={{ fontSize:12,color:T.lo,fontFamily:UI,fontStyle:"italic" }}>Not selected</span>
              )}
            </div>
            {/* System prompt */}
            <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
              <div style={{ width:80,flexShrink:0,fontSize:10,fontWeight:600,color:T.lo,letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:UI,paddingTop:2 }}>Prompt</div>
              {taskContext ? (
                <div style={{ fontSize:11,color:T.mid,fontFamily:MONO,lineHeight:1.5,flex:1,minWidth:0,background:T.surface,borderRadius:4,padding:"5px 8px",maxHeight:44,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",whiteSpace:"pre-wrap" }}>
                  {taskContext}
                </div>
              ) : (
                <span style={{ fontSize:12,color:T.lo,fontFamily:UI,fontStyle:"italic" }}>No system prompt</span>
              )}
            </div>
          </div>
        </div>

        {/* Custom Evaluators — primary */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <div>
                <div style={{ fontSize:15,fontWeight:600,color:T.hi,fontFamily:UI }}>Custom Evaluators</div>
                <div style={{ fontSize:12,color:T.mid,fontFamily:UI,marginTop:2 }}>LLM-as-judge, code functions, or embedding similarity</div>
              </div>
              {aiSuggested?.has("customMetrics") && (
                <div style={{ display:"flex",alignItems:"center",gap:4,background:"rgba(91,142,240,0.9)",borderRadius:5,padding:"3px 10px",boxShadow:"0 2px 8px rgba(91,142,240,0.4)" }}>
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M5 0.5L6 3.5H9L6.5 5.5L7.5 8.5L5 7L2.5 8.5L3.5 5.5L1 3.5H4L5 0.5Z" fill="#fff"/></svg>
                  <span style={{ fontSize:10,color:"#fff",fontFamily:UI,fontWeight:700 }}>AI added</span>
                  <button onClick={()=>dismissAi?.("customMetrics")} style={{ background:"rgba(255,255,255,0.2)",border:"none",cursor:"pointer",color:"#fff",fontSize:10,padding:"1px 3px",lineHeight:1,borderRadius:2 }}>×</button>
                </div>
              )}
            </div>
            <Btn onClick={()=>{setEditMetric(null);setPanelOpen(true);}}>+ Add Evaluator</Btn>
          </div>

          {customMetrics.length===0 ? (
            <button onClick={()=>{setEditMetric(null);setPanelOpen(true);}} style={{
              width:"100%", border:`1.5px dashed ${T.blue}`, borderRadius:8, padding:"22px 0",
              background:"rgba(59,130,246,0.03)", cursor:"pointer", display:"flex", flexDirection:"column",
              alignItems:"center", gap:6, transition:"background .15s",
            }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(59,130,246,0.07)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(59,130,246,0.03)"}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8.5" stroke={T.blue} strokeWidth="1.3"/><path d="M10 6.5v7M6.5 10h7" stroke={T.blue} strokeWidth="1.5" strokeLinecap="round"/></svg>
              <div style={{ fontSize:13,fontWeight:500,color:T.blueTxt,fontFamily:UI }}>Add your first evaluator</div>
              <div style={{ fontSize:11,color:T.lo,fontFamily:UI }}>Most reliable for open-ended generative tasks</div>
            </button>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
              {customMetrics.map(m => {
                const mc = methodColor[m.method] || T.mBlue;
                const methodLabel = m.method==="llm-judge"?"LLM Judge":m.method==="code"?"Code Fn":"Embedding";
                return (
                  <div key={m.id} style={{ background:m.aiAdded?"rgba(91,142,240,0.08)":T.surface, border:`2px solid ${m.aiAdded?"rgba(91,142,240,0.5)":m.enabled?T.blue+"44":T.border}`, borderLeft:m.aiAdded?"3px solid rgba(91,142,240,0.5)":undefined, borderRadius:8, padding:"10px 14px", display:"flex", alignItems:"center", gap:10, transition:"all .15s", boxShadow:m.aiAdded?"0 0 0 1px rgba(91,142,240,0.12)":"none" }}>
                    <CheckBox checked={m.enabled} onClick={()=>setCustomMetrics(p=>p.map(x=>x.id===m.id?{...x,enabled:!x.enabled}:x))} />
                    <Badge label={methodLabel} color={mc} />
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:13,fontWeight:500,color:T.hi,fontFamily:UI }}>{m.name}</div>
                      {m.description && <div style={{ fontSize:11,color:T.lo,fontFamily:UI,marginTop:1 }}>{m.description}</div>}
                    </div>
                    <button onClick={()=>{setEditMetric(m);setPanelOpen(true);}} style={{ background:"none",border:`1px solid ${T.border}`,cursor:"pointer",color:T.mid,padding:"3px 8px",fontSize:11,fontFamily:UI,borderRadius:4 }}>Edit</button>
                    <button onClick={()=>setCustomMetrics(p=>p.filter(x=>x.id!==m.id))} style={{ background:"none",border:"none",cursor:"pointer",color:T.lo,padding:"2px 4px",fontSize:16,lineHeight:1 }}>×</button>
                  </div>
                );
              })}

            </div>
          )}
        </div>

        {hasLLM && (
          <div style={{ marginBottom:16,padding:"10px 12px",background:"rgba(252,211,77,0.06)",border:`1px solid rgba(252,211,77,0.2)`,borderRadius:6,display:"flex",gap:10,alignItems:"flex-start" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink:0,marginTop:1 }}><path d="M7 2L12.5 11.5H1.5L7 2Z" stroke="#FCD34D" strokeWidth="1.2"/><path d="M7 6v3M7 10.5h.01" stroke="#FCD34D" strokeWidth="1.2" strokeLinecap="round"/></svg>
            <span style={{ fontSize:12,color:"#FCD34D",fontFamily:UI }}>LLM-as-Judge adds one model call per row — affects cost and latency estimates.</span>
          </div>
        )}

        <Divider />

        {/* Preset Metrics — collapsible, 3 shown by default */}
        <div>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
            <SubLabel style={{ margin:0 }}>Preset Metrics</SubLabel>
            <span style={{ fontSize:11,color:T.lo,fontFamily:UI }}>Statistical — exact-match tasks</span>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
            {(showPresets ? metrics : metrics.slice(0,3)).map(m => (
              <div key={m.id} onClick={()=>toggle(m.id)} style={{
                background:T.surface, border:`1px solid ${m.enabled?T.blue+"44":T.border}`,
                borderRadius:7, padding:"10px 14px", display:"flex", alignItems:"flex-start", gap:10,
                cursor:"pointer", transition:"border-color .15s",
              }}
                onMouseEnter={e=>{ if(!m.enabled) e.currentTarget.style.borderColor=T.dis; }}
                onMouseLeave={e=>{ if(!m.enabled) e.currentTarget.style.borderColor=T.border; }}
              >
                <CheckBox checked={m.enabled} onClick={e=>{e.stopPropagation();toggle(m.id);}} />
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:3 }}>
                    <span style={{ fontSize:13,fontWeight:500,color:T.hi,fontFamily:UI }}>{m.name}</span>
                    <Badge label={m.color===T.mBlue?"Statistical":m.color===T.mTeal?"Semantic":m.color===T.mAmber?"LLM Judge":"Human"} color={m.color} />
                    {m.llm && <Badge label="Model call" color={T.mAmber} />}
                  </div>
                  <div style={{ fontSize:12,color:T.lo,fontFamily:UI,lineHeight:1.5 }}>{METRIC_DESC[m.id] || m.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={()=>setShowPresets(p=>!p)} style={{ marginTop:8, display:"flex", alignItems:"center", gap:4, background:"none", border:"none", cursor:"pointer", padding:0 }}>
            <span style={{ fontSize:12,color:T.mid,fontFamily:UI }}>{showPresets ? `Show less` : `Show all ${metrics.length} metrics`}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color:T.mid, transform:showPresets?"rotate(180deg)":"none", transition:"transform .2s" }}><path d="M2.5 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:24,paddingTop:20,borderTop:`1px solid ${T.border}` }}>
          {onBack && <Btn onClick={onBack} variant="ghost">← Back</Btn>}
          <Btn onClick={onNext} disabled={!hasEnabled} style={{ marginLeft:"auto" }}>Continue to Model Selection →</Btn>
        </div>
      </div>

      <CustomMetricPanel isOpen={panelOpen} onClose={()=>setPanelOpen(false)} onSave={saveCustom} editMetric={editMetric} />
    </>
  );
}


/* ─────────────────────────────────────────────────────────────
   STEP: MODEL SELECTION (with criteria inline)
───────────────────────────────────────────────────────────── */
const ALL_PROVIDERS_LIST = ["OpenAI","Anthropic","Google","Meta","Cohere","AWS Bedrock","Featherless","xAI","OpenRouter","Cerebras"];
const EXT_MODELS = ALL_MODELS.map(m => ({
  ...m,
  humanEval: m.lmsys ? Math.round((m.lmsys - 1100) * 0.55 + 40) : null,
  math:      m.lmsys ? Math.round((m.lmsys - 1100) * 0.38 + 28) : null,
  helmet:    m.lmsys ? Math.round((m.lmsys - 1100) * 0.42 + 60) : null,
}));

function ModelSelectionStep({ criteria, setCriteria, selModels, setSelModels, taskType, taskContext, metrics, onNext, onBack }) {
  const [search, setSearch]           = useState("");
  const [activeProviders, setActiveProviders] = useState([]);
  const [ossF, setOssF]         = useState(null);
  const [minCtx, setMinCtx]     = useState(0);
  const [maxCostSl, setMaxCostSl] = useState(50);
  const [dateFilter, setDateFilter] = useState("all");

  const isSelected = id => selModels.some(m => m.id === id);
  const toggleModel = m => isSelected(m.id) ? setSelModels(p => p.filter(x => x.id !== m.id)) : setSelModels(p => [...p, m]);
  const capNum = parseFloat(criteria.maxCostCap) || Infinity;

  const setPriorityLevel = (id, newLevel) => {
    setCriteria(prev => {
      const newP = {
        high:   prev.priorities.high.filter(i=>i!==id),
        medium: prev.priorities.medium.filter(i=>i!==id),
        low:    prev.priorities.low.filter(i=>i!==id),
      };
      newP[newLevel] = [...newP[newLevel], id];
      return { ...prev, priorities:newP };
    });
  };

  const filtered = EXT_MODELS.filter(m => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.provider.toLowerCase().includes(search.toLowerCase())) return false;
    if (ossF !== null && m.oss !== ossF) return false;
    if (criteria.openSourceOnly && !m.oss) return false;
    if (activeProviders.length > 0 && !activeProviders.includes(m.provider)) return false;
    if (m.ctx < minCtx) return false;
    if (m.cost > Math.min(maxCostSl, capNum)) return false;
    if (dateFilter === "6mo" && m.released < 2024) return false;
    if (dateFilter === "year" && m.released < 2023) return false;
    return true;
  });

  const recommended = [...EXT_MODELS].sort((a, b) => {
    const hi = criteria.priorities?.high || [];
    let sa = 0, sb = 0;
    if (hi.includes("accuracy"))       { sa += (a.lmsys||1100)/10; sb += (b.lmsys||1100)/10; }
    if (hi.includes("cost"))          { sa += (30-(a.cost||30))*2; sb += (30-(b.cost||30))*2; }
    if (hi.includes("speed"))         { sa += a.speed/3; sb += b.speed/3; }
    if (hi.includes("contextWindow")) { sa += a.ctx/10000; sb += b.ctx/10000; }
    sa += ((a.lmsys||1100)-1100)/2; sb += ((b.lmsys||1100)-1100)/2;
    return sb - sa;
  }).slice(0, 3);

  const { priorities, openSourceOnly } = criteria;

  const StatVal = ({ label, val }) => (
    <span style={{ display:"inline-flex", alignItems:"baseline", gap:3 }}>
      <span style={{ fontSize:10, color:T.lo, fontFamily:MONO, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</span>
      <span style={{ fontFamily:MONO, fontSize:12, fontWeight:600, color:T.mid }}>{val}</span>
    </span>
  );

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [openFilters, setOpenFilters] = useState({ priorities:true, provider:true, source:true, ctx:true, cost:true, date:true });
  const toggleFilter = k => setOpenFilters(p=>({...p,[k]:!p[k]}));

  const FilterSection = ({ id, label, children }) => (
    <div style={{ borderBottom:`1px solid ${T.borderS}` }}>
      <button onClick={()=>toggleFilter(id)} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 14px", background:"none", border:"none", cursor:"pointer" }}>
        <span style={{ fontSize:10,fontWeight:700,color:T.mid,letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:UI }}>{label}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color:T.lo, transform:openFilters[id]?"rotate(180deg)":"none", transition:"transform .15s", flexShrink:0 }}><path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      {openFilters[id] && <div style={{ padding:"0 14px 12px" }}>{children}</div>}
    </div>
  );

  const FilterPanel = () => (
    <div style={{ flex:1, overflow:"auto" }}>
      {/* Search */}
      <div style={{ padding:"10px 14px", borderBottom:`1px solid ${T.borderS}` }}>
        <div style={{ position:"relative" }}>
          <svg width="13" height="13" viewBox="0 0 13 13" style={{ position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",color:T.lo,pointerEvents:"none" }} fill="none">
            <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="M9 9L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search models..."
            style={{ width:"100%",paddingLeft:26,paddingRight:8,paddingTop:7,paddingBottom:7,background:T.elev,border:`1px solid ${T.border}`,borderRadius:6,fontSize:12,color:T.hi,outline:"none",boxSizing:"border-box",fontFamily:UI }} />
        </div>
      </div>

      <FilterSection id="priorities" label="Criteria">
        <div style={{ fontSize:10,color:T.lo,fontFamily:UI,marginBottom:8 }}>Affects which models appear under Recommended</div>
        {Object.entries(PRIORITY_CFG).map(([id, cfg]) => {
          const level = priorities.high.includes(id) ? 'high' : priorities.medium.includes(id) ? 'medium' : priorities.low.includes(id) ? 'low' : null;
          return (
            <div key={id} style={{ marginBottom:7 }}>
              <div style={{ fontSize:11,color:T.mid,fontFamily:UI,marginBottom:3 }}>{cfg.label}</div>
              <div style={{ display:"flex",gap:3 }}>
                {[['high','High','#4ADE80'],['medium','Med','#FBBF24'],['low','Low','#94A3B8']].map(([lvl,lbl,clr]) => (
                  <button key={lvl} onClick={()=>setPriorityLevel(id, lvl)} style={{
                    flex:1,padding:"4px 0",fontSize:10,borderRadius:4,cursor:"pointer",fontFamily:UI,
                    background:level===lvl?`${clr}22`:T.elev,color:level===lvl?clr:T.lo,
                    border:`1px solid ${level===lvl?`${clr}55`:T.border}`,fontWeight:level===lvl?600:400,
                  }}>{lbl}</button>
                ))}
              </div>
            </div>
          );
        })}

      </FilterSection>

      <FilterSection id="provider" label="Provider">
        <div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>
          {ALL_PROVIDERS_LIST.map(p => {
            const on = activeProviders.includes(p);
            return (
              <button key={p} onClick={()=>setActiveProviders(prev=>prev.includes(p)?prev.filter(x=>x!==p):[...prev,p])} style={{
                padding:"3px 7px",borderRadius:5,fontSize:10,fontFamily:UI,cursor:"pointer",
                background:on?T.blue:T.elev,color:on?"#fff":T.mid,
                border:`1px solid ${on?T.blue:T.border}`,fontWeight:on?500:400,
              }}>{p}</button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection id="source" label="Source Type">
        <div style={{ display:"flex",gap:5 }}>
          {[[null,"All"],[true,"Open"],[false,"Closed"]].map(([v,l]) => (
            <button key={l} onClick={()=>setOssF(v)} style={{
              flex:1,padding:"6px 0",borderRadius:6,fontSize:11,fontFamily:UI,cursor:"pointer",
              background:ossF===v?T.blue:T.elev,color:ossF===v?"#fff":T.mid,
              border:`1px solid ${ossF===v?T.blue:T.border}`,
            }}>{l}</button>
          ))}
        </div>
      </FilterSection>

      <FilterSection id="ctx" label="Min Context Window">
        <input type="range" min={0} max={200000} step={4096} value={minCtx} onChange={e=>setMinCtx(+e.target.value)}
          style={{ width:"100%",accentColor:T.blue,cursor:"pointer",marginBottom:4 }} />
        <div style={{ fontSize:11,color:T.mid,fontFamily:UI }}>{minCtx===0?"Any":`${(minCtx/1000).toFixed(0)}K+`}</div>
      </FilterSection>

      <FilterSection id="cost" label="Cost per 1M tokens">
        <input type="range" min={1} max={50} step={1} value={maxCostSl} onChange={e=>setMaxCostSl(+e.target.value)}
          style={{ width:"100%",accentColor:T.blue,cursor:"pointer",marginBottom:4 }} />
        <div style={{ fontSize:11,color:T.mid,fontFamily:UI }}>${maxCostSl}</div>
      </FilterSection>

      <FilterSection id="date" label="Release Date">
        <div style={{ display:"flex",gap:4 }}>
          {[["all","All"],["6mo","6 mo"],["year","1 yr"]].map(([v,l]) => (
            <button key={v} onClick={()=>setDateFilter(v)} style={{
              flex:1,padding:"6px 0",borderRadius:6,fontSize:11,fontFamily:UI,cursor:"pointer",
              background:T.elev,color:dateFilter===v?T.hi:T.mid,
              border:`1px solid ${dateFilter===v?T.blue:T.border}`,
            }}>{l}</button>
          ))}
        </div>
      </FilterSection>
    </div>
  );
  return (
    <div style={{ flex:1, minHeight:0, display:"flex", background:T.base, overflow:"hidden" }}>

      {/* LEFT — collapsible filter panel */}
      <div style={{ width:filtersOpen?252:44, background:T.surface, borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column", flexShrink:0, transition:"width .2s cubic-bezier(.4,0,.2,1)", overflow:"hidden" }}>
        <div style={{ padding:"8px 14px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <button onClick={()=>setFiltersOpen(p=>!p)} style={{ display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer",flex:1,padding:0 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink:0 }}><path d="M2 4h10M4 7h6M6 10h2" stroke={T.mid} strokeWidth="1.4" strokeLinecap="round"/></svg>
            {filtersOpen && <span style={{ fontSize:11,fontWeight:600,color:T.lo,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:UI,whiteSpace:"nowrap" }}>Filters</span>}
            {filtersOpen && <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft:"auto",color:T.lo,flexShrink:0 }}><path d="M2 4l3-3 3 3M2 6l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>}
          </button>

        </div>
        {filtersOpen && <FilterPanel />}
      </div>

      {/* CENTER — scrollable model table */}
      <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"8px 16px",flexShrink:0 }}>
          <span style={{ fontSize:12,color:T.mid,fontFamily:UI }}>{filtered.length} models</span>
        </div>
        <div style={{ flex:1,overflow:"auto",padding:16 }}>
          {/* Recommended */}
          <div style={{ marginBottom:20 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><polygon points="6.5,1 8,4.5 11.5,4.5 8.75,6.5 9.75,10 6.5,8 3.25,10 4.25,6.5 1.5,4.5 5,4.5" fill={T.blue}/></svg>
              <span style={{ fontSize:13,fontWeight:500,color:T.hi,fontFamily:UI }}>Recommended for You</span>
              <Badge label="Based on criteria" color={T.rBlue} />
            </div>
            {criteria.priorities.high.length===0 && criteria.priorities.medium.length===0 ? (
              <div style={{ padding:"24px 16px",textAlign:"center",color:T.mid,fontSize:12,fontFamily:UI,background:T.elev,border:`1px dashed ${T.border}`,borderRadius:8,lineHeight:1.6 }}>
                Set a criteria priority above<br/>to get model recommendations
              </div>
            ) : (
            <Card style={{ padding:0,overflow:"hidden" }}>
              {recommended.map((m,i) => {
                const badge=getRecBadge(m,criteria); const sel=isSelected(m.id);
                return (
                  <button key={m.id} onClick={()=>toggleModel(m)} style={{
                    width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
                    background:sel?T.blueSub:"transparent",
                    cursor:"pointer",textAlign:"left",
                    borderTop:"none", borderRight:"none", borderBottom:i<2?`1px solid ${T.border}`:"none",
                    borderLeft:`3px solid ${sel?T.blue:"transparent"}`,
                  }}
                    onMouseEnter={e=>{ if(!sel) e.currentTarget.style.background=T.elev; }}
                    onMouseLeave={e=>{ if(!sel) e.currentTarget.style.background="transparent"; }}
                  >
                    <div style={{ width:12,display:"flex",justifyContent:"center",flexShrink:0 }}>
                      {sel && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1.5 6L4.5 9L10.5 3" stroke={T.blueTxt} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div style={{ minWidth:0, flex:1, overflow:"hidden" }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:6, marginBottom:4 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, minWidth:0 }}>
                          <span style={{ fontSize:13,fontWeight:600,color:T.hi,fontFamily:UI,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{m.name}</span>
                          <Chip name={m.provider} />
                        </div>
                        {badge && <Badge label={badge.label} color={badge.color} />}
                      </div>
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <StatVal label="$/1M" val={`${m.cost}`} />
                        <StatVal label="spd" val={`${m.speed}t/s`} />
                        <StatVal label="ctx" val={`${(m.ctx/1000).toFixed(0)}K`} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </Card>
            )}
          </div>
          {/* All models table */}
          <div>
            <SubLabel>All Models</SubLabel>
            <div style={{ overflowX:"auto", border:`1px solid ${T.border}`, borderRadius:8 }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:480 }}>
                <thead>
                  <tr style={{ background:T.elev, position:"sticky", top:0, zIndex:1 }}>
                    {[["","18px"],["Model","auto"],["Provider","90px"],["Cost","80px"],["Speed","60px"],["Ctx","55px"]].map(([h,w]) => (
                      <th key={h} style={{ width:w, padding:"7px 10px", textAlign:"left", fontSize:10, fontWeight:600, color:T.lo, letterSpacing:"0.07em", textTransform:"uppercase", fontFamily:UI, borderBottom:`1px solid ${T.border}`, whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m,i) => {
                    const sel=isSelected(m.id);
                    return (
                      <tr key={m.id} onClick={()=>toggleModel(m)} style={{
                        background:sel?"rgba(91,142,240,0.06)":"transparent",
                        borderBottom:i<filtered.length-1?`1px solid ${T.borderS}`:"none",
                        borderLeft:`2px solid ${sel?T.blue:"transparent"}`,
                        cursor:"pointer",
                      }}
                        onMouseEnter={e=>{ if(!sel) e.currentTarget.style.background=T.elev; }}
                        onMouseLeave={e=>{ if(!sel) e.currentTarget.style.background="transparent"; }}
                      >
                        <td style={{ padding:"7px 10px", width:18 }}>
                          <div style={{ display:"flex",justifyContent:"center" }}>
                            {sel && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 5L3.5 7.5L9 2" stroke={T.blueTxt} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                        </td>
                        <td style={{ padding:"7px 10px" }}>
                          <span style={{ fontSize:12,fontWeight:500,color:T.hi,fontFamily:UI,whiteSpace:"nowrap" }}>{m.name}</span>
                          {m.oss && <span style={{ marginLeft:5 }}><Badge label="OSS" color={T.mGreen} /></span>}
                        </td>
                        <td style={{ padding:"7px 10px" }}><Chip name={m.provider} /></td>
                        <td style={{ padding:"7px 10px" }}><span style={{ fontFamily:MONO,fontSize:11,color:T.hi,whiteSpace:"nowrap" }}>${m.cost}<span style={{ fontSize:9,color:T.lo,marginLeft:2 }}>/1M</span></span></td>
                        <td style={{ padding:"7px 10px" }}><span style={{ fontFamily:MONO,fontSize:11,color:T.hi }}>{m.speed}</span></td>
                        <td style={{ padding:"7px 10px" }}><span style={{ fontFamily:MONO,fontSize:11,color:T.hi }}>{(m.ctx/1000).toFixed(0)}K</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — selected models only */}
      <div style={{ width:224,background:T.surface,borderLeft:`1px solid ${T.border}`,display:"flex",flexDirection:"column",flexShrink:0 }}>
        <div style={{ padding:"10px 14px",borderBottom:`1px solid ${T.border}`,flexShrink:0 }}>
          <span style={{ fontSize:11,fontWeight:600,color:T.mid,letterSpacing:"0.04em",textTransform:"uppercase",fontFamily:UI }}>
            Selected {selModels.length > 0 && <span style={{ color:T.blueTxt }}>· {selModels.length}</span>}
          </span>
        </div>        <div style={{ flex:1,overflow:"auto",padding:"6px 14px 8px" }}>
          {selModels.length===0 && (
            <div style={{ padding:"12px 0",color:T.lo,fontSize:12,fontFamily:UI,textAlign:"center" }}>
              Click models to add
            </div>
          )}
          {selModels.map((m,i) => (
            <div key={m.id} style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 8px",background:T.elev,border:`1px solid ${T.border}`,borderRadius:5,marginBottom:5 }}>
              <div style={{ width:7,height:7,borderRadius:2,background:MODEL_COLORS[i%MODEL_COLORS.length],flexShrink:0 }} />
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:11,fontWeight:500,color:T.hi,fontFamily:UI,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{m.name}</div>
                <div style={{ fontSize:10,color:T.lo,fontFamily:UI }}>{m.provider}</div>
              </div>
              <button onClick={()=>setSelModels(p=>p.filter(x=>x.id!==m.id))} style={{ background:"none",border:"none",cursor:"pointer",color:T.lo,padding:0,fontSize:14,lineHeight:1,flexShrink:0 }}>×</button>
            </div>
          ))}
        </div>

        {/* Footer nav */}
        <div style={{ padding:"10px 12px",borderTop:`1px solid ${T.border}`,flexShrink:0 }}>
          <Btn onClick={onNext} disabled={selModels.length===0} style={{ width:"100%",padding:"9px 0",fontSize:13 }}>Continue →</Btn>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
/* ─────────────────────────────────────────────────────────────
   EVAL RESULTS — ABC Output Comparison
   (shown after user clicks Run Evaluation)
───────────────────────────────────────────────────────────── */

// Model accent colors for the comparison view
const MODEL_COLORS = ["#5B8EF0","#A78BFA","#34D399","#FB923C","#F87171"];

// Rich mock evaluation data (5 rows with per-model rougeL/cost/lat)
const EVAL_DATA = [
  { id:1,
    input:"What is your baggage allowance for economy class?",
    golden:"Economy passengers can bring one carry-on bag (up to 22x14x9 inches, 15 lbs) and one personal item. For checked bags, domestic flights allow one bag up to 50 lbs for a fee; many international routes include one free checked bag. Overweight or extra bags will incur additional charges.",
    outputs:{
      0:{ text:"I'm not sure about specific baggage policies without knowing which airline you're flying with, as these vary significantly. Typically, most airlines allow one carry-on item and a personal item for free in economy class. For checked baggage, many airlines include one free checked bag with economy tickets, though some budget carriers charge for this.", rougeL:9.4, f1:0.12, bleu:0.08, cost:0.0031, lat:4.21 },
      1:{ text:"Welcome! In economy class, you're typically allowed one carry-on and one personal item. For checked bags, limits vary by route, so please check your specific booking details!", rougeL:16.8, f1:0.21, bleu:0.14, cost:0.0012, lat:2.05 },
      2:{ text:"Economy class passengers may bring one carry-on bag and one personal item on board. Checked baggage allowance varies by fare type and route, but most economy fares include one checked bag up to 23 kg (50 lb). Please check your ticket details for the exact allowance.", rougeL:41.2, f1:0.52, bleu:0.38, cost:0.0008, lat:1.87 },
      3:{ text:"Economy passengers are entitled to one carry-on and one personal item. Checked bag allowances differ by route and fare class — one bag is typically included on international flights.", rougeL:28.5, f1:0.61, bleu:0.42, cost:0.0006, lat:1.64 },
    }
  },
  { id:2,
    input:"How do I check in for my flight online?",
    golden:"Online check-in opens 24 hours before departure. Head to our website or app, select 'Check-In,' and enter your confirmation number and last name. From there you can pick your seat, add baggage, and grab your boarding pass — all from your phone!",
    outputs:{
      0:{ text:"Most airlines allow online check-in starting 24 hours before departure through their website or mobile app. You'll need your booking reference and passport information. You can usually download a mobile boarding pass or print one at the airport. The exact process depends on your specific airline.", rougeL:21.3, f1:0.28, bleu:0.19, cost:0.0028, lat:3.94 },
      1:{ text:"It's easy! Just visit our website or mobile app 24 hours before your flight, enter your confirmation code, and you'll have your boarding pass in no time.", rougeL:38.7, f1:0.45, bleu:0.33, cost:0.0011, lat:1.88 },
      2:{ text:"You can check in online by visiting our website or mobile app and selecting \"Check In.\" Enter your booking reference and last name to access your reservation. Online check-in usually opens 24 hours before departure.", rougeL:44.1, f1:0.55, bleu:0.41, cost:0.0009, lat:1.72 },
      3:{ text:"Online check-in is available 24 hours before departure via our website or app. Enter your booking reference and last name, then select your seat and download your boarding pass.", rougeL:36.2, f1:0.58, bleu:0.44, cost:0.0007, lat:1.58 },
    }
  },
  { id:3,
    input:"Can I change my flight after booking?",
    golden:"Yes, flight changes can be made online, through our app, or by calling us. Flexible and business fares usually allow free changes, while basic economy tickets may be more limited. Any fare difference will apply at the time of the change.",
    outputs:{
      0:{ text:"This depends entirely on your airline and the type of fare you purchased. Some airlines allow free changes, while others charge fees that can range from $50–$200+ depending on the route. Non-refundable fares typically have stricter change policies.", rougeL:12.1, f1:0.16, bleu:0.10, cost:0.0034, lat:4.55 },
      1:{ text:"Yes, you can! Changes depend on your ticket type. Visit \"Manage Booking\" to see your options; please note that fare differences or change fees may apply.", rougeL:29.4, f1:0.35, bleu:0.25, cost:0.0014, lat:2.11 },
      2:{ text:"Yes, most tickets allow changes, though change fees or fare differences may apply depending on your ticket type. You can modify your booking through \"Manage Booking\" on our website or contact customer support.", rougeL:37.8, f1:0.48, bleu:0.35, cost:0.0009, lat:1.93 },
      3:{ text:"Flight changes are possible for most fare types. Flexible fares are free to change; basic economy may have restrictions. Any price difference will be collected at the time of modification.", rougeL:31.5, f1:0.54, bleu:0.39, cost:0.0007, lat:1.71 },
    }
  },
  { id:4,
    input:"What happens if my flight is cancelled?",
    golden:"If your flight is cancelled, we'll automatically rebook you on the next available flight and notify you by email or SMS. You can also opt for a full refund to your original payment method. If an overnight stay is needed due to a cancellation on our end, hotel and meal vouchers may be provided.",
    outputs:{
      0:{ text:"Airline cancellation policies are determined by each carrier, but generally they're required to offer you either a rebooking on another flight, a full refund, or a travel credit. In some regions, you may be entitled to compensation. Check your airline's policy or contact them directly.", rougeL:11.7, f1:0.15, bleu:0.09, cost:0.0029, lat:4.12 },
      1:{ text:"We've got you covered! If a flight is cancelled, we'll do our best to rebook you on the next available flight or provide a full refund if you prefer not to travel.", rougeL:31.6, f1:0.38, bleu:0.27, cost:0.0013, lat:2.22 },
      2:{ text:"If your flight is cancelled, we will automatically rebook you on the next available flight when possible. You may also choose to request a refund or select an alternative flight through our website or customer support.", rougeL:39.2, f1:0.50, bleu:0.36, cost:0.0009, lat:1.89 },
      3:{ text:"Cancelled flights are automatically rebooked on the next available departure. Alternatively, request a full refund through our website. Vouchers for meals or hotels may apply for disruptions caused by the airline.", rougeL:33.4, f1:0.57, bleu:0.40, cost:0.0007, lat:1.66 },
    }
  },
  { id:5,
    input:"How early should I arrive at the airport?",
    golden:"We recommend arriving at least 2 hours before domestic flights and 3 hours before international flights. This gives you comfortable time for check-in, bag drop, and security. During busy travel periods, a little extra buffer is always a good idea.",
    outputs:{
      0:{ text:"General travel advice suggests arriving 2–3 hours before domestic flights and 3–4 hours before international flights. This can vary based on the airport's congestion, time of day, and how familiar you are with the airport. During peak travel times, arriving earlier is a good idea.", rougeL:29.8, f1:0.36, bleu:0.24, cost:0.0026, lat:3.77 },
      1:{ text:"To keep things stress-free, we recommend arriving 2 hours early for domestic flights and 3 hours for international journeys. Safe travels!", rougeL:52.3, f1:0.60, bleu:0.46, cost:0.0010, lat:1.74 },
      2:{ text:"We recommend arriving 2 hours before departure for domestic flights and 3 hours before departure for international flights. This allows time for check-in, security screening, and boarding.", rougeL:58.1, f1:0.68, bleu:0.52, cost:0.0008, lat:1.61 },
      3:{ text:"Plan to arrive at least 2 hours early for domestic and 3 hours for international travel. Factor in extra time during peak seasons or at busy hub airports.", rougeL:44.7, f1:0.71, bleu:0.55, cost:0.0006, lat:1.49 },
    }
  },
];

/* ── Export dropdown ─────────────────────────────────────────── */
function ExportMenu({ models }) {
  const [open, setOpen] = useState(false);

  const doExport = (fmt) => {
    setOpen(false);
    const rows = EVAL_DATA.map((row, ri) => {
      const obj = { row: ri+1, input: row.input, golden: row.golden };
      models.forEach((m, mi) => {
        const v = row.outputs[mi] || {};
        obj[m.name+"_output"]  = v.text  || "";
        obj[m.name+"_rouge"]   = v.rougeL ?? "";
        obj[m.name+"_cost"]    = v.cost   ?? "";
        obj[m.name+"_latency"] = v.lat    ?? "";
      });
      return obj;
    });

    let content, mime, ext;
    if (fmt === "csv") {
      const keys = Object.keys(rows[0]);
      const csv = [keys.join(","), ...rows.map(r => keys.map(k => JSON.stringify(r[k]??"",-1).replace(/^"|"$/g,"")).join(","))].join("\n");
      content = csv; mime = "text/csv"; ext = "csv";
    } else if (fmt === "json") {
      content = JSON.stringify({ exported: new Date().toISOString(), models: models.map(m=>m.name), rows }, null, 2);
      mime = "application/json"; ext = "json";
    } else {
      const lines = ["StackEval Export", "Generated: "+new Date().toLocaleDateString(), ""];
      models.forEach((m,mi) => {
        const avg = key => (EVAL_DATA.reduce((s,r)=>(s+(r.outputs[mi]?.[key]||0)),0)/EVAL_DATA.length);
        lines.push(`${m.name}: ROUGE-L ${avg("rougeL").toFixed(1)} avg, $${avg("cost").toFixed(4)}/call, ${avg("lat").toFixed(2)}s avg`);
      });
      content = lines.join("\n"); mime = "text/plain"; ext = "txt";
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], {type:mime}));
    a.download = `stackeval-results.${ext}`;
    a.click();
  };

  return (
    <div style={{ position:"relative" }}>
      <Btn small onClick={()=>setOpen(p=>!p)} style={{ display:"flex", alignItems:"center", gap:5 }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3 5l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Export
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
      </Btn>
      {open && (
        <>
          <div onClick={()=>setOpen(false)} style={{ position:"fixed",inset:0,zIndex:98 }} />
          <div style={{ position:"absolute",top:"calc(100% + 6px)",right:0,width:160,background:T.elev,border:`1px solid ${T.border}`,borderRadius:8,padding:4,zIndex:99,boxShadow:"0 8px 24px rgba(0,0,0,0.5)" }}>
            {[["csv","CSV","Spreadsheet rows"],["json","JSON","Full structured data"],["txt","Text report","Summary per model"]].map(([fmt,label,desc])=>(
              <button key={fmt} onClick={()=>doExport(fmt)} style={{ width:"100%",padding:"8px 10px",background:"none",border:"none",cursor:"pointer",textAlign:"left",borderRadius:5,display:"flex",flexDirection:"column",gap:1 }}
                onMouseEnter={e=>e.currentTarget.style.background=T.high}
                onMouseLeave={e=>e.currentTarget.style.background="none"}
              >
                <span style={{ fontSize:13,fontWeight:500,color:T.hi,fontFamily:UI }}>{label}</span>
                <span style={{ fontSize:11,color:T.lo,fontFamily:UI }}>{desc}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EvalResults({ models, taskType, onNewEval, embedded, enabledMetrics: passedMetrics }) {
  const [layout, setLayout]     = useState("b");
  const [search, setSearch]     = useState("");
  const [sortVal, setSortVal]   = useState("default");
  const [filterVal, setFilterVal] = useState("all");
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Map user-selected metric IDs to data keys and display info
  const METRIC_MAP = {
    rouge: { key:"rouge", dataKey:"rougeL", label:"ROUGE-L", higher:true, fmt:v=>v.toFixed(1), fmtShort:v=>v.toFixed(1)+" avg", badgeTx:"Most Accurate", badgeColor:T.rBlue, tipKey:"rouge",
      note:(wN,wV,rN,rV)=>`Runner-up ${rN} scores ${rV.replace(" avg","")} — ${wV.replace(" avg","")} pts behind` },
    f1:    { key:"f1", dataKey:"f1", label:"F1 Score", higher:true, fmt:v=>(v*100).toFixed(1)+"%", fmtShort:v=>(v*100).toFixed(1)+"% avg", badgeTx:"Highest F1", badgeColor:T.rBlue, tipKey:"f1",
      note:(wN,wV,rN,rV)=>`Runner-up ${rN} at ${rV.replace(" avg","")}` },
    bleu:  { key:"bleu", dataKey:"bleu", label:"BLEU", higher:true, fmt:v=>(v*100).toFixed(1)+"%", fmtShort:v=>(v*100).toFixed(1)+"% avg", badgeTx:"Highest BLEU", badgeColor:T.rPurple, tipKey:"bleu",
      note:(wN,wV,rN,rV)=>`Runner-up ${rN} at ${rV.replace(" avg","")}` },
    cost:  { key:"cost", dataKey:"cost", label:"Cost", higher:false, fmt:v=>"$"+v.toFixed(4), fmtShort:v=>"$"+v.toFixed(4)+" avg", badgeTx:"Cheapest", badgeColor:T.rGreen, tipKey:"cost",
      note:(wN,wV,rN,rV)=>`Runner-up ${rN} at ${rV.replace(" avg","")} — compare impact at scale` },
    lat:   { key:"lat", dataKey:"lat", label:"Latency", higher:false, fmt:v=>v.toFixed(2)+"s", fmtShort:v=>v.toFixed(2)+"s avg", badgeTx:"Fastest", badgeColor:T.rTeal, tipKey:"lat",
      note:(wN,wV,rN,rV)=>`Runner-up ${rN} at ${rV.replace(" avg","")}` },
  };

  // Build metric list from user-selected metrics, always add cost + latency
  const buildMetricOrder = () => {
    const order = [];
    const seen = new Set();
    if (passedMetrics && passedMetrics.length > 0) {
      passedMetrics.forEach(m => {
        if (METRIC_MAP[m.id] && !seen.has(m.id)) { order.push({ ...METRIC_MAP[m.id], visible:true }); seen.add(m.id); }
      });
    }
    // Always include cost and latency if not already
    if (!seen.has("cost")) order.push({ ...METRIC_MAP.cost, visible:true });
    if (!seen.has("lat")) order.push({ ...METRIC_MAP.lat, visible:true });
    // Fallback if no quality metrics
    if (order.every(m => m.key === "cost" || m.key === "lat")) {
      order.unshift({ ...METRIC_MAP.rouge, visible:true });
    }
    return order;
  };

  // Model/metric order with visibility (draggable)
  const [modelOrder, setModelOrder] = useState(
    models.slice(0,4).map((m, i) => ({ id:m.id, name:m.name, provider:m.provider, color:MODEL_COLORS[i], visible:true }))
  );
  const [metricOrder, setMetricOrder] = useState(buildMetricOrder);

  // Drag state
  const dragRef = useRef({ type:null, key:null });
  const [dragOver, setDragOver] = useState(null);

  const visModels  = modelOrder.filter(m => m.visible);
  const visMetrics = metricOrder.filter(m => m.visible);

  // ── Helpers ──────────────────────────────────────────────────
  const getRow = (row, modelIdx) => row.outputs[modelIdx] || row.outputs[0];

  const getMetricVal = (output, metKey) => {
    const mm = METRIC_MAP[metKey];
    return mm ? (output[mm.dataKey] ?? 0) : 0;
  };

  const getWinner = (row, metKey) => {
    const mm = METRIC_MAP[metKey];
    if (!mm) return null;
    const vals = modelOrder.map((m, i) => ({ i, val: getMetricVal(getRow(row,i), metKey) }));
    const valid = vals.filter(v => v.val > 0);
    if (!valid.length) return null;
    return mm.higher ? valid.reduce((a,b) => b.val > a.val ? b : a).i : valid.reduce((a,b) => b.val < a.val ? b : a).i;
  };

  const fmtMetric = (val, key) => {
    const mm = METRIC_MAP[key];
    return mm ? mm.fmt(val) : val.toFixed(2);
  };

  // ── Filtering ────────────────────────────────────────────────
  const getRows = () => {
    let rows = [...EVAL_DATA];
    const s = search.toLowerCase().trim();
    if (s) rows = rows.filter(r =>
      r.input.toLowerCase().includes(s) ||
      r.golden.toLowerCase().includes(s) ||
      modelOrder.some((m,i) => getRow(r,i).text.toLowerCase().includes(s))
    );
    if (filterVal === "zero")       rows = rows.filter(r => modelOrder.every((_,i) => getMetricVal(getRow(r,i), metricOrder[0]?.key || "rouge") === 0));
    else if (filterVal.startsWith("best-")) {
      const idx = parseInt(filterVal.replace("best-",""));
      rows = rows.filter(r => getWinner(r, metricOrder[0]?.key || "rouge") === idx);
    }
    if (sortVal === "rouge-desc")   rows.sort((a,b) => Math.max(...modelOrder.map((_,i)=>getMetricVal(getRow(b,i),"rouge"))) - Math.max(...modelOrder.map((_,i)=>getMetricVal(getRow(a,i),"rouge"))));
    else if (sortVal === "rouge-asc")  rows.sort((a,b) => Math.max(...modelOrder.map((_,i)=>getMetricVal(getRow(a,i),"rouge"))) - Math.max(...modelOrder.map((_,i)=>getMetricVal(getRow(b,i),"rouge"))));
    else if (sortVal === "cost-asc")   rows.sort((a,b) => Math.min(...modelOrder.map((_,i)=>getMetricVal(getRow(a,i),"cost"))) - Math.min(...modelOrder.map((_,i)=>getMetricVal(getRow(b,i),"cost"))));
    else if (sortVal === "lat-asc")    rows.sort((a,b) => Math.min(...modelOrder.map((_,i)=>getMetricVal(getRow(a,i),"lat"))) - Math.min(...modelOrder.map((_,i)=>getMetricVal(getRow(b,i),"lat"))));
    else if (sortVal === "f1-desc")    rows.sort((a,b) => Math.max(...modelOrder.map((_,i)=>getMetricVal(getRow(b,i),"f1"))) - Math.max(...modelOrder.map((_,i)=>getMetricVal(getRow(a,i),"f1"))));
    else if (sortVal === "bleu-desc")  rows.sort((a,b) => Math.max(...modelOrder.map((_,i)=>getMetricVal(getRow(b,i),"bleu"))) - Math.max(...modelOrder.map((_,i)=>getMetricVal(getRow(a,i),"bleu"))));
    return rows;
  };

  const rows = getRows();

  // ── Drag helpers ────────────────────────────────────────────
  const handleDragStart = (type, key) => { dragRef.current = { type, key }; };
  const handleDrop = (type, targetKey) => {
    const { type:dt, key:dk } = dragRef.current;
    if (dt !== type || dk === targetKey) { setDragOver(null); return; }
    const arr = type === "model" ? modelOrder : metricOrder;
    const setArr = type === "model" ? setModelOrder : setMetricOrder;
    const fromI = arr.findIndex(x => x[type==="model"?"id":"key"] === dk);
    const toI   = arr.findIndex(x => x[type==="model"?"id":"key"] === targetKey);
    if (fromI < 0 || toI < 0) return;
    const next = [...arr];
    const [item] = next.splice(fromI, 1);
    next.splice(toI, 0, item);
    setArr(next);
    setDragOver(null);
  };

  const toggleModelVis = (id) => {
    const vis = modelOrder.filter(m=>m.visible);
    if (vis.length <= 1 && modelOrder.find(m=>m.id===id)?.visible) return;
    setModelOrder(p => p.map(m => m.id===id ? {...m,visible:!m.visible} : m));
  };
  const toggleMetricVis = (key) => {
    const vis = metricOrder.filter(m=>m.visible);
    if (vis.length <= 1 && metricOrder.find(m=>m.key===key)?.visible) return;
    setMetricOrder(p => p.map(m => m.key===key ? {...m,visible:!m.visible} : m));
  };

  // ── Leaders ────────────────────────────────────────────────
  const LEADER_CFGS = metricOrder.map(met => ({
    label: met.label,
    badgeTx: met.badgeTx,
    badgeColor: met.badgeColor,
    getVal: (r,i) => getMetricVal(getRow(r,i), met.key),
    fmt: v => (met.fmtShort || met.fmt)(v),
    higher: met.higher,
    note: met.note,
    metKey: met.key,
  }));

  // ── Win detection ─────────────────────────────────────────
  const globalWinner = (cfg) => {
    const avgs = modelOrder.map((m,i) => ({ m, i, avg: EVAL_DATA.reduce((s,r)=>s+cfg.getVal(r,i),0)/EVAL_DATA.length }));
    return cfg.higher ? avgs.reduce((a,b)=>b.avg>a.avg?b:a) : avgs.reduce((a,b)=>b.avg<a.avg?b:a);
  };

  // ── Golden block ─────────────────────────────────────────
  const GoldenBlock = ({ text }) => (
    <div style={{ background:"rgba(252,211,77,0.05)",border:"1px solid rgba(252,211,77,0.18)",borderRadius:6,padding:"10px 14px",marginTop:12 }}>
      <span style={{ fontFamily:MONO,fontSize:10,textTransform:"uppercase",letterSpacing:"0.07em",color:"#FCD34D",background:"rgba(252,211,77,0.1)",border:"1px solid rgba(252,211,77,0.25)",borderRadius:3,padding:"2px 6px",display:"inline-block",marginBottom:6 }}>Reference Output</span>
      <div style={{ fontSize:13,color:T.mid,lineHeight:1.6 }}>{text}</div>
    </div>
  );

  // ── Small badge ─────────────────────────────────────────
  const SmBadge = ({ color, text }) => (
    <span style={{ height:16,padding:"0 6px",borderRadius:4,border:`1px solid ${color.bd}`,background:color.bg,fontSize:9,fontFamily:MONO,fontWeight:500,letterSpacing:"0.04em",textTransform:"uppercase",display:"inline-flex",alignItems:"center",color:color.tx,whiteSpace:"nowrap",flexShrink:0 }}>{text}</span>
  );

  // ── Mini bar track ────────────────────────────────────────
  const MiniBar = ({ pct, color, dim }) => (
    <div style={{ flex:1,height:4,background:T.borderS,borderRadius:2,overflow:"hidden" }}>
      <div style={{ height:"100%",borderRadius:2,background:color,opacity:dim?0.28:1,width:`${Math.max(pct,2)}%`,transition:"width .4s" }} />
    </div>
  );

  // ══════════════ LAYOUT A — SYNCHRONIZED GRID ═══════════════
  const LayoutA = () => (
    <div style={{ border:`1px solid ${T.border}`,borderRadius:8,overflow:"hidden" }}>
      <table style={{ width:"100%",borderCollapse:"collapse" }}>
        <thead>
          <tr style={{ background:T.elev }}>
            <th style={{ width:28,padding:"10px 12px",textAlign:"left",fontSize:10,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.08em",color:T.lo,borderBottom:`1px solid ${T.border}`,fontFamily:MONO }}>#</th>
            <th style={{ width:200,padding:"10px 12px",textAlign:"left",fontSize:10,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.08em",color:T.lo,borderBottom:`1px solid ${T.border}`,fontFamily:MONO }}>Input + Reference</th>
            {visModels.map((m,ci) => (
              <th key={m.id} style={{ padding:"10px 12px",textAlign:"left",fontSize:10,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.08em",color:T.lo,borderBottom:`1px solid ${T.border}`,borderLeft:`1px solid ${T.border}`,fontFamily:MONO,width:`${Math.floor(60/visModels.length)}%` }}>
                <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                  <div style={{ width:7,height:7,borderRadius:2,background:m.color,flexShrink:0 }} />
                  {m.name}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const modelIdxMap = visModels.map(m => modelOrder.findIndex(x=>x.id===m.id));
            const rW = getWinner(row,"rouge"), cW = getWinner(row,"cost"), lW = getWinner(row,"lat");
            const maxR = Math.max(...modelOrder.map((_,i)=>getRow(row,i).rougeL));
            const maxC = Math.max(...modelOrder.map((_,i)=>getRow(row,i).cost));
            const maxL = Math.max(...modelOrder.map((_,i)=>getRow(row,i).lat));
            return (
              <tr key={row.id} style={{ borderBottom:`1px solid ${T.borderS}` }}>
                <td style={{ padding:"14px 12px",verticalAlign:"top" }}>
                  <span style={{ fontFamily:MONO,fontSize:11,color:T.lo }}>{row.id}</span>
                </td>
                <td style={{ padding:"14px 12px",verticalAlign:"top" }}>
                  <div style={{ fontSize:14,color:T.hi,lineHeight:1.5,marginBottom:4 }}>{row.input}</div>
                  <GoldenBlock text={row.golden} />
                </td>
                {visModels.map((m, ci) => {
                  const mIdx = modelIdxMap[ci];
                  const v = getRow(row, mIdx);
                  const isRW = mIdx===rW, isCW = mIdx===cW, isLW = mIdx===lW;
                  const rPct = maxR>0 ? v.rougeL/maxR*100 : 0;
                  const cPct = maxC>0 ? v.cost/maxC*100 : 0;
                  const lPct = maxL>0 ? v.lat/maxL*100 : 0;
                  return (
                    <td key={m.id} style={{ padding:"14px 12px",verticalAlign:"top",borderLeft:`1px solid ${T.borderS}` }}>
                      <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginBottom:8,minHeight:20 }}>
                        {isRW&&maxR>0 && <SmBadge color={T.mBlue} text="Best ROUGE-L" />}
                        {isCW&&visMetrics.find(x=>x.key==="cost") && <SmBadge color={T.mGreen} text="Cheapest" />}
                        {isLW&&visMetrics.find(x=>x.key==="lat") && <SmBadge color={T.mTeal} text="Fastest" />}
                      </div>
                      <div style={{ fontSize:13,color:T.mid,lineHeight:1.6,marginBottom:10,display:"-webkit-box",WebkitLineClamp:5,WebkitBoxOrient:"vertical",overflow:"hidden" }}>{v.text}</div>
                      <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
                        {visMetrics.map(met => {
                          const isW = met.key==="rouge"?isRW:met.key==="cost"?isCW:isLW;
                          const val = met.key==="rouge"?v.rougeL:met.key==="cost"?v.cost:v.lat;
                          const pct = met.key==="rouge"?rPct:met.key==="cost"?cPct:lPct;
                          return (
                            <div key={met.key} style={{ display:"flex",alignItems:"center",gap:6 }}>
                              <span style={{ fontFamily:MONO,fontSize:9,color:T.lo,textTransform:"uppercase",letterSpacing:"0.06em",width:44,flexShrink:0 }}>{met.label}</span>
                              <MiniBar pct={pct} color={m.color} dim={!isW&&met.key==="rouge"} />
                              <span style={{ fontFamily:MONO,fontSize:11,color:isW?T.hi:T.mid,minWidth:50,fontWeight:isW?500:400 }}>{fmtMetric(val,met.key)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {/* Avg row */}
          <tr style={{ background:T.elev,borderTop:`1px solid ${T.border}` }}>
            <td style={{ padding:"10px 12px" }} />
            <td style={{ padding:"10px 12px" }}>
              <span style={{ fontFamily:MONO,fontSize:10,textTransform:"uppercase",letterSpacing:"0.07em",color:T.lo }}>Averages — {EVAL_DATA.length} rows</span>
            </td>
            {visModels.map((m, ci) => {
              const mIdx = modelOrder.findIndex(x=>x.id===m.id);
              const gW = (cfg) => { const avgs = modelOrder.map((_,i)=>({i,avg:EVAL_DATA.reduce((s,r)=>s+cfg.getVal(r,i),0)/EVAL_DATA.length})); return cfg.higher?avgs.reduce((a,b)=>b.avg>a.avg?b:a).i:avgs.reduce((a,b)=>b.avg<a.avg?b:a).i; };
              return (
                <td key={m.id} style={{ padding:"10px 12px",verticalAlign:"top",borderLeft:`1px solid ${T.border}` }}>
                  {visMetrics.map(met => {
                    const cfg = LEADER_CFGS.find(c=>c.label.toLowerCase()===({rouge:"accuracy",cost:"cost",lat:"speed"}[met.key]));
                    if (!cfg) return null;
                    const avg = EVAL_DATA.reduce((s,r)=>s+cfg.getVal(r,mIdx),0)/EVAL_DATA.length;
                    const isW = gW(cfg)===mIdx;
                    return (
                      <div key={met.key} style={{ display:"flex",alignItems:"center",gap:6,marginBottom:4,fontFamily:MONO,fontSize:11 }}>
                        <span style={{ color:T.lo,width:52 }}>{met.label}</span>
                        <span style={{ color:isW?T.hi:T.mid,fontWeight:isW?500:400 }}>{fmtMetric(avg,met.key)}</span>
                        {isW && <SmBadge color={cfg.badgeColor} text="avg best" />}
                      </div>
                    );
                  })}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );

  // ══════════════ LAYOUT B — ROW FOCUS ACCORDION ════════════════
  const LayoutB = () => (
    <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
      {rows.map(row => {
        const winners = {};
        visMetrics.forEach(met => { winners[met.key] = getWinner(row, met.key); });
        const firstQualityMet = visMetrics.find(m => m.higher);
        const firstQualityMax = firstQualityMet ? Math.max(...modelOrder.map((_,i)=>getMetricVal(getRow(row,i), firstQualityMet.key))) : 0;
        const exp = expandedRows.has(row.id);
        const toggleRow = () => setExpandedRows(p => { const n=new Set(p); n.has(row.id)?n.delete(row.id):n.add(row.id); return n; });
        return (
          <div key={row.id} style={{ background:T.surface,border:`1px solid ${exp?T.blue:T.border}`,borderRadius:8,overflow:"hidden",transition:"border-color .15s" }}>
            {/* Header */}
            <div onClick={toggleRow} style={{ padding:"13px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer" }}>
              <span style={{ fontFamily:MONO,fontSize:11,color:T.lo,width:24,flexShrink:0 }}>{String(row.id).padStart(2,"0")}</span>
              <span style={{ fontSize:14,color:T.hi,flex:1,lineHeight:1.4 }}>{row.input}</span>
              <div style={{ display:"flex",alignItems:"center",gap:5,flexShrink:0 }}>
                {visModels.map(m => (
                  <div key={m.id} style={{ width:8,height:8,borderRadius:2,background:m.color,opacity:0.7 }} />
                ))}
              </div>
              <span style={{ color:T.lo,fontSize:16,transition:"transform .2s",transform:exp?"rotate(90deg)":"none" }}>›</span>
            </div>
            {/* Expanded body */}
            {exp && (
              <div style={{ borderTop:`1px solid ${T.border}` }}>
                <div style={{ padding:"10px 16px", borderBottom:`1px solid ${T.border}`, background:T.base }}>
                  <GoldenBlock text={row.golden} />
                </div>
                <div style={{ display:"flex",overflowX:"auto",alignItems:"stretch" }}>
                  {visModels.map(m => {
                    const mi = modelOrder.findIndex(x=>x.id===m.id);
                    const v = getRow(row,mi);
                    const isFirstQW = firstQualityMet && mi===winners[firstQualityMet.key];
                    return (
                      <div key={m.id} style={{ padding:"14px 16px", borderRight:`1px solid ${T.borderS}`, background:isFirstQW&&firstQualityMax>0?"rgba(91,142,240,0.04)":"transparent", display:"flex", flexDirection:"column", minWidth:220, flex:"0 0 220px" }}>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                          <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                            <div style={{ width:2,height:14,borderRadius:2,background:m.color,flexShrink:0 }} />
                            <span style={{ fontSize:12,color:m.color,fontFamily:UI,fontWeight:500 }}>{m.name}</span>
                          </div>
                          <div style={{ display:"flex",gap:3 }}>
                            {isFirstQW&&firstQualityMax>0 && <SmBadge color={T.mBlue} text="Best match" />}
                          </div>
                        </div>
                        <div style={{ fontSize:13,color:T.mid,lineHeight:1.6,marginBottom:10,flex:1 }}>{v.text}</div>
                        <div style={{ borderTop:`1px solid ${T.border}`,paddingTop:10,display:"flex",flexDirection:"column",gap:6 }}>
                          {visMetrics.map(met => {
                            const isW = mi===winners[met.key];
                            const val = getMetricVal(v, met.key);
                            const maxV = Math.max(...modelOrder.map((_,i2)=>getMetricVal(getRow(row,i2), met.key)));
                            const pct = maxV>0 ? val/maxV*100 : 0;
                            return (
                              <div key={met.key} style={{ display:"grid", gridTemplateColumns:"56px 1fr 44px", alignItems:"center", gap:4 }}>
                                <span style={{ fontFamily:MONO,fontSize:10,fontWeight:700,color:T.mid,textTransform:"uppercase",letterSpacing:"0.04em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{met.label}</span>
                                <MiniBar pct={pct} color={m.color} dim={!isW} />
                                <span style={{ fontFamily:MONO,fontSize:11,color:isW?T.hi:T.lo,textAlign:"right",fontWeight:isW?700:400 }}>{fmtMetric(val,met.key)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // ══════════════ LAYOUT C — OUTPUT FOCUS TABLE ════════════════
  const [cSort, setCSort] = useState("rouge-desc");

  const LayoutC = () => (
    <div style={{ border:`1px solid ${T.border}`,borderRadius:8,overflow:"hidden" }}>
      <table style={{ width:"100%",borderCollapse:"collapse" }}>
        <thead>
          <tr style={{ background:T.elev }}>
            {[
              { w:28, label:"#", key:null },
              { w:200, label:"Input + Reference", key:null },
              { w:"44%", label:"Outputs", key:null },
              ...visMetrics.map(m => ({ w:110, label:m.label, key:m.key==="rouge"?"rouge-desc":m.key==="cost"?"cost-asc":"lat-asc" }))
            ].map(col => (
              <th key={col.label} onClick={col.key?()=>setCSort(col.key):undefined} style={{
                width:col.w,padding:"10px 12px",textAlign:"left",
                fontSize:10,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.08em",
                color:cSort===col.key?T.blueTxt:T.lo,
                borderBottom:`1px solid ${T.border}`,
                fontFamily:MONO,cursor:col.key?"pointer":"default",
              }}>{col.label}{cSort===col.key?" ↓":""}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const rW=getWinner(row,"rouge"),cW=getWinner(row,"cost"),lW=getWinner(row,"lat");
            const maxR=Math.max(...modelOrder.map((_,i)=>getRow(row,i).rougeL));
            const maxC=Math.max(...modelOrder.map((_,i)=>getRow(row,i).cost));
            const maxL=Math.max(...modelOrder.map((_,i)=>getRow(row,i).lat));
            return (
              <tr key={row.id} style={{ borderBottom:`1px solid ${T.borderS}` }}>
                <td style={{ padding:"14px 12px",verticalAlign:"top" }}>
                  <span style={{ fontFamily:MONO,fontSize:11,color:T.lo }}>{row.id}</span>
                </td>
                <td style={{ padding:"14px 12px",verticalAlign:"top" }}>
                  <div style={{ fontSize:14,color:T.hi,lineHeight:1.5 }}>{row.input}</div>
                  <GoldenBlock text={row.golden} />
                </td>
                {/* Stacked outputs */}
                <td style={{ padding:"0",verticalAlign:"top" }}>
                  {visModels.map(m => {
                    const mi=modelOrder.findIndex(x=>x.id===m.id);
                    const v=getRow(row,mi);
                    const isRW=mi===rW, isCW=mi===cW, isLW=mi===lW;
                    return (
                      <div key={m.id} style={{ display:"flex",gap:10,padding:"12px 12px",borderBottom:`1px solid ${T.borderS}` }}>
                        <div style={{ width:2,borderRadius:2,flexShrink:0,alignSelf:"stretch",minHeight:14,background:m.color }} />
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:7,flexWrap:"wrap" }}>
                            <span style={{ fontFamily:MONO,fontSize:10,color:m.color,textTransform:"uppercase",letterSpacing:"0.06em" }}>{m.name}</span>
                            {isRW&&maxR>0 && <SmBadge color={T.mBlue} text="Best ROUGE-L" />}
                            {isCW&&visMetrics.find(x=>x.key==="cost") && <SmBadge color={T.mGreen} text="Cheapest" />}
                            {isLW&&visMetrics.find(x=>x.key==="lat") && <SmBadge color={T.mTeal} text="Fastest" />}
                          </div>
                          <div style={{ fontSize:13,color:T.mid,lineHeight:1.6 }}>{v.text}</div>
                        </div>
                      </div>
                    );
                  })}
                </td>
                {/* Stacked metric values per metric column */}
                {visMetrics.map(met => {
                  const maxVal = met.key==="rouge"?maxR:met.key==="cost"?maxC:maxL;
                  const isWIdx = met.key==="rouge"?rW:met.key==="cost"?cW:lW;
                  return (
                    <td key={met.key} style={{ padding:"0",verticalAlign:"top" }}>
                      {visModels.map(m => {
                        const mi=modelOrder.findIndex(x=>x.id===m.id);
                        const v=getRow(row,mi);
                        const val=met.key==="rouge"?v.rougeL:met.key==="cost"?v.cost:v.lat;
                        const pct=maxVal>0?val/maxVal*100:0;
                        const isW=mi===isWIdx;
                        const winBadge = isW&&(met.key==="rouge"?maxR>0:true)
                          ? <SmBadge color={met.key==="rouge"?T.mBlue:met.key==="cost"?T.mGreen:T.mTeal} text="best" />
                          : null;
                        return (
                          <div key={m.id} style={{ padding:"12px 12px",borderBottom:`1px solid ${T.borderS}`,display:"flex",flexDirection:"column",gap:3 }}>
                            <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                              <div style={{ width:7,height:7,borderRadius:2,flexShrink:0,background:m.color }} />
                              <span style={{ fontFamily:MONO,fontSize:13,color:isW?T.hi:T.mid,fontWeight:isW?600:400 }}>{fmtMetric(val,met.key)}</span>
                              {winBadge}
                            </div>
                            <div style={{ height:4,background:T.borderS,borderRadius:2,overflow:"hidden" }}>
                              <div style={{ height:"100%",borderRadius:2,background:m.color,opacity:isW||(met.key!=="rouge")?1:0.25,width:`${Math.max(pct,met.key==="rouge"?0:4)}%`,transition:"width .4s" }} />
                            </div>
                          </div>
                        );
                      })}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {/* Avg row */}
          <tr style={{ background:T.elev,borderTop:`1px solid ${T.border}` }}>
            <td style={{ padding:"10px 12px" }} />
            <td style={{ padding:"10px 12px" }}>
              <span style={{ fontFamily:MONO,fontSize:10,textTransform:"uppercase",letterSpacing:"0.07em",color:T.lo }}>Averages — {EVAL_DATA.length} rows</span>
            </td>
            <td style={{ padding:"10px 12px" }} />
            {visMetrics.map(met => {
              const cfg = LEADER_CFGS.find(c=>c.label.toLowerCase()===({rouge:"accuracy",cost:"cost",lat:"speed"}[met.key]));
              return (
                <td key={met.key} style={{ padding:"10px 12px" }}>
                  {visModels.map(m => {
                    const mi=modelOrder.findIndex(x=>x.id===m.id);
                    const avg=EVAL_DATA.reduce((s,r)=>s+cfg.getVal(r,mi),0)/EVAL_DATA.length;
                    const isW=globalWinner(cfg).i===mi;
                    return (
                      <div key={m.id} style={{ display:"flex",alignItems:"center",gap:5,marginBottom:4 }}>
                        <div style={{ width:6,height:6,borderRadius:1.5,background:m.color }} />
                        <span style={{ fontFamily:MONO,fontSize:11,color:isW?T.hi:T.mid,fontWeight:isW?500:400 }}>{fmtMetric(avg,met.key)}</span>
                        {isW && <SmBadge color={cfg.badgeColor} text="avg" />}
                      </div>
                    );
                  })}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );

  // ── Leaders panel ─────────────────────────────────────────
  const LeadersPanel = () => (
    <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, padding:"20px 24px" }}>
      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:16 }}>
        <span style={{ fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em",color:T.lo,fontFamily:MONO,fontWeight:700 }}>Model Leaders</span>
        <div style={{ display:"flex",alignItems:"center",gap:4 }}>
          {modelOrder.map(m => (
            <button key={m.id} onClick={()=>toggleModelVis(m.id)} style={{
              display:"inline-flex",alignItems:"center",gap:4,height:20,padding:"0 8px",borderRadius:4,
              border:`1px solid ${m.visible?m.color+"60":T.border}`,
              background:m.visible?m.color+"18":T.elev,
              cursor:"pointer",fontFamily:UI,fontSize:11,fontWeight:500,
              color:m.visible?m.color:T.lo, transition:"all .15s",
            }}>
              <div style={{ width:6,height:6,borderRadius:2,background:m.color,opacity:m.visible?1:0.4,flexShrink:0 }} />
              {m.name.split(" ").slice(-1)[0]}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display:"flex",gap:12,overflowX:"auto",paddingBottom:4 }}>
        {LEADER_CFGS.map(cfg => {
          const avgs = modelOrder.map((m,i) => ({ m, i, avg: EVAL_DATA.reduce((s,r)=>s+cfg.getVal(r,i),0)/EVAL_DATA.length }));
          const sorted = [...avgs].sort((a,b) => cfg.higher?b.avg-a.avg:a.avg-b.avg);
          const winner = sorted[0], runner = sorted[1];
          const maxVal = Math.max(...avgs.map(x=>x.avg));
          const minVal = Math.min(...avgs.map(x=>x.avg));
          const range = (maxVal-minVal) || 1;
          return (
            <div key={cfg.label} style={{ background:T.elev, border:`1px solid ${T.border}`, borderRadius:10, padding:"16px 18px", display:"flex", flexDirection:"column", gap:12, minWidth:260, flex:"0 0 260px" }}>
              {/* Header */}
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                  <span style={{ fontSize:12,fontFamily:MONO,fontWeight:700,color:T.mid,textTransform:"uppercase",letterSpacing:"0.07em" }}>{cfg.label}</span>
                  <MetricTip metKey={cfg.metKey||"rouge"} />
                </div>
                <Badge label={cfg.badgeTx} color={cfg.badgeColor} />
              </div>
              {/* Model bars */}
              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                {avgs.map(({m,i,avg}) => {
                  const isW = i===winner.i;
                  const pct = cfg.higher ? (avg/maxVal*100) : ((maxVal-avg)/range*100+8);
                  return (
                    <div key={m.id}>
                      <div style={{ display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:5 }}>
                        <span style={{ fontSize:13,fontWeight:isW?700:400,color:isW?T.hi:T.mid,fontFamily:UI,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"68%" }}>{m.name}</span>
                        <span style={{ fontFamily:MONO,fontSize:12,color:isW?T.hi:T.mid,fontWeight:isW?700:400 }}>{cfg.fmt(avg).replace(" avg","")}</span>
                      </div>
                      <div style={{ width:"100%",height:6,background:T.high,borderRadius:3,overflow:"hidden" }}>
                        <div style={{ height:"100%",borderRadius:3,background:m.color,opacity:isW?1:0.4,width:`${Math.min(pct,100)}%`,transition:"width .6s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Note */}
              <div style={{ padding:"8px 10px",background:T.surface,border:`1px solid ${T.border}`,borderRadius:6,display:"flex",gap:8,alignItems:"flex-start" }}>
                <span style={{ fontSize:9,fontWeight:800,color:T.lo,fontFamily:MONO,letterSpacing:"0.08em",textTransform:"uppercase",flexShrink:0,paddingTop:2,marginTop:1 }}>NOTE</span>
                <span style={{ fontSize:12,color:T.mid,lineHeight:1.55,fontFamily:UI }} dangerouslySetInnerHTML={{ __html: cfg.note(winner.m.name, cfg.fmt(winner.avg), runner.m.name, cfg.fmt(runner.avg)).replace(/Runner-up ([^:]+)/,'Runner-up <strong style="color:#B4B4CC">$1</strong>').replace(/\$([^\s]+) avg/,'$$1') }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── Insight bar ─────────────────────────────────────────
  const InsightBar = () => {
    const rougeAvgs = modelOrder.map((m,i) => ({ m, avg: EVAL_DATA.reduce((s,r)=>s+getRow(r,i).rougeL,0)/EVAL_DATA.length })).sort((a,b)=>b.avg-a.avg);
    const costAvgs  = modelOrder.map((m,i) => ({ m, avg: EVAL_DATA.reduce((s,r)=>s+getRow(r,i).cost,0)/EVAL_DATA.length })).sort((a,b)=>a.avg-b.avg);
    const top = rougeAvgs[0], cheap = costAvgs[0];
    const topCostAvg = EVAL_DATA.reduce((s,r)=>s+getRow(r,modelOrder.findIndex(x=>x.id===top.m.id)).cost,0)/EVAL_DATA.length;
    const cheapCostAvg = EVAL_DATA.reduce((s,r)=>s+getRow(r,modelOrder.findIndex(x=>x.id===cheap.m.id)).cost,0)/EVAL_DATA.length;
    const ratio = topCostAvg > 0 && cheapCostAvg > 0 ? topCostAvg/cheapCostAvg : 1;
    const isSame = cheap.m.id === top.m.id;
    return (
      <div style={{ borderBottom:`1px solid ${T.border}`, background:"rgba(91,142,240,0.08)", borderTop:`1px solid rgba(91,142,240,0.2)`, padding:"12px 24px" }}>
        <p style={{ margin:0, fontSize:13, fontFamily:UI, lineHeight:1.65, color:T.mid }}>
          <span style={{ color:top.m.color, fontWeight:700 }}>{top.m.name}</span>
          {" scores highest at "}
          <span style={{ color:T.hi, fontFamily:MONO, fontWeight:600 }}>{top.avg.toFixed(1)}</span>
          {" avg ROUGE-L"}
          {!isSame && <>
            {" — "}
            <span style={{ color:cheap.m.color, fontWeight:700 }}>{cheap.m.name}</span>
            {" is "}
            <span style={{ color:"#4ADE80", fontFamily:MONO, fontWeight:600 }}>{ratio.toFixed(1)}×</span>
            {" cheaper. Route lower-stakes queries there to cut cost without sacrificing much quality."}
          </>}
          {isSame && <>{" — best accuracy and lowest cost. Clear choice for this task."}</>}
        </p>
      </div>
    );
  };

  // ── Customize chip ─────────────────────────────────────────
  const CtrlChip = ({ label, color, onToggle, visible, dragKey, dragType }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    return (
      <div
        draggable
        onDragStart={() => handleDragStart(dragType, dragKey)}
        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={() => { handleDrop(dragType, dragKey); setIsDragOver(false); }}
        style={{ display:"inline-flex",alignItems:"center",gap:6,height:28,padding:"0 10px 0 7px",borderRadius:5,border:`1px solid ${isDragOver?T.blueTxt:T.border}`,background:isDragOver?"rgba(122,184,255,0.08)":visible?T.surface:T.elev,fontFamily:MONO,fontSize:12,color:visible?T.mid:T.lo,cursor:"grab",userSelect:"none",whiteSpace:"nowrap",opacity:visible?1:0.55 }}
      >
        <div style={{ display:"flex",flexDirection:"column",gap:2,opacity:0.35 }}>{[0,1,2].map(i=><div key={i} style={{ width:10,height:1.5,background:"currentColor",borderRadius:1 }} />)}</div>
        {color && <div style={{ width:7,height:7,borderRadius:2,flexShrink:0,background:color }} />}
        <span style={{ fontSize:11,textDecoration:visible?"none":"line-through" }}>{label}</span>
        <button onClick={onToggle} style={{ width:16,height:16,borderRadius:3,border:`1px solid ${T.border}`,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:T.lo,padding:0 }}>
          {visible?"✓":"×"}
        </button>
      </div>
    );
  };

  const embeddedWrap = embedded
    ? { background:T.surface, borderTop:`1px solid ${T.border}` }
    : { display:"flex", flexDirection:"column", minHeight:"100%" };

  return (
    <div style={embeddedWrap}>
      {/* Topbar — only in standalone (non-embedded) mode */}
      {!embedded && (
        <div style={{ background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"0 24px",height:48,display:"flex",alignItems:"center",gap:10,flexShrink:0 }}>
          <span style={{ fontFamily:MONO,fontSize:13,fontWeight:500,color:T.hi,letterSpacing:"0.04em" }}>stack<span style={{ color:T.blueTxt }}>eval</span></span>
          <div style={{ width:1,height:16,background:T.border }} />
          <span style={{ fontSize:13,color:T.lo }}>Experiment Results</span>
          {taskType && <Chip name={taskType.toUpperCase().replace("-","/")} />}
          {models.slice(0,4).map((m,i) => <Chip key={m.id} name={m.provider.toUpperCase()} />)}
          <div style={{ display:"flex",alignItems:"center",gap:6,marginLeft:"auto",fontFamily:MONO,fontSize:11,color:T.mTeal.tx,letterSpacing:"0.05em" }}>
            <div style={{ width:6,height:6,borderRadius:"50%",background:T.mTeal.tx,animation:"blink 1.8s infinite" }} />
            LIVE
          </div>
          <button onClick={onNewEval} style={{ background:"none",border:`1px solid ${T.border}`,cursor:"pointer",color:T.mid,fontSize:12,fontFamily:UI,padding:"5px 12px",borderRadius:6,marginLeft:12 }}>
            ← New Evaluation
          </button>
        </div>
      )}

      {/* Model Leaders */}
      <LeadersPanel />

      {/* AI Takeaway */}
      <InsightBar />

      {/* Customize bar — models + metrics toggles */}
      <div style={{ padding:"8px 20px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${T.border}`,background:T.base,flexShrink:0,flexWrap:"wrap" }}>
        <div style={{ display:"flex",alignItems:"center",gap:6,flexShrink:0 }}>
          <span style={{ fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",color:T.lo,fontFamily:MONO,whiteSpace:"nowrap" }}>Models</span>
          <div style={{ display:"flex",alignItems:"center",gap:4,flexWrap:"wrap" }}>
            {modelOrder.map(m=>(
              <CtrlChip key={m.id} label={m.name.split(" ").slice(-2).join(" ")} color={m.color} visible={m.visible} dragKey={m.id} dragType="model" onToggle={()=>toggleModelVis(m.id)} />
            ))}
          </div>
        </div>
        <div style={{ width:1,height:16,background:T.border,flexShrink:0 }} />
        <div style={{ display:"flex",alignItems:"center",gap:6,flexShrink:0 }}>
          <span style={{ fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",color:T.lo,fontFamily:MONO,whiteSpace:"nowrap" }}>Metrics</span>
          <div style={{ display:"flex",alignItems:"center",gap:4,flexWrap:"wrap" }}>
            {metricOrder.map(m=>(
              <CtrlChip key={m.key} label={m.label} color={{rouge:T.mBlue.tx,cost:T.mGreen.tx,lat:T.mTeal.tx}[m.key]} visible={m.visible} dragKey={m.key} dragType="metric" onToggle={()=>toggleMetricVis(m.key)} />
            ))}
          </div>
        </div>
      </div>

      {/* Row comparison */}
      <div style={{ padding:"16px 24px 32px", flex:embedded?undefined:1 }}>
        <LayoutB />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP 5 — RUN EVALUATION + RESULTS
───────────────────────────────────────────────────────────── */
function RunStep({ selModels, challenger, metrics, taskType, taskContext, onBack,
  ran, setRan, fileName, setFileName, inputMode, setInputMode,
  manualInput, setManualInput, manualGolden, setManualGolden,
  csvColumns, setCsvColumns, csvRows, setCsvRows,
  challengerActive, setChallengerActive
}) {
  const [running, setRunning]     = useState(false);
  const [progress, setProgress]   = useState(0);
  const [selectedTaskType, setSelectedTaskType] = useState(taskType || "");

  // Mock preview rows from airline dataset (PDF)
  const MOCK_CSV_COLUMNS = ["input", "golden_output"];
  const MOCK_CSV_ROWS = [
    { input: "What is your baggage allowance for economy class?", golden_output: "Economy passengers can bring one carry-on bag (up to 22x14x9 inches, 15 lbs) and one personal item. For checked bags, domestic flights allow one bag up to 50 lbs for a fee; many international routes include one free checked bag." },
    { input: "How do I check in for my flight online?", golden_output: "Online check-in opens 24 hours before departure. Head to our website or app, select 'Check-In,' and enter your confirmation number and last name. From there you can pick your seat, add baggage, and grab your boarding pass." },
    { input: "Can I change my flight after booking?", golden_output: "Yes, flight changes can be made online, through our app, or by calling us. Flexible and business fares usually allow free changes, while basic economy tickets may be more limited. Any fare difference will apply at the time of the change." },
    { input: "What happens if my flight is cancelled?", golden_output: "If your flight is cancelled, we'll automatically rebook you on the next available flight and notify you by email or SMS. You can also opt for a full refund to your original payment method." },
    { input: "How early should I arrive at the airport?", golden_output: "We recommend arriving at least 2 hours before domestic flights and 3 hours before international flights. This gives you comfortable time for check-in, bag drop, and security." },
  ];

  const parseCSV = (text) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return;
    const cols = lines[0].split(",").map(c => c.trim().replace(/^"|"$/g, ""));
    const rows = lines.slice(1, 6).map(line => {
      // handle quoted fields
      const vals = [];
      let cur = "", inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQ = !inQ; }
        else if (ch === "," && !inQ) { vals.push(cur.trim()); cur = ""; }
        else { cur += ch; }
      }
      vals.push(cur.trim());
      const obj = {};
      cols.forEach((c, i) => { obj[c] = vals[i] ?? ""; });
      return obj;
    });
    setCsvColumns(cols);
    setCsvRows(rows);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => parseCSV(ev.target.result);
    reader.readAsText(file);
  };

  const baseModels = selModels.length > 0 ? selModels.slice(0,4) : ALL_MODELS.slice(0,3);
  const testModels = (challengerActive && challenger && !baseModels.find(m=>m.id===challenger.id)) ? [...baseModels, challenger] : baseModels;
  const enabledMetrics = metrics.filter(m => m.enabled);
  const shownMetrics   = enabledMetrics.slice(0, 3);
  const extraCount     = Math.max(0, enabledMetrics.length - 3);

  const run = () => {
    setRunning(true); setProgress(0);
    const t = setInterval(() => {
      setProgress(p => { if (p >= 100) { clearInterval(t); setRunning(false); setRan(true); return 100; } return Math.min(100, p + Math.random()*14); });
    }, 160);
  };

  // Once evaluation is done, show the full comparison UI BELOW the run page
  // (no early return — we render both)

  return (
    <div style={{ display:"flex", flexDirection:"column" }}>
    <div style={{ padding:"28px 28px" }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:24,fontWeight:700,color:T.hi,letterSpacing:"-0.24px",margin:"0 0 6px",fontFamily:UI }}>Run Evaluation</h1>
        <p style={{ fontSize:14,color:T.mid,margin:0,fontFamily:UI }}>Upload your test data and run the evaluation across selected models</p>
      </div>

      {/* Evaluation Configuration */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ marginBottom:16, paddingBottom:16, borderBottom:`1px solid ${T.border}` }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
            <div style={{ fontSize:11,fontWeight:700,color:T.mid,letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:UI }}>System Prompt</div>
          </div>
          {taskContext ? (
            <div style={{ fontSize:12,color:T.mid,fontFamily:MONO,lineHeight:1.6,background:T.elev,border:`1px solid ${T.border}`,borderRadius:6,padding:"8px 12px",maxHeight:80,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",whiteSpace:"pre-wrap" }}>
              {taskContext}
            </div>
          ) : (
            <div style={{ fontSize:12,color:T.lo,fontFamily:UI,background:T.elev,borderRadius:6,padding:"8px 12px",border:`1px dashed ${T.border}`,fontStyle:"italic" }}>
              No system prompt — outputs evaluated without a rubric.
            </div>
          )}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:24 }}>
          <div>
            <div style={{ fontSize:11,fontWeight:700,color:T.mid,letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:UI,marginBottom:10 }}>Task Type</div>
            <div style={{ position:"relative" }}>
              <select value={selectedTaskType} onChange={e=>setSelectedTaskType(e.target.value)} style={{ width:"100%",padding:"10px 36px 10px 12px",background:T.elev,border:`1px solid ${T.border}`,borderRadius:8,fontSize:14,fontWeight:selectedTaskType?600:400,color:selectedTaskType?T.hi:T.mid,outline:"none",cursor:"pointer",fontFamily:UI,appearance:"none" }}>
                <option value="" style={{background:T.surface,color:T.mid}}>Select task type...</option>
                <option value="qa" style={{background:T.surface}}>Standard QA</option>
                <option value="summarization" style={{background:T.surface}}>Summarization</option>
                <option value="rag-qa" style={{background:T.surface}}>RAG QA</option>
                <option value="locomo" style={{background:T.surface}}>LoCoMo</option>
              </select>
              <svg width="14" height="14" viewBox="0 0 14 14" style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:T.mid }} fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
          <div>
            <div style={{ fontSize:11,fontWeight:700,color:T.mid,letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:UI,marginBottom:10 }}>Evaluation Metrics ({enabledMetrics.length})</div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:8 }}>
              {shownMetrics.map(m => <Badge key={m.id} label={m.name} color={m.color||T.mBlue} />)}
              {extraCount > 0 && <span style={{ fontSize:12,color:T.mid,fontFamily:UI,alignSelf:"center" }}>+{extraCount} more</span>}
            </div>
            <button onClick={()=>{}} style={{ background:"none",border:"none",cursor:"pointer",color:T.blueTxt,fontSize:13,fontFamily:UI,padding:0 }}>Edit metrics →</button>
          </div>
          <div>
            <div style={{ fontSize:11,fontWeight:700,color:T.mid,letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:UI,marginBottom:10 }}>Model Criteria</div>
            <div style={{ display:"flex",alignItems:"flex-start",gap:6,marginBottom:8 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginTop:1,flexShrink:0 }}><circle cx="7" cy="7" r="6" stroke={T.blue} strokeWidth="1.3"/><path d="M4.5 7L6.5 9L9.5 5" stroke={T.blue} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ fontSize:13,color:T.mid,fontFamily:UI,lineHeight:1.4 }}>Medium priority: Cost, Speed, Context</span>
            </div>
            <button onClick={()=>{}} style={{ background:"none",border:"none",cursor:"pointer",color:T.blueTxt,fontSize:13,fontFamily:UI,padding:0 }}>Edit criteria →</button>
          </div>
        </div>
      </Card>

      {/* Challenger suggestion */}
      {challenger && (() => {
        const avgCost = testModels.length ? testModels.reduce((s,m)=>s+(m.cost||0),0)/testModels.length : 0;
        const avgLmsys = testModels.length ? testModels.reduce((s,m)=>s+(m.lmsys||0),0)/testModels.length : 0;
        const cheaperThan = avgCost > 0 ? (avgCost / (challenger.cost||1)).toFixed(1) : null;
        const vsAccuracy = challenger.lmsys > avgLmsys ? "competitive accuracy" : "lower cost tradeoff";
        return (
          <div style={{ marginBottom:16, background:T.elev, border:"1px solid rgba(245,158,11,0.3)", borderRadius:10, overflow:"hidden" }}>
            <div style={{ padding:"12px 16px", background:"rgba(245,158,11,0.06)", borderBottom:"1px solid rgba(245,158,11,0.18)", display:"flex", alignItems:"center", gap:10 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink:0 }}><polygon points="7,1 8.75,5 13,5 9.75,7.5 10.75,12 7,9.5 3.25,12 4.25,7.5 1,5 5.25,5" fill="#F59E0B"/></svg>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13,fontWeight:600,color:challengerActive?"#F59E0B":T.mid,fontFamily:UI }}>
                  Challenger · <span style={{ color:challengerActive?T.hi:T.mid,fontWeight:500 }}>{challenger.name}</span>
                </div>
                <div style={{ fontSize:11,color:T.lo,fontFamily:UI,marginTop:1 }}>{challenger.provider} · Runs on Backboard credits</div>
              </div>
              <Toggle on={challengerActive} onClick={()=>setChallengerActive(p=>!p)} />
            </div>
            <div style={{ padding:"12px 16px" }}>
              <div style={{ fontSize:12,color:challengerActive?T.mid:T.lo,fontFamily:UI,lineHeight:1.65 }}>
                {(() => {
                  const selectedNames = testModels.map(m=>m.name.split(" ").slice(-1)[0]).join(", ");
                  const cheapest = testModels.length ? Math.min(...testModels.map(m=>m.cost||99)) : 99;
                  const ratio = cheapest > 0 ? (cheapest / (challenger.cost||1)).toFixed(1) : null;
                  const isCheaper = ratio && parseFloat(ratio) > 1.5;
                  const isOss = challenger.oss;
                  return <>
                    <strong style={{ color:T.hi }}>{challenger.name}</strong> is included because it covers a gap your current selection leaves open —{" "}
                    {isCheaper
                      ? <>it costs roughly <strong style={{ color:T.hi }}>{ratio}× less</strong> than your cheapest selected model, making it worth benchmarking to see if lower cost comes with acceptable quality loss.</>
                      : isOss
                        ? <>it's fully open source, so you can self-host and avoid per-token costs entirely. Useful as a cost ceiling reference.</>
                        : <>it represents a different capability profile from your selected models, which helps surface whether your eval metrics are measuring the right things.</>
                    }
                    {" "}If it performs within 10–15% of your best model, the cost saving may justify switching.
                  </>;
                })()}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Selected Models */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
          <div style={{ fontSize:11,fontWeight:700,color:T.mid,letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:UI }}>
            Selected Models ({testModels.length}{challengerActive&&challenger?" + 1 Challenger":""})
          </div>
          <button onClick={()=>{}} style={{ background:"none",border:"none",cursor:"pointer",color:T.blueTxt,fontSize:13,fontFamily:UI,padding:0 }}>+ Add models</button>
        </div>
        <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
          {testModels.map((m, i) => (
            <div key={m.id} style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"7px 12px",background:T.elev,border:`1px solid ${T.border}`,borderRadius:8 }}>
              <div style={{ width:7,height:7,borderRadius:2,background:MODEL_COLORS[i],flexShrink:0 }} />
              <span style={{ fontSize:13,fontWeight:500,color:T.hi,fontFamily:UI }}>{m.name}</span>
              <span style={{ color:T.border }}>|</span>
              <Chip name={m.provider} />
            </div>
          ))}
          {challengerActive && challenger && (
            <div style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"7px 12px",background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:8 }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><polygon points="6.5,1 8,4.5 11.5,4.5 8.75,6.5 9.75,10 6.5,8 3.25,10 4.25,6.5 1.5,4.5 5,4.5" fill="#F59E0B"/></svg>
              <span style={{ fontSize:13,fontWeight:600,color:"#F59E0B",fontFamily:UI }}>{challenger.name}</span>
              <span style={{ color:"rgba(245,158,11,0.4)" }}>|</span>
              <span style={{ fontSize:11,fontWeight:500,color:"#F59E0B",letterSpacing:"0.04em",textTransform:"uppercase",fontFamily:UI }}>Challenger</span>
            </div>
          )}
        </div>
      </Card>

      {/* Input + Run */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ display:"flex",gap:0,marginBottom:20 }}>
          {[["single","Single Input"],["csv","Upload CSV"]].map(([k,l],idx) => (
            <button key={k} onClick={()=>setInputMode(k)} style={{ padding:"9px 22px",fontSize:14,fontFamily:UI,cursor:"pointer",fontWeight:500,background:inputMode===k?T.blue:"transparent",color:inputMode===k?"#fff":T.mid,border:`1px solid ${inputMode===k?T.blue:T.border}`,borderRadius:idx===0?"8px 0 0 8px":"0 8px 8px 0" }}>{l}</button>
          ))}
        </div>

        {inputMode === "single" && (
          <>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16 }}>
              <div>
                <div style={{ fontSize:14,fontWeight:500,color:T.hi,fontFamily:UI,marginBottom:8 }}>Input (Prompt)</div>
                <textarea value={manualInput} onChange={e=>setManualInput(e.target.value)} placeholder="Enter your test prompt here..." rows={6}
                  style={{ width:"100%",padding:"12px 14px",background:T.elev,border:`1px solid ${T.border}`,borderRadius:8,fontSize:13,color:T.hi,outline:"none",boxSizing:"border-box",fontFamily:UI,resize:"vertical" }} />
              </div>
              <div>
                <div style={{ fontSize:14,fontWeight:500,color:T.hi,fontFamily:UI,marginBottom:8 }}>Expected Output (Golden)</div>
                <textarea value={manualGolden} onChange={e=>setManualGolden(e.target.value)} placeholder="Enter the expected output here..." rows={6}
                  style={{ width:"100%",padding:"12px 14px",background:T.elev,border:`1px solid ${T.border}`,borderRadius:8,fontSize:13,color:T.hi,outline:"none",boxSizing:"border-box",fontFamily:UI,resize:"vertical" }} />
              </div>
            </div>
          </>
        )}

        {inputMode === "csv" && (
          <div>
            <div style={{ marginBottom: (fileName || true) ? 16 : 0 }}>
              <div>
                <SubLabel>CSV File (requires: input, golden_output)</SubLabel>
                <div onClick={()=>document.getElementById("csv-up").click()} style={{ border:`1px dashed ${fileName ? T.blue : T.border}`,borderRadius:8,padding:"16px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:12 }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=T.blue} onMouseLeave={e=>e.currentTarget.style.borderColor=fileName?T.blue:T.border}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 12V4M5 8l4-4 4 4M2 14h14" stroke={T.blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div>
                    <div style={{ fontSize:13,color:T.hi,fontFamily:UI }}>{fileName||"Click to upload"}</div>
                    <div style={{ fontSize:11,color:T.mid,fontFamily:UI,marginTop:2 }}>Supports .csv files</div>
                  </div>
                </div>
                <input id="csv-up" type="file" accept=".csv" style={{ display:"none" }} onChange={handleFileChange} />
              </div>
            </div>

            {/* CSV Preview — only shown after upload */}
            {fileName && (() => {
              const cols = csvColumns.length ? csvColumns : MOCK_CSV_COLUMNS;
              const rows = csvRows.length ? csvRows : MOCK_CSV_ROWS;
              return (
                <div style={{ marginTop:4 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                    <SubLabel style={{ margin:0 }}>Preview</SubLabel>
                    <span style={{ fontSize:11,color:T.lo,fontFamily:UI }}>Showing {rows.length} of your rows</span>
                  </div>
                  <div style={{ border:`1px solid ${T.border}`,borderRadius:8,overflow:"hidden" }}>
                    {/* Header */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", background:T.elev, borderBottom:`1px solid ${T.border}` }}>
                      {["input","golden_output"].map((col,i) => (
                        <div key={col} style={{ padding:"8px 12px",fontSize:11,fontWeight:700,color:T.lo,fontFamily:UI,letterSpacing:"0.07em",textTransform:"uppercase", borderRight: i===0 ? `1px solid ${T.border}` : "none" }}>
                          {col}
                        </div>
                      ))}
                    </div>
                    {/* Rows */}
                    {rows.map((row, ri) => (
                      <div key={ri} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", borderBottom: ri < rows.length-1 ? `1px solid ${T.borderS}` : "none", background: ri%2===0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                        {["input","golden_output"].map((col,i) => (
                          <div key={col} style={{ padding:"9px 12px",fontSize:12,color:T.mid,fontFamily:UI,lineHeight:1.5, borderRight: i===0 ? `1px solid ${T.borderS}` : "none",overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" }}>
                            {row[col] ?? ""}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {running && (
          <div style={{ marginTop:16 }}>
            <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,color:T.mid,fontFamily:UI,marginBottom:5 }}>
              <span>Evaluating {testModels.length} models across {EVAL_DATA.length} rows…</span>
              <span style={{ fontFamily:MONO }}>{Math.min(100,Math.round(progress))}%</span>
            </div>
            <div style={{ height:4,background:T.elev,borderRadius:2 }}>
              <div style={{ height:"100%",background:`linear-gradient(90deg,${T.blue},#6EE7B7)`,borderRadius:2,width:`${Math.min(100,progress)}%`,transition:"width .2s" }} />
            </div>
          </div>
        )}
      </Card>

      {/* Single run CTA — right-aligned, right below the input card */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <Btn onClick={onBack} variant="ghost">← Back to Model Selection</Btn>
        <Btn onClick={run} disabled={running || (inputMode==="single" && !manualInput.trim())} style={{ padding:"10px 28px", fontSize:14 }}>
          {running ? "Running…" : "▶ Run Evaluation"}
        </Btn>
      </div>
    </div>

      {/* Output Comparison — full-width below the run section */}
      {ran && (
        <div style={{ borderTop:`1px solid ${T.border}`, marginTop:8 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 28px 0" }}>
            <div>
              <h2 style={{ fontSize:20,fontWeight:700,color:T.hi,letterSpacing:"-0.2px",margin:"0 0 4px",fontFamily:UI }}>Output Comparison</h2>
              <p style={{ fontSize:13,color:T.lo,margin:0,fontFamily:UI }}>Results across {testModels.length} models · {EVAL_DATA.length} evaluation rows</p>
            </div>
            <div style={{ display:"flex",gap:8,alignItems:"center" }}>
              <Btn onClick={()=>{ setRan(false); }} variant="ghost" small>Run Again</Btn>
              <ExportMenu models={testModels} />
            </div>
          </div>
          <div style={{ marginTop:16 }}>
            <EvalResults models={testModels} taskType={selectedTaskType||taskType} onNewEval={()=>setRan(false)} embedded />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────────
   ✦ DRAFT BUTTON — AI-powered textarea fill
   Used in: task context textarea + evaluator prompt textarea
───────────────────────────────────────────────────────────── */

const TASK_CONTEXT_DRAFTS = {
  "qa":            "Evaluating whether model responses correctly and concisely answer factual questions against a reference answer.",
  "summarization": "Evaluating whether model summaries capture the key points of the source text without hallucinating or omitting critical information.",
  "rag-qa":        "Evaluating whether model responses accurately answer questions using only the context provided, without relying on outside knowledge.",
  "locomo":        "Evaluating whether model responses correctly answer questions requiring chaining facts across a very long context window.",
};

function draftEvaluatorPrompt(name) {
  const n = (name || "").toLowerCase();
  if (/tone|empathy|warm/i.test(n))
    return "Evaluate whether the response is warm, reassuring, and appropriate for a customer-facing context. Penalize responses that are overly formal, dismissive, or robotic. Return a score from 0 to 1.";
  if (/length|concise|verbose|brief/i.test(n))
    return "Evaluate whether the response length is appropriate. Penalize responses under 20 words (too brief) or over 150 words (too verbose). Return a score from 0 to 1.";
  if (/accuracy|correct|factual/i.test(n))
    return "Evaluate whether the response correctly answers the question without introducing false information. Compare against the reference answer. Return a score from 0 to 1.";
  if (/hallucin|ground|faithful/i.test(n))
    return "Evaluate whether the response introduces any claims not supported by the provided context. Return 1 if fully grounded, 0 if any hallucinated content is present.";
  if (/relevance|relevant/i.test(n))
    return "Evaluate whether the response directly addresses what was asked. Penalize off-topic or indirect answers. Return a score from 0 to 1.";
  return `Evaluate the ${name || "quality"} of the response on a scale from 0 to 1. Compare the output against the reference answer.

Input: {{input}}
Output: {{output}}
Reference: {{golden_output}}

Return: score (0–1) | one-sentence reason.`;
}

function DraftButton({ value, onDraft, pending, onRevert }) {
  if (pending) {
    return (
      <div style={{ display:"inline-flex",alignItems:"center",gap:5,
        background:"rgba(91,142,240,0.9)",borderRadius:5,padding:"4px 10px",
        boxShadow:"0 2px 8px rgba(91,142,240,0.5)",cursor:"default" }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 0.5L6 3.5H9L6.5 5.5L7.5 8.5L5 7L2.5 8.5L3.5 5.5L1 3.5H4L5 0.5Z" fill="#fff"/>
        </svg>
        <span style={{ fontSize:10,fontWeight:700,color:"#fff",fontFamily:UI }}>Suggested Draft</span>
        <button onClick={onRevert} style={{ background:"rgba(255,255,255,0.2)",border:"none",cursor:"pointer",color:"#fff",fontSize:11,padding:"1px 4px",lineHeight:1,borderRadius:3,marginLeft:1 }} title="Revert">×</button>
      </div>
    );
  }
  return (
    <button onClick={onDraft} style={{
      display:"inline-flex",alignItems:"center",gap:4,
      background:"rgba(91,142,240,0.12)",border:"1px solid rgba(91,142,240,0.4)",
      borderRadius:4,padding:"4px 10px",cursor:"pointer",
      fontSize:11,color:"#8FBCFF",fontFamily:UI,fontWeight:600,
      transition:"all .12s",
    }}
      onMouseEnter={e=>{ e.currentTarget.style.background="rgba(91,142,240,0.22)"; e.currentTarget.style.borderColor="rgba(91,142,240,0.5)"; }}
      onMouseLeave={e=>{ e.currentTarget.style.background="rgba(91,142,240,0.12)"; e.currentTarget.style.borderColor="rgba(91,142,240,0.4)"; }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M5 0.5L6 3.5H9L6.5 5.5L7.5 8.5L5 7L2.5 8.5L3.5 5.5L1 3.5H4L5 0.5Z" fill="#8FBCFF"/>
      </svg>
      {value ? "✦ Rewrite" : "✦ Generate Draft"}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   AI COPILOT PANEL
───────────────────────────────────────────────────────────── */

const STEP_STARTERS = {
  1: "Describe what you're evaluating…",
  2: "What does a good response look like?",
  3: "What matters most — cost, speed, or quality?",
  4: "Why did a model score low? What should I pick?",
};

const MOCK_COPILOT = [
  { match:/customer.?serv|chatbot|support.?bot|airline|support/i,
    text:"Sounds like a **customer support** evaluation. Here's my setup suggestion:\n\n• Task type → **Standard QA**\n• Add a **Tone & Empathy** evaluator — statistical metrics miss this entirely\n\nHere's what I drafted:\n\n`\"Score the output 0–1 on tone and empathy. 1 = warm, resolves the issue, acknowledges the customer. 0 = cold or unhelpful. Input: {{input}} Output: {{output}} Reference: {{golden_output}}. Return score + one-sentence reason.\"`\n\nDoes this match what you had in mind?",
    actions:[
      { label:"Set task type → QA",  type:"set_task_type",    payload:{ taskType:"qa" } },
      { label:"Add Tone & Empathy",  type:"add_custom_metric", payload:{ name:"Tone & Empathy", method:"llm-judge", description:"Evaluates warmth and resolution quality", config:{ promptTemplate:"Score the output 0–1 on tone and empathy. 1 = warm, resolves the issue, acknowledges the customer. 0 = cold or unhelpful. Input: {{input}} Output: {{output}} Reference: {{golden_output}}. Return score + one-sentence reason." } } }
    ]
  },
  { match:/empathy|empathetic|tone|warmth|warm/i,
    text:"Here's a **Tone & Empathy** evaluator prompt:\n\n`\"You are evaluating a customer support response. Score 0–1 where: 1 = warm, empathetic, fully resolves the issue; 0 = cold, dismissive, or unhelpful. Input: {{input}} Output: {{output}} Reference: {{golden_output}}. Return only: score (0–1) | one-sentence reason.\"`\n\nThis is an LLM-as-judge metric — adds one model call per row. Want me to add it?",
    actions:[
      { label:"Add to metrics", type:"add_custom_metric", payload:{ name:"Tone & Empathy", method:"llm-judge", description:"Evaluates warmth and resolution quality", config:{ promptTemplate:"You are evaluating a customer support response. Score 0–1 where: 1 = warm, empathetic, fully resolves the issue; 0 = cold, dismissive, or unhelpful. Input: {{input}} Output: {{output}} Reference: {{golden_output}}. Return only: score (0–1) | one-sentence reason." } } }
    ]
  },
  { match:/too long|length|concise|verbose|word.?count|brevity/i,
    text:"Here's a **Response Length** evaluator — no model call needed, it's a code function:\n\n`\"Count words in {{output}}. Score 1.0 if 20–150 words, 0.5 if 10–200 words, 0.0 otherwise.\"`\n\nFast and cheap. Want me to add it?",
    actions:[
      { label:"Add Length evaluator", type:"add_custom_metric", payload:{ name:"Response Length", method:"code", description:"Checks response falls in 20–150 word range", config:{ code:"def evaluate(input, output, golden_output):\n    words = len(output.split())\n    if 20 <= words <= 150: return 1.0\n    if 10 <= words <= 200: return 0.5\n    return 0.0" } } }
    ]
  },
  { match:/cheap|cost|budget|production|affordable|price|money/i,
    text:"For cost-sensitive production, I'd narrow to:\n\n• **GPT-3.5 Turbo** — $2/1M, very fast\n• **Claude 3 Haiku** — $1.5/1M, best cost/quality in class\n• **Llama 3 8B** — $0.5/1M, open source\n\nThese are 5–15× cheaper than flagship models with acceptable quality for most support tasks. Want me to filter to these?",
    actions:[
      { label:"Filter to budget models", type:"filter_models", payload:{ models:["gpt-3.5-turbo","claude-3-haiku","llama-3-8b"] } }
    ]
  },
  { match:/why.*(worse|bad|low|fail|score)|what.*(wrong|went|issue)/i,
    text:"Looking at the row-level results, the model struggles most where the question requires **specific policy recall** — rows #1 (baggage) and #3 (flight change) have the lowest scores.\n\nIn both cases, the model gave generic answers instead of citing your specific policy. This is a retrieval/grounding gap, not a generation gap — the model doesn't have your policy data.\n\nA **Faithfulness** evaluator or RAG pipeline would help here. Want me to draft one?",
    actions:[]
  },
  { match:/summarize|verdict|recommend|what should i|which model|pick/i,
    text:"Based on the current results:\n\n• **Claude 3 Sonnet** leads on accuracy (avg 44.1 ROUGE-L) with grounded answers\n• **GPT-3.5 Turbo** scores 36.2 at 4× lower cost — solid for lower-stakes queries\n• **GPT-4 Turbo** excels on complex questions but costs 7.5× more\n\n**My pick:** Claude 3 Sonnet for quality-critical flows; GPT-3.5 Turbo for high-volume routing.\n\nWant a shareable summary?",
    actions:[]
  },
  { match:/why.*score.*low|why.*bad|worst|low.*score|row.*low|haiku.*low|low.*haiku/i,
    text:"Looking at the row-level results, the model struggles most on rows where the question requires specific policy recall — rows #1 and #3 score lowest. The model gave accurate but generic answers instead of citing specific policy details. This is a grounding gap, not a generation gap.",
    actions:[]
  },
  { match:/output|comparison|results|what.*pick|which.*model|recommend|summarize.*result|verdict/i,
    text:"Based on the current results:\n\n• The top model leads on accuracy but costs more per call\n• The cheapest model is within 10–15% on quality\n\n**Recommendation:** Use the top model for high-stakes queries and route simpler questions to the cheapest option. Want a shareable summary?",
    actions:[]
  },
  { match:/rag|retrieval|document|grounding|faithful/i,
    text:"For RAG evaluation, the two most important metrics are:\n\n• **Faithfulness** — is the output grounded in retrieved context?\n• **Answer Relevance** — does it actually answer the question?\n\nI'd set task type to **RAG QA** and add a Faithfulness evaluator. Want me to set that up?",
    actions:[
      { label:"Set task → RAG QA", type:"set_task_type", payload:{ taskType:"rag-qa" } },
      { label:"Add Faithfulness metric", type:"add_custom_metric", payload:{ name:"Faithfulness", method:"llm-judge", description:"Checks output is grounded in context", config:{ promptTemplate:"Does the output only use information from the retrieved context to answer the question? Score 1.0 if fully grounded, 0.5 if partially, 0.0 if it hallucinates or ignores context. Input: {{input}} Output: {{output}} Reference: {{golden_output}}. Return score + reason." } } }
    ]
  },
];

function getMockCopilotResponse(input) {
  for (const r of MOCK_COPILOT) {
    if (r.match.test(input)) return r;
  }
  return { text:"Can you tell me a bit more about what you're evaluating? That'll help me point you in the right direction.", actions:[] };
}

function renderCopilotText(text) {
  return text.split('\n').map((line, li) => {
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/);
    const content = parts.map((p, pi) => {
      if (p.startsWith('**') && p.endsWith('**')) return <strong key={pi} style={{ color:"#fff", fontWeight:600 }}>{p.slice(2,-2)}</strong>;
      if (p.startsWith('`') && p.endsWith('`')) return <span key={pi} style={{ display:"block", marginTop:6, marginBottom:6, padding:"8px 10px", background:"rgba(255,255,255,0.06)", borderRadius:5, fontFamily:MONO, fontSize:11, color:"#93C5FD", lineHeight:1.6, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>{p.slice(1,-1)}</span>;
      return p;
    });
    const isBullet = /^[•\-]/.test(line.trim());
    return <div key={li} style={{ marginBottom:3, paddingLeft:isBullet?4:0 }}>{content}</div>;
  });
}

function CopilotPanel({ open, onToggle, step, taskType, taskContext, metrics, criteria, selModels, onApply }) {
  const [messages, setMessages] = useState([{
    id:0, role:"assistant", actions:[],
    text:"Hi! I'm your eval copilot — I know where you are in the setup.\n\nDescribe what you're building in plain language and I'll translate it into specific config choices.",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(new Set());
  const [undoStore, setUndoStore] = useState({});  // key → prev state snapshot
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Step-aware PLACEHOLDER — we don't prefill the value; user types fresh
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, loading]);
  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);

  const send = () => {
    const txt = input.trim();
    if (!txt || loading) return;
    setMessages(p => [...p, { id:Date.now(), role:"user", text:txt, actions:[] }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const resp = getMockCopilotResponse(txt);
      setMessages(p => [...p, { id:Date.now()+1, role:"assistant", text:resp.text, actions:resp.actions||[] }]);
      setLoading(false);
    }, 700 + Math.random()*500);
  };

  const applyAction = (msgId, action, prevSnapshot) => {
    onApply(action);
    const key = `${msgId}-${action.type}`;
    setApplied(p => new Set([...p, key]));
    if (prevSnapshot) setUndoStore(p => ({...p, [key]: prevSnapshot}));
  };

  const undoAction = (key, action) => {
    if (undoStore[key]) onApply({...action, _undo: undoStore[key]});
    setApplied(p => { const n = new Set(p); n.delete(key); return n; });
    setUndoStore(p => { const n = {...p}; delete n[key]; return n; });
  };

  const stepNames = ["Define Task","Define Metrics","Model Selection","Run"];
  const stepName = stepNames[step-1] || "";

  return (
    <>
      {/* Floating toggle pill — right edge */}
      <button onClick={onToggle} style={{
        position:"fixed", right: open ? 320 : 0, top:"50%", transform:"translateY(-50%)",
        zIndex:60, cursor:"pointer", border:"none",
        background:"#2B5ECC",
        borderRadius:"8px 0 0 8px", padding:"16px 10px",
        display:"flex", flexDirection:"column", alignItems:"center", gap:6,
        transition:"right .25s cubic-bezier(.4,0,.2,1)",
        boxShadow:open?"none":"-2px 0 12px rgba(91,142,240,0.4)",
      }}>
        {open
          ? <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 1l9 9M10 1L1 10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
          : <>
              <svg width="15" height="15" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1L7.8 4.7H11.5L8.5 6.8L9.8 10.5L6.5 8.4L3.2 10.5L4.5 6.8L1.5 4.7H5.2L6.5 1Z" fill="#fff"/>
              </svg>
              <span style={{ fontSize:10, color:"rgba(255,255,255,0.95)", fontFamily:UI, fontWeight:700, letterSpacing:"0.04em", writingMode:"vertical-rl" }}>AI</span>
            </>
        }
      </button>

      {/* Panel */}
      <div style={{
        position:"fixed", right: open ? 0 : -325, top:0, bottom:0, width:320,
        background:T.surface, borderLeft:`1px solid ${T.border}`,
        display:"flex", flexDirection:"column", zIndex:55,
        transition:"right .25s cubic-bezier(.4,0,.2,1)",
        boxShadow:open?"-4px 0 28px rgba(0,0,0,0.55)":"none",
      }}>
        {/* Header */}
        <div style={{ padding:"11px 14px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:9, flexShrink:0, background:T.elev }}>
          <div style={{ width:26,height:26,background:"#5B8EF0",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1L7.8 4.7H11.5L8.5 6.8L9.8 10.5L6.5 8.4L3.2 10.5L4.5 6.8L1.5 4.7H5.2L6.5 1Z" fill="#fff"/>
            </svg>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13,fontWeight:600,color:T.hi,fontFamily:UI }}>AI Copilot</div>
            <div style={{ fontSize:10,color:T.lo,fontFamily:UI }}>Step: {stepName}</div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:4 }}>
            <div style={{ width:6,height:6,borderRadius:"50%",background:"#22C55E",animation:"pulse 2s infinite" }} />
            <span style={{ fontSize:10,color:T.lo,fontFamily:MONO }}>live</span>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex:1, overflow:"auto", padding:"12px 12px 6px" }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ marginBottom:10, display:"flex", flexDirection:"column", alignItems:msg.role==="user"?"flex-end":"flex-start" }}>
              {msg.role==="user"
                ? <div style={{ maxWidth:"85%", padding:"8px 12px", borderRadius:"12px 12px 3px 12px", background:T.blue, fontSize:13, color:"#fff", fontFamily:UI, lineHeight:1.5 }}>
                    {msg.text}
                  </div>
                : <div style={{ maxWidth:"95%", padding:"9px 12px", borderRadius:"3px 12px 12px 12px", background:T.elev, border:`1px solid ${T.border}`, fontSize:13, color:T.hi, fontFamily:UI, lineHeight:1.55 }}>
                    {renderCopilotText(msg.text)}
                  </div>
              }
              {msg.role==="assistant" && msg.actions?.length > 0 && (
                <div style={{ display:"flex", gap:5, marginTop:6, flexWrap:"wrap", paddingLeft:2 }}>
                  {msg.actions.map((action, ai) => {
                    const key = `${msg.id}-${action.type}`;
                    const done = applied.has(key);
                    return (
                      <span key={ai} style={{ display:"inline-flex",gap:3 }}>
                        <button onClick={()=>!done&&applyAction(msg.id, action)} style={{
                          padding:"4px 10px", borderRadius:done?"5px 0 0 5px":5, fontSize:11, fontFamily:UI,
                          cursor:done?"default":"pointer",
                          background:done?"rgba(34,197,94,0.15)":T.surface,
                          color:done?"#4ADE80":T.blueTxt,
                          border:`1px solid ${done?"rgba(34,197,94,0.4)":T.blue+"44"}`,
                          fontWeight:500, borderRight:done?"none":"auto",
                        }}>
                          {done ? "✓ Applied" : `✦ ${action.label}`}
                        </button>
                        {done && (
                          <button onClick={()=>undoAction(key, action)} style={{
                            padding:"4px 8px", borderRadius:"0 5px 5px 0", fontSize:11, fontFamily:UI, cursor:"pointer",
                            background:"rgba(34,197,94,0.08)", color:T.lo,
                            border:"1px solid rgba(34,197,94,0.4)", borderLeft:"none", fontWeight:400,
                          }} title="Undo this change">↩</button>
                        )}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display:"flex", marginBottom:10 }}>
              <div style={{ padding:"10px 14px", borderRadius:"3px 12px 12px 12px", background:T.elev, border:`1px solid ${T.border}` }}>
                <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                  {[0.4,0.7,1.0].map((d,i) => <div key={i} style={{ width:5,height:5,borderRadius:"50%",background:T.mid,animation:`pulse ${d+0.5}s infinite` }} />)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding:"10px 12px", borderTop:`1px solid ${T.border}`, flexShrink:0 }}>
          <div style={{ display:"flex", gap:7, alignItems:"flex-end" }}>
            <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} }}
              placeholder={STEP_STARTERS[step] || "Ask anything or describe your use case…"}
              rows={2}
              style={{ flex:1, padding:"8px 10px", background:T.elev, border:`1px solid ${T.border}`, borderRadius:7, fontSize:12, color:T.hi, outline:"none", resize:"none", fontFamily:UI, lineHeight:1.5 }} />
            <button onClick={send} disabled={!input.trim()||loading} style={{
              width:32, height:32, borderRadius:7, border:"none", flexShrink:0,
              background:input.trim()&&!loading?T.blue:T.elev, cursor:input.trim()&&!loading?"pointer":"default",
              display:"flex", alignItems:"center", justifyContent:"center", transition:"background .15s",
            }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 12L12 6.5 1 1v4.5l7 2-7 2V12z" fill={input.trim()&&!loading?"#fff":T.lo}/></svg>
            </button>
          </div>
          <div style={{ fontSize:10,color:T.lo,fontFamily:UI,marginTop:4 }}>Enter · Shift+Enter for new line</div>
        </div>
      </div>
    </>
  );
}

export default function App() {
  const [step,          setStep]         = useState(1);
  const [taskType,      setTaskType]     = useState(null);
  const [taskContext,   setTaskContext]  = useState('');
  const [metrics,       setMetrics]      = useState(INIT_METRICS);
  const [criteria,      setCriteria]     = useState({ priorities:{ high:[],medium:[],low:[] }, openSourceOnly:false, maxCostCap:"" });
  const [selModels,     setSelModels]    = useState([]);
  const [challenger]                     = useState(CHALLENGERS[0]);
  const [customMetrics, setCustomMetrics] = useState([]);
  const [copilotOpen,   setCopilotOpen]  = useState(false);
  const [aiSuggested,   setAiSuggested] = useState(new Set());
  // Persistent eval state — survives step navigation
  const [evalRan,         setEvalRan]         = useState(false);
  const [evalFileName,    setEvalFileName]     = useState(null);
  const [evalInputMode,   setEvalInputMode]    = useState("single");
  const [evalManualInput, setEvalManualInput]  = useState("");
  const [evalManualGolden,setEvalManualGolden] = useState("");
  const [evalCsvColumns,  setEvalCsvColumns]   = useState([]);
  const [evalCsvRows,     setEvalCsvRows]      = useState([]);
  const [evalChallengerOn,setEvalChallengerOn] = useState(true);

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  const handleCopilotApply = (action) => {
    const type = action.type || action.payload?.type;
    // Global copilot actions
    if (type === "set_task_type") { setTaskType(action.payload?.taskType||action.taskType); setAiSuggested(p=>new Set([...p,"taskType"])); }
    else if (type === "set_task_and_context") { if(action.taskType) setTaskType(action.taskType); if(action.taskContext) setTaskContext(action.taskContext); setAiSuggested(p=>new Set([...p,"taskType"])); }
    else if (type === "add_custom_metric") { const m={...(action.metric||action.payload),id:Date.now().toString(),enabled:true,aiAdded:true}; setCustomMetrics(p=>[...p,m]); setAiSuggested(p=>new Set([...p,"customMetrics"])); }
    else if (type === "filter_models") { const toSel=ALL_MODELS.filter(m=>(action.payload?.models||[]).includes(m.id)); setSelModels(toSel); setAiSuggested(p=>new Set([...p,"selModels"])); }
    else if (type === "toggle_metrics") { if(action.enable) setMetrics(p=>p.map(m=>action.enable.includes(m.id)?{...m,enabled:true}:m)); if(action.disable) setMetrics(p=>p.map(m=>action.disable.includes(m.id)?{...m,enabled:false}:m)); }
    else if (type === "set_criteria") { setCriteria(p=>{ const n={...p,priorities:{...p.priorities}}; ["high","medium","low"].forEach(l=>{ n.priorities[l]=n.priorities[l].filter(x=>x!==action.field); }); n.priorities[action.level]=[...n.priorities[action.level],action.field]; return n; }); }
    // Legacy global chat actions
    else if (action.payload?.taskType) { setTaskType(action.payload.taskType); setAiSuggested(p=>new Set([...p,"taskType"])); }
  };

  return (
    <div style={{ display:"flex", height:"100vh", background:T.base, overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:${T.base}}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:10px}
        ::-webkit-scrollbar-thumb:hover{background:${T.lo}}
        button,input,textarea,select{font-family:'Inter',-apple-system,sans-serif}
        ::placeholder{color:${T.lo} !important;opacity:1}
        input[type=range]{accent-color:${T.blue}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes pulse{0%,100%{opacity:0.7}50%{opacity:1}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <Sidebar step={step} nav={setStep} taskType={taskType} selModels={selModels} metrics={metrics} />

      <main style={{ flex:1, overflow: step===3 ? "hidden" : "auto", display:"flex", flexDirection:"column" }}>

        {step===1 && <DefineTaskStep taskType={taskType} setTaskType={setTaskType} taskContext={taskContext} setTaskContext={setTaskContext} aiSuggested={aiSuggested} dismissAi={f=>setAiSuggested(p=>{ const n=new Set(p); n.delete(f); return n; })} onNext={next} />}
        {step===2 && <DefineMetricsStep metrics={metrics} setMetrics={setMetrics} taskType={taskType} taskContext={taskContext} customMetrics={customMetrics} setCustomMetrics={setCustomMetrics} aiSuggested={aiSuggested} dismissAi={f=>setAiSuggested(p=>{ const n=new Set(p); n.delete(f); return n; })} onNext={next} onBack={back} />}
        {step===3 && <ModelSelectionStep criteria={criteria} setCriteria={setCriteria} selModels={selModels} setSelModels={setSelModels} taskType={taskType} taskContext={taskContext} metrics={metrics} aiSuggested={aiSuggested} onNext={next} onBack={back} />}
        {step===4 && <RunStep selModels={selModels} challenger={challenger} metrics={metrics} taskType={taskType} taskContext={taskContext} onBack={back}
          ran={evalRan} setRan={setEvalRan}
          fileName={evalFileName} setFileName={setEvalFileName}
          inputMode={evalInputMode} setInputMode={setEvalInputMode}
          manualInput={evalManualInput} setManualInput={setEvalManualInput}
          manualGolden={evalManualGolden} setManualGolden={setEvalManualGolden}
          csvColumns={evalCsvColumns} setCsvColumns={setEvalCsvColumns}
          csvRows={evalCsvRows} setCsvRows={setEvalCsvRows}
          challengerActive={evalChallengerOn} setChallengerActive={setEvalChallengerOn}
        />}
      </main>

      <CopilotPanel
        open={copilotOpen} onToggle={()=>setCopilotOpen(p=>!p)}
        step={step} taskType={taskType} taskContext={taskContext}
        metrics={metrics} criteria={criteria} selModels={selModels}
        onApply={handleCopilotApply}
      />
    </div>
  );
}
