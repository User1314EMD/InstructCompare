import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="site-logo">InstructCompare</Link>
        <nav>
          <ThemeToggle />
          <ul className="nav-links">
            <li><Link to="/">Главная</Link></li>
            <li><Link to="/catalog">Каталог</Link></li>
            <li><Link to="/rating">Оценка</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
