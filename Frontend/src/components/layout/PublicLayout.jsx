import Nav from '../Nav.jsx';
import Footer from '../Footer.jsx';

export default function PublicLayout({
  children,
  sections,
  onToggleTheme,
  onSecret,
  projectPage = false,
}) {
  return (
    <div className="shell">
      <Nav
        sections={sections}
        onToggleTheme={onToggleTheme}
        basePath={projectPage ? '/#' : ''}
      />
      <main id="main">{children}</main>
      <Footer onSecret={onSecret} />
    </div>
  );
}
