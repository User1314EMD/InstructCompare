import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Instruction from './pages/Instruction'

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/instruction/:id" element={<Instruction />} />
        </Routes>
      </main>
      <footer className="site-footer">
        InstructCompare. Демонстрационный проект.
      </footer>
    </>
  )
}
