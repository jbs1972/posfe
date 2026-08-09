import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

// =====================================================
// MODAL COMPONENTS (Outside to prevent re-creation)
// =====================================================

const CompanyModal = ({
    title,
    data,
    errors,
    setData,
    setErrors,
    onSubmit,
    onClose,
    loading,
    buttonText,
    handleChange
}) => (
    <div
        className='fixed inset-0 bg-black/40
        flex justify-center items-center z-50'
    >
        <div
            className='bg-white w-full max-w-sm
            rounded-lg shadow-lg p-4'
        >
            <div className='flex justify-between mb-5'>
                <h2
                    className='text-lg font-semibold
                    text-cyan-700'
                >
                    {title}
                </h2>

                <button
                    onClick={onClose}
                    className='text-xl'
                >
                    ✕
                </button>
            </div>

            <form onSubmit={onSubmit}>
                {
                    errors.apiError && (
                        <div
                            className='bg-red-100
                            text-red-700 p-3 rounded-lg mb-4'
                        >
                            {errors.apiError}
                        </div>
                    )
                }

                {
                    ['cname', 'cabbr'].map(field => (
                        <div
                            key={field}
                            className='mb-4'
                        >
                            <label
                                className='block mb-2
                                font-semibold'
                            >
                                {
                                    field === 'cname'
                                        ? 'Company Name'
                                        : 'Company Abbreviation'
                                }
                            </label>

                            <input
                                type='text'
                                name={field}
                                value={data[field]}
                                onChange={(e) =>
                                    handleChange(
                                        e,
                                        setData,
                                        errors,
                                        setErrors
                                    )
                                }
                                className='w-full border
                                rounded-md px-3 py-1.5 text-sm
                                focus:ring-2
                                focus:ring-cyan-500'
                            />

                            {
                                errors[field] && (
                                    <p
                                        className='text-red-600
                                        text-sm mt-1'
                                    >
                                        {errors[field]}
                                    </p>
                                )
                            }
                        </div>
                    ))
                }

                <div className='flex justify-end gap-3 mt-5'>
                    <button
                        type='button'
                        onClick={onClose}
                        className='px-4 py-1.5 text-sm border
                        rounded-md hover:bg-gray-100'
                    >
                        Cancel
                    </button>

                    <button
                        type='submit'
                        disabled={loading}
                        className='bg-cyan-700
                        hover:bg-cyan-800
                        text-white px-4 py-1.5 text-sm
                        rounded-md'
                    >
                        {
                            loading
                                ? 'Processing...'
                                : buttonText
                        }
                    </button>
                </div>
            </form>
        </div>
    </div>
);

const DeleteConfirmationModal = ({
    company,
    onCancel,
    onConfirm,
    loading,
    error
}) => (
    <div
        className='fixed inset-0 bg-black/40
        flex justify-center items-center z-50'
    >
        <div
            className='bg-white w-full max-w-sm
            rounded-lg shadow-lg p-4'
        >
            <div className='flex justify-between mb-5'>
                <h2
                    className='text-lg font-semibold
                    text-cyan-700'
                >
                    Confirm Deletion
                </h2>

                <button
                    onClick={onCancel}
                    className='text-xl'
                >
                    ✕
                </button>
            </div>

            <p className='text-gray-700 mb-4'>
                Are you sure you want to permanently delete
                the company <strong>{company?.cname}</strong>? This action cannot be undone.
            </p>

            {error && (
                <div
                    className='bg-red-100 text-red-700
                    p-3 rounded-lg mb-4'
                >
                    {error}
                </div>
            )}

            <div className='flex justify-end gap-3 mt-5'>
                <button
                    type='button'
                    onClick={onCancel}
                    className='px-5 py-2 border
                    rounded-lg hover:bg-gray-100'
                >
                    Cancel
                </button>

                <button
                    type='button'
                    onClick={onConfirm}
                    disabled={loading}
                    className='bg-red-700
                    hover:bg-red-800
                    text-white px-5 py-2
                    rounded-lg'
                >
                    {loading ? 'Deleting...' : 'Delete Company'}
                </button>
            </div>
        </div>
    </div>
);

