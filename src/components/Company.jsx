import React, { useEffect, useState } from 'react';

import axios from 'axios';

const Company = () => {

    // =========================================================
    // AXIOS INSTANCE
    // =========================================================

    const api = axios.create({
        baseURL: 'http://localhost:8080/api'
    });

    // =========================================================
    // STATES
    // =========================================================

    const [companies, setCompanies] = useState([]);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState('');

    const [currentPage, setCurrentPage] = useState(0);

    const [totalPages, setTotalPages] = useState(0);

    const [totalElements, setTotalElements] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');

    const [sortField, setSortField] = useState('companyId');

    const [sortDirection, setSortDirection] = useState('asc');

    const [openModal, setOpenModal] = useState(false);

    // =========================================================
    // FORM STATES
    // =========================================================

    const [formData, setFormData] = useState({
        cname: '',
        cabbr: ''
    });

    const [formErrors, setFormErrors] = useState({});

    const [saving, setSaving] = useState(false);

    const [toggleLoadingId, setToggleLoadingId] = useState(null);

    const pageSize = 10;

    // =========================================================
    // FETCH COMPANIES
    // =========================================================

    const fetchCompanies = async (
        page = 0,
        search = '',
        field = 'companyId',
        direction = 'asc'
    ) => {

        try {

            setLoading(true);

            const response = await api.get('/companies/page', {

                params: {
                    page: page,
                    size: pageSize,
                    sort: `${field},${direction}`
                }

            });

            let fetchedCompanies = response.data.data.content;

            // SEARCH

            if (search.trim() !== '') {

                fetchedCompanies = fetchedCompanies.filter((company) =>

                    company.cname
                        .toLowerCase()
                        .includes(search.toLowerCase())

                    ||

                    company.cabbr
                        .toLowerCase()
                        .includes(search.toLowerCase())
                );
            }

            setCompanies(fetchedCompanies);

            setCurrentPage(response.data.data.number);

            setTotalPages(response.data.data.totalPages);

            setTotalElements(response.data.data.totalElements);

        } catch (err) {

            setError('Failed to fetch companies');

        } finally {

            setLoading(false);
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        fetchCompanies(
            currentPage,
            searchTerm,
            sortField,
            sortDirection
        );

    }, [currentPage, sortField, sortDirection]);

    // =========================================================
    // SEARCH
    // =========================================================

    useEffect(() => {

        const delayDebounce = setTimeout(() => {

            fetchCompanies(
                0,
                searchTerm,
                sortField,
                sortDirection
            );

            setCurrentPage(0);

        }, 400);

        return () => clearTimeout(delayDebounce);

    }, [searchTerm]);

    // =========================================================
    // SORTING
    // =========================================================

    const handleSort = (field) => {

        if (sortField === field) {

            setSortDirection(
                sortDirection === 'asc'
                    ? 'desc'
                    : 'asc'
            );

        } else {

            setSortField(field);

            setSortDirection('asc');
        }
    };

    const getSortIcon = (field) => {

        if (sortField !== field) {
            return '⇅';
        }

        return sortDirection === 'asc'
            ? '▲'
            : '▼';
    };

    // =========================================================
    // PAGINATION
    // =========================================================

    const handlePrevious = () => {

        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNext = () => {

        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    // =========================================================
    // INPUT CHANGE
    // =========================================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

        setFormErrors({
            ...formErrors,
            [name]: ''
        });
    };

    // =========================================================
    // VALIDATION
    // =========================================================

    const validateForm = () => {

        const errors = {};

        if (!formData.cname.trim()) {
            errors.cname = 'Company name is required';
        }

        if (!formData.cabbr.trim()) {
            errors.cabbr = 'Company abbreviation is required';
        }

        if (formData.cabbr.length > 10) {
            errors.cabbr =
                'Company abbreviation cannot exceed 10 characters';
        }

        setFormErrors(errors);

        return Object.keys(errors).length === 0;
    };

    // =========================================================
    // SAVE COMPANY
    // =========================================================

    const saveCompany = async (e) => {

        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {

            setSaving(true);

            await api.post('/companies', formData);

            // RESET FORM

            setFormData({
                cname: '',
                cabbr: ''
            });

            setFormErrors({});

            // CLOSE MODAL

            setOpenModal(false);

            // REFRESH TABLE

            fetchCompanies(
                currentPage,
                searchTerm,
                sortField,
                sortDirection
            );

        } catch (err) {

            setFormErrors({
                apiError:
                    err.response?.data?.message
                    ||
                    'Failed to save company'
            });

        } finally {

            setSaving(false);
        }
    };

    // =========================================================
    // TOGGLE ACTIVE STATUS
    // =========================================================

    const toggleCompanyStatus = async (
        companyId,
        currentStatus
    ) => {

        try {

            setToggleLoadingId(companyId);

            await api.patch(
                `/companies/${companyId}`,
                {
                    active: !currentStatus
                }
            );

            // UPDATE LOCAL STATE

            setCompanies((prevCompanies) =>

                prevCompanies.map((company) =>

                    company.companyId === companyId

                        ? {
                            ...company,
                            active: !currentStatus
                        }

                        : company
                )
            );

        } catch (err) {

            alert(
                err.response?.data?.message
                ||
                'Failed to update status'
            );

        } finally {

            setToggleLoadingId(null);
        }
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div className='flex justify-center items-center h-52'>

                <h1 className='text-2xl font-bold text-cyan-700'>
                    Loading Companies...
                </h1>

            </div>
        );
    }

    return (

        <div className='p-6'>

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className='flex flex-col md:flex-row justify-between items-center gap-4 mb-6'>

                <div>

                    <h1 className='text-3xl font-bold text-cyan-700'>
                        Company Management
                    </h1>

                    <p className='text-gray-500 mt-1'>
                        Total Companies : {totalElements}
                    </p>

                </div>

                <div className='flex gap-3 w-full md:w-auto'>

                    {/* SEARCH */}

                    <input
                        type='text'
                        placeholder='Search company...'
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(e.target.value)
                        }
                        className='border border-gray-300 rounded-lg px-4 py-2
                        focus:outline-none focus:ring-2 focus:ring-cyan-500'
                    />

                    {/* ADD BUTTON */}

                    <button
                        onClick={() => setOpenModal(true)}
                        className='bg-cyan-700 hover:bg-cyan-800
                        text-white font-semibold px-5 py-2 rounded-lg
                        shadow-md transition'
                    >
                        + Add Company
                    </button>

                </div>

            </div>

            {/* ================================================= */}
            {/* TABLE */}
            {/* ================================================= */}

            <div className='overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200'>

                <table className='min-w-full text-sm text-left'>

                    <thead className='bg-cyan-700 text-white uppercase text-xs'>

                        <tr>

                            <th
                                onClick={() => handleSort('companyId')}
                                className='px-6 py-4 cursor-pointer'
                            >
                                ID {getSortIcon('companyId')}
                            </th>

                            <th
                                onClick={() => handleSort('cname')}
                                className='px-6 py-4 cursor-pointer'
                            >
                                Company Name {getSortIcon('cname')}
                            </th>

                            <th
                                onClick={() => handleSort('cabbr')}
                                className='px-6 py-4 cursor-pointer'
                            >
                                Abbreviation {getSortIcon('cabbr')}
                            </th>

                            <th className='px-6 py-4'>
                                Status
                            </th>

                            <th className='px-6 py-4'>
                                Created At
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {
                            companies.length > 0 ? (

                                companies.map((company) => (

                                    <tr
                                        key={company.companyId}
                                        className='border-b hover:bg-cyan-50'
                                    >

                                        <td className='px-6 py-4'>
                                            {company.companyId}
                                        </td>

                                        <td className='px-6 py-4 font-semibold'>
                                            {company.cname}
                                        </td>

                                        <td className='px-6 py-4'>
                                            {company.cabbr}
                                        </td>

                                        {/* ================================= */}
                                        {/* TOGGLE BUTTON */}
                                        {/* ================================= */}

                                        <td className='px-6 py-4'>

                                            <button
                                                onClick={() =>
                                                    toggleCompanyStatus(
                                                        company.companyId,
                                                        company.active
                                                    )
                                                }
                                                disabled={
                                                    toggleLoadingId === company.companyId
                                                }
                                                className={`
                                                    relative inline-flex h-7 w-14
                                                    items-center rounded-full
                                                    transition-all duration-300
                                                    focus:outline-none

                                                    ${
                                                        company.active
                                                            ? 'bg-green-500'
                                                            : 'bg-red-500'
                                                    }

                                                    ${
                                                        toggleLoadingId === company.companyId
                                                            ? 'opacity-50 cursor-not-allowed'
                                                            : 'cursor-pointer'
                                                    }
                                                `}
                                            >

                                                <span
                                                    className={`
                                                        inline-block h-5 w-5
                                                        transform rounded-full
                                                        bg-white transition-all
                                                        duration-300 shadow-md

                                                        ${
                                                            company.active
                                                                ? 'translate-x-8'
                                                                : 'translate-x-1'
                                                        }
                                                    `}
                                                />

                                            </button>

                                        </td>

                                        <td className='px-6 py-4 text-gray-500'>
                                            {
                                                new Date(company.createdAt)
                                                    .toLocaleString()
                                            }
                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>

                                    <td
                                        colSpan='5'
                                        className='text-center py-6 text-gray-500'
                                    >
                                        No Companies Found
                                    </td>

                                </tr>
                            )
                        }

                    </tbody>

                </table>

            </div>

            {/* ================================================= */}
            {/* PAGINATION */}
            {/* ================================================= */}

            <div className='flex justify-between items-center mt-6'>

                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 0}
                    className={`
                        px-5 py-2 rounded-lg font-semibold

                        ${
                            currentPage === 0
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-cyan-700 text-white hover:bg-cyan-800'
                        }
                    `}
                >
                    Previous
                </button>

                <div className='font-medium text-gray-700'>
                    Page {currentPage + 1} of {totalPages}
                </div>

                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages - 1}
                    className={`
                        px-5 py-2 rounded-lg font-semibold

                        ${
                            currentPage === totalPages - 1
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-cyan-700 text-white hover:bg-cyan-800'
                        }
                    `}
                >
                    Next
                </button>

            </div>

            {/* ================================================= */}
            {/* MODAL */}
            {/* ================================================= */}

            {
                openModal && (

                    <div
                        className='fixed inset-0 bg-black bg-opacity-40
                        flex justify-center items-center z-50'
                    >

                        <div
                            className='bg-white rounded-2xl shadow-2xl
                            w-full max-w-md p-6'
                        >

                            {/* HEADER */}

                            <div className='flex justify-between items-center mb-5'>

                                <h2 className='text-2xl font-bold text-cyan-700'>
                                    Add Company
                                </h2>

                                <button
                                    onClick={() => setOpenModal(false)}
                                    className='text-gray-500 hover:text-red-600 text-xl'
                                >
                                    ✕
                                </button>

                            </div>

                            {/* FORM */}

                            <form onSubmit={saveCompany}>

                                {/* API ERROR */}

                                {
                                    formErrors.apiError && (

                                        <div
                                            className='bg-red-100 text-red-700
                                            px-4 py-3 rounded-lg mb-4'
                                        >
                                            {formErrors.apiError}
                                        </div>
                                    )
                                }

                                {/* COMPANY NAME */}

                                <div className='mb-4'>

                                    <label className='block mb-2 font-semibold text-gray-700'>
                                        Company Name
                                    </label>

                                    <input
                                        type='text'
                                        name='cname'
                                        value={formData.cname}
                                        onChange={handleChange}
                                        className='w-full border border-gray-300
                                        rounded-lg px-4 py-2 focus:outline-none
                                        focus:ring-2 focus:ring-cyan-500'
                                    />

                                    {
                                        formErrors.cname && (

                                            <p className='text-red-600 text-sm mt-1'>
                                                {formErrors.cname}
                                            </p>
                                        )
                                    }

                                </div>

                                {/* COMPANY ABBR */}

                                <div className='mb-5'>

                                    <label className='block mb-2 font-semibold text-gray-700'>
                                        Company Abbreviation
                                    </label>

                                    <input
                                        type='text'
                                        name='cabbr'
                                        value={formData.cabbr}
                                        onChange={handleChange}
                                        className='w-full border border-gray-300
                                        rounded-lg px-4 py-2 focus:outline-none
                                        focus:ring-2 focus:ring-cyan-500'
                                    />

                                    {
                                        formErrors.cabbr && (

                                            <p className='text-red-600 text-sm mt-1'>
                                                {formErrors.cabbr}
                                            </p>
                                        )
                                    }

                                </div>

                                {/* BUTTONS */}

                                <div className='flex justify-end gap-3'>

                                    <button
                                        type='button'
                                        onClick={() => setOpenModal(false)}
                                        className='px-5 py-2 rounded-lg border
                                        border-gray-300 hover:bg-gray-100'
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type='submit'
                                        disabled={saving}
                                        className='bg-cyan-700 hover:bg-cyan-800
                                        text-white px-5 py-2 rounded-lg
                                        font-semibold shadow-md'
                                    >
                                        {
                                            saving
                                                ? 'Saving...'
                                                : 'Save Company'
                                        }
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>
                )
            }

        </div>
    );
};

export default Company;