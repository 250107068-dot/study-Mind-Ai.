import { useState, useRef } from "react";

const LANGUAGES = {
  en: { label: "🇬🇧 English", code: "en" },
  kz: { label: "🇰🇿 Қазақша", code: "kz" },
  ru: { label: "🇷🇺 Русский", code: "ru" },
};

const UI_TEXT = {
  en: {
    title: "StudyAI Turbo",
    subtitle: "Transform any topic into a full learning experience",
    placeholder: "Enter a topic (e.g. Photosynthesis, Newton's Laws, World War 2...)",
    btn: "Generate Study Guide",
    loading: "Generating your study guide...",
    langLabel: "Explanation language:",
    topicLabel: "Topic to study:",
    or: "OR",
    uploadBtn: "Upload PDF",
    tabs: ["Summary", "Explanation", "Concepts", "Steps", "Quiz", "Tips", "YouTube"],
  },
  kz: {
    title: "StudyAI Turbo",
    subtitle: "Кез келген тақырыпты толық оқу тәжірибесіне айналдырыңыз",
    placeholder: "Тақырып енгізіңіз (мыс. Фотосинтез, Ньютон заңдары...)",
    btn: "Оқу нұсқаулығын жасау",
    loading: "Оқу нұсқаулығы жасалуда...",
    langLabel: "Түсіндіру тілі:",
    topicLabel: "Оқу тақырыбы:",
    or: "НЕМЕСЕ",
    uploadBtn: "PDF жүктеу",
    tabs: ["Қысқаша", "Түсіндірме", "Тұжырымдар", "Қадамдар", "Тест", "Кеңестер", "YouTube"],
  },
  ru: {
    title: "StudyAI Turbo",
    subtitle: "Превратите любую тему в полный учебный опыт",
    placeholder: "Введите тему (напр. Фотосинтез, Законы Ньютона...)",
    btn: "Создать учебное руководство",
    loading: "Создание учебного руководства...",
    langLabel: "Язык объяснения:",
    topicLabel: "Тема для изучения:",
    or: "ИЛИ",
    uploadBtn: "Загрузить PDF",
    tabs: ["Резюме", "Объяснение", "Концепции", "Шаги", "Тест", "Советы", "YouTube"],
  },
};

const SECTION_ICONS = ["📋", "💡", "🔑", "📚", "❓", "🧠", "▶️"];

function buildPrompt(topic, lang) {
  const langNames = { en: "English", kz: "Kazakh", ru: "Russian" };
  const ln = langNames[lang] || "English";

  return `You are StudyAI Turbo, an expert AI tutor. A student wants to learn about: "${topic}"

Respond ONLY in ${ln} language throughout ALL sections.

Return a JSON object with EXACTLY these keys (no markdown, no backticks, raw JSON only):

{
  "summary": ["bullet 1", "bullet 2", "bullet 3", "bullet 4", "bullet 5"],
  "explanation": "A simple, beginner-friendly explanation with real-life examples. 3-4 paragraphs.",
  "concepts": [
    {"name": "Concept name", "description": "Brief explanation"},
    {"name": "Concept name", "description": "Brief explanation"}
  ],
  "steps": [
    {"step": 1, "title": "Step title", "content": "Detailed explanation of this step"},
    {"step": 2, "title": "Step title", "content": "Detailed explanation of this step"}
  ],
  "quiz": [
    {"q": "Question text?", "type": "mcq", "options": ["A", "B", "C", "D"], "answer": "A"},
    {"q": "Question text?", "type": "short", "answer": "Short answer here"}
  ],
  "tips": ["Tip 1 with memory technique", "Tip 2 with study method", "Tip 3 with trick"],
  "youtube": [
    {"title": "YouTube search query 1", "reason": "Why this helps"},
    {"title": "YouTube search query 2", "reason": "Why this helps"},
    {"title": "YouTube search query 3", "reason": "Why this helps"}
  ]
}

Rules:
- ALL text must be in ${ln} ONLY
- quiz must have at least 5 questions (mix of mcq and short)
- concepts must have at least 5 items
- steps must have at least 4 steps
- Return ONLY valid JSON, absolutely no extra text`;
}

async function callClaude(topic, lang) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{ role: "user", content: buildPrompt(topic, lang) }],
    }),
  });
  const data = await response.json();
  const raw = data.content.map((b) => b.text || "").join("");
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ── Components ────────────────────────────────────────────────

