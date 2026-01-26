import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import InstructionRating from '../components/InstructionRating'

const DATA_URL = '/data/instructions.json'

function imageSrc(img) {
  if (!img) return ''
  if (/^https?:\/\//i.test(img)) return img
  return (img.startsWith('/') ? '' : '/') + img
}

export default function Instruction() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const num = parseInt(id, 10)
    if (Number.isNaN(num)) {
      setError('Некорректный идентификатор инструкции.')
      setLoading(false)
      return
    }

    fetch(DATA_URL)
      .then((r) => r.json())
      .then((data) => {
        const found = data.find((i) => i.id === num)
        if (!found) setError('Инструкция с таким идентификатором не найдена.')
        else setItem(found)
      })
      .catch(() => setError('Не удалось загрузить данные. Проверьте наличие public/data/instructions.json.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (item) document.title = `${item.airline} — ${item.aircraft} — InstructCompare`
  }, [item])

  if (loading) {
    return (
      <div className="instruction-page">
        <p className="catalog-empty">Загрузка…</p>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="instruction-page">
        <Link to="/catalog" className="instruction-back">← Назад в каталог</Link>
        <p className="catalog-empty">{error}</p>
      </div>
    )
  }

  return (
    <div className="instruction-page">
      <Link to="/catalog" className="instruction-back">← Назад в каталог</Link>

      <div className="instruction-image-wrap">
        <img
          className="instruction-image"
          src={imageSrc(item.image)}
          alt={`Инструкция: ${item.airline}, ${item.aircraft}`}
        />
      </div>

      <div className="instruction-sections">
        <section className="instruction-section">
          <h2>Описание</h2>
          <div className="instruction-meta">
            <span>{item.airline}</span>
            <span>{item.aircraft}</span>
            <span>{item.country}</span>
            <span>{String(item.year)}</span>
          </div>
          <p>{item.description || '—'}</p>
        </section>

        <section className="instruction-section">
          <h2>Анализ</h2>
          <p>{item.analysis || '—'}</p>
        </section>

        <section className="instruction-section">
          <h2>Вывод</h2>
          <p>{item.conclusion || '—'}</p>
        </section>

        <InstructionRating instructionId={id} />
      </div>
    </div>
  )
}
