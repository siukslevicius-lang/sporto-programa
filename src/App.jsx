import { useEffect, useMemo, useState } from "react"
import { supabase } from "./supabase"
import "./App.css"

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
    "Kojų tiesimas",
    "Kojų lenkimas"
  ],
  Pečiai: [
    "Pečių spaudimas",
    "Šoninis kėlimas",
    "Trauka smakrui"
  ],
  Rankos: [
    "Bicepso lenkimas",
    "Tricepso tiesimas",
    "Hammer curls"
  ]
}

function App() {
  const [group, setGroup] = useState("Krūtinė")
  const [exercise, setExercise] = useState("")
  const [weight, setWeight] = useState("")
  const [reps, setReps] = useState("")
  const [sets, setSets] = useState("")
  const [note, setNote] = useState("")
  const [workouts, setWorkouts] = useState([])

  const currentExercises = useMemo(() => {
    return pratimai[group]
  }, [group])

  useEffect(() => {
    if (currentExercises.length > 0) {
      setExercise(currentExercises[0])
    }
  }, [currentExercises])

  async function loadWorkouts() {
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error) {
      setWorkouts(data)
    }
  }

  useEffect(() => {
    loadWorkouts()
  }, [])

  async function addWorkout() {
    if (!exercise || !weight || !reps || !sets) return

    const { data, error } = await supabase.from("workouts").insert([
      {
        group_name: group,
        exercise,
        weight: Number(weight),
        reps: Number(reps),
        sets: Number(sets),
        note
      }
    ])
    .select()

console.log(data)
console.log(error)
    if (!error) {
      setWeight("")
      setReps("")
      setSets("")
      setNote("")
      loadWorkouts()
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h1>Sporto programa</h1>

      <h2>Raumenų grupė</h2>

      <select
        value={group}
        onChange={(e) => setGroup(e.target.value)}
        style={{ width: "100%", padding: 10 }}
      >
        {Object.keys(pratimai).map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>

      <h2>Pratimas</h2>

      <select
        value={exercise}
        onChange={(e) => setExercise(e.target.value)}
        style={{ width: "100%", padding: 10 }}
      >
        {currentExercises.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>

      <h2>Svoris</h2>

      <input
        type="number"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        style={{ width: "100%", padding: 10 }}
      />

      <h2>Pakartojimai</h2>

      <input
        type="number"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        style={{ width: "100%", padding: 10 }}
      />

      <h2>Setai</h2>

      <input
        type="number"
        value={sets}
        onChange={(e) => setSets(e.target.value)}
        style={{ width: "100%", padding: 10 }}
      />

      <h2>Pastabos</h2>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{ width: "100%", padding: 10 }}
      />

      <button
        onClick={addWorkout}
        style={{
          marginTop: 20,
          width: "100%",
          padding: 15,
          fontSize: 18
        }}
      >
        Išsaugoti treniruotę
      </button>

      <hr style={{ margin: "40px 0" }} />

      <h2>Išsaugotos treniruotės</h2>

      {workouts.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid gray",
            padding: 15,
            marginBottom: 15,
            borderRadius: 10
          }}
        >
          <h3>{item.group_name}</h3>

          <p>
            <b>Pratimas:</b> {item.exercise}
          </p>

          <p>
            <b>Svoris:</b> {item.weight} kg
          </p>

          <p>
            <b>Pakartojimai:</b> {item.reps}
          </p>

          <p>
            <b>Setai:</b> {item.sets}
          </p>

          {item.note && (
            <p>
              <b>Pastabos:</b> {item.note}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

export default App