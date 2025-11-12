import { Link, useLocation } from 'react-router-dom';

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="navigation">
      <Link
        to="/"
        className={location.pathname === '/' ? 'active' : ''}
      >
        Trades
      </Link>
      <Link
        to="/portfolio"
        className={location.pathname === '/portfolio' ? 'active' : ''}
      >
        Portfolio
      </Link>
    </nav>
  );
}



