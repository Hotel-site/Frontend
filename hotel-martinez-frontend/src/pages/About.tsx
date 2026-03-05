import '../styles/about.css'

export default function About() {
  return (
    <section className="about">
      <div className="container">
        <header className="about-hero">
          <p className="about-kicker">Since 1929</p>
          <h1>О Hôtel Martinez</h1>
          <p className="about-lead">
            Легендарный отель Канн на набережной Круазетт. Мы объединяем архитектуру ар-деко,
            французскую гастрономию и сервис уровня 5★ в одной атмосфере Лазурного Берега.
          </p>
        </header>

        <div className="about-stats">
          <article className="about-stat-card">
            <h3>97 лет</h3>
            <p>истории и гостеприимства</p>
          </article>
          <article className="about-stat-card">
            <h3>409</h3>
            <p>номеров и люксов</p>
          </article>
          <article className="about-stat-card">
            <h3>24/7</h3>
            <p>консьерж и room-service</p>
          </article>
        </div>

        <div className="about-grid">
          <article className="about-card">
            <h2>Наша философия</h2>
            <p>
              Для нас роскошь — это внимание к деталям: персональный подход, безупречный комфорт
              и эстетика, которая чувствуется в каждом элементе пребывания.
            </p>
          </article>

          <article className="about-card">
            <h2>Что вас ждёт</h2>
            <ul>
              <li>просторные номера с видом на море и Круазетт</li>
              <li>рестораны с авторским меню</li>
              <li>wellness & spa для полного восстановления</li>
              <li>трансфер и персональные маршруты по Ривьере</li>
            </ul>
          </article>
        </div>

        <section className="about-cta">
          <h2>Почувствуйте атмосферу Martinez</h2>
          <p>Выберите номер и сервисы в каталоге — и соберите своё идеальное путешествие.</p>
        </section>
      </div>
    </section>
  )
}
