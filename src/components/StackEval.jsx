import { useState, useCallback, useRef, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS  (Blue Labs / StackEval design system)
───────────────────────────────────────────────────────────── */
const T = {
  // surfaces
  base:    "#0A0A0C",
  surface: "#111115",
  elev:    "#18181F",
  // borders
  border:  "#26262E",
  borderS: "#1E1E26",
  // primary
  blue:    "#3B82F6",
  blueHov: "#2563EB",
  blueSub: "rgba(59,130,246,0.08)",
  blueTxt: "#93C5FD",
  // text
  hi:  "#EDEDF0",
  mid: "#8A8A9A",
  lo:  "#55556A",
  dis: "#3A3A4A",
  // metric badge variants  { bg, border, text }
  mBlue:   { bg:"#1E2235", bd:"#2A3050", tx:"#93C5FD" },
  mTeal:   { bg:"#1E2830", bd:"#1F3530", tx:"#6EE7B7" },
  mAmber:  { bg:"#27201A", bd:"#3A2E1A", tx:"#FCD34D" },
  mGreen:  { bg:"#1F2A1E", bd:"#243024", tx:"#86EFAC" },
  mCustom: { bg:"transparent", bd:"#3A3A50", tx:"#8A8A9A", dash:true },
  // recommendation badge variants
  rGreen:  { bg:"#1E2A1E", bd:"#243024", tx:"#86EFAC" },
  rBlue:   { bg:"#1A1F2E", bd:"#232B3E", tx:"#93C5FD" },
  rTeal:   { bg:"#1E2830", bd:"#1F3530", tx:"#6EE7B7" },
  rAmber:  { bg:"#292314", bd:"#3D3218", tx:"#FCD34D" },
  rPurple: { bg:"#1E1A2E", bd:"#2E2845", tx:"#C4B5FD" },
  rNeut:   { bg:"transparent", bd:"#3A3A50", tx:"#9B9BB0", dash:true },
  // task type dots
  dotQA:  "#3B82F6", dotSum:"#8B5CF6", dotRAG:"#10B981", dotLoc:"#F59E0B",
};
const MONO = "'JetBrains Mono',monospace";
const UI   = "'Inter',-apple-system,sans-serif";

/* ─────────────────────────────────────────────────────────────
   PRIMITIVE COMPONENTS
───────────────────────────────────────────────────────────── */
const Badge = ({ label, score, color, style = {} }) => (
  <span style={{
    display:"inline-flex", alignItems:"center", gap:5, height:20, padding:"0 7px",
    borderRadius:4, background:color.bg,
    border:`1px ${color.dash?"dashed":"solid"} ${color.bd}`,
    fontSize:11, fontWeight:500, letterSpacing:"0.06em", textTransform:"uppercase",
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
    background:active?T.blueSub:T.borderS, color:active?T.blueTxt:T.mid,
    fontSize:11, fontWeight:500, letterSpacing:"0.06em", textTransform:"uppercase",
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
    <button onClick={onClick} disabled={disabled} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{ ...base, background:disabled?T.elev:hov?T.blueHov:T.blue, color:disabled?T.dis:"#fff" }}>{children}</button>
  );
  if (variant==="ghost") return (
    <button onClick={onClick} disabled={disabled} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{ ...base, background:"transparent", border:`1px solid ${hov?T.blue:T.border}`, color:hov?T.hi:T.mid }}>{children}</button>
  );
  if (variant==="link") return (
    <button onClick={onClick} style={{ ...base, background:"none", border:"none", color:hov?T.hi:T.mid, padding:0 }} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>{children}</button>
  );
};

const Card = ({ children, style={} }) => (
  <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, padding:16, ...style }}>{children}</div>
);

const Mono = ({ children }) => <span style={{ fontFamily:MONO, fontSize:12, color:T.hi }}>{children}</span>;

const SubLabel = ({ children }) => (
  <div style={{ fontSize:11, fontWeight:600, color:T.lo, letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:UI, marginBottom:8 }}>{children}</div>
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
    width:16, height:16, borderRadius:3, border:`1px solid ${checked?T.blue:T.dis}`,
    background:checked?T.blue:"transparent", cursor:"pointer", display:"flex",
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
  qa:           { input:"What is your baggage allowance for economy class?", output:"Economy passengers can bring one carry-on bag (up to 22x14x9 inches, 15 lbs) and one personal item. For checked bags, domestic flights allow one bag up to 50 lbs for a fee; many international routes include one free checked bag." },
  summarization:{ input:"If your flight is cancelled, we'll automatically rebook you on the next available flight and notify you by email or SMS. You can also opt for a full refund to your original payment method. If an overnight stay is needed due to a cancellation on our end, hotel and meal vouchers may be provided.", output:"Cancelled flights are automatically rebooked. Full refunds or hotel/meal vouchers available depending on circumstances." },
  "rag-qa":     { input:"How do I check in for my flight online?", output:"Online check-in opens 24 hours before departure. Head to our website or app, select 'Check-In,' and enter your confirmation number and last name." },
  locomo:       { input:"Can I bring my pet on the flight?", output:"Small dogs and cats can travel in the cabin in an approved carrier that fits under the seat, subject to availability and a pet fee." },
};

const INIT_METRICS = [
  { id:"f1",    name:"F1 Score",           enabled:true,  desc:"Harmonic mean of precision and recall",                                          color:T.mBlue,   llm:false },
  { id:"bleu",  name:"BLEU",               enabled:true,  desc:"Bilingual Evaluation Understudy — n-gram overlap against reference",             color:T.mBlue,   llm:false },
  { id:"rouge", name:"ROUGE-L",            enabled:true,  desc:"Longest common subsequence recall between output and reference",                 color:T.mBlue,   llm:false },
  { id:"bert",  name:"BERTScore",          enabled:false, desc:"Contextual embedding similarity using BERT representations",                     color:T.mTeal,   llm:false },
  { id:"judge", name:"LLM-as-Judge",       enabled:false, desc:"Uses an LLM to score outputs against criteria you define",                       color:T.mAmber,  llm:true  },
  { id:"human", name:"Human Evaluation",   enabled:false, desc:"Human annotation scores — results imported via CSV",                             color:T.mGreen,  llm:false },
];

const ALL_MODELS = [
  { id:"gpt-4-turbo",    name:"GPT-4 Turbo",    provider:"OpenAI",    ctx:128000, oss:false, cost:15,  speed:120, lmsys:1251, mmlu:86.4, matchPct:95, released:2024 },
  { id:"claude-3-opus",  name:"Claude 3 Opus",  provider:"Anthropic", ctx:200000, oss:false, cost:25,  speed:90,  lmsys:1263, mmlu:86.8, matchPct:92, released:2024 },
  { id:"claude-3-sonnet",name:"Claude 3 Sonnet",provider:"Anthropic", ctx:200000, oss:false, cost:8,   speed:150, lmsys:1202, mmlu:79.0, matchPct:87, released:2024 },
  { id:"claude-3-haiku", name:"Claude 3 Haiku", provider:"Anthropic", ctx:200000, oss:false, cost:1.5, speed:250, lmsys:1179, mmlu:75.2,              released:2024 },
  { id:"gemini-ultra",   name:"Gemini Ultra",   provider:"Google",    ctx:32768,  oss:false, cost:20,  speed:100, lmsys:1258, mmlu:90.0,              released:2024 },
  { id:"gemini-pro",     name:"Gemini Pro",     provider:"Google",    ctx:32768,  oss:false, cost:7,   speed:130, lmsys:1215, mmlu:79.1,              released:2023 },
  { id:"gpt-4",          name:"GPT-4",          provider:"OpenAI",    ctx:8192,   oss:false, cost:30,  speed:80,  lmsys:1247, mmlu:86.4, matchPct:88, released:2023 },
  { id:"gpt-3.5-turbo",  name:"GPT-3.5 Turbo", provider:"OpenAI",    ctx:16385,  oss:false, cost:2,   speed:200, lmsys:1105, mmlu:70.0,              released:2022 },
  { id:"llama-3-70b",    name:"Llama 3 70B",    provider:"Meta",      ctx:8192,   oss:true,  cost:5,   speed:110, lmsys:1213, mmlu:79.5,              released:2024 },
  { id:"llama-3-8b",     name:"Llama 3 8B",     provider:"Meta",      ctx:8192,   oss:true,  cost:0.5, speed:300, lmsys:1155, mmlu:66.6,              released:2024 },
  { id:"mixtral-8x7b",   name:"Mixtral 8x7B",   provider:"Mistral",   ctx:32768,  oss:true,  cost:3,   speed:140, lmsys:1191, mmlu:70.6,              released:2023 },
  { id:"mistral-7b",     name:"Mistral 7B",     provider:"Mistral",   ctx:8192,   oss:true,  cost:1,   speed:220, lmsys:1141, mmlu:62.5,              released:2023 },
  { id:"command-r-plus", name:"Command R+",     provider:"Cohere",    ctx:128000, oss:false, cost:12,  speed:115, lmsys:1225, mmlu:75.0,              released:2024 },
  { id:"command-r",      name:"Command R",      provider:"Cohere",    ctx:128000, oss:false, cost:6,   speed:135, lmsys:1186, mmlu:72.3,              released:2024 },
];

