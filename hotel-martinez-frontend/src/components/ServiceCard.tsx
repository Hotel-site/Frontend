import type { Service } from '../types/service'
import '../styles/service-card.css'

type Props = { service: Service }

export default function ServiceCard({ service }: Props) {
  return (
    <article className="service-card">
      <div className="service-card__icon-wrap">
        <span className="service-card__icon">{service.icon}</span>
      </div>
      <div className="service-card__top">
        <span className="service-card__category">{service.category}</span>
        {service.popular && <span className="service-card__badge">Популярно</span>}
      </div>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
    </article>
  )
}
