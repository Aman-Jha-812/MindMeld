const Header = ({ title, subtitle, actions }) => {
  return (
    <header className="sticky top-0 z-10 bg-sidebar/80 backdrop-blur-md border-b border-line">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          {title && (
            <h1 className="text-xl font-bold text-ink">{title}</h1>
          )}
          {subtitle && (
            <p className="text-sm text-ink-secondary mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3">{actions}</div>
        )}
      </div>
    </header>
  );
};

export default Header;
