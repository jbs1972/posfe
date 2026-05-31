import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import {
    createBrowserRouter,
    RouterProvider,
    Outlet
} from "react-router-dom";

import Header from './Header';
import Sidebar from './Sidebar';

import Dashboard from './components/Dashboard.jsx';
import About from './components/About.jsx';

import Master from './components/Master.jsx';
import Company from './components/Company.jsx';
import Unit from './components/Unit.jsx';
import Product from './components/Product.jsx';

import Transaction from './components/Transaction.jsx';
import Purchase from './components/Purchase.jsx';
import Sale from './components/Sale.jsx';

import Error from './Error';

const AppLayout = () => {
    return (
        <div>
            <Header />

            {/* Main Layout */}
            <div className='flex'>

                <Sidebar />

                {/* Dynamic Page Content */}
                <div className='flex-1 p-4'>
                    <Outlet />
                </div>

            </div>
        </div>
    );
};

const appRouter = createBrowserRouter([
    {
        path: "/",
        element: <AppLayout />,
        errorElement: <Error />,

        children: [
            {
                path: "/",
                element: <Dashboard />
            },

            /* Nested Route */
            {
                path: "/master",
                element: <Master />,

                children: [
                    {
                        path: "company",
                        element: <Company />
                    },
                    {
                        path: "unit",
                        element: <Unit />
                    },
                    {
                        path: "product",
                        element: <Product />
                    }
                ]
            },

            /* TRANSACTION MODULE */
            {
                path: "/transaction",
                element: <Transaction />,

                children: [
                    {
                        path: "purchase",
                        element: <Purchase />
                    },
                    {
                        path: "sale",
                        element: <Sale />
                    }
                ]
            },

            {
                path: "/about",
                element: <About />
            },
        ]
    }
]);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <RouterProvider router={appRouter} />
    </StrictMode>
);