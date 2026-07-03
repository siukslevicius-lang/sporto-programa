import { useEffect, useMemo, useState } from "react"
import { supabase } from "./supabase"

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
  const [group, setGroup] = useState("Krūtinė")
  const [exercise, setExercise] = useState(pratimai["Krūtinė"][0])
  const [weight, setWeight] = useState("")
  const [reps, setReps] = useState("")
  const [sets, setSets] = useState("3")
  const [note, setNote] = useState("")
  const [workouts, setWorkouts] = useState([])
  const [tab, setTab] = useState("new")
  const [loading, setLoading] = useState(false)
const [dbStatus, setDbStatus] = useState("loading")
const [dbMessage, setDbMessage] = useState("")
async function loadWorkouts() {
  setDbStatus("loading")
  setDbMessage("Programa jungiasi prie duomenų bazės. Jei projektas buvo užmigdytas, pirmas paleidimas gali užtrukti 1–3 minutes.")

  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    setDbStatus("error")
    setDbMessage("Nepavyko prisijungti prie duomenų bazės. Gali būti, kad Supabase projektas užmigdytas. Atidaryk Supabase ir paspausk Resume project.")
    return
  }

  setWorkouts(data || [])
  setDbStatus("ok")
  setDbMessage("")
}

  useEffect(() => {
    loadWorkouts()
  }, [])

  function changeGroup(newGroup) {
    setGroup(newGroup)
    setExercise(pratimai[newGroup][0])
  }
