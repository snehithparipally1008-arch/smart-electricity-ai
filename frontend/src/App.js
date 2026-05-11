import { useState, useEffect, useRef } from "react";

const CITIES = ["Mumbai","Delhi","Bangalore","Hyderabad","Chennai","Kolkata","Pune","Ahmedabad","Jaipur","Lucknow","Surat","Nagpur","Bhopal","Indore","Vadodara","Visakhapatnam","Coimbatore","Patna","Ranchi","Chandigarh"];

/* ═══════════════════════════════════════════════
   NEBULA PARTICLE CANVAS — deep space background
═══════════════════════════════════════════════ */
function NebulaCanvas({ style }) {
  const ref = useRef(null);
  const raf = useRef(null);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    let W = (c.width = window.innerWidth);
    let H = (c.height = window.innerHeight);
    const onResize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; initStars(); };
    window.addEventListener("resize", onResize);

    let stars = [];
    const initStars = () => {
      stars = Array.from({ length: 280 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.pow(Math.random(), 3) * 2.4 + 0.3,
        a: Math.random() * 0.9 + 0.1,
        twinkleSpeed: 0.008 + Math.random() * 0.018,
        twinklePhase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.85 ? "255,200,120" : Math.random() > 0.7 ? "180,200,255" : "255,255,255",
      }));
    };
    initStars();

    const nebulae = [
      { x: W * 0.15, y: H * 0.25, rx: 340, ry: 220, hue: "0,120,255", a: 0.045, vx: 0.06, vy: 0.04 },
      { x: W * 0.78, y: H * 0.65, rx: 280, ry: 180, hue: "0,200,140", a: 0.04, vx: -0.05, vy: 0.035 },
      { x: W * 0.5, y: H * 0.5, rx: 400, ry: 300, hue: "80,40,200", a: 0.03, vx: 0.03, vy: -0.04 },
      { x: W * 0.85, y: H * 0.15, rx: 200, ry: 140, hue: "0,180,255", a: 0.035, vx: -0.04, vy: 0.05 },
    ];

    const makeShooter = () => ({
      x: Math.random() * W * 0.7, y: Math.random() * H * 0.4,
      len: 120 + Math.random() * 180, speed: 8 + Math.random() * 12,
      angle: Math.PI / 5 + (Math.random() - 0.5) * 0.3,
      progress: 0, alive: true, delay: Math.random() * 400,
    });
    let shooters = [makeShooter(), makeShooter()];
    let shooterTimer = 0;

    const dust = Array.from({ length: 90 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 0.6 + Math.random() * 1.4,
      vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
      a: 0.2 + Math.random() * 0.4,
      hue: Math.random() > 0.5 ? "99,210,255" : "0,220,160",
    }));

    const hexLines = Array.from({ length: 12 }, (_, i) => ({
      y: (H / 13) * (i + 1), offset: Math.random() * Math.PI * 2,
      speed: 0.004 + Math.random() * 0.004, amp: 12 + Math.random() * 18,
      freq: 0.007 + Math.random() * 0.005, a: 0.025 + Math.random() * 0.03,
    }));

    function draw() {
      // solid deep-space fill — no transparency so no white bleed-through
      ctx.fillStyle = "#02081400";
      ctx.fillRect(0, 0, W, H);
      // Re-draw opaque background each frame
      ctx.fillStyle = "rgb(2,8,20)";
      ctx.fillRect(0, 0, W, H);

      nebulae.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < -n.rx) n.x = W + n.rx; if (n.x > W + n.rx) n.x = -n.rx;
        if (n.y < -n.ry) n.y = H + n.ry; if (n.y > H + n.ry) n.y = -n.ry;
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.rx);
        g.addColorStop(0, `rgba(${n.hue},${n.a})`);
        g.addColorStop(0.45, `rgba(${n.hue},${n.a * 0.4})`);
        g.addColorStop(1, `rgba(${n.hue},0)`);
        ctx.save(); ctx.scale(1, n.ry / n.rx);
        ctx.beginPath(); ctx.arc(n.x, n.y * (n.rx / n.ry), n.rx, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill(); ctx.restore();
      });

      hexLines.forEach(l => {
        l.offset += l.speed;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
          const y = l.y + Math.sin(x * l.freq + l.offset) * l.amp;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(99,210,255,${l.a})`; ctx.lineWidth = 0.8; ctx.stroke();
      });

      stars.forEach(s => {
        s.twinklePhase += s.twinkleSpeed;
        const pulse = 0.5 + 0.5 * Math.sin(s.twinklePhase);
        const alpha = s.a * (0.4 + 0.6 * pulse);
        if (s.r > 1.4) {
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3.5);
          g.addColorStop(0, `rgba(${s.color},${alpha})`);
          g.addColorStop(1, `rgba(${s.color},0)`);
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = g; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color},${Math.min(alpha + 0.2, 1)})`;
        ctx.shadowBlur = s.r > 1.4 ? 8 : 0;
        ctx.shadowColor = `rgba(${s.color},0.8)`;
        ctx.fill(); ctx.shadowBlur = 0;
      });

      dust.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = W; if (d.x > W) d.x = 0;
        if (d.y < 0) d.y = H; if (d.y > H) d.y = 0;
        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 4);
        g.addColorStop(0, `rgba(${d.hue},${d.a})`);
        g.addColorStop(1, `rgba(${d.hue},0)`);
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r * 4, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      });

      shooterTimer++;
      if (shooterTimer > 240) { shooterTimer = 0; shooters.push(makeShooter()); if (shooters.length > 5) shooters.shift(); }
      shooters.forEach(s => {
        if (s.delay > 0) { s.delay--; return; }
        s.progress += s.speed;
        const px = s.x + Math.cos(s.angle) * s.progress;
        const py = s.y + Math.sin(s.angle) * s.progress;
        const trail = Math.min(s.progress, s.len);
        const gx = ctx.createLinearGradient(px - Math.cos(s.angle) * trail, py - Math.sin(s.angle) * trail, px, py);
        gx.addColorStop(0, "rgba(255,255,255,0)"); gx.addColorStop(1, "rgba(255,255,255,0.9)");
        ctx.beginPath();
        ctx.moveTo(px - Math.cos(s.angle) * trail, py - Math.sin(s.angle) * trail);
        ctx.lineTo(px, py);
        ctx.strokeStyle = gx; ctx.lineWidth = 1.5; ctx.stroke();
        if (px > W + 100 || py > H + 100) s.alive = false;
      });
      shooters = shooters.filter(s => s.alive !== false);

      raf.current = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", onResize); };
  }, []);

  return <canvas ref={ref} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", display: "block", ...style }} />;
}

