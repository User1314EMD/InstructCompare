import { useState, useEffect, useCallback } from 'react'
import { doc, getDoc, runTransaction } from 'firebase/firestore'
import { db } from '../firebase'

const STORAGE_KEY = 'instructcompare_rating'
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

function getLocalUser() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v == null) return null
    const n = parseInt(v, 10)
    return n >= 1 && n <= 5 ? n : null
  } catch {
    return null
  }
}

function setLocalUser(val) {
  try {
    localStorage.setItem(STORAGE_KEY, String(val))
  } catch {}
}

export default function Rating() {
  const [avg, setAvg] = useState(0)
  const [total, setTotal] = useState(0)
  const [user, setUserState] = useState(null)
  const [loading, setLoading] = useState(!!db)

  const loadFromFirebase = useCallback(() => {
    if (!db) return
    const statsRef = doc(db, 'stats', 'rating')
    const voteRef = doc(db, 'votes', getClientId())
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
  }, [])

  useEffect(() => {
    if (db) {
      loadFromFirebase()
    } else {
      const u = getLocalUser()
      const votes = u != null ? SEED.concat([u]) : SEED
      const sum = votes.reduce((a, b) => a + b, 0)
      setAvg(sum / votes.length)
      setTotal(votes.length)
      setUserState(u)
      setLoading(false)
    }
  }, [loadFromFirebase])

  function onVoteFirebase(val) {
    if (!db) return
    const clientId = getClientId()
    const statsRef = doc(db, 'stats', 'rating')
    const voteRef = doc(db, 'votes', clientId)

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
    if (val < 1 || val > 5) return
    if (db) {
      onVoteFirebase(val)
    } else {
      setLocalUser(val)
      setUserState(val)
      const votes = SEED.concat([val])
      const sum = votes.reduce((a, b) => a + b, 0)
      setAvg(sum / votes.length)
      setTotal(votes.length)
    }
  }

  const totalLabel = plural(total)

  return (
    <div className="rating-page">
      <div className="rating-card">
        <h1>Оцените сайт</h1>
        <p className="rating-desc">
          Нажмите на оценку от 1 до 5. Результаты обновятся сразу.
        </p>

        <div className="rating-buttons">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              type="button"
              className={'rating-btn' + (user === v ? ' rating-btn-active' : '')}
              onClick={() => onVote(v)}
              disabled={loading}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="rating-results">
          <div className="rating-avg">
            <span className="rating-avg-value">{loading ? '…' : total > 0 ? avg.toFixed(1) : '—'}</span>
            <span className="rating-avg-label">Средняя оценка</span>
          </div>
          <div className="rating-meta">
            <span>{totalLabel}</span>
            {user != null && <span className="rating-yours">Ваша оценка: {user}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