const Company = () => {
    const { token } = useAuth();

    const api = axios.create({
        baseURL: 'http://localhost:8080/api',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });

    // =====================================================
    // STATES
    // =====================================================

    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');

    const [sortField, setSortField] = useState('companyId');
    const [sortDirection, setSortDirection] = useState('asc');

    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);

    const isFirstPage = currentPage === 0;
    const isLastPage = currentPage === totalPages - 1;

    const [saving, setSaving] = useState(false);
    const [editSaving, setEditSaving] = useState(false);

    const [toggleLoadingId, setToggleLoadingId] =
        useState(null);

    const [formErrors, setFormErrors] = useState({});
    const [editErrors, setEditErrors] = useState({});
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const pageSize = 10;

    // =====================================================
    // FORM STATES
    // =====================================================

    const initialForm = {
        cname: '',
        cabbr: ''
    };

    const initialEditForm = {
        companyId: '',
        cname: '',
        cabbr: ''
    };

    const [formData, setFormData] =
        useState(initialForm);

    const [editFormData, setEditFormData] =
        useState(initialEditForm);

    // =====================================================
    // FETCH COMPANIES
    // =====================================================

    const fetchCompanies = async (
        page = 0,
        search = '',
        field = 'companyId',
        direction = 'asc'
    ) => {

        try {

            setLoading(true);

            const response = await api.get(
                '/companies/page',
                {
                    params: {
                        page,
                        size: pageSize,
                        sort: `${field},${direction}`
                    }
                }
            );

            let data = response.data.data.content;

            if (search.trim()) {

                data = data.filter(company =>

                    company.cname
                        .toLowerCase()
                        .includes(search.toLowerCase())

                    ||

                    company.cabbr
                        .toLowerCase()
                        .includes(search.toLowerCase())
                );
            }

            setCompanies(data);

            setCurrentPage(response.data.data.number);

            setTotalPages(response.data.data.totalPages);

            setTotalElements(
                response.data.data.totalElements
            );

        } catch {

            alert('Failed to fetch companies');

        } finally {

            setLoading(false);
        }
    };

    // =====================================================
    // EFFECTS
    // =====================================================

    useEffect(() => {

        const delay = searchTerm.trim() ? 400 : 0;

        const timer = setTimeout(() => {
            fetchCompanies(
                currentPage,
                searchTerm,
                sortField,
                sortDirection
            );
        }, delay);

        return () => clearTimeout(timer);

    }, [currentPage, searchTerm, sortField, sortDirection]);

    // =====================================================
    // COMMON FUNCTIONS
    // =====================================================

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

    const getSortIcon = (field) =>

        sortField !== field
            ? '⇅'
            : sortDirection === 'asc'
                ? '▲'
                : '▼';

    const validate = (data, setErrors) => {

        const errors = {};

        if (!data.cname.trim()) {
            errors.cname = 'Company name is required';
        }

        if (!data.cabbr.trim()) {
            errors.cabbr =
                'Company abbreviation is required';
        }

        if (data.cabbr.length > 10) {
            errors.cabbr =
                'Maximum 10 characters allowed';
        }

        setErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleChange = (
        e,
        setter,
        errors,
        setErrors
    ) => {

        const { name, value } = e.target;

        setter(prev => ({
            ...prev,
            [name]: value
        }));

        setErrors({
            ...errors,
            [name]: ''
        });
    };

    // =====================================================
    // ADD COMPANY
    // =====================================================

    const saveCompany = async (e) => {

        e.preventDefault();

        if (!validate(formData, setFormErrors)) {
            return;
        }

        try {

            setSaving(true);

            await api.post('/companies', formData);

            setFormData(initialForm);

            setOpenAddModal(false);

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
            });

        } finally {

            setSaving(false);
        }
    };

    // =====================================================
    // EDIT COMPANY
    // =====================================================

    const handleEditClick = (company) => {

        setEditFormData(company);

        setEditErrors({});

        setOpenEditModal(true);
    };

    const updateCompany = async (e) => {

        e.preventDefault();

        if (!validate(editFormData, setEditErrors)) {
            return;
        }

        try {

            setEditSaving(true);

            await api.patch(

                `/companies/${editFormData.companyId}`,

                {
                    cname: editFormData.cname,
                    cabbr: editFormData.cabbr
                }
            );

            setCompanies(prev =>

                prev.map(company =>

                    company.companyId ===
                    editFormData.companyId

                        ? {
                            ...company,
                            cname: editFormData.cname,
                            cabbr: editFormData.cabbr,
                            updatedAt:
                                new Date().toISOString()
                        }

                        : company
                )
            );

            setOpenEditModal(false);

        } catch (err) {

            setEditErrors({
                apiError:
                    err.response?.data?.message
            });

        } finally {

            setEditSaving(false);
        }
    };

    // =====================================================
    // DELETE COMPANY
    // =====================================================

    const confirmDelete = (company) => {
        setDeleteError('');
        setDeleteTarget(company);
    };

    const deleteCompany = async () => {
        if (!deleteTarget) return;

        try {
            setDeleting(true);

            await api.delete(
                `/companies/${deleteTarget.companyId}`
            );

            setCompanies(prev =>
                prev.filter(
                    company =>
                        company.companyId !== deleteTarget.companyId
                )
            );

            setDeleteTarget(null);
        } catch (err) {
            setDeleteError(
                err.response?.data?.message ||
                'Unable to delete this company. Please try again.'
            );
        } finally {
            setDeleting(false);
        }
    };

    // =====================================================
    // TOGGLE STATUS
    // =====================================================

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

            setCompanies(prev =>

                prev.map(company =>

                    company.companyId === companyId

                        ? {
                            ...company,
                            active: !currentStatus,
                            updatedAt:
                                new Date().toISOString()
                        }

                        : company
                )
            );

        } catch (err) {

            alert(
                err.response?.data?.message
            );

        } finally {

            setToggleLoadingId(null);
        }
    };



    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div
                className='flex justify-center
                items-center h-52'
            >

                <h1
                    className='text-lg font-semibold
                    text-cyan-700'
                >
                    Loading Companies...
                </h1>

            </div>
        );
    }

    // =====================================================
    // UI
    // =====================================================

    return (

        <div className='p-4'>

            {/* HEADER */}

            <div
                className='flex flex-col md:flex-row
                justify-between items-center gap-4 mb-6'
            >

                <div>

                    <h1
                        className='text-2xl font-semibold
                        text-cyan-700'
                    >
                        Company Management
                    </h1>

                    <p className='text-gray-500 mt-1'>
                        Total Companies :
                        {' '}
                        {totalElements}
                    </p>

                </div>

                <div className='flex gap-2'>

                    <input
                        type='text'
                        placeholder='Search company...'
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(0);
                        }}
                        className='border rounded-lg
                        px-4 py-2 focus:ring-2
                        focus:ring-cyan-500'
                    />

                    <button
                        onClick={() =>
                            setOpenAddModal(true)
                        }
                        className='bg-cyan-700
                        hover:bg-cyan-800
                        text-white px-4 py-1.5 text-sm
                        rounded-md'
                    >
                        + Add Company
                    </button>

                </div>

            </div>

            {/* TABLE */}

            <div
                className='overflow-x-auto bg-white
                rounded-lg border border-gray-200'
            >

                <table className='min-w-full text-sm'>

                    <thead
                        className='bg-cyan-700
                        text-white uppercase text-xs'
                    >

                        <tr>

                            {
                                [
                                    ['companyId', 'ID'],
                                    ['cname', 'Company Name'],
                                    ['cabbr', 'Abbreviation'],
                                    ['createdAt', 'Created At'],
                                    ['updatedAt', 'Updated At']
                                ].map(([field, label]) => (

                                    <th
                                        key={field}
                                        onClick={() =>
                                            handleSort(field)
                                        }
                                        className='px-3 py-2
                                        cursor-pointer'
                                    >
                                        {label}
                                        {' '}
                                        {getSortIcon(field)}
                                    </th>
                                ))
                            }

                            <th className='px-3 py-2'>
                                Status
                            </th>

                            <th className='px-3 py-2 text-center'>
                                Edit
                            </th>

                            <th className='px-3 py-2 text-center'>
                                Delete
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {
                            companies.length > 0 ? (

                                companies.map(company => (

                                    <tr
                                        key={company.companyId}
                                        className='border-b
                                        hover:bg-cyan-50'
                                    >

                                        <td className='px-3 py-2'>
                                            {company.companyId}
                                        </td>

                                        <td
                                            className='px-3 py-2
                                            font-semibold'
                                        >
                                            {company.cname}
                                        </td>

                                        <td className='px-3 py-2'>
                                            {company.cabbr}
                                        </td>

                                        <td
                                            className='px-3 py-2
                                            text-gray-500'
                                        >
                                            {
                                                new Date(
                                                    company.createdAt
                                                ).toLocaleString()
                                            }
                                        </td>

                                        <td
                                            className='px-3 py-2
                                            text-gray-500'
                                        >
                                            {
                                                new Date(
                                                    company.updatedAt
                                                ).toLocaleString()
                                            }
                                        </td>

                                        {/* STATUS */}

                                        <td className='px-3 py-2'>

                                            <button
                                                onClick={() =>
                                                    toggleCompanyStatus(
                                                        company.companyId,
                                                        company.active
                                                    )
                                                }
                                                disabled={
                                                    toggleLoadingId ===
                                                    company.companyId
                                                }
                                                className={`
                                                    relative inline-flex
                                                    h-5 w-10 items-center
                                                    rounded-full

                                                    ${
                                                        company.active
                                                            ? 'bg-green-500'
                                                            : 'bg-red-500'
                                                    }
                                                `}
                                            >

                                                <span
                                                    className={`
                                                        h-4 w-4 bg-white
                                                        rounded-full
                                                        transition-all

                                                        ${
                                                            company.active
                                                                ? 'translate-x-5'
                                                                : 'translate-x-1'
                                                        }
                                                    `}
                                                />

                                            </button>

                                        </td>

                                        {/* EDIT */}

                                        <td
                                            className='px-3 py-2
                                            text-center'
                                        >

                                            <button
                                                onClick={() =>
                                                    handleEditClick(company)
                                                }
                                                className='bg-blue-100
                                                hover:bg-blue-200
                                                text-blue-700
                                                p-1.5 rounded-md'
                                            >
                                                ✏️
                                            </button>

                                        </td>

                                        {/* DELETE */}

                                        <td
                                            className='px-3 py-2
                                            text-center'
                                        >

                                            <button
                                                onClick={() =>
                                                    confirmDelete(company)
                                                }
                                                className='bg-red-100
                                                hover:bg-red-200
                                                text-red-700
                                                p-1.5 rounded-md'
                                            >
                                                🗑️
                                            </button>

                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>

                                    <td
                                        colSpan='8'
                                        className='text-center
                                        py-6 text-gray-500'
                                    >
                                        No Companies Found
                                    </td>

                                </tr>
                            )
                        }

                    </tbody>

                </table>

            </div>

            {/* PAGINATION */}

            <div
                className='flex justify-between
                items-center mt-6'
            >

                <button
                    onClick={() =>
                        setCurrentPage(prev => prev - 1)
                    }
                    disabled={isFirstPage}
                    className='px-3 py-1.5 text-sm rounded-md bg-cyan-700 text-white disabled:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:filter disabled:blur-sm'
                >
                    Previous
                </button>

                <div className='font-medium'>
                    Page
                    {' '}
                    {currentPage + 1}
                    {' '}
                    of
                    {' '}
                    {totalPages}
                </div>

                <button
                    onClick={() =>
                        setCurrentPage(prev => prev + 1)
                    }
                    disabled={isLastPage}
                    className='px-3 py-1.5 text-sm rounded-md bg-cyan-700 text-white disabled:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:filter disabled:blur-sm'
                >
                    Next
                </button>

            </div>

            {/* ADD MODAL */}

            {
                openAddModal && (

                    <CompanyModal
                        title='Add Company'
                        data={formData}
                        errors={formErrors}
                        setData={setFormData}
                        setErrors={setFormErrors}
                        onSubmit={saveCompany}
                        onClose={() =>
                            setOpenAddModal(false)
                        }
                        loading={saving}
                        buttonText='Save Company'
                        handleChange={handleChange}
                    />
                )
            }

            {/* EDIT MODAL */}

            {
                openEditModal && (

                    <CompanyModal
                        title='Edit Company'
                        data={editFormData}
                        errors={editErrors}
                        setData={setEditFormData}
                        setErrors={setEditErrors}
                        onSubmit={updateCompany}
                        onClose={() =>
                            setOpenEditModal(false)
                        }
                        loading={editSaving}
                        buttonText='Update Company'
                        handleChange={handleChange}
                    />
                )
            }

            {
                deleteTarget && (
                    <DeleteConfirmationModal
                        company={deleteTarget}
                        onCancel={() => setDeleteTarget(null)}
                        onConfirm={deleteCompany}
                        loading={deleting}
                        error={deleteError}
                    />
                )
            }

        </div>
    );
};

export default Company;