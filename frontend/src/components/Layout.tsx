import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Kits" },
    { path: "/items", label: "Inventory" },
    { path: "/notifications", label: "Notifications" },
  ];

  return (
    <div className="flex min-h-screen bg-white transition-colors duration-200 dark:bg-gray-900">
      <nav className="w-64 bg-gray-800 p-6 text-white dark:bg-gray-950">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Savage Supply</h1>
          <ThemeToggle />
        </div>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`block rounded p-2 ${
                  location.pathname === item.path
                    ? "bg-blue-600 dark:bg-blue-500"
                    : "hover:bg-gray-700 dark:hover:bg-gray-800"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <main className="flex-1 overflow-auto bg-gray-50 transition-colors duration-200 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
};
