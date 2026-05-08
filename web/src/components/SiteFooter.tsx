import { useI18n } from "../i18n/i18n";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span className="site-footer-brand">{t("app.name")}</span>
        <span className="site-footer-note">{t("footer.note")}</span>
      </div>
    </footer>
  );
}
