import { useMemo, useState } from "react"

const pratimai = {
  Krūtinė: [
    "Krūtinės spaudimas treniruoklyje",
    "Spaudimas su štanga gulint",
    "Spaudimas su hanteliais",
    "Krūtinės suvedimas treniruoklyje"
  ],
  Nugara: [
    "Nugaros trauka iš viršaus",
    "Irklavimas treniruoklyje",
    "Trauka prie pilvo",
    "Nugaros tiesimas"
  ],
  Kojos: [
    "Kojų spaudimas",
    "Pritūpimai",
    "Kojų tiesimas treniruoklyje",
    "Kojų lenkimas treniruoklyje",
    "Blauzdos treniruoklyje"
  ],
  Pečiai: [
    "Pečių spaudimas treniruoklyje",
    "Šoniniai mostai su hanteliais",
    "Galinės deltos treniruoklyje"
  ],
  Rankos: [
    "Bicepsas su hanteliais",
    "Bicepsas su štanga",
    "Tricepsas su trosu",
    "Tricepsas treniruoklyje"
  ]
}

function App() {
  const [irasai, setIrasai] = useState(() => {
    const issaugota = localStorage.getItem("sporto-irasai")
    return issaugota ? JSON.parse(issaugota) : []
  })

  const [grupe, setGrupe] = useState("Krūtinė")
  const [pratimas, setPratimas] = useState(pratimai["Krūtinė"][0])
  const [svoris, setSvoris] = useState("")
  const [kartai, setKartai] = useState("")
  const [serijos, setSerijos] = useState("3")
  const [pastaba, setPastaba] = useState("")
  const [skiltis, setSkiltis] = useState("naujas")

  function keistiGrupe(naujaGrupe) {
    setGrupe(naujaGrupe)
    setPratimas(pratimai[naujaGrupe][0])
  }

  function issaugoti() {
    if (!svoris || !kartai || !serijos) return

    const naujas = {
      id: Date.now(),
      data: new Date().toLocaleDateString("lt-LT"),
      grupe,
      pratimas,
      svoris: Number(svoris),
      kartai: Number(kartai),
      serijos: Number(serijos),
      kruvis: Number(svoris) * Number(kartai) * Number(serijos),
      pastaba
    }

    const visi = [naujas, ...irasai]
    setIrasai(visi)
    localStorage.setItem("sporto-irasai", JSON.stringify(visi))

    setSvoris("")
    setKartai("")
    setSerijos("3")
    setPastaba("")
  }

  function istrinti(id) {
    const nauji = irasai.filter((i) => i.id !== id)
    setIrasai(nauji)
    localStorage.setItem("sporto-irasai", JSON.stringify(nauji))
  }

  const statistika = useMemo(() => {
    const dienos = new Set(irasai.map((i) => i.data)).size
    const seriju = irasai.reduce((suma, i) => suma + i.serijos, 0)
    const kruvis = irasai.reduce((suma, i) => suma + i.kruvis, 0)
    const maxSvoris = irasai.length ? Math.max(...irasai.map((i) => i.svoris)) : 0

    return { dienos, seriju, kruvis, maxSvoris }
  }, [irasai])

  const praeitas = irasai.find((i) => i.pratimas === pratimas)

  const rekordai = useMemo(() => {
    const map = {}

    irasai.forEach((i) => {
      if (!map[i.pratimas] || i.svoris > map[i.pratimas].svoris) {
        map[i.pratimas] = i
      }
    })

    return Object.values(map)
  }, [irasai])

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.hero}>
          <div>
            <div style={styles.badge}>Lietuviška gym programėlė</div>
            <h1 style={styles.title}>Mano progresas salėje</h1>
            <p style={styles.subtitle}>
              Įrašyk pratimus, svorius, pakartojimus ir serijas. Kitą kartą matysi,
              ką darei anksčiau, ir galėsi lengviau progresuoti.
            </p>
          </div>
        </header>

        <div style={styles.stats}>
          <Stat title="Treniruočių dienų" value={statistika.dienos} />
          <Stat title="Iš viso serijų" value={statistika.seriju} />
          <Stat title="Bendras krūvis" value={`${statistika.kruvis} kg`} />
          <Stat title="Didžiausias svoris" value={`${statistika.maxSvoris} kg`} />
        </div>

        <div style={styles.tabs}>
          <button onClick={() => setSkiltis("naujas")} style={skiltis === "naujas" ? styles.tabActive : styles.tab}>
            Naujas įrašas
          </button>
          <button onClick={() => setSkiltis("istorija")} style={skiltis === "istorija" ? styles.tabActive : styles.tab}>
            Istorija
          </button>
          <button onClick={() => setSkiltis("rekordai")} style={skiltis === "rekordai" ? styles.tabActive : styles.tab}>
            Rekordai
          </button>
        </div>

        {skiltis === "naujas" && (
          <main style={styles.grid}>
            <section style={styles.card}>
              <h2 style={styles.h2}>Įrašyti pratimą</h2>

              <label style={styles.label}>Raumenų grupė</label>
              <div style={styles.groupGrid}>
                {Object.keys(pratimai).map((g) => (
                  <button
                    key={g}
                    onClick={() => keistiGrupe(g)}
                    style={grupe === g ? styles.groupActive : styles.group}
                  >
                    {g}
                  </button>
                ))}
              </div>

              <label style={styles.label}>Pratimas</label>
              <select value={pratimas} onChange={(e) => setPratimas(e.target.value)} style={styles.input}>
                {pratimai[grupe].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>

              {praeitas && (
                <div style={styles.lastBox}>
                  <b>Praeitą kartą:</b><br />
                  {praeitas.svoris} kg × {praeitas.kartai} kart. × {praeitas.serijos} ser.
                </div>
              )}

              <div style={styles.three}>
                <div>
                  <label style={styles.label}>Svoris kg</label>
                  <input value={svoris} onChange={(e) => setSvoris(e.target.value)} type="number" style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Kartai</label>
                  <input value={kartai} onChange={(e) => setKartai(e.target.value)} type="number" style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Serijos</label>
                  <input value={serijos} onChange={(e) => setSerijos(e.target.value)} type="number" style={styles.input} />
                </div>
              </div>

              <label style={styles.label}>Pastaba</label>
              <textarea
                value={pastaba}
                onChange={(e) => setPastaba(e.target.value)}
                placeholder="Pvz., buvo sunku, kitą kartą kelti svorį, skaudėjo petį..."
                style={styles.textarea}
              />

              <button onClick={issaugoti} style={styles.save}>
                Išsaugoti pratimą
              </button>
            </section>

            <section style={styles.cardDark}>
              <h2 style={styles.h2}>Kaip naudoti?</h2>
              <p>1. Pasirink raumenų grupę.</p>
              <p>2. Pasirink pratimą.</p>
              <p>3. Įrašyk svorį, pakartojimus ir serijas.</p>
              <p>4. Kitą treniruotę programa parodys, ką darei praeitą kartą.</p>
              <div style={styles.example}>
                Pavyzdys: kojų spaudimas 120 kg × 10 kartų × 3 serijos.
              </div>
            </section>
          </main>
        )}

        {skiltis === "istorija" && (
          <section style={styles.card}>
            <h2 style={styles.h2}>Treniruočių istorija</h2>

            {irasai.length === 0 && <p>Dar nėra įrašų.</p>}

            {irasai.map((i) => (
              <div key={i.id} style={styles.entry}>
                <div>
                  <small>{i.data} · {i.grupe}</small>
                  <h3>{i.pratimas}</h3>
                  <p>{i.svoris} kg × {i.kartai} kart. × {i.serijos} ser.</p>
                  <b>Bendras krūvis: {i.kruvis} kg</b>
                  {i.pastaba && <p style={styles.note}>{i.pastaba}</p>}
                </div>
                <button onClick={() => istrinti(i.id)} style={styles.delete}>Ištrinti</button>
              </div>
            ))}
          </section>
        )}

        {skiltis === "rekordai" && (
          <section style={styles.card}>
            <h2 style={styles.h2}>Geriausi rezultatai</h2>

            {rekordai.length === 0 && <p>Rekordų dar nėra.</p>}

            <div style={styles.recordGrid}>
              {rekordai.map((r) => (
                <div key={r.pratimas} style={styles.record}>
                  <small>{r.grupe}</small>
                  <h3>{r.pratimas}</h3>
                  <div style={styles.recordWeight}>{r.svoris} kg</div>
                  <p>{r.kartai} kart. × {r.serijos} ser.</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function Stat({ title, value }) {
  return (
    <div style={styles.stat}>
      <small>{title}</small>
      <strong>{value}</strong>
    </div>
  )
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f0f10",
    color: "#f5f5f5",
    fontFamily: "Arial, sans-serif",
    padding: 18
  },
  container: {
    maxWidth: 1100,
    margin: "0 auto"
  },
  hero: {
    background: "linear-gradient(135deg, #171717, #2b2b2b)",
    borderRadius: 30,
    padding: 32,
    marginBottom: 18,
    boxShadow: "0 20px 50px rgba(0,0,0,0.35)"
  },
  badge: {
    display: "inline-block",
    background: "#d6ff3f",
    color: "#111",
    padding: "8px 14px",
    borderRadius: 999,
    fontWeight: 700,
    marginBottom: 14
  },
  title: {
    fontSize: 42,
    margin: "0 0 10px"
  },
  subtitle: {
    color: "#cfcfcf",
    maxWidth: 720,
    lineHeight: 1.5
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginBottom: 18
  },
  stat: {
    background: "#1b1b1d",
    border: "1px solid #2d2d30",
    borderRadius: 22,
    padding: 20
  },
  tabs: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
    background: "#18181a",
    padding: 8,
    borderRadius: 22,
    marginBottom: 18
  },
  tab: {
    padding: 14,
    borderRadius: 16,
    border: 0,
    background: "transparent",
    color: "#aaa",
    fontWeight: 700,
    cursor: "pointer"
  },
  tabActive: {
    padding: 14,
    borderRadius: 16,
    border: 0,
    background: "#d6ff3f",
    color: "#111",
    fontWeight: 800,
    cursor: "pointer"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1.4fr 0.8fr",
    gap: 18
  },
  card: {
    background: "#1a1a1c",
    border: "1px solid #2c2c30",
    borderRadius: 28,
    padding: 24
  },
  cardDark: {
    background: "#111",
    border: "1px solid #2c2c30",
    borderRadius: 28,
    padding: 24,
    color: "#ddd"
  },
  h2: {
    marginTop: 0
  },
  label: {
    display: "block",
    marginTop: 16,
    marginBottom: 8,
    color: "#cfcfcf",
    fontWeight: 700
  },
  groupGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: 8
  },
  group: {
    padding: 13,
    borderRadius: 16,
    border: "1px solid #333",
    background: "#242426",
    color: "#eee",
    cursor: "pointer"
  },
  groupActive: {
    padding: 13,
    borderRadius: 16,
    border: "1px solid #d6ff3f",
    background: "#d6ff3f",
    color: "#111",
    fontWeight: 800,
    cursor: "pointer"
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: 14,
    borderRadius: 16,
    border: "1px solid #333",
    background: "#101011",
    color: "white",
    fontSize: 16
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: 90,
    padding: 14,
    borderRadius: 16,
    border: "1px solid #333",
    background: "#101011",
    color: "white",
    fontSize: 16
  },
  three: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10
  },
  lastBox: {
    background: "#2f3215",
    color: "#f4ffb0",
    padding: 16,
    borderRadius: 18,
    marginTop: 14
  },
  save: {
    width: "100%",
    marginTop: 18,
    padding: 16,
    borderRadius: 18,
    border: 0,
    background: "#d6ff3f",
    color: "#111",
    fontSize: 17,
    fontWeight: 900,
    cursor: "pointer"
  },
  example: {
    marginTop: 18,
    background: "#202020",
    padding: 16,
    borderRadius: 18
  },
  entry: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    background: "#111",
    padding: 18,
    borderRadius: 20,
    marginTop: 12,
    border: "1px solid #2c2c30"
  },
  delete: {
    height: 40,
    border: 0,
    borderRadius: 14,
    padding: "0 14px",
    background: "#3a1d1d",
    color: "#ffb5b5",
    cursor: "pointer"
  },
  note: {
    background: "#222",
    padding: 12,
    borderRadius: 14
  },
  recordGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12
  },
  record: {
    background: "#111",
    padding: 18,
    borderRadius: 20,
    border: "1px solid #2c2c30"
  },
  recordWeight: {
    fontSize: 36,
    fontWeight: 900,
    color: "#d6ff3f"
  }
}

export default App