function TabBar({ tabs, icons, active, onChange }) {
  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: "6px",
      marginBottom: "24px",
    }}>
      {tabs.map((t, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          style={{
            padding: "8px 16px",
            borderRadius: "20px",
            border: active === i ? "none" : "1.5px solid #2d2d2d",
            background: active === i
              ? "linear-gradient(135deg, #00c6ff, #0072ff)"
              : "transparent",
            color: active === i ? "#fff" : "#aaa",
            fontFamily: "'Space Mono', monospace",
            fontSize: "12px",
            cursor: "pointer",
            transition: "all 0.2s",
            fontWeight: active === i ? "700" : "400",
          }}
        >
          {icons[i]} {t}
        </button>
      ))}
    </div>
  );
}

function SummaryTab({ data }) {
  return (
    <div>
      <h3 style={sectionTitle}>📋 Summary</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {data.map((item, i) => (
          <li key={i} style={{
            display: "flex", alignItems: "flex-start", gap: "12px",
            marginBottom: "12px", padding: "14px 16px",
            background: "#111", borderRadius: "10px",
            borderLeft: "3px solid #0072ff",
          }}>
            <span style={{ color: "#0072ff", fontWeight: "700", minWidth: "20px" }}>{i + 1}.</span>
            <span style={{ color: "#ddd", lineHeight: "1.6" }}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExplanationTab({ data }) {
  return (
    <div>
      <h3 style={sectionTitle}>💡 Simple Explanation</h3>
      {data.split("\n").filter(Boolean).map((p, i) => (
        <p key={i} style={{
          color: "#ccc", lineHeight: "1.8", marginBottom: "16px",
          padding: "16px", background: "#111", borderRadius: "10px",
        }}>{p}</p>
      ))}
    </div>
  );
}

function ConceptsTab({ data }) {
  return (
    <div>
      <h3 style={sectionTitle}>🔑 Key Concepts</h3>
      <div style={{ display: "grid", gap: "12px" }}>
        {data.map((c, i) => (
          <div key={i} style={{
            padding: "16px", background: "#111", borderRadius: "10px",
            border: "1px solid #222",
          }}>
            <div style={{
              color: "#00c6ff", fontFamily: "'Space Mono', monospace",
              fontSize: "13px", fontWeight: "700", marginBottom: "6px",
            }}>
              {i + 1}. {c.name}
            </div>
            <div style={{ color: "#bbb", lineHeight: "1.6", fontSize: "14px" }}>{c.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepsTab({ data }) {
  return (
    <div>
      <h3 style={sectionTitle}>📚 Step-by-Step</h3>
      {data.map((s, i) => (
        <div key={i} style={{
          display: "flex", gap: "16px", marginBottom: "16px",
          padding: "16px", background: "#111", borderRadius: "10px",
        }}>
          <div style={{
            minWidth: "36px", height: "36px", borderRadius: "50%",
            background: "linear-gradient(135deg, #00c6ff, #0072ff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: "700", fontSize: "14px",
            fontFamily: "'Space Mono', monospace",
          }}>{s.step}</div>
          <div>
            <div style={{ color: "#fff", fontWeight: "700", marginBottom: "6px" }}>{s.title}</div>
            <div style={{ color: "#bbb", lineHeight: "1.7", fontSize: "14px" }}>{s.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuizTab({ data }) {
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});

  return (
    <div>
      <h3 style={sectionTitle}>❓ Quiz</h3>
      {data.map((q, i) => (
        <div key={i} style={{
          marginBottom: "20px", padding: "18px",
          background: "#111", borderRadius: "12px",
          border: "1px solid #222",
        }}>
          <div style={{ color: "#fff", fontWeight: "600", marginBottom: "12px" }}>
            Q{i + 1}: {q.q}
          </div>
          {q.type === "mcq" && q.options && (
            <div style={{ display: "grid", gap: "8px", marginBottom: "12px" }}>
              {q.options.map((opt, j) => {
                const selected = answers[i] === opt;
                const isCorrect = revealed[i] && opt === q.answer;
                const isWrong = revealed[i] && selected && opt !== q.answer;
                return (
                  <button key={j} onClick={() => setAnswers({ ...answers, [i]: opt })} style={{
                    padding: "10px 14px", textAlign: "left", borderRadius: "8px", cursor: "pointer",
                    border: isCorrect ? "2px solid #00ff88"
                      : isWrong ? "2px solid #ff4444"
                        : selected ? "2px solid #0072ff"
                          : "1.5px solid #333",
                    background: isCorrect ? "#00ff8820"
                      : isWrong ? "#ff444420"
                        : selected ? "#0072ff20"
                          : "#1a1a1a",
                    color: "#ccc", fontSize: "14px",
                  }}>{opt}</button>
                );
              })}
            </div>
          )}
          {q.type === "short" && (
            <div style={{
              padding: "12px", background: "#0a0a0a", borderRadius: "8px",
              color: "#666", fontSize: "13px", fontStyle: "italic", marginBottom: "10px",
            }}>
              {revealed[i] ? `✅ ${q.answer}` : "Click 'Reveal' to see the answer"}
            </div>
          )}
          <button onClick={() => setRevealed({ ...revealed, [i]: true })} style={{
            padding: "7px 16px", borderRadius: "20px", cursor: "pointer",
            border: "none", background: "#0072ff", color: "#fff",
            fontSize: "12px", fontFamily: "'Space Mono', monospace",
          }}>Reveal Answer</button>
          {revealed[i] && (
            <span style={{
              marginLeft: "12px", color: "#00ff88",
              fontSize: "13px", fontWeight: "600",
            }}>✅ {q.answer}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function TipsTab({ data }) {
  const colors = ["#ff6b6b", "#ffd93d", "#6bcb77"];
  return (
    <div>
      <h3 style={sectionTitle}>🧠 Study Tips</h3>
      {data.map((tip, i) => (
        <div key={i} style={{
          display: "flex", gap: "16px", alignItems: "flex-start",
          marginBottom: "14px", padding: "16px",
          background: "#111", borderRadius: "10px",
          borderLeft: `3px solid ${colors[i % 3]}`,
        }}>
          <span style={{ fontSize: "22px" }}>
            {["💡", "🎯", "🔥"][i % 3]}
          </span>
          <span style={{ color: "#ccc", lineHeight: "1.7", fontSize: "14px" }}>{tip}</span>
        </div>
      ))}
    </div>
  );
}

function YouTubeTab({ data }) {
  return (
    <div>
      <h3 style={sectionTitle}>▶️ YouTube Suggestions</h3>
      {data.map((v, i) => (
        <a
          key={i}
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(v.title)}`}
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: "none" }}
        >
          <div style={{
            display: "flex", gap: "16px", alignItems: "center",
            marginBottom: "12px", padding: "16px",
            background: "#111", borderRadius: "10px",
            border: "1px solid #222",
            transition: "border-color 0.2s", cursor: "pointer",
          }}
            onMouseOver={e => e.currentTarget.style.borderColor = "#ff0000"}
            onMouseOut={e => e.currentTarget.style.borderColor = "#222"}
          >
            <div style={{
              width: "44px", height: "44px", borderRadius: "10px",
              background: "#ff0000", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "20px", flexShrink: 0,
            }}>▶</div>
            <div>
              <div style={{ color: "#fff", fontWeight: "600", marginBottom: "4px" }}>{v.title}</div>
              <div style={{ color: "#666", fontSize: "13px" }}>{v.reason}</div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

const sectionTitle = {
  color: "#fff",
  fontFamily: "'Space Mono', monospace",
  fontSize: "16px",
  fontWeight: "700",
  marginBottom: "16px",
  paddingBottom: "10px",
  borderBottom: "1px solid #222",
};

// ── Main App ──────────────────────────────────────────────────

export default function App() {
  const [lang, setLang] = useState("en");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const fileRef = useRef();

  const ui = UI_TEXT[lang];

  const handleGenerate = async (topicOverride) => {
    const t = topicOverride || topic;
    if (!t.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setActiveTab(0);
    try {
      const data = await callClaude(t.trim(), lang);
      setResult(data);
    } catch (e) {
      setError("Failed to generate. Check API key or try again.");
    }
    setLoading(false);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const name = file.name.replace(/\.pdf$/i, "").replace(/[_-]/g, " ");
    setTopic(name);
    handleGenerate(name);
  };

  const TABS = ui.tabs;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      fontFamily: "'DM Sans', sans-serif",
      color: "#fff",
      padding: "0",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0d0d1a 0%, #0a0a14 100%)",
        borderBottom: "1px solid #1a1a2e",
        padding: "24px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "16px",
      }}>
        <div>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "22px", fontWeight: "700",
            background: "linear-gradient(135deg, #00c6ff, #0072ff)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            🎓 {ui.title}
          </div>
          <div style={{ color: "#555", fontSize: "13px", marginTop: "4px" }}>{ui.subtitle}</div>
        </div>

        {/* Language switcher */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ color: "#555", fontSize: "12px", fontFamily: "'Space Mono', monospace" }}>
            {ui.langLabel}
          </span>
          {Object.values(LANGUAGES).map((l) => (
            <button key={l.code} onClick={() => setLang(l.code)} style={{
              padding: "6px 14px", borderRadius: "20px", cursor: "pointer",
              border: lang === l.code ? "none" : "1.5px solid #2a2a2a",
              background: lang === l.code
                ? "linear-gradient(135deg, #00c6ff, #0072ff)"
                : "#111",
              color: lang === l.code ? "#fff" : "#777",
              fontSize: "12px", fontFamily: "'Space Mono', monospace",
              transition: "all 0.2s",
            }}>{l.label}</button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div style={{
        maxWidth: "760px", margin: "40px auto", padding: "0 24px",
      }}>
        <div style={{
          background: "#111", borderRadius: "16px",
          border: "1px solid #1e1e1e", padding: "28px",
        }}>
          <div style={{ color: "#888", fontSize: "12px", fontFamily: "'Space Mono', monospace", marginBottom: "10px" }}>
            {ui.topicLabel}
          </div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder={ui.placeholder}
              style={{
                flex: 1, padding: "14px 18px",
                background: "#0a0a0a", border: "1.5px solid #222",
                borderRadius: "10px", color: "#fff", fontSize: "14px",
                outline: "none", fontFamily: "'DM Sans', sans-serif",
              }}
            />
            <button
              onClick={() => handleGenerate()}
              disabled={loading || !topic.trim()}
              style={{
                padding: "14px 24px", borderRadius: "10px", border: "none",
                background: loading || !topic.trim()
                  ? "#1a1a1a"
                  : "linear-gradient(135deg, #00c6ff, #0072ff)",
                color: loading || !topic.trim() ? "#444" : "#fff",
                fontFamily: "'Space Mono', monospace",
                fontSize: "13px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer",
                whiteSpace: "nowrap", transition: "all 0.2s",
              }}
            >
              {loading ? "..." : ui.btn}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ flex: 1, height: "1px", background: "#1e1e1e" }} />
            <span style={{ color: "#444", fontSize: "12px", fontFamily: "'Space Mono', monospace" }}>{ui.or}</span>
            <div style={{ flex: 1, height: "1px", background: "#1e1e1e" }} />
          </div>

          <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={handleFile} />
          <button onClick={() => fileRef.current.click()} style={{
            width: "100%", padding: "13px",
            border: "1.5px dashed #2a2a2a", borderRadius: "10px",
            background: "transparent", color: "#666",
            fontFamily: "'Space Mono', monospace", fontSize: "13px",
            cursor: "pointer", transition: "all 0.2s",
          }}
            onMouseOver={e => { e.currentTarget.style.borderColor = "#0072ff"; e.currentTarget.style.color = "#0072ff"; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#666"; }}
          >
            📄 {ui.uploadBtn}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{
            textAlign: "center", padding: "60px 0",
          }}>
            <div style={{
              width: "48px", height: "48px", margin: "0 auto 20px",
              border: "3px solid #1a1a1a",
              borderTop: "3px solid #0072ff",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <div style={{ color: "#555", fontFamily: "'Space Mono', monospace", fontSize: "13px" }}>
              {ui.loading}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginTop: "20px", padding: "16px",
            background: "#ff444415", border: "1px solid #ff4444",
            borderRadius: "10px", color: "#ff4444", fontSize: "14px",
          }}>⚠️ {error}</div>
        )}

        {/* Results */}
        {result && (
          <div style={{ marginTop: "32px" }}>
            <TabBar tabs={TABS} icons={SECTION_ICONS} active={activeTab} onChange={setActiveTab} />

            <div style={{
              background: "#111", borderRadius: "14px",
              border: "1px solid #1e1e1e", padding: "24px",
            }}>
              {activeTab === 0 && <SummaryTab data={result.summary || []} />}
              {activeTab === 1 && <ExplanationTab data={result.explanation || ""} />}
              {activeTab === 2 && <ConceptsTab data={result.concepts || []} />}
              {activeTab === 3 && <StepsTab data={result.steps || []} />}
              {activeTab === 4 && <QuizTab data={result.quiz || []} />}
              {activeTab === 5 && <TipsTab data={result.tips || []} />}
              {activeTab === 6 && <YouTubeTab data={result.youtube || []} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
