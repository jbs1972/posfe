import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

// =====================================================
// ICON COMPONENTS
// =====================================================

const EditIcon = () => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='h-4 w-4'
    >
        <path d='M12 20h9' />
        <path d='M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z' />
    </svg>
);

const DeleteIcon = () => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='h-4 w-4'
    >
        <path d='M3 6h18' />
        <path d='M8 6V4h8v2' />
        <path d='M19 6l-1 16H6L5 6' />
        <path d='M10 11v6' />
        <path d='M14 11v6' />
    </svg>
);

// =====================================================
// MODAL COMPONENTS (Outside to prevent re-creation)
// =====================================================

const FinancialYearModal = ({
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
                    type='button'
                    onClick={onClose}
                    className='text-xl'
                >
                    x
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

                <div className='mb-4'>
                    <label
                        className='block mb-2
                        font-semibold'
                    >
                        Starting Date
                    </label>

                    <input
                        type='date'
                        name='startingdt'
                        value={data.startingdt}
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
                        errors.startingdt && (
                            <p
                                className='text-red-600
                                text-sm mt-1'
                            >
                                {errors.startingdt}
                            </p>
                        )
                    }
                </div>

                <div className='mb-4'>
                    <label
                        className='block mb-2
                        font-semibold'
                    >
                        Ending Date
                    </label>

                    <input
                        type='date'
                        name='endingdt'
                        value={data.endingdt}
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
                        errors.endingdt && (
                            <p
                                className='text-red-600
                                text-sm mt-1'
                            >
                                {errors.endingdt}
                            </p>
                        )
                    }
                </div>

                <div className='mb-4'>
                    <label
                        className='block mb-2
                        font-semibold'
                    >
                        Financial Code
                    </label>

                    <input
                        type='text'
                        name='financialcode'
                        value={data.financialcode}
                        onChange={(e) =>
                            handleChange(
                                e,
                                setData,
                                errors,
                                setErrors
                            )
                        }
                        placeholder='23-24'
                        className='w-full border
                        rounded-md px-3 py-1.5 text-sm
                        focus:ring-2
                        focus:ring-cyan-500'
                    />

                    {
                        errors.financialcode && (
                            <p
                                className='text-red-600
                                text-sm mt-1'
                            >
                                {errors.financialcode}
                            </p>
                        )
                    }
                </div>

                <div className='mb-4'>
                    <label
                        className='block mb-2
                        font-semibold'
                    >
                        Status
                    </label>

                    <select
                        name='active'
                        value={String(data.active)}
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
                    >
                        <option value='true'>Active</option>
                        <option value='false'>Inactive</option>
                    </select>
                </div>

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
                        rounded-md disabled:opacity-60
                        disabled:cursor-not-allowed'
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
    financialYear,
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
                    type='button'
                    onClick={onCancel}
                    className='text-xl'
                >
                    x
                </button>
            </div>

            <p className='text-gray-700 mb-4'>
                Are you sure you want to permanently delete
                the financial year <strong>{financialYear?.financialcode}</strong>? This action cannot be undone.
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
                    rounded-lg disabled:opacity-60
                    disabled:cursor-not-allowed'
                >
                    {loading ? 'Deleting...' : 'Delete Financial Year'}
                </button>
            </div>
        </div>
    </div>
);

