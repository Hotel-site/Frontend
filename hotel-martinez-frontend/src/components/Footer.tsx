import '../styles/footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__left">
          <p>Hôtel Martinez — исторический отель Франции</p>
          <p>© 2026 Hôtel Martinez. 5 Starts Hotel.</p>
        </div>
        <div className="footer__right">
          <p>Контакты:</p>
          <a className="footer__email" href="mailto:info@martinez-hotel.com">info@martinez-hotel.com</a>
        </div>
      </div>
    </footer>
  )
}