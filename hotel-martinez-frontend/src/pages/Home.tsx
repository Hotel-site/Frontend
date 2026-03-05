import { Link } from 'react-router-dom'
import '../styles/home.css'

export default function Home() {
  return (
    <section className="hero">
      <div className="container hero__content">
        <h1>Hôtel Martinez — Cannes</h1>
        <p>
          Легендарный отель на набережной Круазетт: люксы с видом на море,
          изысканная гастрономия, SPA и безупречный сервис Французской Ривьеры.
        </p>
        <Link className="hero__btn" to="/catalog">Перейти к каталогу</Link>
      </div>
    </section>
  )
}
