import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import {
    createBrowserRouter,
    RouterProvider,
    Outlet,
    Navigate
} from 'react-router-dom';

import Header from './Header';
import Sidebar from './Sidebar';

import Dashboard from './components/Dashboard.jsx';
import About from './components/About.jsx';

import Master from './components/Master.jsx';
import User from './components/User.jsx';
import Company from './components/Company.jsx';
import Unit from './components/Unit.jsx';
import Product from './components/Product.jsx';
import Vendor from './components/Vendor.jsx';
import Customer from './components/Customer.jsx';
import FinancialYear from './components/FinancialYear.jsx';

import Transaction from './components/Transaction.jsx';
import Purchase from './components/Purchase.jsx';
import Sale from './components/Sale.jsx';

import Error from './Error';
import Login from './pages/auth/Login.jsx';
import ForgotPasswordRequest from './pages/auth/ForgotPasswordRequest.jsx';
import ForgotPasswordVerifyOtp from './pages/auth/ForgotPasswordVerifyOtp.jsx';
import ForgotPasswordReset from './pages/auth/ForgotPasswordReset.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

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

const ProtectedLayout = () => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <AppLayout />;
};

const appRouter = createBrowserRouter([
    {
        path: "/",
        element: <ProtectedLayout />,
        errorElement: <Error />,

        children: [
            {
                index: true,
                element: <Dashboard />
            },
            {
                path: "dashboard",
                element: <Dashboard />
            },

            /* Nested Route */
            {
                path: "master",
                element: <Master />,

                children: [
                    {
                        path: "user",
                        element: <User />
                    },
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
                    },
                    {
                        path: "vendor",
                        element: <Vendor />
                    },
                    {
                        path: "customer",
                        element: <Customer />
                    },
                    {
                        path: "financial-year",
                        element: <FinancialYear />
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
    },
    {
        path: "/login",
        element: <Login />,
        errorElement: <Error />
    },
    {
        path: "/forgot-password",
        element: <ForgotPasswordRequest />,
        errorElement: <Error />
    },
    {
        path: "/forgot-password/verify-otp",
        element: <ForgotPasswordVerifyOtp />,
        errorElement: <Error />
    },
    {
        path: "/forgot-password/reset",
        element: <ForgotPasswordReset />,
        errorElement: <Error />
    }
]);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <RouterProvider router={appRouter} />
        </AuthProvider>
    </StrictMode>
);