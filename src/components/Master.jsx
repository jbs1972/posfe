import React from 'react';
import { Outlet } from 'react-router-dom';

const Master = () => {
  return (
    <div>
      <h1 className='text-3xl font-bold text-slate-700 mb-6'>
        Master Module
      </h1>

      {/* Child Route Render Area */}
      <Outlet />
    </div>
  );
};

export default Master;