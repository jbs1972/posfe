import React from 'react';
import { Outlet } from 'react-router-dom';

const Transaction = () => {
    return (
        <div>

            <h1 className='text-3xl font-bold text-slate-700 mb-6'>
                Transaction Module
            </h1>

            {/* Child Routes Render Here */}
            <Outlet />

        </div>
    );
};

export default Transaction;