import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className='w-52 min-h-screen bg-slate-100 border-r border-gray-300 shadow-md'>
            <ul className='p-4 font-semibold text-lg text-slate-700'>
                <li className='mb-4'>
                    <Link to="/">Dashboard</Link>
                </li>
                <li className='mb-4'>
                    <Link to="/about">About</Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;