import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { APP_LOGO_URL } from './utilities/constants';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, userName } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className='flex flex-wrap items-center justify-between border border-gray-200 bg-white px-4 py-3 shadow-sm'>
      <div className='flex items-center gap-3'>
        <img className='h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 p-1' src={APP_LOGO_URL} alt='app logo' />
        <div>
          <p className='text-base font-semibold text-slate-900'>POS Frontend</p>
          {isAuthenticated && userName && (
            <p className='text-sm text-slate-500'>Logged in as <span className='font-semibold text-slate-900'>{userName}</span></p>
          )}
        </div>
      </div>

      {isAuthenticated && (
        <button
          type='button'
          onClick={handleLogout}
          className='rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300'
        >
          Logout
        </button>
      )}
    </div>
  );
};

export default Header;