const CHALLENGERS = [
  { id:"phi-3-mini", name:"Phi-3 Mini",  provider:"Microsoft", ctx:4096,  oss:true,  cost:0.3, speed:350, lmsys:1180, mmlu:68.8 },
  { id:"falcon-40b", name:"Falcon 40B",  provider:"TII",       ctx:2048,  oss:true,  cost:2.5, speed:160, lmsys:1165, mmlu:55.4 },
  { id:"vicuna-13b", name:"Vicuna 13B",  provider:"LMSYS",     ctx:2048,  oss:true,  cost:1.2, speed:180, lmsys:1121, mmlu:56.0 },
];

const MOCK_RESULTS = [
  { input:"What is your baggage allowance for economy class?", golden:"Economy passengers can bring one carry-on bag (up to 22x14x9 inches, 15 lbs) and one personal item.",
    out:{ "gpt-4-turbo":{text:"Economy passengers can bring one carry-on bag and one personal item.",f1:0.92,bleu:0.85,rouge:0.88,ms:245,cost:0.03},
          "claude-3-opus":{text:"One carry-on bag and one personal item for economy class.",f1:0.88,bleu:0.80,rouge:0.82,ms:312,cost:0.05},
          "claude-3-sonnet":{text:"Economy class allows one carry-on and one personal item.",f1:0.90,bleu:0.82,rouge:0.85,ms:198,cost:0.02} }},
  { input:"How do I check in for my flight online?", golden:"Online check-in opens 24 hours before departure.",
    out:{ "gpt-4-turbo":{text:"Online check-in opens 24 hours before departure via our website or app.",f1:0.95,bleu:0.90,rouge:0.92,ms:180,cost:0.02},
          "claude-3-opus":{text:"Check in online 24 hours before your flight through our website.",f1:0.90,bleu:0.85,rouge:0.88,ms:220,cost:0.03},
          "claude-3-sonnet":{text:"Online check-in is available 24 hours before departure.",f1:0.93,bleu:0.88,rouge:0.90,ms:155,cost:0.01} }},
  { input:"Can I change my flight after booking?", golden:"Yes, flight changes can be made online, through our app, or by calling us.",
    out:{ "gpt-4-turbo":{text:"Yes, changes can be made online or by calling us.",f1:0.92,bleu:0.88,rouge:0.90,ms:156,cost:0.02},
          "claude-3-opus":{text:"Flight changes are possible through multiple channels.",f1:0.85,bleu:0.78,rouge:0.80,ms:198,cost:0.04},
          "claude-3-sonnet":{text:"Yes, you can change your flight online, via app, or by phone.",f1:0.94,bleu:0.90,rouge:0.92,ms:134,cost:0.01} }},
  { input:"What happens if my flight is cancelled?", golden:"If your flight is cancelled, we'll automatically rebook you on the next available flight.",
    out:{ "gpt-4-turbo":{text:"We'll rebook you on the next available flight automatically.",f1:0.93,bleu:0.88,rouge:0.90,ms:180,cost:0.02},
          "claude-3-opus":{text:"Automatic rebooking on the next available flight is provided.",f1:0.90,bleu:0.85,rouge:0.87,ms:220,cost:0.03},
          "claude-3-sonnet":{text:"You'll be automatically rebooked if your flight is cancelled.",f1:0.91,bleu:0.86,rouge:0.88,ms:155,cost:0.01} }},
];

const PRESETS = {
  chatbot:         { high:["cost","speed"],          medium:["contextWindow"], low:[] },
  rag:             { high:["contextWindow"],          medium:["cost","speed"],  low:[] },
  "code-assistant":{ high:["speed","contextWindow"],  medium:["cost"],          low:[] },
};

