import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

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
        aria-hidden='true'
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
        aria-hidden='true'
    >
        <path d='M3 6h18' />
        <path d='M8 6V4h8v2' />
        <path d='M19 6l-1 16H6L5 6' />
        <path d='M10 11v6' />
        <path d='M14 11v6' />
    </svg>
);

const CustomerModal = ({
    title,
    data,
    errors,
    setData,
    setErrors,
    onSubmit,
    onClose,
    loading,
    buttonText,
    modalType
}) => (
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4'>
        <div className='bg-white w-full max-w-md rounded-xl shadow-xl p-5'>
            <div className='flex items-center justify-between mb-5'>
                <h2 className='text-xl font-semibold text-cyan-700'>
                    {title}
                </h2>
                <button
                    type='button'
                    onClick={onClose}
                    className='text-2xl leading-none text-gray-500 hover:text-gray-700'
                    aria-label='Close modal'
                >
                    ×
                </button>
            </div>

            <form onSubmit={onSubmit}>
                {errors.apiError && (
                    <div className='mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
                        {errors.apiError}
                    </div>
                )}

                <div className='mb-4'>
                    <label className='mb-2 block text-sm font-semibold text-gray-700'>
                        Customer Name
                    </label>
                    <input
                        type='text'
                        name='cname'
                        value={data.cname}
                        onChange={(e) => {
                            setData(prev => ({ ...prev, cname: e.target.value }));
                            setErrors(prev => ({ ...prev, cname: '', apiError: '' }));
                        }}
                        className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100'
                        placeholder='Enter customer name'
                    />
                    {errors.cname && (
                        <p className='mt-1 text-xs text-red-600'>{errors.cname}</p>
                    )}
                </div>

                <div className='mb-4'>
                    <label className='mb-2 block text-sm font-semibold text-gray-700'>
                        Mobile Number
                    </label>
                    <input
                        type='text'
                        name='cmobile'
                        value={data.cmobile}
                        onChange={(e) => {
                            setData(prev => ({ ...prev, cmobile: e.target.value }));
                            setErrors(prev => ({ ...prev, cmobile: '', apiError: '' }));
                        }}
                        className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100'
                        placeholder='Enter mobile number'
                    />
                    {errors.cmobile && (
                        <p className='mt-1 text-xs text-red-600'>{errors.cmobile}</p>
                    )}
                </div>

                <div className='mb-5'>
                    <label className='mb-2 block text-sm font-semibold text-gray-700'>
                        Status
                    </label>
                    <select
                        name='active'
                        value={String(data.active)}
                        onChange={(e) => {
                            setData(prev => ({ ...prev, active: e.target.value === 'true' }));
                            setErrors(prev => ({ ...prev, active: '', apiError: '' }));
                        }}
                        className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100'
                    >
                        <option value='true'>Active</option>
                        <option value='false'>Inactive</option>
                    </select>
                </div>

                <div className='flex justify-end gap-3'>
                    <button
                        type='button'
                        onClick={onClose}
                        className='rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100'
                    >
                        Cancel
                    </button>
                    <button
                        type='submit'
                        disabled={loading}
                        className='rounded-md bg-cyan-700 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60'
                    >
                        {loading ? 'Processing...' : buttonText}
                    </button>
                </div>
            </form>
        </div>
    </div>
);

const DeleteConfirmationModal = ({ customer, onCancel, onConfirm, loading, error }) => (
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4'>
        <div className='bg-white w-full max-w-sm rounded-xl shadow-xl p-5'>
            <div className='flex items-center justify-between mb-4'>
                <h2 className='text-lg font-semibold text-cyan-700'>
                    Confirm Delete
                </h2>
                <button
                    type='button'
                    onClick={onCancel}
                    className='text-2xl leading-none text-gray-500 hover:text-gray-700'
                    aria-label='Close delete modal'
                >
                    ×
                </button>
            </div>

            <p className='mb-4 text-sm text-gray-700'>
                Are you sure you want to delete customer <strong>{customer?.cname}</strong>? This action cannot be undone.
            </p>

            {error && (
                <div className='mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
                    {error}
                </div>
            )}

            <div className='flex justify-end gap-3'>
                <button
                    type='button'
                    onClick={onCancel}
                    className='rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100'
                >
                    Cancel
                </button>
                <button
                    type='button'
                    onClick={onConfirm}
                    disabled={loading}
                    className='rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60'
                >
                    {loading ? 'Deleting...' : 'Delete Customer'}
                </button>
            </div>
        </div>
    </div>
);

