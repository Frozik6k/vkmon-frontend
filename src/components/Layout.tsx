import { PropsWithChildren } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Дашборд' },
  { to: '/auth', label: 'Логин / Регистрация' },
  { to: '/accounts', label: 'VK аккаунты' },
  { to: '/auto-posting', label: 'Автопостинг' },
  { to: '/ai', label: 'AI контент' },
  { to: '/logs', label: 'Логи и биллинг' },
];

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>VKmon Frontend</h1>
        <div className="nav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </aside>
      <main>{children}</main>
    </div>
  );
}