/* ═══════════════════════════════════════════════
   SHARED HEADER
═══════════════════════════════════════════════ */
function Header({ username, onLogout }) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 20, height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2rem", background: "rgba(2,8,20,0.92)", backdropFilter: "blur(26px)", borderBottom: "1px solid rgba(99,210,255,0.14)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 24, filter: "drop-shadow(0 0 16px rgba(99,210,255,1))" }}>⚡</span>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: "0.04em", fontFamily: "'Georgia',serif" }}>Smart Electricity Predictor</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Welcome, <span style={{ color: "#63d4ff", fontWeight: 700 }}>{username}</span></span>
        <button onClick={onLogout} style={{ background: "rgba(99,210,255,0.07)", border: "1px solid rgba(99,210,255,0.22)", color: "rgba(255,255,255,0.55)", padding: "7px 18px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>Logout</button>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════
   LANDING PAGE
═══════════════════════════════════════════════ */
function LandingPage({ onLogin }) {
  const [phase, setPhase] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1300),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setPhase(4), 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const doLogin = () => {
    setLogging(true); setLoginError("");
    setTimeout(() => {
      if (username.trim() && password.trim()) onLogin(username);
      else { setLoginError("Please enter your credentials."); setLogging(false); }
    }, 1200);
  };

  const letters = "SMART ELECTRICITY PREDICTOR".split("");

  return (
    <div style={{ minHeight: "100vh", background: "rgb(2,8,20)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI',sans-serif" }}>
      <NebulaCanvas />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 1000, padding: "0 2rem", width: "100%" }}>

        <div style={{ fontSize: 82, marginBottom: "1.4rem", opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? "scale(1)" : "scale(0.05)", transition: "all 0.8s cubic-bezier(0.175,0.885,0.32,1.275)", filter: "drop-shadow(0 0 38px rgba(99,210,255,1)) drop-shadow(0 0 80px rgba(0,200,255,0.5))" }}>⚡</div>

        <div style={{ marginBottom: "1.1rem", textAlign: "center" }}>
          {[["SMART ELECTRICITY", 0], ["PREDICTOR", 18]].map(([word, startIdx]) => (
            <div key={word} style={{ display: "flex", justifyContent: "center", flexWrap: "nowrap" }}>
              {word.split("").map((ch, i) => (
                <span key={i} style={{
                  display: "inline-block",
                  fontSize: word === "PREDICTOR" ? "clamp(2.6rem,6.5vw,6rem)" : "clamp(1.8rem,4.2vw,4rem)",
                  fontFamily: "'Georgia',serif", fontWeight: 700,
                  color: ch === " " ? "transparent" : "#ffffff",
                  letterSpacing: ch === " " ? "0.25em" : "0.03em",
                  opacity: phase >= 1 ? 1 : 0,
                  transform: phase >= 1 ? "translateY(0) rotateX(0deg)" : "translateY(60px) rotateX(-90deg)",
                  transition: `opacity 0.55s ease ${0.042 * (startIdx + i)}s, transform 0.7s cubic-bezier(0.23,1,0.32,1) ${0.042 * (startIdx + i)}s`,
                  textShadow: phase >= 1 ? "0 0 38px rgba(99,210,255,0.75), 0 0 90px rgba(99,210,255,0.25)" : "none",
                  lineHeight: 1.1,
                }}>{ch === " " ? "\u00A0" : ch}</span>
              ))}
            </div>
          ))}
        </div>

        <div style={{ height: 2, background: "linear-gradient(90deg,transparent,#63d4ff 20%,#00ffb0 50%,#63d4ff 80%,transparent)", width: phase >= 2 ? "68%" : "0%", margin: "0 auto 2rem", transition: "width 1.2s ease 0.1s", boxShadow: "0 0 22px rgba(99,210,255,0.75), 0 0 45px rgba(99,210,255,0.3)" }} />

        <p style={{ fontFamily: "'Georgia',serif", fontStyle: "italic", fontSize: "clamp(1.1rem,2.4vw,1.48rem)", color: "#63d4ff", letterSpacing: "0.16em", textTransform: "uppercase", opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease", marginBottom: "1.4rem" }}>
          AI-Powered Household Energy Intelligence
        </p>

        <div style={{ opacity: phase >= 3 ? 1 : 0, transform: phase >= 3 ? "translateY(0)" : "translateY(22px)", transition: "all 0.9s ease", marginBottom: "3.2rem" }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "clamp(1rem,2.2vw,1.22rem)", lineHeight: 1.95, margin: "0 auto", maxWidth: 640 }}>
            Harness machine learning to forecast your next electricity bill — before it arrives. Enter your appliances, city, and meter reading.
          </p>
        </div>

        <div style={{ opacity: phase >= 4 ? 1 : 0, transform: phase >= 4 ? "translateY(0) scale(1)" : "translateY(50px) scale(0.93)", transition: "all 1s cubic-bezier(0.23,1,0.32,1)", background: "rgba(8,22,42,0.95)", border: "1px solid rgba(99,210,255,0.28)", borderRadius: 26, padding: "3.2rem 3.8rem", maxWidth: 500, margin: "0 auto", backdropFilter: "blur(32px)", boxShadow: "0 0 100px rgba(0,0,0,0.7), 0 0 50px rgba(99,210,255,0.07), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "2.4rem", fontFamily: "'Georgia',serif" }}>⚡ Access Portal</p>
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
            style={{ width: "100%", padding: "19px 22px", marginBottom: 18, background: "rgba(5,16,32,0.95)", border: "1px solid rgba(99,210,255,0.2)", borderRadius: 13, color: "#fff", fontSize: 19, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()}
            style={{ width: "100%", padding: "19px 22px", marginBottom: 26, background: "rgba(5,16,32,0.95)", border: "1px solid rgba(99,210,255,0.2)", borderRadius: 13, color: "#fff", fontSize: 19, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
          {loginError && <p style={{ color: "#ff7070", fontSize: 15, marginBottom: 16, textAlign: "left" }}>{loginError}</p>}
          <button onClick={doLogin} disabled={logging}
            style={{ width: "100%", padding: "20px", background: logging ? "rgba(99,210,255,0.2)" : "linear-gradient(135deg,#0090d0 0%,#00c9a0 100%)", border: "none", borderRadius: 13, color: "#fff", fontSize: 20, fontWeight: 700, cursor: logging ? "not-allowed" : "pointer", letterSpacing: "0.07em", fontFamily: "inherit", transition: "all 0.3s", boxShadow: logging ? "none" : "0 6px 38px rgba(0,144,208,0.52)" }}>
            {logging ? "Authenticating…" : "Enter Dashboard →"}
          </button>
        </div>
      </div>

      <style>{`input::placeholder{color:rgba(255,255,255,0.28);}input:focus{border-color:rgba(99,210,255,0.6)!important;box-shadow:0 0 0 3px rgba(99,210,255,0.1)!important;}*{box-sizing:border-box;}`}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   RESULT PAGE
═══════════════════════════════════════════════ */
function ResultPage({ result, onBack, username, onLogout }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 80); }, []);

  return (
    <div style={{ minHeight: "100vh", background: "rgb(2,8,20)", fontFamily: "'Segoe UI',sans-serif", position: "relative", overflow: "hidden" }}>
      <NebulaCanvas />
      <Header username={username} onLogout={onLogout} />

      <main style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "3.5rem 2rem", opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(28px)", transition: "all 0.7s ease" }}>

        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 9, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(99,210,255,0.2)", borderRadius: 11, color: "rgba(255,255,255,0.6)", padding: "12px 24px", fontSize: 16, cursor: "pointer", fontFamily: "inherit", marginBottom: "3.5rem", transition: "all 0.2s", letterSpacing: "0.04em" }}>
          ← Back to Dashboard
        </button>

        <div style={{ textAlign: "center", marginBottom: "3.8rem" }}>
          <div style={{ fontSize: 72, marginBottom: "1rem", filter: "drop-shadow(0 0 30px rgba(99,210,255,0.9))" }}>⚡</div>
          <h1 style={{ fontSize: "clamp(2rem,4.8vw,3.6rem)", color: "#fff", fontWeight: 700, margin: "0 0 0.6rem", fontFamily: "'Georgia',serif" }}>
            Prediction <span style={{ color: "#63d4ff", textShadow: "0 0 30px rgba(99,210,255,0.65)" }}>Results</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 17, letterSpacing: "0.07em" }}>Based on your household usage data</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, marginBottom: "3.2rem" }}>
          {[
            { icon: "🔋", value: result.predicted_units, unit: "kWh", label: "Predicted Units", color: "#63d4ff", rgba: "99,210,255" },
            { icon: "💰", value: `₹${result.predicted_bill}`, unit: "INR", label: "Predicted Bill", color: "#00c9a0", rgba: "0,201,160" },
          ].map((card, i) => (
            <div key={i} style={{ background: `rgba(${card.rgba},0.06)`, border: `1px solid rgba(${card.rgba},0.32)`, borderRadius: 24, padding: "3.4rem 2rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", width: 240, height: 240, borderRadius: "50%", background: `radial-gradient(circle,rgba(${card.rgba},0.12) 0%,transparent 70%)`, top: "-70px", right: "-70px", pointerEvents: "none" }} />
              <div style={{ fontSize: 58, marginBottom: "1.1rem" }}>{card.icon}</div>
              <div style={{ color: card.color, fontSize: "clamp(2.8rem,6vw,4.4rem)", fontWeight: 800, letterSpacing: "-0.02em", textShadow: `0 0 40px rgba(${card.rgba},0.58)` }}>{card.value}</div>
              <div style={{ color: card.color, fontSize: 23, fontWeight: 600, marginBottom: 12 }}>{card.unit}</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, letterSpacing: "0.18em", textTransform: "uppercase" }}>{card.label}</div>
            </div>
          ))}
        </div>

        {result.recommendations?.length > 0 && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,255,180,0.16)", borderRadius: 24, padding: "2.8rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "2rem" }}>
              <span style={{ fontSize: 28 }}>💡</span>
              <p style={{ color: "#00c9a0", fontSize: 16, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, margin: 0 }}>Energy Saving Recommendations</p>
              <span style={{ marginLeft: "auto", background: "rgba(0,201,160,0.12)", color: "#00c9a0", fontSize: 14, fontWeight: 700, padding: "6px 16px", borderRadius: 20, border: "1px solid rgba(0,201,160,0.24)" }}>{result.recommendations.length} Tips</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {result.recommendations.map((tip, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 20, background: "rgba(0,201,160,0.04)", borderRadius: 13, padding: "17px 22px", border: "1px solid rgba(0,201,160,0.1)" }}>
                  <span style={{ color: "#00c9a0", fontWeight: 800, fontSize: 15, minWidth: 30, marginTop: 2, fontFamily: "monospace" }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ color: "rgba(255,255,255,0.78)", fontSize: 17, lineHeight: 1.75 }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <button onClick={onBack} style={{ background: "linear-gradient(135deg,#0090d0,#00c9a0)", border: "none", borderRadius: 15, color: "#fff", padding: "18px 52px", fontSize: 20, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em", fontFamily: "inherit", boxShadow: "0 6px 40px rgba(0,144,208,0.44)" }}>
            ⚡ Predict Again
          </button>
        </div>
      </main>

      <style>{`*{box-sizing:border-box;}button:hover:not(:disabled){filter:brightness(1.12);transform:translateY(-2px);transition:all 0.2s;}`}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN DASHBOARD — compact inputs
═══════════════════════════════════════════════ */
function MainApp({ username, onLogout }) {
  const [formData, setFormData] = useState({
    Fan: "", Refrigerator: "", AirConditioner: "", Television: "",
    Monitor: "", MotorPump: "", Month: "", City: "", CurrentMonthUnits: ""
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Fan: Number(formData.Fan), Refrigerator: Number(formData.Refrigerator),
          AirConditioner: Number(formData.AirConditioner), Television: Number(formData.Television),
          Monitor: Number(formData.Monitor), MotorPump: Number(formData.MotorPump),
          Month: Number(formData.Month), City: formData.City,
          CurrentMonthUnits: Number(formData.CurrentMonthUnits),
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      alert("Backend connection failed. Make sure Flask is running at port 5000.");
    }
    setLoading(false);
  };

  if (result) return <ResultPage result={result} onBack={() => setResult(null)} username={username} onLogout={onLogout} />;

  const active = name => !!formData[name];

  // Compact card style
  const cardStyle = name => ({
    background: active(name) ? "rgba(6,24,46,0.97)" : "rgba(8,20,38,0.92)",
    border: `1px solid ${active(name) ? "rgba(99,210,255,0.52)" : "rgba(99,210,255,0.18)"}`,
    borderRadius: 14,
    padding: "1rem 1.1rem 0.9rem",
    transition: "border-color 0.3s, background 0.3s, box-shadow 0.3s",
    boxShadow: active(name) ? "0 0 20px rgba(99,210,255,0.1), inset 0 0 20px rgba(99,210,255,0.03)" : "none",
  });

  // Compact label style
  const labelStyle = {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontWeight: 600,
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  // Compact number input style
  const numInputStyle = {
    width: "100%",
    background: "rgba(4,13,26,0.9)",
    border: "1px solid rgba(99,210,255,0.15)",
    borderRadius: 9,
    color: "#fff",
    padding: "10px 10px",
    fontSize: 22,
    fontWeight: 700,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    textAlign: "center",
  };

  return (
    <div style={{ minHeight: "100vh", background: "rgb(2,8,20)", fontFamily: "'Segoe UI',sans-serif", position: "relative", overflow: "hidden" }}>
      <NebulaCanvas />
      <Header username={username} onLogout={onLogout} />

      <main style={{ position: "relative", zIndex: 1, maxWidth: 920, margin: "0 auto", padding: "2rem 1.5rem 4rem", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(24px)", transition: "all 0.6s ease" }}>

        {/* title */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "clamp(1.8rem,3.8vw,2.8rem)", color: "#fff", fontWeight: 700, margin: 0, fontFamily: "'Georgia',serif" }}>
            Energy Forecast <span style={{ color: "#63d4ff", textShadow: "0 0 32px rgba(99,210,255,0.68)" }}>Dashboard</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 15, marginTop: "0.6rem", letterSpacing: "0.05em" }}>Enter your household appliance counts and meter reading</p>
        </div>

        {/* ══ MAIN CARD ══ */}
        <div style={{ background: "rgba(8,22,42,0.94)", border: "1px solid rgba(99,210,255,0.18)", borderRadius: 22, padding: "2rem 2rem 1.8rem", backdropFilter: "blur(16px)", boxShadow: "0 0 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)" }}>

          {/* section label */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.8rem", paddingBottom: "1.2rem", borderBottom: "1px solid rgba(99,210,255,0.1)" }}>
            <span style={{ fontSize: 18 }}>🔌</span>
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600 }}>Enter Your Usage Details</span>
          </div>

          {/* ══ 6 ROWS × 2 COLUMNS ══ */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

            {/* ROW 1 — Fan | Refrigerator */}
            <div style={cardStyle("Fan")}>
              <div style={labelStyle}><span>🌀</span> Fan</div>
              <input type="number" name="Fan" value={formData.Fan} onChange={handleChange} min="0" placeholder="0" style={numInputStyle} />
            </div>

            <div style={cardStyle("Refrigerator")}>
              <div style={labelStyle}><span>🧊</span> Refrigerator</div>
              <input type="number" name="Refrigerator" value={formData.Refrigerator} onChange={handleChange} min="0" placeholder="0" style={numInputStyle} />
            </div>

            {/* ROW 2 — Air Conditioner | Television */}
            <div style={cardStyle("AirConditioner")}>
              <div style={labelStyle}><span>❄️</span> Air Conditioner</div>
              <input type="number" name="AirConditioner" value={formData.AirConditioner} onChange={handleChange} min="0" placeholder="0" style={numInputStyle} />
            </div>

            <div style={cardStyle("Television")}>
              <div style={labelStyle}><span>📺</span> Television</div>
              <input type="number" name="Television" value={formData.Television} onChange={handleChange} min="0" placeholder="0" style={numInputStyle} />
            </div>

            {/* ROW 3 — Monitor | Motor Pump */}
            <div style={cardStyle("Monitor")}>
              <div style={labelStyle}><span>🖥️</span> Monitor</div>
              <input type="number" name="Monitor" value={formData.Monitor} onChange={handleChange} min="0" placeholder="0" style={numInputStyle} />
            </div>

            <div style={cardStyle("MotorPump")}>
              <div style={labelStyle}><span>⚙️</span> Motor Pump</div>
              <input type="number" name="MotorPump" value={formData.MotorPump} onChange={handleChange} min="0" placeholder="0" style={numInputStyle} />
            </div>

            {/* ROW 4 — City | Month */}
            <div style={cardStyle("City")}>
              <div style={labelStyle}><span>🏙️</span> City</div>
              <select name="City" value={formData.City} onChange={handleChange}
                style={{ width: "100%", background: "rgba(4,13,26,0.97)", border: "1px solid rgba(99,210,255,0.15)", borderRadius: 9, color: formData.City ? "#fff" : "rgba(255,255,255,0.3)", padding: "10px 12px", fontSize: 15, outline: "none", fontFamily: "inherit", cursor: "pointer" }}>
                <option value="">Select a city</option>
                {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>

            <div style={cardStyle("Month")}>
              <div style={labelStyle}><span>📅</span> Month (1–12)</div>
              <input type="number" name="Month" value={formData.Month} onChange={handleChange} placeholder="e.g. 6" min="1" max="12"
                style={{ width: "100%", background: "rgba(4,13,26,0.9)", border: "1px solid rgba(99,210,255,0.15)", borderRadius: 9, color: "#fff", padding: "10px 12px", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>

            {/* ROW 5 — Current Month Units (full width) */}
            <div style={{ ...cardStyle("CurrentMonthUnits"), gridColumn: "1 / -1" }}>
              <div style={labelStyle}><span>⚡</span> Current Month Units (kWh)</div>
              <input type="number" name="CurrentMonthUnits" value={formData.CurrentMonthUnits} onChange={handleChange} placeholder="Units shown on your electricity meter" min="0"
                style={{ width: "100%", background: "rgba(4,13,26,0.9)", border: "1px solid rgba(99,210,255,0.15)", borderRadius: 9, color: "#fff", padding: "10px 14px", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>

            {/* ROW 6 — Predict button (full width) */}
            <div style={{ gridColumn: "1 / -1" }}>
              <button onClick={handleSubmit} disabled={loading}
                style={{ width: "100%", padding: "18px", background: loading ? "rgba(99,210,255,0.18)" : "linear-gradient(135deg,#0090d0 0%,#00c9a0 100%)", border: "none", borderRadius: 13, color: "#fff", fontSize: 19, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.08em", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, transition: "all 0.3s", boxShadow: loading ? "none" : "0 6px 40px rgba(0,144,208,0.48), 0 0 70px rgba(0,200,140,0.12)" }}>
                {loading
                  ? <><span style={{ display: "inline-block", width: 22, height: 22, border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Analysing…</>
                  : "⚡  Predict My Bill"}
              </button>
            </div>

          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, select:focus { border-color: rgba(99,210,255,0.65) !important; box-shadow: 0 0 0 3px rgba(99,210,255,0.12) !important; }
        input::placeholder { color: rgba(255,255,255,0.22); }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.25; }
        * { box-sizing: border-box; }
        button:hover:not(:disabled) { filter: brightness(1.11); transform: translateY(-2px); }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,210,255,0.22); border-radius: 3px; }
        select option { background: #040e20; color: #fff; }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════ */
export default function App() {
  const [user, setUser] = useState(null);
  return user
    ? <MainApp username={user} onLogout={() => setUser(null)} />
    : <LandingPage onLogin={name => setUser(name)} />;
}