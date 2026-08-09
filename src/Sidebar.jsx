import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

const Sidebar = () => {
    const { userRole } = useAuth();

    return (
        <div className='w-60 min-h-screen bg-slate-100 border-r border-gray-300 shadow-md'>

            <ul className='p-4 font-semibold text-lg text-slate-700'>

                <li className='mb-4'>
                    <Link to="/">Dashboard</Link>
                </li>

                {/* Master Menu */}
                <li className='mb-2'>
                    <div className='text-slate-800 font-bold'>
                        Master
                    </div>

                    {/* Submenus */}
                    <ul className='ml-4 mt-2 text-base font-medium text-slate-600'>

                        {userRole === 'ROLE_ADMIN' && (
                            <li className='mb-2 hover:text-blue-600'>
                                <Link to="/master/user">
                                    User
                                </Link>
                            </li>
                        )}

                        <li className='mb-2 hover:text-blue-600'>
                            <Link to="/master/company">
                                Company
                            </Link>
                        </li>

                        <li className='mb-2 hover:text-blue-600'>
                            <Link to="/master/unit">
                                Unit
                            </Link>
                        </li>

                        <li className='mb-2 hover:text-blue-600'>
                            <Link to="/master/product">
                                Product
                            </Link>
                        </li>

                        <li className='mb-2 hover:text-blue-600'>
                            <Link to="/master/vendor">
                                Vendor
                            </Link>
                        </li>

                        <li className='mb-2 hover:text-blue-600'>
                            <Link to="/master/financial-year">
                                Financial Year
                            </Link>
                        </li>

                    </ul>
                </li>

                {/* Transaction Menu */}
                <li>

                    <div className='text-slate-800 font-bold'>
                        Transaction
                    </div>

                    <ul className='ml-4 mt-2 text-base font-medium text-slate-600'>

                        <li className='mb-2 hover:text-blue-600'>
                            <Link to="/transaction/purchase">
                                Purchase
                            </Link>
                        </li>

                        <li className='mb-2 hover:text-blue-600'>
                            <Link to="/transaction/sale">
                                Sale
                            </Link>
                        </li>

                    </ul>

                </li>

                <li className='mb-4'>
                    <Link to="/about">About</Link>
                </li>

            </ul>

        </div>
    );
};

export default Sidebar;