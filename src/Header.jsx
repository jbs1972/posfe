import { APP_LOGO_URL } from './utilities/constants';

const Header = () => {

  return (
    <div className='flex flex-wrap justify-between border border-gray-600 rounded-lg mx-1 bg-green-50 shadow-lg'>
      <div>
        <img className='w-16 m-4 rounded-lg' src={APP_LOGO_URL} alt='app_logo' />
      </div>
    </div>
  );
};

export default Header;