async function deleteWorkout(id) {
  const confirmDelete = confirm("Ar tikrai ištrinti?")
  
  if (!confirmDelete) return

  const { error } = await supabase
    .from("workouts")
    .delete()
    .eq("id", id)

  if (!error) {
    loadWorkouts()
  }
}
  async function addWorkout() {
    if (!exercise || !weight || !reps || !sets) {
      alert("Įrašyk svorį, pakartojimus ir serijas")
      return
    }

    setLoading(true)

    const { error } = await supabase.from("workouts").insert([
      {
        group_name: group,
        exercise,
        weight: Number(weight),
        reps: Number(reps),
        sets: Number(sets),
        note,
        created_at: new Date().toISOString()
      }
    ])

    setLoading(false)

    if (error) {
      alert("Klaida: " + error.message)
      return
    }

    setWeight("")
    setReps("")
    setSets("3")
    setNote("")
    loadWorkouts()
    setTab("history")
  }

  const stats = useMemo(() => {
    const days = new Set(
      workouts.map((w) => new Date(w.created_at).toLocaleDateString("lt-LT"))
    ).size

    const totalSets = workouts.reduce((sum, w) => sum + Number(w.sets || 0), 0)
    const totalVolume = workouts.reduce(
      (sum, w) => sum + Number(w.weight || 0) * Number(w.reps || 0) * Number(w.sets || 0),
      0
    )
    const maxWeight = workouts.length
      ? Math.max(...workouts.map((w) => Number(w.weight || 0)))
      : 0

    return { days, totalSets, totalVolume, maxWeight }
  }, [workouts])

  const previous = workouts.find((w) => w.exercise === exercise)

  const records = useMemo(() => {
    const map = {}

    workouts.forEach((w) => {
      if (!map[w.exercise] || Number(w.weight) > Number(map[w.exercise].weight)) {
        map[w.exercise] = w
      }
    })

    return Object.values(map)
  }, [workouts])

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.hero}>
          <div style={styles.badge}>Lietuviška gym programėlė</div>
          <h1 style={styles.title}>Mano progresas salėje</h1>
          <p style={styles.subtitle}>
            Įrašyk pratimus, svorius, pakartojimus ir serijas. Duomenys sinchronizuojasi
            tarp telefono ir kompiuterio.
          </p>
        </header>

        <div style={styles.stats}>
          <Stat title="Treniruočių dienų" value={stats.days} />
          <Stat title="Iš viso serijų" value={stats.totalSets} />
          <Stat title="Bendras krūvis" value={`${stats.totalVolume} kg`} />
          <Stat title="Didžiausias svoris" value={`${stats.maxWeight} kg`} />
        </div>
{dbStatus !== "ok" && (
  <div style={dbStatus === "error" ? styles.dbError : styles.dbNotice}>
    {dbMessage}
  </div>
)}
        <div style={styles.tabs}>
          <button onClick={() => setTab("new")} style={tab === "new" ? styles.tabActive : styles.tab}>
            Naujas įrašas
          </button>
          <button onClick={() => setTab("history")} style={tab === "history" ? styles.tabActive : styles.tab}>
            Istorija
          </button>
          <button onClick={() => setTab("records")} style={tab === "records" ? styles.tabActive : styles.tab}>
            Rekordai
          </button>
        </div>

        {tab === "new" && (
          <section style={styles.card}>
            <h2>Įrašyti pratimą</h2>

            <label style={styles.label}>Raumenų grupė</label>
            <div style={styles.groupGrid}>
              {Object.keys(pratimai).map((g) => (
                <button
                  key={g}
                  onClick={() => changeGroup(g)}
                  style={group === g ? styles.groupActive : styles.group}
                >
                  {g}
                </button>
              ))}
            </div>

            <label style={styles.label}>Pratimas</label>
            <select value={exercise} onChange={(e) => setExercise(e.target.value)} style={styles.input}>
              {pratimai[group].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>

            {previous && (
              <div style={styles.lastBox}>
                <b>Praeitą kartą:</b><br />
                {previous.weight} kg × {previous.reps} kart. × {previous.sets} ser.
              </div>
            )}

            <div style={styles.three}>
              <div>
                <label style={styles.label}>Svoris kg</label>
                <input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Kartai</label>
                <input value={reps} onChange={(e) => setReps(e.target.value)} type="number" style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Serijos</label>
                <input value={sets} onChange={(e) => setSets(e.target.value)} type="number" style={styles.input} />
              </div>
            </div>

            <label style={styles.label}>Pastaba</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Pvz., buvo sunku, kitą kartą kelti svorį..."
              style={styles.textarea}
            />

            <button onClick={addWorkout} style={styles.save}>
              {loading ? "Saugoma..." : "Išsaugoti pratimą"}
            </button>
          </section>
        )}

        {tab === "history" && (
          <section style={styles.card}>
            <h2>Treniruočių istorija</h2>

            {workouts.length === 0 && <p>Įrašų dar nėra.</p>}

            {workouts.map((w) => (
              <div key={w.id} style={styles.entry}>
                <small>
                  {new Date(w.created_at).toLocaleDateString("lt-LT")} · {w.group_name}
                </small>
                <h3>{w.exercise}</h3>
                <p>{w.weight} kg × {w.reps} kart. × {w.sets} ser.</p>
                <b>Bendras krūvis: {Number(w.weight) * Number(w.reps) * Number(w.sets)} kg</b>
                {w.note && <p style={styles.note}>{w.note}</p>}
                <button
  onClick={() => deleteWorkout(w.id)}
  style={styles.deleteBtn}
>
  Ištrinti
</button>
              </div>
            ))}
          </section>
        )}

        {tab === "records" && (
          <section style={styles.card}>
            <h2>Geriausi rezultatai</h2>

            <div style={styles.recordGrid}>
              {records.map((r) => (
                <div key={r.exercise} style={styles.record}>
                  <small>{r.group_name}</small>
                  <h3>{r.exercise}</h3>
                  <div style={styles.recordWeight}>{r.weight} kg</div>
                  <p>{r.reps} kart. × {r.sets} ser.</p>
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
  dbNotice: {
  background: "#2f3215",
  color: "#f4ffb0",
  padding: 16,
  borderRadius: 18,
  marginBottom: 18,
  border: "1px solid #596000",
  fontWeight: 700
},
dbError: {
  background: "#3a1616",
  color: "#ffd1d1",
  padding: 16,
  borderRadius: 18,
  marginBottom: 18,
  border: "1px solid #7a2b2b",
  fontWeight: 700
},tabs: {
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
  card: {
    background: "#1a1a1c",
    border: "1px solid #2c2c30",
    borderRadius: 28,
    padding: 24,
    marginBottom: 18
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
  entry: {
    background: "#111",
    padding: 18,
    borderRadius: 20,
    marginTop: 12,
    border: "1px solid #2c2c30"
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
  deleteBtn: {
  marginTop: 12,
  background: "#ff4d4d",
  color: "white",
  border: 0,
  padding: "10px 14px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 700
},
  recordWeight: {
    fontSize: 36,
    fontWeight: 900,
    color: "#d6ff3f"
  }
}

export default App