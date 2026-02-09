import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section className="hero">
      <span className="hero-icon">✈</span>
      <h1>InstructCompare</h1>
      <p>
        Демонстрационный сайт для просмотра и сравнения инструкций по безопасности
        разных авиакомпаний и типов воздушных судов. Здесь можно изучить оформление,
        структуру и подачу информации в карточках безопасности.
      </p>
      <p>
        <strong>Сайт не является аналитическим сервисом</strong> — он служит
        визуальной витриной и архивом для ознакомления с коллекцией.
      </p>
      <Link to="/catalog" className="btn">Перейти в каталог инструкций</Link>
      <div className="hero-features">
        <div className="hero-feature">
          <span className="hero-feature-icon">📋</span>
          <span>33+ инструкций</span>
        </div>
        <div className="hero-feature">
          <span className="hero-feature-icon">🔍</span>
          <span>Фильтры и поиск</span>
        </div>
        <div className="hero-feature">
          <span className="hero-feature-icon">📊</span>
          <span>Анализ и выводы</span>
        </div>
      </div>
    </section>
  )
}