const Customer = () => {
    const { token } = useAuth();
    const api = axios.create({
        baseURL: 'http://localhost:8080/api',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    const pageSize = 10;

    const initialForm = { cname: '', cmobile: '', active: true };
    const initialEditForm = { customerId: '', cname: '', cmobile: '', active: true };

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [toggleLoadingId, setToggleLoadingId] = useState(null);
    const [formData, setFormData] = useState(initialForm);
    const [editFormData, setEditFormData] = useState(initialEditForm);
    const [formErrors, setFormErrors] = useState({});
    const [editErrors, setEditErrors] = useState({});
    const [deleteError, setDeleteError] = useState('');

    const fetchCustomers = async (page = 0) => {
        try {
            setLoading(true);
            const response = await api.get('/customers/page', {
                params: { page, size: pageSize },
            });

            const pageData = response.data?.data || {};
            setCustomers(pageData.content || []);
            setCurrentPage(pageData.number ?? page);
            setTotalPages(pageData.totalPages ?? 0);
            setTotalElements(pageData.totalElements ?? 0);
        } catch (error) {
            alert(
                error.response?.data?.message || 'Failed to fetch customers.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers(currentPage);
    }, [currentPage]);

    const validateCustomer = (data, errorSetter) => {
        const errors = {};

        if (!data.cname || !data.cname.trim()) {
            errors.cname = 'Customer name is required.';
        }

        if (data.cname && data.cname.trim().length > 100) {
            errors.cname = 'Customer name must not exceed 100 characters.';
        }

        if (!data.cmobile || !data.cmobile.trim()) {
            errors.cmobile = 'Mobile number is required.';
        } else if (!/^[0-9]{10}$/.test(data.cmobile.trim())) {
            errors.cmobile = 'Mobile number must be 10 digits.';
        }

        errorSetter(errors);
        return Object.keys(errors).length === 0;
    };

    const saveCustomer = async (e) => {
        e.preventDefault();

        if (!validateCustomer(formData, setFormErrors)) {
            return;
        }

        try {
            setSaving(true);
            await api.post('/customers', {
                cname: formData.cname.trim(),
                cmobile: formData.cmobile.trim(),
                active: formData.active,
            });

            setFormData(initialForm);
            setFormErrors({});
            setOpenAddModal(false);
            await fetchCustomers(0);
        } catch (error) {
            setFormErrors({
                apiError:
                    error.response?.data?.message ||
                    'Unable to save customer. Please try again.',
            });
        } finally {
            setSaving(false);
        }
    };

    const openEditModalForCustomer = (customer) => {
        setEditFormData({
            customerId: customer.customerId,
            cname: customer.cname,
            cmobile: customer.cmobile,
            active: customer.active,
        });
        setEditErrors({});
        setOpenEditModal(true);
    };

    const updateCustomer = async (e) => {
        e.preventDefault();

        if (!validateCustomer(editFormData, setEditErrors)) {
            return;
        }

        try {
            setEditing(true);
            const response = await api.patch(`/customers/${editFormData.customerId}`, {
                cname: editFormData.cname.trim(),
                cmobile: editFormData.cmobile.trim(),
                active: editFormData.active,
            });

            const updatedCustomer = response.data?.data || {
                ...editFormData,
                customerId: editFormData.customerId,
            };

            setCustomers(prev =>
                prev.map(customer =>
                    customer.customerId === editFormData.customerId
                        ? { ...customer, ...updatedCustomer, updatedAt: new Date().toISOString() }
                        : customer
                )
            );

            setOpenEditModal(false);
            setEditFormData(initialEditForm);
        } catch (error) {
            setEditErrors({
                apiError:
                    error.response?.data?.message ||
                    'Unable to update customer. Please try again.',
            });
        } finally {
            setEditing(false);
        }
    };

    const confirmDelete = (customer) => {
        setDeleteError('');
        setDeleteTarget(customer);
    };

    const toggleCustomerStatus = async (customerId, currentStatus) => {
        try {
            setToggleLoadingId(customerId);

            await api.patch(`/customers/${customerId}`, {
                active: !currentStatus,
            });

            setCustomers(prev =>
                prev.map(customer =>
                    customer.customerId === customerId
                        ? {
                            ...customer,
                            active: !currentStatus,
                            updatedAt: new Date().toISOString(),
                        }
                        : customer
                )
            );
        } catch (error) {
            alert(
                error.response?.data?.message || 'Unable to update customer status.'
            );
        } finally {
            setToggleLoadingId(null);
        }
    };

    const deleteCustomer = async () => {
        if (!deleteTarget) return;

        try {
            setDeleting(true);
            await api.delete(`/customers/delete/${deleteTarget.customerId}`);
            setDeleteTarget(null);
            await fetchCustomers(currentPage);
        } catch (error) {
            setDeleteError(
                error.response?.data?.message || 'Unable to delete customer.'
            );
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return '-';
        return new Date(dateValue).toLocaleString();
    };

    const isFirstPage = currentPage === 0;
    const isLastPage = totalPages === 0 || currentPage >= totalPages - 1;

    return (
        <div className='p-4'>
            <div className='mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold text-cyan-700'>Customer Management</h1>
                    <p className='mt-1 text-sm text-gray-500'>Total Customers: {totalElements}</p>
                </div>

                <button
                    type='button'
                    onClick={() => {
                        setFormData(initialForm);
                        setFormErrors({});
                        setOpenAddModal(true);
                    }}
                    className='rounded-md bg-cyan-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-800'
                >
                    + Add Customer
                </button>
            </div>

            <div className='overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm max-h-[520px]'>
                <table className='min-w-full text-sm'>
                    <thead className='sticky top-0 z-10 bg-cyan-700 text-left text-xs uppercase tracking-wide text-white'>
                        <tr>
                            <th className='px-3 py-3 font-semibold'>ID</th>
                            <th className='px-3 py-3 font-semibold'>Name</th>
                            <th className='px-3 py-3 font-semibold'>Mobile</th>
                            <th className='px-3 py-3 font-semibold'>Created At</th>
                            <th className='px-3 py-3 font-semibold'>Updated At</th>
                            <th className='px-3 py-3 font-semibold'>Status</th>
                            <th className='px-3 py-3 text-center font-semibold'>Edit</th>
                            <th className='px-3 py-3 text-center font-semibold'>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan='8' className='px-3 py-8 text-center text-gray-500'>
                                    Loading customers...
                                </td>
                            </tr>
                        ) : customers.length > 0 ? (
                            customers.map(customer => (
                                <tr key={customer.customerId} className='border-b border-gray-200 hover:bg-cyan-50'>
                                    <td className='px-3 py-3 text-gray-700'>{customer.customerId}</td>
                                    <td className='px-3 py-3 font-medium text-gray-800'>{customer.cname}</td>
                                    <td className='px-3 py-3 text-gray-700'>{customer.cmobile}</td>
                                    <td className='px-3 py-3 text-gray-500'>{formatDate(customer.createdAt)}</td>
                                    <td className='px-3 py-3 text-gray-500'>{formatDate(customer.updatedAt)}</td>
                                    <td className='px-3 py-3 text-center'>
                                        <button
                                            type='button'
                                            onClick={() => toggleCustomerStatus(customer.customerId, customer.active)}
                                            disabled={toggleLoadingId === customer.customerId}
                                            className={`relative inline-flex h-5 w-10 items-center rounded-full disabled:cursor-not-allowed disabled:opacity-60 ${
                                                customer.active ? 'bg-green-500' : 'bg-red-500'
                                            }`}
                                            aria-label='Toggle customer status'
                                        >
                                            <span
                                                className={`h-4 w-4 rounded-full bg-white transition-all ${
                                                    customer.active ? 'translate-x-5' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </td>
                                    <td className='px-3 py-3 text-center'>
                                        <button
                                            type='button'
                                            onClick={() => openEditModalForCustomer(customer)}
                                            className='inline-flex items-center justify-center rounded-md bg-blue-100 p-1.5 text-blue-700 transition hover:bg-blue-200'
                                            aria-label='Edit customer'
                                        >
                                            <EditIcon />
                                        </button>
                                    </td>
                                    <td className='px-3 py-3 text-center'>
                                        <button
                                            type='button'
                                            onClick={() => confirmDelete(customer)}
                                            className='inline-flex items-center justify-center rounded-md bg-red-100 p-1.5 text-red-700 transition hover:bg-red-200'
                                            aria-label='Delete customer'
                                        >
                                            <DeleteIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan='8' className='px-3 py-8 text-center text-gray-500'>
                                    No customers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className='mt-6 flex items-center justify-between'>
                <button
                    type='button'
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                    disabled={isFirstPage}
                    className='rounded-md bg-cyan-700 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300'
                >
                    Previous
                </button>

                <div className='text-sm font-medium text-gray-600'>
                    Page {totalPages === 0 ? 0 : currentPage + 1} of {totalPages}
                </div>

                <button
                    type='button'
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={isLastPage}
                    className='rounded-md bg-cyan-700 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300'
                >
                    Next
                </button>
            </div>

            {openAddModal && (
                <CustomerModal
                    title='Add Customer'
                    data={formData}
                    errors={formErrors}
                    setData={setFormData}
                    setErrors={setFormErrors}
                    onSubmit={saveCustomer}
                    onClose={() => setOpenAddModal(false)}
                    loading={saving}
                    buttonText='Save Customer'
                    modalType='add'
                />
            )}

            {openEditModal && (
                <CustomerModal
                    title='Edit Customer'
                    data={editFormData}
                    errors={editErrors}
                    setData={setEditFormData}
                    setErrors={setEditErrors}
                    onSubmit={updateCustomer}
                    onClose={() => setOpenEditModal(false)}
                    loading={editing}
                    buttonText='Update Customer'
                    modalType='edit'
                />
            )}

            {deleteTarget && (
                <DeleteConfirmationModal
                    customer={deleteTarget}
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={deleteCustomer}
                    loading={deleting}
                    error={deleteError}
                />
            )}
        </div>
    );
};

export default Customer;
