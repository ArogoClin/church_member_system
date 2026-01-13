import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UsersRound, UserCog, X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const navLinks = [
    {
      to: '/',
      icon: LayoutDashboard,
      label: 'Dashboard'
    },
    {
      to: '/members',
      icon: Users,
      label: 'Members'
    },
    {
      to: '/jumuias',
      icon: UsersRound,
      label: 'Jumuias'
    },
    {
      to: '/groups',
      icon: UserCog,
      label: 'Groups'
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 
          overflow-y-auto z-40 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Close button for mobile */}
        <div className="lg:hidden p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;