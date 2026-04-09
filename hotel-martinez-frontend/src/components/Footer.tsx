import '../styles/footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__left">
          <p>Hôtel Martinez — исторический отель Франции</p>

          <div className="footer__signature">
            {/* Replace this placeholder with your real logo (e.g. /logo.svg) */}
            <img
              className="footer__logo"
              src="/martinez-logo-placeholder.svg"
              alt="Hôtel Martinez logo"
            />
            <span>© 2026 Hôtel Martinez. 5 Starts Hotel.</span>
          </div>
        </div>
        <div className="footer__right">
          <p>Контакты:</p>
          <a className="footer__email" href="mailto:info@martinez-hotel.com">info@martinez-hotel.com</a>
        </div>
      </div>
    </footer>
  )
}