const FinancialYear = () => {
    const { token } = useAuth();

    const api = axios.create({
        baseURL: 'http://localhost:8080/api',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });

    // =====================================================
    // STATES
    // =====================================================

    const [financialYears, setFinancialYears] = useState([]);
    const [loading, setLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');

    const [sortField, setSortField] = useState('fyId');
    const [sortDirection, setSortDirection] = useState('asc');

    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);

    const isFirstPage = currentPage === 0;
    const isLastPage = totalPages === 0 || currentPage === totalPages - 1;

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
        startingdt: '',
        endingdt: '',
        financialcode: '',
        active: true
    };

    const initialEditForm = {
        fyId: '',
        startingdt: '',
        endingdt: '',
        financialcode: '',
        active: true
    };

    const [formData, setFormData] =
        useState(initialForm);

    const [editFormData, setEditFormData] =
        useState(initialEditForm);

    // =====================================================
    // FETCH FINANCIAL YEARS
    // =====================================================

    const fetchFinancialYears = async (
        page = 0,
        search = '',
        field = 'fyId',
        direction = 'asc'
    ) => {

        try {

            setLoading(true);

            const response = await api.get(
                '/financialyears/page',
                {
                    params: {
                        page,
                        size: pageSize,
                        sort: `${field},${direction}`
                    }
                }
            );

            let data = response.data.data.content || [];

            if (search.trim()) {

                data = data.filter(financialYear =>

                    financialYear.financialcode
                        .toLowerCase()
                        .includes(search.toLowerCase())

                    ||

                    financialYear.startingdt
                        .toLowerCase()
                        .includes(search.toLowerCase())

                    ||

                    financialYear.endingdt
                        .toLowerCase()
                        .includes(search.toLowerCase())
                );
            }

            setFinancialYears(data);

            setCurrentPage(response.data.data.number || 0);

            setTotalPages(response.data.data.totalPages || 0);

            setTotalElements(
                response.data.data.totalElements || 0
            );

        } catch {

            alert('Failed to fetch financial years');

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
            fetchFinancialYears(
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
            ? 'sort'
            : sortDirection === 'asc'
                ? 'up'
                : 'down';

    const validate = (data, setErrors) => {

        const errors = {};

        if (!data.startingdt) {
            errors.startingdt = 'Starting date is required';
        }

        if (!data.endingdt) {
            errors.endingdt = 'Ending date is required';
        }

        if (
            data.startingdt &&
            data.endingdt &&
            data.endingdt < data.startingdt
        ) {
            errors.endingdt =
                'Ending date must be after starting date';
        }

        if (!data.financialcode.trim()) {
            errors.financialcode =
                'Financial code is required';
        }

        if (data.financialcode.length > 20) {
            errors.financialcode =
                'Maximum 20 characters allowed';
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
            [name]: name === 'active'
                ? value === 'true'
                : value
        }));

        setErrors({
            ...errors,
            [name]: ''
        });
    };

    const formatDateTime = (dateValue) => {
        if (!dateValue) return '-';

        return new Date(dateValue).toLocaleString();
    };

    // =====================================================
    // ADD FINANCIAL YEAR
    // =====================================================

    const saveFinancialYear = async (e) => {

        e.preventDefault();

        if (!validate(formData, setFormErrors)) {
            return;
        }

        try {

            setSaving(true);

            await api.post('/financialyears', {
                startingdt: formData.startingdt,
                endingdt: formData.endingdt,
                financialcode: formData.financialcode,
                active: formData.active
            });

            setFormData(initialForm);

            setOpenAddModal(false);

            fetchFinancialYears(
                currentPage,
                searchTerm,
                sortField,
                sortDirection
            );

        } catch (err) {

            setFormErrors({
                apiError:
                    err.response?.data?.message ||
                    'Unable to save this financial year. Please try again.'
            });

        } finally {

            setSaving(false);
        }
    };

    // =====================================================
    // EDIT FINANCIAL YEAR
    // =====================================================

    const handleEditClick = (financialYear) => {

        setEditFormData({
            fyId: financialYear.fyId,
            startingdt: financialYear.startingdt,
            endingdt: financialYear.endingdt,
            financialcode: financialYear.financialcode,
            active: financialYear.active
        });

        setEditErrors({});

        setOpenEditModal(true);
    };

    const updateFinancialYear = async (e) => {

        e.preventDefault();

        if (!validate(editFormData, setEditErrors)) {
            return;
        }

        try {

            setEditSaving(true);

            await api.patch(

                `/financialyears/${editFormData.fyId}`,

                {
                    startingdt: editFormData.startingdt,
                    endingdt: editFormData.endingdt,
                    financialcode: editFormData.financialcode,
                    active: editFormData.active
                }
            );

            setFinancialYears(prev =>

                prev.map(financialYear =>

                    financialYear.fyId ===
                    editFormData.fyId

                        ? {
                            ...financialYear,
                            startingdt:
                                editFormData.startingdt,
                            endingdt:
                                editFormData.endingdt,
                            financialcode:
                                editFormData.financialcode,
                            active:
                                editFormData.active,
                            updatedAt:
                                new Date().toISOString()
                        }

                        : financialYear
                )
            );

            setOpenEditModal(false);

        } catch (err) {

            setEditErrors({
                apiError:
                    err.response?.data?.message ||
                    'Unable to update this financial year. Please try again.'
            });

        } finally {

            setEditSaving(false);
        }
    };

    // =====================================================
    // DELETE FINANCIAL YEAR
    // =====================================================

    const confirmDelete = (financialYear) => {
        setDeleteError('');
        setDeleteTarget(financialYear);
    };

    const deleteFinancialYear = async () => {
        if (!deleteTarget) return;

        try {
            setDeleting(true);

            await api.delete(
                `/financialyears/${deleteTarget.fyId}`
            );

            setFinancialYears(prev =>
                prev.filter(
                    financialYear =>
                        financialYear.fyId !== deleteTarget.fyId
                )
            );

            setTotalElements(prev => Math.max(prev - 1, 0));

            setDeleteTarget(null);
        } catch (err) {
            setDeleteError(
                err.response?.data?.message ||
                'Unable to delete this financial year. Please try again.'
            );
        } finally {
            setDeleting(false);
        }
    };

    // =====================================================
    // TOGGLE STATUS
    // =====================================================

    const toggleFinancialYearStatus = async (
        fyId,
        currentStatus
    ) => {

        try {

            setToggleLoadingId(fyId);

            await api.patch(
                `/financialyears/${fyId}`,
                {
                    active: !currentStatus
                }
            );

            setFinancialYears(prev =>

                prev.map(financialYear =>

                    financialYear.fyId === fyId

                        ? {
                            ...financialYear,
                            active: !currentStatus,
                            updatedAt:
                                new Date().toISOString()
                        }

                        : financialYear
                )
            );

        } catch (err) {

            alert(
                err.response?.data?.message ||
                'Unable to update financial year status'
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
                    Loading Financial Years...
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
                        Financial Year Management
                    </h1>

                    <p className='text-gray-500 mt-1'>
                        Total Financial Years :
                        {' '}
                        {totalElements}
                    </p>

                </div>

                <div className='flex gap-2'>

                    <input
                        type='text'
                        placeholder='Search financial year...'
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
                        onClick={() => {
                            setFormData(initialForm);
                            setFormErrors({});
                            setOpenAddModal(true);
                        }}
                        className='bg-cyan-700
                        hover:bg-cyan-800
                        text-white px-4 py-1.5 text-sm
                        rounded-md'
                    >
                        + Add Financial Year
                    </button>

                </div>

            </div>

            {/* TABLE */}

            <div
                className='overflow-auto max-h-[520px] bg-white
                rounded-lg border border-gray-200'
            >

                <table className='min-w-full text-sm'>

                    <thead
                        className='bg-cyan-700
                        text-white uppercase text-xs
                        sticky top-0 z-10'
                    >

                        <tr>

                            {
                                [
                                    ['fyId', 'ID'],
                                    ['startingdt', 'Starting Date'],
                                    ['endingdt', 'Ending Date'],
                                    ['financialcode', 'Financial Code'],
                                    ['createdAt', 'Created At'],
                                    ['updatedAt', 'Updated At']
                                ].map(([field, label]) => (

                                    <th
                                        key={field}
                                        onClick={() =>
                                            handleSort(field)
                                        }
                                        className='px-3 py-2
                                        cursor-pointer text-left'
                                    >
                                        {label}
                                        {' '}
                                        <span
                                            className='normal-case
                                            text-[10px]'
                                        >
                                            {getSortIcon(field)}
                                        </span>
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
                            financialYears.length > 0 ? (

                                financialYears.map(financialYear => (

                                    <tr
                                        key={financialYear.fyId}
                                        className='border-b
                                        hover:bg-cyan-50'
                                    >

                                        <td className='px-3 py-2'>
                                            {financialYear.fyId}
                                        </td>

                                        <td className='px-3 py-2'>
                                            {financialYear.startingdt}
                                        </td>

                                        <td className='px-3 py-2'>
                                            {financialYear.endingdt}
                                        </td>

                                        <td
                                            className='px-3 py-2
                                            font-semibold'
                                        >
                                            {financialYear.financialcode}
                                        </td>

                                        <td
                                            className='px-3 py-2
                                            text-gray-500'
                                        >
                                            {
                                                formatDateTime(
                                                    financialYear.createdAt
                                                )
                                            }
                                        </td>

                                        <td
                                            className='px-3 py-2
                                            text-gray-500'
                                        >
                                            {
                                                formatDateTime(
                                                    financialYear.updatedAt
                                                )
                                            }
                                        </td>

                                        {/* STATUS */}

                                        <td className='px-3 py-2 text-center'>

                                            <button
                                                type='button'
                                                onClick={() =>
                                                    toggleFinancialYearStatus(
                                                        financialYear.fyId,
                                                        financialYear.active
                                                    )
                                                }
                                                disabled={
                                                    toggleLoadingId ===
                                                    financialYear.fyId
                                                }
                                                className={`
                                                    relative inline-flex
                                                    h-5 w-10 items-center
                                                    rounded-full
                                                    disabled:opacity-60
                                                    disabled:cursor-not-allowed

                                                    ${
                                                        financialYear.active
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
                                                            financialYear.active
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
                                                type='button'
                                                onClick={() =>
                                                    handleEditClick(
                                                        financialYear
                                                    )
                                                }
                                                className='inline-flex
                                                items-center justify-center
                                                bg-blue-100
                                                hover:bg-blue-200
                                                text-blue-700
                                                p-1.5 rounded-md'
                                                aria-label='Edit financial year'
                                            >
                                                <EditIcon />
                                            </button>

                                        </td>

                                        {/* DELETE */}

                                        <td
                                            className='px-3 py-2
                                            text-center'
                                        >

                                            <button
                                                type='button'
                                                onClick={() =>
                                                    confirmDelete(
                                                        financialYear
                                                    )
                                                }
                                                className='inline-flex
                                                items-center justify-center
                                                bg-red-100
                                                hover:bg-red-200
                                                text-red-700
                                                p-1.5 rounded-md'
                                                aria-label='Delete financial year'
                                            >
                                                <DeleteIcon />
                                            </button>

                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>

                                    <td
                                        colSpan='9'
                                        className='text-center
                                        py-6 text-gray-500'
                                    >
                                        No Financial Years Found
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
                    {totalPages === 0 ? 0 : currentPage + 1}
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

                    <FinancialYearModal
                        title='Add Financial Year'
                        data={formData}
                        errors={formErrors}
                        setData={setFormData}
                        setErrors={setFormErrors}
                        onSubmit={saveFinancialYear}
                        onClose={() =>
                            setOpenAddModal(false)
                        }
                        loading={saving}
                        buttonText='Save Financial Year'
                        handleChange={handleChange}
                    />
                )
            }

            {/* EDIT MODAL */}

            {
                openEditModal && (

                    <FinancialYearModal
                        title='Edit Financial Year'
                        data={editFormData}
                        errors={editErrors}
                        setData={setEditFormData}
                        setErrors={setEditErrors}
                        onSubmit={updateFinancialYear}
                        onClose={() =>
                            setOpenEditModal(false)
                        }
                        loading={editSaving}
                        buttonText='Update Financial Year'
                        handleChange={handleChange}
                    />
                )
            }

            {
                deleteTarget && (
                    <DeleteConfirmationModal
                        financialYear={deleteTarget}
                        onCancel={() => setDeleteTarget(null)}
                        onConfirm={deleteFinancialYear}
                        loading={deleting}
                        error={deleteError}
                    />
                )
            }

        </div>
    );
};

export default FinancialYear;