const PRIORITY_CFG = {
  cost:          { label:"Cost",           desc:"Prefer lower-cost models" },
  speed:         { label:"Speed",          desc:"Prefer faster inference" },
  contextWindow: { label:"Context Window", desc:"Prefer larger context windows" },
};

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function getRecBadge(m, criteria) {
  const hi = criteria.priorities?.high || [];
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
const STEPS = [
  { id:1, label:"Task Type" }, { id:2, label:"Define Metrics" },
  { id:3, label:"Define Criteria" }, { id:4, label:"Model Selection" }, { id:5, label:"Run" },
];

function Sidebar({ step, nav, taskType, selModels }) {
  const done = id => ({ 1:!!taskType, 2:true, 3:true, 4:selModels.length>0, 5:false }[id]);
  const locked = id => id===5 && (!taskType || !selModels.length);

  return (
    <aside style={{ width:230, background:T.base, borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column", flexShrink:0 }}>
      <div style={{ padding:"18px 18px 14px", borderBottom:`1px solid ${T.border}`, display:"flex", gap:10, alignItems:"center" }}>
        <div style={{ width:28, height:28, background:T.blue, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polygon points="7,1 9.5,5.5 14,5.5 10.5,8.5 12,13 7,10 2,13 3.5,8.5 0,5.5 4.5,5.5" fill="white"/></svg>
        </div>
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:T.hi, fontFamily:UI, letterSpacing:"-0.2px" }}>StackEval</div>
          <div style={{ fontSize:11, color:T.lo, fontFamily:UI }}>LLM Evaluation</div>
        </div>
      </div>

      <nav style={{ flex:1, padding:"18px 12px", overflowY:"auto" }}>
        <SubLabel>Wizard</SubLabel>
        <ol style={{ listStyle:"none", margin:"4px 0 0", padding:0, display:"flex", flexDirection:"column", gap:1 }}>
          {STEPS.map((s,i) => {
            const active = step===s.id, complete=done(s.id), lock=locked(s.id);
            return (
              <li key={s.id}>
                <button onClick={()=>!lock&&nav(s.id)} disabled={lock} style={{
                  width:"100%", display:"flex", alignItems:"center", gap:10, padding:"8px 10px",
                  borderRadius:6, border:active?`1px solid rgba(59,130,246,0.25)`:"1px solid transparent",
                  background:active?T.blueSub:"transparent", cursor:lock?"not-allowed":"pointer", textAlign:"left",
                  color:lock?T.dis:active?T.hi:T.mid, transition:"all .1s",
                }}
                  onMouseEnter={e=>{ if(!active&&!lock) e.currentTarget.style.background=T.elev; }}
                  onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}
                >
                  <div style={{ width:20,height:20,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
                    background:active?T.blue:complete&&!active?"rgba(59,130,246,0.15)":"transparent",
                    border:`1px solid ${active?T.blue:complete?T.blue:lock?T.dis:T.border}`,
                    fontSize:10,fontWeight:700,color:active?"#fff":complete?T.blueTxt:lock?T.dis:T.lo,
                  }}>
                    {complete&&!active ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2" stroke={T.blueTxt} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> : s.id}
                  </div>
                  <span style={{ fontSize:13,fontFamily:UI,fontWeight:active?600:400 }}>{s.label}</span>
                  {active && <div style={{ marginLeft:"auto",width:4,height:4,borderRadius:"50%",background:T.blue }} />}
                </button>
                {i<STEPS.length-1 && <div style={{ marginLeft:20,paddingLeft:10 }}><div style={{ width:1,height:8,background:T.border }} /></div>}
              </li>
            );
          })}
        </ol>
      </nav>

      <div style={{ padding:"12px 18px", borderTop:`1px solid ${T.border}`, fontSize:11, color:T.lo, fontFamily:UI }}>
        © 2026 Backboard.io
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP 1 — TASK TYPE
───────────────────────────────────────────────────────────── */
function Step1({ taskType, setTaskType, onNext }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ maxWidth:940, margin:"0 auto", padding:"32px 28px" }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:24,fontWeight:700,color:T.hi,letterSpacing:"-0.24px",margin:"0 0 6px",fontFamily:UI }}>Configure Evaluation Task</h1>
        <p style={{ fontSize:14,color:T.mid,margin:0,fontFamily:UI }}>Select a task type to begin configuring your evaluation.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {TASK_OPTIONS.map(t => {
          const sel = taskType===t.id;
          return (
            <button key={t.id} onClick={()=>setTaskType(t.id)} style={{
              background:sel?T.blueSub:T.surface, border:`1px solid ${sel?T.blue:T.border}`,
              outline:sel?`1px solid ${T.blue}`:"none", borderRadius:8, padding:16,
              textAlign:"left", cursor:"pointer", transition:"all .15s",
            }}
              onMouseEnter={e=>{ if(!sel){e.currentTarget.style.borderColor=T.blue;e.currentTarget.style.background=T.elev;} }}
              onMouseLeave={e=>{ if(!sel){e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background=T.surface;} }}
            >
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div style={{ width:6,height:6,borderRadius:"50%",background:t.dot,marginTop:4 }} />
                {sel && (
                  <div style={{ width:16,height:16,borderRadius:"50%",background:T.blue,display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1 4.5L3.5 7L8 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                )}
              </div>
              <div style={{ fontSize:14,fontWeight:600,color:T.hi,marginBottom:6,fontFamily:UI }}>{t.name}</div>
              <div style={{ fontSize:12,color:T.mid,lineHeight:1.5,fontFamily:UI }}>{t.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Example accordion */}
      <Card style={{ marginBottom:24 }}>
        <button onClick={()=>setOpen(!open)} style={{ width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",background:"transparent",border:"none",cursor:"pointer",padding:0 }}>
          <div style={{ textAlign:"left" }}>
            <div style={{ fontSize:14,fontWeight:500,color:T.hi,fontFamily:UI,marginBottom:2 }}>Example</div>
            <div style={{ fontSize:12,color:T.mid,fontFamily:UI }}>{taskType ? `${TASK_OPTIONS.find(t=>t.id===taskType)?.name} format` : "Select a task type above to see an example."}</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color:T.mid,transition:"transform .2s",transform:open?"rotate(180deg)":"none",flexShrink:0 }}>
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {open && taskType && (
          <>
            <Divider />
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
              {[["Input","input"],["Expected Output","output"]].map(([lbl,k])=>(
                <div key={k}>
                  <SubLabel>{lbl}</SubLabel>
                  <div style={{ background:T.elev,border:`1px solid ${T.border}`,borderRadius:6,padding:"10px 12px" }}>
                    <span style={{ fontSize:13,color:T.hi,lineHeight:1.6,fontFamily:UI }}>{TASK_EXAMPLES[taskType]?.[k]}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {open && !taskType && (
          <div style={{ textAlign:"center",padding:"24px 0",color:T.lo,fontSize:13,fontFamily:UI,marginTop:12 }}>
            Select a task type above to see a relevant example.
          </div>
        )}
      </Card>

      <div style={{ display:"flex",justifyContent:"flex-end",alignItems:"center",gap:10 }}>
        {taskType && (
          <div style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,color:T.mid,fontFamily:UI }}>
            <div style={{ width:4,height:4,borderRadius:"50%",background:TASK_OPTIONS.find(t=>t.id===taskType)?.dot }} />
            {TASK_OPTIONS.find(t=>t.id===taskType)?.name}
          </div>
        )}
        <Btn onClick={onNext} disabled={!taskType}>Continue to Define Metrics →</Btn>
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
                      <Textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={12}
                        style={{ border:"none",borderRadius:0,background:"transparent",resize:"vertical",fontFamily:UI,fontSize:13,lineHeight:1.6 }} />
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
          <Btn onClick={save}>Save Custom Metrics</Btn>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP 2 — DEFINE METRICS
───────────────────────────────────────────────────────────── */
function Step2({ metrics, setMetrics, onNext, onBack }) {
  const [showMore, setShowMore]     = useState(false);
  const [panelOpen, setPanelOpen]   = useState(false);
  const [editMetric, setEditMetric] = useState(null);
  const [customMetrics, setCustomMetrics] = useState([]);

  const toggle = id => setMetrics(p => p.map(m => m.id===id?{...m,enabled:!m.enabled}:m));
  const shown  = showMore ? metrics : metrics.slice(0,4);
  const hasEnabled = metrics.some(m=>m.enabled) || customMetrics.some(m=>m.enabled);
  const hasLLM = metrics.find(m=>m.id==="judge")?.enabled || customMetrics.some(m=>m.enabled&&m.method==="llm-judge");

  const saveCustom = m => {
    if (editMetric) setCustomMetrics(p=>p.map(x=>x.id===editMetric.id?m:x));
    else setCustomMetrics(p=>[...p,m]);
    setEditMetric(null);
  };

  return (
    <>
      <div style={{ maxWidth:720,margin:"0 auto",padding:"32px 28px" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24 }}>
          <div>
            <h1 style={{ fontSize:24,fontWeight:700,color:T.hi,letterSpacing:"-0.24px",margin:"0 0 6px",fontFamily:UI }}>Define Evaluation Metrics</h1>
            <p style={{ fontSize:14,color:T.mid,margin:0,fontFamily:UI }}>Select from preset metrics or add a custom evaluator.</p>
          </div>
          <button onClick={onNext} style={{ background:"none",border:"none",cursor:"pointer",color:T.lo,padding:4,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:4,transition:"color .15s" }} onMouseEnter={e=>e.currentTarget.style.color=T.mid} onMouseLeave={e=>e.currentTarget.style.color=T.lo}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
          <SubLabel style={{ margin:0 }}>Preset Metrics</SubLabel>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:8 }}>
          {shown.map(m => (
            <div key={m.id} style={{ background:T.surface,border:`1px solid ${m.enabled?T.borderS:T.border}`,borderRadius:8,padding:"12px 14px",display:"flex",alignItems:"flex-start",gap:12 }}>
              <CheckBox checked={m.enabled} onClick={()=>toggle(m.id)} />
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:"flex",alignItems:"center",flexWrap:"wrap",gap:6,marginBottom:3 }}>
                  <span style={{ fontSize:14,fontWeight:500,color:T.hi,fontFamily:UI }}>{m.name}</span>
                  <Badge label={m.color===T.mBlue?"Statistical":m.color===T.mTeal?"Semantic":m.color===T.mAmber?"LLM Judge":"Human"} color={m.color} />
                  {m.llm && <Badge label="Uses Model Call" color={T.mAmber} />}
                </div>
                <div style={{ fontSize:12,color:T.mid,fontFamily:UI }}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom:12 }}>
          {!showMore && metrics.length>4 && (
            <Btn onClick={()=>setShowMore(true)} variant="link" style={{ fontSize:13,color:T.mid }}>Show all metrics</Btn>
          )}
          {showMore && (
            <Btn onClick={()=>setShowMore(false)} variant="link" style={{ fontSize:13,color:T.mid }}>Show less</Btn>
          )}
        </div>

        <Divider />

        {/* Custom metrics */}
        <div style={{ marginBottom:14 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4 }}>
            <SubLabel style={{ margin:0 }}>Custom Evaluators</SubLabel>
            <Btn onClick={()=>{setEditMetric(null);setPanelOpen(true);}} small>+ Add Custom</Btn>
          </div>
          <div style={{ fontSize:12,color:T.mid,fontFamily:UI }}>Code evaluators, embedding similarity, or LLM-as-judge</div>
        </div>

        {customMetrics.length===0 ? (
          <div style={{ border:`1px dashed ${T.border}`,borderRadius:8,padding:"20px 0",textAlign:"center" }}>
            <div style={{ fontSize:13,color:T.lo,fontFamily:UI }}>No custom metrics yet</div>
            <Btn onClick={()=>{setEditMetric(null);setPanelOpen(true);}} variant="link" style={{ fontSize:13,color:T.blueTxt,marginTop:4 }}>Create your first custom metric →</Btn>
          </div>
        ) : (
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {customMetrics.map(m => {
              const mc = m.method==="llm-judge"?T.mAmber:m.method==="code"?T.mBlue:T.mTeal;
              return (
                <div key={m.id} style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:10 }}>
                  <CheckBox checked={m.enabled} onClick={()=>setCustomMetrics(p=>p.map(x=>x.id===m.id?{...x,enabled:!x.enabled}:x))} />
                  <Badge label={m.method==="llm-judge"?"LLM Judge":m.method==="code"?"Code":"Embedding"} color={mc} />
                  <span style={{ fontSize:14,fontWeight:500,color:T.hi,flex:1,fontFamily:UI }}>{m.name}</span>
                  <button onClick={()=>{setEditMetric(m);setPanelOpen(true);}} style={{ background:"none",border:"none",cursor:"pointer",color:T.mid,padding:"2px 6px",fontSize:12,fontFamily:UI }}>Edit</button>
                  <button onClick={()=>setCustomMetrics(p=>p.filter(x=>x.id!==m.id))} style={{ background:"none",border:"none",cursor:"pointer",color:T.mid,padding:0,fontSize:16 }}>×</button>
                </div>
              );
            })}
          </div>
        )}

        {hasLLM && (
          <div style={{ marginTop:12,padding:"10px 12px",background:"rgba(252,211,77,0.06)",border:`1px solid rgba(252,211,77,0.2)`,borderRadius:6,display:"flex",gap:10,alignItems:"flex-start" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink:0,marginTop:1 }}><path d="M7 2L12.5 11.5H1.5L7 2Z" stroke="#FCD34D" strokeWidth="1.2"/><path d="M7 6v3M7 10.5h.01" stroke="#FCD34D" strokeWidth="1.2" strokeLinecap="round"/></svg>
            <span style={{ fontSize:12,color:"#FCD34D",fontFamily:UI }}>LLM-as-Judge metrics add one model call per evaluation row — this affects cost and latency estimates.</span>
          </div>
        )}

        <div style={{ display:"flex",justifyContent:"flex-end",marginTop:24,paddingTop:20,borderTop:`1px solid ${T.border}` }}>
          <Btn onClick={onNext} disabled={!hasEnabled}>Continue to Criteria →</Btn>
        </div>
      </div>

      <CustomMetricPanel isOpen={panelOpen} onClose={()=>setPanelOpen(false)} onSave={saveCustom} editMetric={editMetric} />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP 3 — DEFINE CRITERIA  (drag-and-drop, preset dropdown)
───────────────────────────────────────────────────────────── */
const PRESET_OPTIONS = [
  { value:"chatbot",        label:"Chatbot (Speed + Low Cost)",       priorities:{ high:["cost","speed"], medium:["contextWindow"], low:[] } },
  { value:"rag",            label:"RAG Pipeline (Large Context)",      priorities:{ high:["contextWindow"], medium:["cost","speed"], low:[] } },
  { value:"code-assistant", label:"Code Assistant (Accuracy + Context)",priorities:{ high:["speed","contextWindow"], medium:["cost"], low:[] } },
  { value:"custom",         label:"Custom Configuration",              priorities:null },
];

function Step3({ criteria, setCriteria, onNext, onBack }) {
  const { priorities, openSourceOnly, maxCostCap } = criteria;
  const [capVal, setCapVal]           = useState(maxCostCap||"");
  const [activePreset, setActivePreset] = useState("");
  const [presetOpen, setPresetOpen]   = useState(false);
  const [savedPresets, setSavedPresets] = useState([]);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveName, setSaveName]       = useState("");
  // drag state
  const dragItem = useRef(null);   // { id, fromZone }
  const [dragOver, setDragOver]   = useState(null); // zone being hovered

  const ZONES = [
    { level:"high",   label:"High Priority",   zoneColor:"#22C55E", bg:"rgba(34,197,94,0.05)",   border:"rgba(34,197,94,0.25)" },
    { level:"medium", label:"Medium Priority",  zoneColor:"#EAB308", bg:"rgba(234,179,8,0.05)",   border:"rgba(234,179,8,0.25)" },
    { level:"low",    label:"Low Priority",     zoneColor:"#94A3B8", bg:"rgba(148,163,184,0.04)", border:"rgba(148,163,184,0.2)" },
  ];

  const moveToZone = (itemId, toZone) => {
    setCriteria(prev => {
      const newP = {
        high:   prev.priorities.high.filter(i=>i!==itemId),
        medium: prev.priorities.medium.filter(i=>i!==itemId),
        low:    prev.priorities.low.filter(i=>i!==itemId),
      };
      newP[toZone] = [...newP[toZone], itemId];
      return { ...prev, priorities:newP };
    });
  };

  const handleDragStart = (id, fromZone) => { dragItem.current = { id, fromZone }; };
  const handleDrop = (toZone) => {
    if (dragItem.current && dragItem.current.fromZone !== toZone) {
      moveToZone(dragItem.current.id, toZone);
    }
    dragItem.current = null;
    setDragOver(null);
  };

  const applyPreset = (value) => {
    setActivePreset(value);
    setPresetOpen(false);
    const preset = PRESET_OPTIONS.find(p=>p.value===value);
    if (preset?.priorities) setCriteria(prev=>({...prev, priorities:preset.priorities}));
  };

  const savePreset = () => {
    if (!saveName.trim()) return;
    setSavedPresets(prev=>[...prev,{label:saveName, priorities:{...priorities}}]);
    setSaveModalOpen(false); setSaveName("");
  };

  const selectedPresetLabel = PRESET_OPTIONS.find(p=>p.value===activePreset)?.label || "Select a preset or customize...";

  const PriorityChip = ({ id, zone }) => {
    const cfg = PRIORITY_CFG[id]; if (!cfg) return null;
    return (
      <div
        draggable
        onDragStart={()=>handleDragStart(id, zone)}
        style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"7px 12px",
          background:T.surface, border:`1px solid ${T.border}`, borderRadius:8,
          fontSize:13, color:T.hi, fontFamily:UI, cursor:"grab", userSelect:"none",
          boxShadow:"0 1px 3px rgba(0,0,0,0.3)", transition:"transform .1s",
        }}
        onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
        onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}
      >
        {/* grip dots */}
        <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
          {[0,4,8].map(y=>[0,4].map(x=>(
            <circle key={`${x}${y}`} cx={x} cy={y+3} r="1.2" fill={T.lo}/>
          )))}
        </svg>
        <span style={{ fontWeight:500 }}>{cfg.label}</span>
      </div>
    );
  };

  return (
    <div style={{ maxWidth:720,margin:"0 auto",padding:"32px 28px" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:24,fontWeight:700,color:T.hi,letterSpacing:"-0.24px",margin:"0 0 6px",fontFamily:UI }}>Define Your Criteria</h1>
          <p style={{ fontSize:14,color:T.mid,margin:0,fontFamily:UI }}>Set your priorities and constraints to optimize model recommendations.</p>
        </div>
        <button onClick={onNext} style={{ background:"none",border:"none",cursor:"pointer",color:T.lo,padding:4,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:4,transition:"color .15s" }} onMouseEnter={e=>e.currentTarget.style.color=T.mid} onMouseLeave={e=>e.currentTarget.style.color=T.lo}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
        </button>
      </div>

      {/* Preset dropdown */}
      <Card style={{ marginBottom:20, position:"relative" }}>
        <SubLabel>Use Case Preset</SubLabel>
        <div style={{ position:"relative" }}>
          <button onClick={()=>setPresetOpen(!presetOpen)} style={{
            width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"13px 16px", background:T.elev, border:`1px solid ${T.border}`,
            borderRadius:8, cursor:"pointer", color:activePreset?T.hi:T.mid,
            fontSize:15, fontWeight:activePreset?600:400, fontFamily:UI,
          }}>
            {selectedPresetLabel}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color:T.mid,flexShrink:0,transition:"transform .2s",transform:presetOpen?"rotate(180deg)":"none" }}>
              <path d="M4.5 7l4.5 4.5L13.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {presetOpen && (
            <div style={{ position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,zIndex:40,overflow:"hidden",boxShadow:"0 8px 24px rgba(0,0,0,0.4)" }}>
              {PRESET_OPTIONS.map((p,i)=>(
                <button key={p.value} onClick={()=>applyPreset(p.value)} style={{
                  width:"100%", textAlign:"left", padding:"14px 18px",
                  background:activePreset===p.value?"rgba(59,130,246,0.1)":"transparent",
                  border:"none", borderBottom:i<PRESET_OPTIONS.length-1?`1px solid ${T.borderS}`:"none",
                  color:activePreset===p.value?T.blueTxt:T.hi, fontSize:14, fontWeight:activePreset===p.value?500:400,
                  fontFamily:UI, cursor:"pointer",
                }}
                  onMouseEnter={e=>{ if(activePreset!==p.value) e.currentTarget.style.background=T.elev; }}
                  onMouseLeave={e=>{ if(activePreset!==p.value) e.currentTarget.style.background="transparent"; }}
                >{p.label}</button>
              ))}
              {savedPresets.map((p,i)=>(
                <button key={`saved-${i}`} onClick={()=>{setCriteria(prev=>({...prev,priorities:p.priorities}));setPresetOpen(false);setActivePreset("custom");}} style={{
                  width:"100%",textAlign:"left",padding:"14px 18px",background:"transparent",border:"none",
                  borderTop:`1px solid ${T.borderS}`,color:T.hi,fontSize:14,fontFamily:UI,cursor:"pointer",
                  display:"flex",alignItems:"center",gap:8,
                }}
                  onMouseEnter={e=>e.currentTarget.style.background=T.elev}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2h8v8l-4-2-4 2V2z" stroke={T.blueTxt} strokeWidth="1.2" strokeLinejoin="round"/></svg>
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Save as Preset */}
      <div style={{ marginBottom:24 }}>
        <Btn onClick={()=>setSaveModalOpen(true)} variant="ghost" style={{ display:"flex",alignItems:"center",gap:8 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3h8v8l-4-2-4 2V3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
          Save as Preset
        </Btn>
        {saveModalOpen && (
          <div style={{ marginTop:10,padding:14,background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,display:"flex",gap:8,alignItems:"center" }}>
            <Input value={saveName} onChange={e=>setSaveName(e.target.value)} placeholder="Preset name…" style={{ flex:1 }} />
            <Btn onClick={savePreset} small>Save</Btn>
            <Btn onClick={()=>setSaveModalOpen(false)} variant="ghost" small>×</Btn>
          </div>
        )}
      </div>

      {/* Drag-and-drop zones */}
      <div style={{ display:"flex",flexDirection:"column",gap:14,marginBottom:20 }}>
        {ZONES.map(({ level,label,zoneColor,bg,border:zoneBorder }) => {
          const isOver = dragOver===level;
          return (
            <div key={level}
              onDragOver={e=>{ e.preventDefault(); setDragOver(level); }}
              onDragLeave={()=>setDragOver(null)}
              onDrop={()=>handleDrop(level)}
            >
              <div style={{ fontSize:13,fontWeight:600,color:zoneColor,marginBottom:8,fontFamily:UI }}>{label}</div>
              <div style={{
                minHeight:72, borderRadius:10, padding:"14px 14px",
                border:`1.5px solid ${isOver?"rgba(59,130,246,0.5)":zoneBorder}`,
                background:isOver?"rgba(59,130,246,0.06)":bg,
                display:"flex",flexWrap:"wrap",gap:8,alignItems:"center",
                transition:"border-color .15s, background .15s",
              }}>
                {priorities[level].map(id => <PriorityChip key={id} id={id} zone={level} />)}
                {priorities[level].length===0 && (
                  <span style={{ fontSize:13,color:T.lo,fontFamily:UI,fontStyle:"italic",pointerEvents:"none" }}>
                    Drag items here
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Divider />

      {/* Toggles */}
      <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <div style={{ fontSize:14,fontWeight:500,color:T.hi,fontFamily:UI }}>Open Source Only</div>
            <div style={{ fontSize:12,color:T.mid,fontFamily:UI }}>Filter model browser to open-source models only</div>
          </div>
          <Toggle on={openSourceOnly} onClick={()=>setCriteria({...criteria,openSourceOnly:!openSourceOnly})} />
        </div>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <div style={{ fontSize:14,fontWeight:500,color:T.hi,fontFamily:UI }}>Max Cost Cap</div>
            <div style={{ fontSize:12,color:T.mid,fontFamily:UI }}>Hide models above this cost ($/1M tokens)</div>
          </div>
          <Input value={capVal} onChange={e=>{setCapVal(e.target.value);setCriteria({...criteria,maxCostCap:e.target.value});}}
            placeholder="No limit" style={{ width:100,textAlign:"right" }} />
        </div>
      </div>

      <div style={{ display:"flex",justifyContent:"flex-end",marginTop:24,paddingTop:20,borderTop:`1px solid ${T.border}` }}>
        <Btn onClick={onNext}>Continue to Model Selection →</Btn>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP 4 — MODEL SELECTION
───────────────────────────────────────────────────────────── */
const ALL_PROVIDERS_LIST = ["OpenAI","Anthropic","Google","Meta","Cohere","AWS Bedrock","Featherless","xAI","OpenRouter","Cerebras"];
const BENCH_TABS_LIST = [
  { key:"lmsys",     label:"LMSYS Arena" },
  { key:"mmlu",      label:"MMLU" },
  { key:"humanEval", label:"HumanEval" },
  { key:"math",      label:"MATH" },
  { key:"helmet",    label:"HELMET" },
];
const EXT_MODELS = ALL_MODELS.map(m => ({
  ...m,
  humanEval: m.lmsys ? Math.round((m.lmsys - 1100) * 0.55 + 40) : null,
  math:      m.lmsys ? Math.round((m.lmsys - 1100) * 0.38 + 28) : null,
  helmet:    m.lmsys ? Math.round((m.lmsys - 1100) * 0.42 + 60) : null,
}));

function Step4({ criteria, selModels, setSelModels, challenger, setChallenger, onNext, onBack }) {
  const [search, setSearch]           = useState("");
  const [leftTab, setLeftTab]         = useState("filters");
  const [activeBench, setActiveBench] = useState("lmsys");
  const [panelW, setPanelW]           = useState(260);
  const [resizing, setResizing]       = useState(false);
  const [activeProviders, setActiveProviders] = useState([]);
  const [ossF, setOssF]         = useState(null);
  const [minCtx, setMinCtx]     = useState(0);
  const [maxCostSl, setMaxCostSl] = useState(50);
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    if (!resizing) return;
    const mm = e => setPanelW(w => Math.max(220, Math.min(500, window.innerWidth - e.clientX)));
    const mu = () => setResizing(false);
    document.addEventListener("mousemove", mm);
    document.addEventListener("mouseup", mu);
    return () => { document.removeEventListener("mousemove", mm); document.removeEventListener("mouseup", mu); };
  }, [resizing]);

  const isSelected = id => selModels.some(m => m.id === id);
  const toggleModel = m => isSelected(m.id) ? setSelModels(p => p.filter(x => x.id !== m.id)) : setSelModels(p => [...p, m]);
  const capNum = parseFloat(criteria.maxCostCap) || Infinity;

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
    if (hi.includes("cost"))          { sa += (30-(a.cost||30))*2; sb += (30-(b.cost||30))*2; }
    if (hi.includes("speed"))         { sa += a.speed/3; sb += b.speed/3; }
    if (hi.includes("contextWindow")) { sa += a.ctx/10000; sb += b.ctx/10000; }
    sa += ((a.lmsys||1100)-1100)/2; sb += ((b.lmsys||1100)-1100)/2;
    return sb - sa;
  }).slice(0, 3);

  const benchLeaderboard = [...filtered]
    .filter(m => m[activeBench] != null && m[activeBench] > 0)
    .sort((a, b) => b[activeBench] - a[activeBench]);

  const rotateChallenger = () => setChallenger(prev => {
    const i = CHALLENGERS.findIndex(c => c.id === prev?.id);
    return CHALLENGERS[(i + 1) % CHALLENGERS.length];
  });

  const StatVal = ({ label, val }) => (
    <span style={{ display:"inline-flex", alignItems:"baseline", gap:3 }}>
      <span style={{ fontSize:11, color:T.mid, fontFamily:UI }}>{label}</span>
      <span style={{ fontFamily:MONO, fontSize:12, color:T.hi }}>{val}</span>
    </span>
  );

  // Shared filter sidebar used in both tabs
  const FilterPanel = () => (
    <div style={{ flex:1, overflow:"auto", padding:"14px 14px 16px" }}>
      <div style={{ position:"relative", marginBottom:14 }}>
        <svg width="13" height="13" viewBox="0 0 13 13" style={{ position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:T.lo,pointerEvents:"none" }} fill="none">
          <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M9 9L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search models..."
          style={{ width:"100%",paddingLeft:28,paddingRight:8,paddingTop:8,paddingBottom:8,background:T.elev,border:`1px solid ${T.border}`,borderRadius:8,fontSize:13,color:T.hi,outline:"none",boxSizing:"border-box",fontFamily:UI }} />
      </div>

      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:11,fontWeight:700,color:T.lo,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:UI,marginBottom:8 }}>Provider</div>
        <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
          {ALL_PROVIDERS_LIST.map(p => {
            const on = activeProviders.includes(p);
            return (
              <button key={p} onClick={()=>setActiveProviders(prev=>prev.includes(p)?prev.filter(x=>x!==p):[...prev,p])} style={{
                padding:"4px 8px",borderRadius:6,fontSize:11,fontFamily:UI,cursor:"pointer",
                background:on?T.blue:T.elev,color:on?"#fff":T.mid,
                border:`1px solid ${on?T.blue:T.border}`,fontWeight:on?500:400,
              }}>{p}</button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:11,fontWeight:700,color:T.lo,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:UI,marginBottom:8 }}>Source Type</div>
        <div style={{ display:"flex",gap:6 }}>
          {[[null,"All"],[true,"Open"],[false,"Closed"]].map(([v,l]) => (
            <button key={l} onClick={()=>setOssF(v)} style={{
              flex:1,padding:"7px 0",borderRadius:8,fontSize:12,fontFamily:UI,cursor:"pointer",
              background:ossF===v?T.blue:T.elev,color:ossF===v?"#fff":T.mid,
              border:`1px solid ${ossF===v?T.blue:T.border}`,fontWeight:ossF===v?600:400,
            }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:11,fontWeight:700,color:T.lo,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:UI,marginBottom:10 }}>Min Context Window</div>
        <input type="range" min={0} max={200000} step={4096} value={minCtx} onChange={e=>setMinCtx(+e.target.value)}
          style={{ width:"100%",accentColor:T.blue,cursor:"pointer",marginBottom:5 }} />
        <div style={{ fontSize:12,color:T.mid,fontFamily:UI }}>{minCtx===0?"0 tokens":`${(minCtx/1000).toFixed(0)}K tokens`}</div>
      </div>

      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:11,fontWeight:700,color:T.lo,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:UI,marginBottom:10 }}>Max Cost ($/1M Tokens)</div>
        <input type="range" min={1} max={50} step={1} value={maxCostSl} onChange={e=>setMaxCostSl(+e.target.value)}
          style={{ width:"100%",accentColor:T.blue,cursor:"pointer",marginBottom:5 }} />
        <div style={{ fontSize:12,color:T.mid,fontFamily:UI }}>${maxCostSl}</div>
      </div>

      <div>
        <div style={{ fontSize:11,fontWeight:700,color:T.lo,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:UI,marginBottom:8 }}>Release Date</div>
        <div style={{ display:"flex",gap:5 }}>
          {[["all","All"],["6mo","Last 6 mo"],["year","Last year"]].map(([v,l]) => (
            <button key={v} onClick={()=>setDateFilter(v)} style={{
              flex:1,padding:"7px 4px",borderRadius:8,fontSize:11,fontFamily:UI,cursor:"pointer",
              background:T.elev,color:dateFilter===v?T.hi:T.mid,
              border:`1px solid ${dateFilter===v?T.blue:T.border}`,fontWeight:dateFilter===v?500:400,
            }}>{l}</button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ height:"100%",display:"flex",background:T.base,overflow:"hidden" }}>

      {/* LEFT */}
      <div style={{ width:242,background:T.surface,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",flexShrink:0 }}>
        <div style={{ display:"flex",borderBottom:`1px solid ${T.border}` }}>
          {[["filters","Filters & Search"],["benchmarks","Benchmarks"]].map(([t,l]) => (
            <button key={t} onClick={()=>setLeftTab(t)} style={{
              flex:1,padding:"11px 2px",fontSize:11,fontWeight:600,border:"none",background:"none",cursor:"pointer",fontFamily:UI,
              borderBottom:`2px solid ${leftTab===t?T.blue:"transparent"}`,
              color:leftTab===t?T.blueTxt:T.mid,lineHeight:1.3,
            }}>{l}</button>
          ))}
        </div>
        <FilterPanel />
      </div>

      {/* CENTER */}
      <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>

        {leftTab === "filters" && (
          <>
            <div style={{ background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"8px 16px" }}>
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
                <Card style={{ padding:0,overflow:"hidden" }}>
                  {recommended.map((m,i) => {
                    const badge=getRecBadge(m,criteria); const sel=isSelected(m.id);
                    return (
                      <button key={m.id} onClick={()=>toggleModel(m)} style={{
                        width:"100%",display:"flex",alignItems:"center",gap:12,padding:"10px 14px",
                        background:sel?"rgba(59,130,246,0.08)":"transparent",
                        borderBottom:i<2?`1px solid ${T.border}`:"none",
                        borderLeft:`2px solid ${sel?T.blue:"transparent"}`,
                        cursor:"pointer",textAlign:"left",border:"none",
                      }}
                        onMouseEnter={e=>{ if(!sel) e.currentTarget.style.background=T.elev; }}
                        onMouseLeave={e=>{ if(!sel) e.currentTarget.style.background="transparent"; }}
                      >
                        <div style={{ width:14,display:"flex",justifyContent:"center" }}>
                          {sel && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1.5 6L4.5 9L10.5 3" stroke={T.blueTxt} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <div style={{ width:160,flexShrink:0 }}>
                          <div style={{ fontSize:13,fontWeight:500,color:T.hi,fontFamily:UI }}>{m.name}</div>
                          <Chip name={m.provider} />
                        </div>
                        <div style={{ display:"flex",gap:10,flex:1,flexWrap:"wrap" }}>
                          <StatVal label="$" val={`${m.cost}/1M`} />
                          <StatVal label="spd" val={`${m.speed}t/s`} />
                          <StatVal label="ctx" val={`${(m.ctx/1000).toFixed(0)}K`} />
                        </div>
                        {badge && <Badge label={badge.label} color={badge.color} />}
                      </button>
                    );
                  })}
                </Card>
              </div>
              {/* All models table */}
              <div>
                <SubLabel>All Models</SubLabel>
                <Card style={{ padding:0,overflow:"hidden" }}>
                  <div style={{ display:"grid",gridTemplateColumns:"18px 170px 110px 70px 70px 65px 55px",padding:"7px 12px",borderBottom:`1px solid ${T.border}`,background:T.elev }}>
                    {["","Model","Provider","Cost","Speed","Context","LMSYS"].map(h => (
                      <span key={h} style={{ fontSize:10,fontWeight:600,color:T.lo,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:UI }}>{h}</span>
                    ))}
                  </div>
                  {filtered.map((m,i) => {
                    const sel=isSelected(m.id);
                    return (
                      <button key={m.id} onClick={()=>toggleModel(m)} style={{
                        width:"100%",display:"grid",gridTemplateColumns:"18px 170px 110px 70px 70px 65px 55px",
                        alignItems:"center",padding:"8px 12px",
                        background:sel?"rgba(59,130,246,0.06)":"transparent",
                        borderBottom:i<filtered.length-1?`1px solid ${T.borderS}`:"none",
                        borderLeft:`2px solid ${sel?T.blue:"transparent"}`,
                        cursor:"pointer",textAlign:"left",border:"none",
                      }}
                        onMouseEnter={e=>{ if(!sel) e.currentTarget.style.background=T.elev; }}
                        onMouseLeave={e=>{ if(!sel) e.currentTarget.style.background="transparent"; }}
                      >
                        <div style={{ display:"flex",justifyContent:"center" }}>
                          {sel && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 5L3.5 7.5L9 2" stroke={T.blueTxt} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <div><span style={{ fontSize:12,fontWeight:500,color:T.hi,fontFamily:UI }}>{m.name}</span>{m.oss && <span style={{ marginLeft:5 }}><Badge label="OSS" color={T.mGreen} /></span>}</div>
                        <Chip name={m.provider} />
                        <span style={{ fontFamily:MONO,fontSize:11,color:T.hi }}>${m.cost}</span>
                        <span style={{ fontFamily:MONO,fontSize:11,color:T.hi }}>{m.speed}</span>
                        <span style={{ fontFamily:MONO,fontSize:11,color:T.hi }}>{(m.ctx/1000).toFixed(0)}K</span>
                        <span style={{ fontFamily:MONO,fontSize:11,color:T.mid }}>{m.lmsys}</span>
                      </button>
                    );
                  })}
                </Card>
              </div>
            </div>
          </>
        )}

        {leftTab === "benchmarks" && (
          <>
            {/* Header */}
            <div style={{ padding:"16px 20px 12px",borderBottom:`1px solid ${T.border}` }}>
              <div style={{ display:"flex",alignItems:"center",gap:9,marginBottom:3 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><polygon points="8,1.5 9.75,6 14.5,6 10.75,8.75 12.25,13.5 8,10.75 3.75,13.5 5.25,8.75 1.5,6 6.25,6" fill="#F59E0B"/></svg>
                <span style={{ fontSize:17,fontWeight:700,color:T.hi,fontFamily:UI }}>Benchmark Leaderboards</span>
              </div>
              <div style={{ fontSize:13,color:T.mid,fontFamily:UI }}>Compare models using public evaluations</div>
            </div>
            {/* Benchmark tabs */}
            <div style={{ display:"flex",borderBottom:`1px solid ${T.border}`,overflow:"auto",paddingLeft:4 }}>
              {BENCH_TABS_LIST.map(tab => (
                <button key={tab.key} onClick={()=>setActiveBench(tab.key)} style={{
                  padding:"10px 16px",fontSize:12,fontWeight:600,border:"none",background:"none",cursor:"pointer",fontFamily:UI,whiteSpace:"nowrap",
                  borderBottom:`2px solid ${activeBench===tab.key?T.blue:"transparent"}`,
                  color:activeBench===tab.key?T.blueTxt:T.mid,marginBottom:-1,
                }}>{tab.label}</button>
              ))}
            </div>
            {/* Table header */}
            <div style={{ display:"grid",gridTemplateColumns:"60px 1fr 100px 80px 100px 80px",padding:"9px 20px",borderBottom:`1px solid ${T.border}`,background:T.elev }}>
              {["RANK","MODEL NAME","SCORE","COST","CONTEXT","LATENCY"].map(h => (
                <span key={h} style={{ fontSize:10,fontWeight:700,color:T.lo,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:UI }}>{h}</span>
              ))}
            </div>
            {/* Table rows */}
            <div style={{ flex:1,overflow:"auto" }}>
              {benchLeaderboard.map((m,idx) => {
                const sel=isSelected(m.id);
                const score=m[activeBench];
                const fmt = activeBench==="lmsys"?score?.toFixed(1):score?.toFixed(1);
                return (
                  <div key={m.id} onClick={()=>toggleModel(m)} style={{
                    display:"grid",gridTemplateColumns:"60px 1fr 100px 80px 100px 80px",
                    alignItems:"center",padding:"12px 20px",
                    borderBottom:`1px solid ${T.borderS}`,
                    background:sel?"rgba(59,130,246,0.06)":"transparent",cursor:"pointer",
                  }}
                    onMouseEnter={e=>{ if(!sel) e.currentTarget.style.background=T.elev; }}
                    onMouseLeave={e=>{ if(!sel) e.currentTarget.style.background="transparent"; }}
                  >
                    <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                      {sel
                        ? <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 6.5L5 10L11.5 3" stroke={T.blueTxt} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        : <span style={{ fontFamily:MONO,fontSize:12,color:idx<3?T.hi:T.lo,fontWeight:700 }}>#{idx+1}</span>
                      }
                    </div>
                    <div style={{ overflow:"hidden" }}>
                      <div style={{ fontSize:13,fontWeight:500,color:sel?T.blueTxt:T.hi,fontFamily:UI,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{m.name}</div>
                    </div>
                    <span style={{ fontFamily:MONO,fontSize:13,color:T.hi,fontWeight:700 }}>{fmt}</span>
                    <span style={{ fontFamily:MONO,fontSize:13,color:T.hi }}>${m.cost}</span>
                    <span style={{ fontFamily:MONO,fontSize:13,color:T.hi }}>{(m.ctx/1000).toFixed(0)}K</span>
                    <span style={{ fontFamily:MONO,fontSize:13,color:T.hi }}>{m.speed}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div style={{ width:panelW,background:T.surface,borderLeft:`1px solid ${T.border}`,display:"flex",flexDirection:"column",flexShrink:0,position:"relative" }}>
        <div onMouseDown={()=>setResizing(true)} style={{ position:"absolute",left:0,top:0,bottom:0,width:4,cursor:"col-resize",zIndex:10 }}
          onMouseEnter={e=>e.currentTarget.style.background=T.blue}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"} />
        <div style={{ padding:"14px 16px",borderBottom:`1px solid ${T.border}` }}>
          <span style={{ fontSize:14,fontWeight:600,color:T.hi,fontFamily:UI }}>Selected ({selModels.length})</span>
        </div>
        <div style={{ flex:1,overflow:"auto",padding:12 }}>
          {selModels.length===0 && <div style={{ textAlign:"center",padding:"40px 0",color:T.lo,fontSize:13,fontFamily:UI }}>Select models to evaluate</div>}
          {selModels.map(m => (
            <div key={m.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:T.elev,border:`1px solid ${T.border}`,borderRadius:6,marginBottom:7 }}>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:12,fontWeight:500,color:T.hi,fontFamily:UI,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{m.name}</div>
                <Chip name={m.provider} />
              </div>
              <button onClick={()=>setSelModels(p=>p.filter(x=>x.id!==m.id))} style={{ background:"none",border:"none",cursor:"pointer",color:T.lo,padding:0,fontSize:16 }}>×</button>
            </div>
          ))}
        </div>

        {/* Challenger */}
        <div style={{ padding:"14px 14px 12px",borderTop:`1px solid ${T.border}` }}>
          <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:12 }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <polygon points="7.5,1.5 9.25,5.5 13.5,5.5 10.25,8 11.25,12.5 7.5,10 3.75,12.5 4.75,8 1.5,5.5 5.75,5.5" fill="#F59E0B"/>
            </svg>
            <span style={{ fontSize:14,fontWeight:700,color:T.hi,fontFamily:UI }}>Challenger</span>
          </div>
          {challenger && (
            <div style={{ background:T.elev,border:`1.5px dashed rgba(245,158,11,0.4)`,borderRadius:10,padding:"14px 14px 12px" }}>
              <div style={{ marginBottom:8 }}>
                <div style={{ fontSize:15,fontWeight:700,color:T.hi,fontFamily:UI }}>{challenger.name}</div>
                <div style={{ fontSize:12,color:T.mid,fontFamily:UI,marginTop:2 }}>{challenger.provider}</div>
              </div>
              <div style={{ fontSize:12,color:T.mid,fontFamily:UI,lineHeight:1.5,marginBottom:12 }}>
                Ranks #{CHALLENGERS.indexOf(challenger)+1} on LMSYS Arena but hasn't been widely tested.
              </div>
              <div style={{ marginBottom:14 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                  <span style={{ fontSize:13,color:T.mid,fontFamily:UI }}>LMSYS</span>
                  <span style={{ fontFamily:MONO,fontSize:13,color:T.hi,fontWeight:600 }}>{challenger.lmsys}</span>
                </div>
                <div style={{ display:"flex",justifyContent:"space-between" }}>
                  <span style={{ fontSize:13,color:T.mid,fontFamily:UI }}>MMLU</span>
                  <span style={{ fontFamily:MONO,fontSize:13,color:T.hi,fontWeight:600 }}>{challenger.mmlu}%</span>
                </div>
              </div>
              <button onClick={rotateChallenger} style={{
                width:"100%",padding:"9px 0",borderRadius:8,fontSize:13,fontFamily:UI,cursor:"pointer",
                background:"rgba(245,158,11,0.12)",color:"#F59E0B",
                border:"1px solid rgba(245,158,11,0.3)",fontWeight:500,
                display:"flex",alignItems:"center",justifyContent:"center",gap:8,
              }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11.5 4A5 5 0 1 0 12 6.5M11.5 1.5V4H9" stroke="#F59E0B" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Shuffle
              </button>
            </div>
          )}
        </div>

        <div style={{ padding:"12px 14px",borderTop:`1px solid ${T.border}`,display:"flex",flexDirection:"column",gap:8 }}>
          <Btn onClick={onNext} disabled={selModels.length===0} style={{ width:"100%",padding:"10px 0",fontSize:14 }}>Run Evaluation →</Btn>
          <Btn onClick={onBack} variant="ghost" style={{ width:"100%" }}>← Back</Btn>
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
const MODEL_COLORS = ["#3B82F6","#C4B5FD","#6EE7B7","#FCD34D","#F87171"];

// Rich mock evaluation data (5 rows with per-model rougeL/cost/lat)
const EVAL_DATA = [
  { id:1, input:"What is your baggage allowance for economy class?", golden:"Economy passengers can bring one carry-on bag (up to 22x14x9 inches, 15 lbs) and one personal item. For checked bags, domestic flights allow one bag up to 50 lbs for a fee; many international routes include one free checked bag. Overweight or extra bags will incur additional charges." },
  { id:2, input:"How do I check in for my flight online?", golden:"Online check-in opens 24 hours before departure. Head to our website or app, select 'Check-In,' and enter your confirmation number and last name. From there you can pick your seat, add baggage, and grab your boarding pass — all from your phone!" },
  { id:3, input:"Can I change my flight after booking?", golden:"Yes, flight changes can be made online, through our app, or by calling us. Flexible and business fares usually allow free changes, while basic economy tickets may be more limited. Any fare difference will apply at the time of the change." },
  { id:4, input:"What happens if my flight is cancelled?", golden:"If your flight is cancelled, we'll automatically rebook you on the next available flight and notify you by email or SMS. You can also opt for a full refund to your original payment method. If an overnight stay is needed due to a cancellation on our end, hotel and meal vouchers may be provided." },
  { id:5, input:"How early should I arrive at the airport?", golden:"We recommend arriving at least 2 hours before domestic flights and 3 hours before international flights. This gives you comfortable time for check-in, bag drop, and security. During busy travel periods, a little extra buffer is always a good idea." },
  { id:6, input:"Do you offer special meals on flights?", golden:"Absolutely! We offer vegetarian, vegan, gluten-free, kosher, halal, diabetic-friendly, and child meal options. Just make your request at least 48 hours before departure — you can do this at booking or through 'Manage My Booking' online." },
  { id:7, input:"How do I earn frequent flyer miles?", golden:"You earn miles by flying with us or our partner airlines, using our co-branded credit card, or shopping with partner retailers. Miles post to your account within 72 hours of your flight. The amount earned depends on distance, fare class, and your membership tier." },
  { id:8, input:"Can I bring my pet on the flight?", golden:"Small dogs and cats can travel in the cabin in an approved carrier that fits under the seat, subject to availability and a pet fee. Larger pets travel as checked baggage or cargo. Some breeds may be restricted, so we recommend contacting us at least 48 hours before your flight to confirm arrangements." },
  { id:9, input:"What is your refund policy?", golden:"Fully refundable tickets can be cancelled anytime for a complete refund. Non-refundable tickets may be eligible for travel credit. If we cancel your flight, a full refund is always available regardless of fare type. Refunds are returned to your original payment method within 7–10 business days." },
  { id:10, input:"Is there Wi-Fi available on my flight?", golden:"Wi-Fi is available on most of our domestic and international flights. You can purchase a pass before your trip through our app or website, or onboard. We offer hourly and full-flight plans to suit your needs. Speeds may vary by route and altitude." },
  { id:11, input:"How do I upgrade my seat to business class?", golden:"Upgrades can be requested through our website, app, or at the check-in counter on the day of travel, subject to availability. You can pay with cash, use frequent flyer miles, or place a bid through our upgrade auction. Elite members may also receive complimentary upgrades based on status." },
  { id:12, input:"What ID do I need to board a domestic flight?", golden:"A valid government-issued photo ID is required — such as a REAL ID-compliant driver's license, state ID, or passport. As of May 7, 2025, REAL ID compliance is required for all domestic U.S. flights. Make sure your ID is current before you travel!" },
  { id:13, input:"Can I travel while pregnant?", golden:"Passengers up to 28 weeks pregnant can fly without documentation. From 28 to 36 weeks, a doctor's letter confirming your due date and fitness to fly is required. Travel is generally not advised after 36 weeks (or 32 weeks for multiples). We always recommend checking with your physician before booking." },
  { id:14, input:"How do I request wheelchair assistance?", golden:"Wheelchair assistance is available at no charge and can be requested at booking, through 'Manage My Booking,' or by calling our accessibility support line. Please let us know at least 48 hours in advance so we can have everything ready for you from check-in to deplaning." },
  { id:15, input:"What carry-on items are not allowed on the plane?", golden:"Liquids over 3.4 oz not in a clear quart-sized bag, sharp objects with blades over 4 inches, firearms, flammable liquids, and lithium batteries above 100Wh are not permitted in carry-ons. We recommend checking the TSA prohibited items list before you pack to avoid any surprises at security." },
  { id:16, input:"How do I file a lost baggage claim?", golden:"We're sorry to hear your bag didn't arrive! Please report it at our baggage service desk before leaving the airport. You'll receive a Property Irregularity Report (PIR) and a tracking reference. We'll do our best to locate and deliver your bag within 24–72 hours. Compensation is available per our policy and applicable regulations." },
  { id:17, input:"Can I select my seat in advance?", golden:"Yes! Seat selection is available at booking or anytime through 'Manage My Booking.' Standard seats are free for most fare classes; seats with extra legroom or preferred locations carry a small fee. Basic economy passengers are assigned a seat at check-in at no charge." },
  { id:18, input:"What is the minimum connection time between flights?", golden:"We generally recommend at least 60 minutes for domestic connections and 90–120 minutes for international ones. At larger hub airports, more time is advisable. If your flights are on a single itinerary with us, your connection time is already guaranteed to meet our minimum requirements." },
  { id:19, input:"Do you offer discounts for children or infants?", golden:"Infants under 2 traveling on a lap fly free domestically and at a reduced fare internationally. Children 2 and older need their own seat and ticket. Discounts vary by route and fare type. We also offer an Unaccompanied Minor service for children ages 5–14 traveling solo." },
];

function EvalResults({ models, taskType, onNewEval, embedded }) {
  const [search, setSearch] = useState("");

  const rows = (() => {
    let r = [...EVAL_DATA];
    const s = search.toLowerCase().trim();
    if (s) r = r.filter(row =>
      row.input.toLowerCase().includes(s) || row.golden.toLowerCase().includes(s)
    );
    return r;
  })();

  return (
    <div style={{ display:"flex",flexDirection:"column",fontFamily:UI }}>
      {/* Toolbar */}
      <div style={{ background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"12px 24px",display:"flex",alignItems:"center",gap:12 }}>
        <div style={{ position:"relative",flex:1,maxWidth:320 }}>
          <svg width="13" height="13" viewBox="0 0 13 13" style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:T.lo,pointerEvents:"none" }} fill="none">
            <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M9 9L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search inputs or outputs..."
            style={{ width:"100%",paddingLeft:30,paddingRight:10,paddingTop:8,paddingBottom:8,background:T.elev,border:`1px solid ${T.border}`,borderRadius:8,fontSize:13,color:T.hi,outline:"none",boxSizing:"border-box",fontFamily:UI }} />
        </div>
        <span style={{ fontSize:12,color:T.mid,fontFamily:UI }}>{rows.length} of {EVAL_DATA.length} rows</span>
      </div>

      {/* Table */}
      <div style={{ padding:"16px 24px 32px" }}>
        <div style={{ border:`1px solid ${T.border}`,borderRadius:8,overflow:"hidden" }}>
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:T.elev }}>
                <th style={{ width:40,padding:"10px 12px",textAlign:"left",fontSize:10,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.08em",color:T.lo,borderBottom:`1px solid ${T.border}`,fontFamily:MONO }}>#</th>
                <th style={{ width:"40%",padding:"10px 12px",textAlign:"left",fontSize:10,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.08em",color:T.lo,borderBottom:`1px solid ${T.border}`,fontFamily:MONO }}>Input</th>
                <th style={{ padding:"10px 12px",textAlign:"left",fontSize:10,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.08em",color:T.lo,borderBottom:`1px solid ${T.border}`,fontFamily:MONO }}>Expected Output</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={row.id} style={{ borderBottom:ri<rows.length-1?`1px solid ${T.borderS}`:"none" }}>
                  <td style={{ padding:"14px 12px",verticalAlign:"top" }}>
                    <span style={{ fontFamily:MONO,fontSize:11,color:T.lo }}>{String(row.id).padStart(2,"0")}</span>
                  </td>
                  <td style={{ padding:"14px 12px",verticalAlign:"top" }}>
                    <div style={{ fontSize:14,color:T.hi,lineHeight:1.6 }}>{row.input}</div>
                  </td>
                  <td style={{ padding:"14px 12px",verticalAlign:"top",borderLeft:`1px solid ${T.borderS}` }}>
                    <div style={{ fontSize:13,color:T.mid,lineHeight:1.6 }}>{row.golden}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP 5 — RUN EVALUATION + RESULTS
───────────────────────────────────────────────────────────── */
function Step5({ selModels, challenger, metrics, taskType, onBack }) {
  const [ran, setRan]             = useState(false);
  const [running, setRunning]     = useState(false);
  const [progress, setProgress]   = useState(0);
  const [fileName, setFileName]   = useState(null);
  const [inputMode, setInputMode] = useState("single");
  const [manualInput, setManualInput]   = useState("");
  const [manualGolden, setManualGolden] = useState("");
  const [selectedTaskType, setSelectedTaskType] = useState(taskType || "");
  const [csvColumns, setCsvColumns] = useState([]);
  const [csvRows, setCsvRows]       = useState([]);

  // Mock preview rows from airline dataset (PDF)
  const MOCK_CSV_COLUMNS = ["input", "golden_output"];
  const MOCK_CSV_ROWS = [
    { input: "What is your baggage allowance for economy class?", golden_output: "Economy passengers can bring one carry-on bag (up to 22x14x9 inches, 15 lbs) and one personal item. For checked bags, domestic flights allow one bag up to 50 lbs for a fee; many international routes include one free checked bag." },
    { input: "How do I check in for my flight online?", golden_output: "Online check-in opens 24 hours before departure. Head to our website or app, select 'Check-In,' and enter your confirmation number and last name." },
    { input: "Can I change my flight after booking?", golden_output: "Yes, flight changes can be made online, through our app, or by calling us. Flexible and business fares usually allow free changes, while basic economy tickets may be more limited." },
    { input: "What happens if my flight is cancelled?", golden_output: "If your flight is cancelled, we'll automatically rebook you on the next available flight and notify you by email or SMS. You can also opt for a full refund to your original payment method." },
    { input: "How early should I arrive at the airport?", golden_output: "We recommend arriving at least 2 hours before domestic flights and 3 hours before international flights." },
  ];

  const parseCSV = (text) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return;
    const rawCols = lines[0].split(",").map(c => c.trim().replace(/^"|"$/g, ""));
    const colMap = rawCols.reduce((acc, col) => {
      const key = col.toLowerCase();
      if (key === "input") acc.input = col;
      if (key === "golden_output" || key === "output") acc.output = col;
      return acc;
    }, {});
    const previewCols = ["input", "golden_output"];
    const rows = lines.slice(1, 6).map(line => {
      const vals = [];
      let cur = "", inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQ = !inQ; }
        else if (ch === "," && !inQ) { vals.push(cur.trim()); cur = ""; }
        else { cur += ch; }
      }
      vals.push(cur.trim());
      const source = {};
      rawCols.forEach((c, i) => { source[c] = vals[i] ?? ""; });
      return {
        input: source[colMap.input] ?? "",
        golden_output: source[colMap.output] ?? "",
      };
    });
    setCsvColumns(previewCols);
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

  const testModels = selModels.length > 0 ? selModels.slice(0,4) : ALL_MODELS.slice(0,3);
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
        <p style={{ fontSize:14,color:T.mid,margin:0,fontFamily:UI }}>Upload your test data and run the evaluation</p>
      </div>

      {/* Evaluation Configuration */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
          <div>
            <div style={{ fontSize:11,fontWeight:700,color:T.lo,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:UI,marginBottom:10 }}>Task Type</div>
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
            <div style={{ fontSize:11,fontWeight:700,color:T.lo,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:UI,marginBottom:10 }}>Evaluation Metrics ({enabledMetrics.length})</div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:8 }}>
              {shownMetrics.map(m => <Badge key={m.id} label={m.name} color={m.color||T.mBlue} />)}
              {extraCount > 0 && <span style={{ fontSize:12,color:T.mid,fontFamily:UI,alignSelf:"center" }}>+{extraCount} more</span>}
            </div>
            <button onClick={()=>{}} style={{ background:"none",border:"none",cursor:"pointer",color:T.blueTxt,fontSize:13,fontFamily:UI,padding:0 }}>Edit metrics →</button>
          </div>
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
            <Btn onClick={run} disabled={running || !manualInput.trim()}>▶ Run Evaluation</Btn>
          </>
        )}

        {inputMode === "csv" && (
          <div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr auto",gap:12,alignItems:"end",marginBottom: (fileName || true) ? 16 : 0 }}>
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
              <Btn onClick={run} disabled={running}>Run Evaluation</Btn>
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
                    <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols.length}, 1fr)`, background:T.elev, borderBottom:`1px solid ${T.border}` }}>
                      {cols.map(col => (
                        <div key={col} style={{ padding:"8px 12px",fontSize:11,fontWeight:700,color:T.lo,fontFamily:UI,letterSpacing:"0.07em",textTransform:"uppercase",borderRight:`1px solid ${T.border}` }}>
                          {col}
                        </div>
                      ))}
                    </div>
                    {/* Rows */}
                    {rows.map((row, ri) => (
                      <div key={ri} style={{ display:"grid", gridTemplateColumns:`repeat(${cols.length}, 1fr)`, borderBottom: ri < rows.length-1 ? `1px solid ${T.borderS}` : "none", background: ri%2===0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                        {cols.map(col => (
                          <div key={col} style={{ padding:"9px 12px",fontSize:12,color:T.mid,fontFamily:UI,lineHeight:1.5,borderRight:`1px solid ${T.borderS}`,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" }}>
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
              <span>Processing {EVAL_DATA.length} rows…</span>
              <span style={{ fontFamily:MONO }}>{Math.min(100,Math.round(progress))}%</span>
            </div>
            <div style={{ height:4,background:T.elev,borderRadius:2 }}>
              <div style={{ height:"100%",background:`linear-gradient(90deg,${T.blue},#6EE7B7)`,borderRadius:2,width:`${Math.min(100,progress)}%`,transition:"width .2s" }} />
            </div>
          </div>
        )}
      </Card>

      <div style={{ paddingTop:20,marginTop:4,borderTop:`1px solid ${T.border}` }}>
        <Btn onClick={onBack} variant="ghost">← Back to Model Selection</Btn>
      </div>
    </div>

      {/* Dataset Preview — full-width below the run section */}
      {ran && (
        <div style={{ borderTop:`1px solid ${T.border}`, marginTop:8 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 28px 0" }}>
            <div>
              <h2 style={{ fontSize:20,fontWeight:700,color:T.hi,letterSpacing:"-0.2px",margin:"0 0 4px",fontFamily:UI }}>Dataset Preview</h2>
              <p style={{ fontSize:13,color:T.mid,margin:0,fontFamily:UI }}>{EVAL_DATA.length} input–output pairs</p>
            </div>
            <Btn onClick={()=>setRan(false)} variant="ghost" small>Run Again</Btn>
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
export default function App() {
  const [step,       setStep]       = useState(1);
  const [taskType,   setTaskType]   = useState(null);
  const [metrics,    setMetrics]    = useState(INIT_METRICS);
  const [criteria,   setCriteria]   = useState({ priorities:{ high:[],medium:["cost","speed","contextWindow"],low:[] }, openSourceOnly:false, maxCostCap:"" });
  const [selModels,  setSelModels]  = useState([]);
  const [challenger, setChallenger] = useState(CHALLENGERS[0]);

  return (
    <div style={{ display:"flex", height:"100vh", background:T.base, overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:${T.base}}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:10px}
        button,input,textarea,select{font-family:'Inter',-apple-system,sans-serif}
        ::placeholder{color:${T.lo}}
        input[type=range]{accent-color:${T.blue}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.25}}
      `}</style>

      <Sidebar step={step} nav={setStep} taskType={taskType} selModels={selModels} />

      <main style={{ flex:1, overflow:"auto", display:"flex", flexDirection:"column" }}>
        {step===1 && <Step1 taskType={taskType} setTaskType={setTaskType} onNext={()=>setStep(2)} />}
        {step===2 && <Step2 metrics={metrics} setMetrics={setMetrics} onNext={()=>setStep(3)} onBack={()=>setStep(1)} />}
        {step===3 && <Step3 criteria={criteria} setCriteria={setCriteria} onNext={()=>setStep(4)} onBack={()=>setStep(2)} />}
        {step===4 && <Step4 criteria={criteria} selModels={selModels} setSelModels={setSelModels} challenger={challenger} setChallenger={setChallenger} onNext={()=>setStep(5)} onBack={()=>setStep(3)} />}
        {step===5 && <Step5 selModels={selModels} challenger={challenger} metrics={metrics} taskType={taskType} onBack={()=>setStep(4)} />}
      </main>
    </div>
  );
}
