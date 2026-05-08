import { useNavigate } from "react-router-dom";
import { SiteFooter } from "../components/SiteFooter";
import { useI18n } from "../i18n/i18n";

const FEATURES = [
  { titleKey: "home.feature.goals.title", descKey: "home.feature.goals.desc", icon: "◎" },
  { titleKey: "home.feature.tasks.title", descKey: "home.feature.tasks.desc", icon: "▦" },
  { titleKey: "home.feature.logs.title", descKey: "home.feature.logs.desc", icon: "◇" },
  { titleKey: "home.feature.risks.title", descKey: "home.feature.risks.desc", icon: "⚠" },
  { titleKey: "home.feature.dashboard.title", descKey: "home.feature.dashboard.desc", icon: "▣" },
  { titleKey: "home.feature.ai.title", descKey: "home.feature.ai.desc", icon: "✦" },
] as const;

const QUOTES = [
  { textKey: "home.quote.1.text", nameKey: "home.quote.1.name", roleKey: "home.quote.1.role" },
  { textKey: "home.quote.2.text", nameKey: "home.quote.2.name", roleKey: "home.quote.2.role" },
  { textKey: "home.quote.3.text", nameKey: "home.quote.3.name", roleKey: "home.quote.3.role" },
] as const;

export function HomePage() {
  const nav = useNavigate();
  const { t } = useI18n();
  const goWorkspace = () => nav("/workspace");

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-inner">
          <p className="hero-eyebrow">{t("home.eyebrow")}</p>
          <h1 className="hero-title">
            {t("home.heroTitle1")}
            <br />
            {t("home.heroTitle2")}
          </h1>
          <p className="hero-lead">
            {t("home.heroLead")}
          </p>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary btn-lg" onClick={goWorkspace}>
              {t("home.ctaPrimary")}
            </button>
            <a className="btn btn-ghost btn-lg" href="#features">
              {t("home.ctaSecondary")}
            </a>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="section-inner">
          <h2 className="section-title">{t("home.featuresTitle")}</h2>
          <p className="section-subtitle">{t("home.featuresSubtitle")}</p>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <article key={f.titleKey} className="feature-card">
                <div className="feature-icon" aria-hidden>
                  {f.icon}
                </div>
                <h3 className="feature-title">{t(f.titleKey)}</h3>
                <p className="feature-desc">{t(f.descKey)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" id="testimonials">
        <div className="section-inner">
          <h2 className="section-title">{t("home.testimonialsTitle")}</h2>
          <p className="section-subtitle">{t("home.testimonialsSubtitle")}</p>
          <div className="quote-grid">
            {QUOTES.map((q) => (
              <blockquote key={q.nameKey} className="quote-card">
                <p className="quote-text">&ldquo;{t(q.textKey)}&rdquo;</p>
                <footer>
                  <cite className="quote-name">{t(q.nameKey)}</cite>
                  <span className="quote-role">{t(q.roleKey)}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="cta-inner">
          <h2 className="cta-title">{t("home.ctaTitle")}</h2>
          <p className="cta-text">{t("home.ctaText")}</p>
          <button type="button" className="btn btn-on-dark btn-lg" onClick={goWorkspace}>
            {t("home.ctaGo")}
          </button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
