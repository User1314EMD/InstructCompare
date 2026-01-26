import { useState, useEffect, useCallback } from 'react'
import { doc, getDoc, runTransaction } from 'firebase/firestore'
import { db } from '../firebase'

const CLIENT_ID_KEY = 'instructcompare_clientid'
const SEED = [4, 5, 4, 3, 5, 4, 4, 5, 3, 4]

function getClientId() {
  try {
    let id = localStorage.getItem(CLIENT_ID_KEY)
    if (!id) {
      id = 'x' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 12)
      localStorage.setItem(CLIENT_ID_KEY, id)
    }
    return id
  } catch {
    return 'anon_' + Math.random().toString(36).slice(2, 10)
  }
}

function plural(n) {
  if (n === 1) return '1 оценка'
  if (n >= 2 && n <= 4) return `${n} оценки`
  return `${n} оценок`
}

function getLocalUser(instructionId) {
  try {
    const key = `instructcompare_rating_${instructionId}`
    const v = localStorage.getItem(key)
    if (v == null) return null
    const n = parseInt(v, 10)
    return n >= 1 && n <= 5 ? n : null
  } catch {
    return null
  }
}

function setLocalUser(instructionId, val) {
  try {
    const key = `instructcompare_rating_${instructionId}`
    localStorage.setItem(key, String(val))
  } catch {}
}

export default function InstructionRating({ instructionId }) {
  const [avg, setAvg] = useState(0)
  const [total, setTotal] = useState(0)
  const [user, setUserState] = useState(null)
  const [loading, setLoading] = useState(!!db)

  const loadFromFirebase = useCallback(() => {
    if (!db || !instructionId) return
    const statsRef = doc(db, 'instructionStats', String(instructionId))
    const voteRef = doc(db, 'instructionVotes', `${getClientId()}_${instructionId}`)
    Promise.all([getDoc(statsRef), getDoc(voteRef)])
      .then(([statsSnap, voteSnap]) => {
        let sum = 0,
          count = 0,
          u = null
        if (statsSnap.exists()) {
          const d = statsSnap.data()
          sum = d.sum || 0
          count = d.count || 0
        }
        if (voteSnap.exists()) u = voteSnap.data().value
        setAvg(count > 0 ? sum / count : 0)
        setTotal(count)
        setUserState(u)
      })
      .catch(() => {
        setAvg(0)
        setTotal(0)
        setUserState(null)
      })
      .finally(() => setLoading(false))
  }, [instructionId])

  useEffect(() => {
    if (db && instructionId) {
      loadFromFirebase()
    } else {
      const u = getLocalUser(instructionId)
      const votes = u != null ? SEED.concat([u]) : SEED
      const sum = votes.reduce((a, b) => a + b, 0)
      setAvg(sum / votes.length)
      setTotal(votes.length)
      setUserState(u)
      setLoading(false)
    }
  }, [instructionId, loadFromFirebase])

  function onVoteFirebase(val) {
    if (!db || !instructionId) return
    const clientId = getClientId()
    const statsRef = doc(db, 'instructionStats', String(instructionId))
    const voteRef = doc(db, 'instructionVotes', `${clientId}_${instructionId}`)

    runTransaction(db, async (transaction) => {
      const statsSnap = await transaction.get(statsRef)
      let sum = 0,
        count = 0
      if (statsSnap.exists()) {
        const d = statsSnap.data()
        sum = d.sum || 0
        count = d.count || 0
      }
      const voteSnap = await transaction.get(voteRef)
      const oldVal = voteSnap.exists() ? voteSnap.data().value : null
      let newSum, newCount
      if (oldVal != null) {
        newSum = sum - oldVal + val
        newCount = count
      } else {
        newSum = sum + val
        newCount = count + 1
      }
      transaction.set(statsRef, { sum: newSum, count: newCount })
      transaction.set(voteRef, { value: val })
    })
      .then(() => loadFromFirebase())
      .catch(() => loadFromFirebase())
  }

  function onVote(val) {
    if (val < 1 || val > 5 || !instructionId) return
    if (db) {
      onVoteFirebase(val)
    } else {
      setLocalUser(instructionId, val)
      setUserState(val)
      const votes = SEED.concat([val])
      const sum = votes.reduce((a, b) => a + b, 0)
      setAvg(sum / votes.length)
      setTotal(votes.length)
    }
  }

  const totalLabel = plural(total)

  return (
    <section className="instruction-section instruction-rating-section">
      <h2>Оцените эту инструкцию</h2>
      <div className="instruction-rating-buttons">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            className={'rating-btn-small' + (user === v ? ' rating-btn-active' : '')}
            onClick={() => onVote(v)}
            disabled={loading}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="instruction-rating-results">
        <div className="instruction-rating-avg">
          <span className="instruction-rating-value">
            {loading ? '…' : total > 0 ? avg.toFixed(1) : '—'}
          </span>
          <span className="instruction-rating-label">Средняя оценка</span>
        </div>
        <div className="instruction-rating-meta">
          <span>{totalLabel}</span>
          {user != null && <span className="instruction-rating-yours">Ваша оценка: {user}</span>}
        </div>
      </div>
    </section>
  )
}
