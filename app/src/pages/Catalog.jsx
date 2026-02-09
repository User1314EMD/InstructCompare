import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const DATA_URL = '/data/instructions.json'

function imageSrc(img) {
  if (!img) return ''
  if (/^https?:\/\//i.test(img)) return img
  return (img.startsWith('/') ? '' : '/') + img
}

function uniqueSorted(arr) {
  return [...new Set(arr)].filter(Boolean).sort()
}

export default function Catalog() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [airline, setAirline] = useState('')
  const [aircraft, setAircraft] = useState('')
  const [country, setCountry] = useState('')
  const [year, setYear] = useState('')

  useEffect(() => {
    fetch(DATA_URL)
      .then((r) => r.json())
      .then((data) => { setList(data); setError(null) })
      .catch(() => setError('Не удалось загрузить данные. Проверьте наличие public/data/instructions.json.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = list.filter((i) => {
    if (airline && i.airline !== airline) return false
    if (aircraft && i.aircraft !== aircraft) return false
    if (country && i.country !== country) return false
    if (year && String(i.year) !== year) return false
    return true
  })

  const airlines = uniqueSorted(list.map((i) => i.airline))
  const aircrafts = uniqueSorted(list.map((i) => i.aircraft))
  const countries = uniqueSorted(list.map((i) => i.country))
  const years = uniqueSorted(list.map((i) => String(i.year)))

  if (loading) {
    return (
      <div className="catalog">
        <p className="catalog-empty">Загрузка…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="catalog">
        <p className="catalog-empty">{error}</p>
      </div>
    )
  }

  return (
    <>
      <div className="page-header">
        <h1>Каталог инструкций</h1>
        <p>Выберите инструкцию для просмотра описания, анализа и вывода. Используйте фильтры для поиска.</p>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="filter-airline">Авиакомпания</label>
          <select id="filter-airline" value={airline} onChange={(e) => setAirline(e.target.value)}>
            <option value="">Все</option>
            {airlines.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filter-aircraft">Тип самолёта</label>
          <select id="filter-aircraft" value={aircraft} onChange={(e) => setAircraft(e.target.value)}>
            <option value="">Все</option>
            {aircrafts.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filter-country">Страна</label>
          <select id="filter-country" value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">Все</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filter-year">Год</label>
          <select id="filter-year" value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">Все</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="catalog">
        <div className="catalog-grid">
          {filtered.map((item) => (
            <Link key={item.id} to={`/instruction/${item.id}`} className="card">
              <div className="card-image-wrap">
                <img className="card-image" src={imageSrc(item.image)} alt={`${item.airline} — ${item.aircraft}`} loading="lazy" />
              </div>
              <div className="card-body">
                <h2 className="card-title">{item.airline}</h2>
                <p className="card-meta">
                  <span>{item.aircraft}</span>
                  <span>{item.country}</span>
                  <span>{String(item.year)}</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="catalog-empty">По выбранным фильтрам инструкций не найдено.</p>
        )}
      </div>
    </>
  )
}
