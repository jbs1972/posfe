import React, { useEffect, useMemo, useState } from 'react';
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

const VendorModal = ({
    title,
    data,
    errors,
    setData,
    setErrors,
    onSubmit,
    onClose,
    loading,
    buttonText,
    handleChange,
    companies
}) => (
    <div className='fixed inset-0 bg-black/40 flex justify-center items-center z-50'>
        <div className='bg-white w-full max-w-md rounded-lg shadow-lg p-4'>
            <div className='flex justify-between mb-5'>
                <h2 className='text-lg font-semibold text-cyan-700'>
                    {title}
                </h2>

                <button
                    type='button'
                    onClick={onClose}
                    className='text-xl leading-none'
                    aria-label='Close modal'
                >
                    x
                </button>
            </div>

            <form onSubmit={onSubmit}>
                {errors.apiError && (
                    <div className='bg-red-100 text-red-700 p-3 rounded-lg mb-4'>
                        {errors.apiError}
                    </div>
                )}

                <div className='mb-4'>
                    <label className='block mb-2 font-semibold'>
                        Vendor Name
                    </label>

                    <input
                        type='text'
                        name='vname'
                        value={data.vname}
                        onChange={(e) =>
                            handleChange(
                                e,
                                setData,
                                errors,
                                setErrors
                            )
                        }
                        className='w-full border rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-cyan-500'
                    />

                    {errors.vname && (
                        <p className='text-red-600 text-sm mt-1'>
                            {errors.vname}
                        </p>
                    )}
                </div>

                <div className='mb-4'>
                    <label className='block mb-2 font-semibold'>
                        Companies
                    </label>

                    <select
                        multiple
                        name='companyIds'
                        value={data.companyIds.map(String)}
                        onChange={(e) =>
                            handleChange(
                                e,
                                setData,
                                errors,
                                setErrors
                            )
                        }
                        className='w-full border rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-cyan-500 min-h-28'
                    >
                        {companies.map(company => (
                            <option
                                key={company.companyId}
                                value={company.companyId}
                            >
                                {company.cname} ({company.cabbr})
                            </option>
                        ))}
                    </select>

                    <p className='text-xs text-gray-500 mt-1'>
                        Hold Ctrl to choose more than one company.
                    </p>

                    {errors.companyIds && (
                        <p className='text-red-600 text-sm mt-1'>
                            {errors.companyIds}
                        </p>
                    )}
                </div>

                <div className='mb-4'>
                    <label className='block mb-2 font-semibold'>
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
                        className='w-full border rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-cyan-500'
                    >
                        <option value='true'>Active</option>
                        <option value='false'>Inactive</option>
                    </select>
                </div>

                <div className='flex justify-end gap-3 mt-5'>
                    <button
                        type='button'
                        onClick={onClose}
                        className='px-4 py-1.5 text-sm border rounded-md hover:bg-gray-100'
                    >
                        Cancel
                    </button>

                    <button
                        type='submit'
                        disabled={loading}
                        className='bg-cyan-700 hover:bg-cyan-800 text-white px-4 py-1.5 text-sm rounded-md disabled:opacity-60 disabled:cursor-not-allowed'
                    >
                        {loading ? 'Processing...' : buttonText}
                    </button>
                </div>
            </form>
        </div>
    </div>
);

const DeleteConfirmationModal = ({
    vendor,
    onCancel,
    onConfirm,
    loading,
    error
}) => (
    <div className='fixed inset-0 bg-black/40 flex justify-center items-center z-50'>
        <div className='bg-white w-full max-w-sm rounded-lg shadow-lg p-4'>
            <div className='flex justify-between mb-5'>
                <h2 className='text-lg font-semibold text-cyan-700'>
                    Confirm Deletion
                </h2>

                <button
                    type='button'
                    onClick={onCancel}
                    className='text-xl leading-none'
                    aria-label='Close modal'
                >
                    x
                </button>
            </div>

            <p className='text-gray-700 mb-4'>
                Are you sure you want to permanently delete
                the vendor <strong>{vendor?.vname}</strong>? This action cannot be undone.
            </p>

            {error && (
                <div className='bg-red-100 text-red-700 p-3 rounded-lg mb-4'>
                    {error}
                </div>
            )}

            <div className='flex justify-end gap-3 mt-5'>
                <button
                    type='button'
                    onClick={onCancel}
                    className='px-5 py-2 border rounded-lg hover:bg-gray-100'
                >
                    Cancel
                </button>

                <button
                    type='button'
                    onClick={onConfirm}
                    disabled={loading}
                    className='bg-red-700 hover:bg-red-800 text-white px-5 py-2 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed'
                >
                    {loading ? 'Deleting...' : 'Delete Vendor'}
                </button>
            </div>
        </div>
    </div>
);

const Vendor = () => {
    const { token } = useAuth();
    const api = axios.create({
        baseURL: 'http://localhost:8080/api',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });

    const [vendors, setVendors] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);

    const activeCompanies = useMemo(
        () => companies.filter(company => company.active === true),
        [companies]
    );

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');

    const [sortField, setSortField] = useState('vendorId');
    const [sortDirection, setSortDirection] = useState('asc');

    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);

    const isFirstPage = currentPage === 0;
    const isLastPage = totalPages === 0 || currentPage === totalPages - 1;

    const [saving, setSaving] = useState(false);
    const [editSaving, setEditSaving] = useState(false);

    const [toggleLoadingId, setToggleLoadingId] = useState(null);

    const [formErrors, setFormErrors] = useState({});
    const [editErrors, setEditErrors] = useState({});
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const pageSize = 10;

    const initialForm = {
        vname: '',
        companyIds: [],
        active: true
    };

    const initialEditForm = {
        vendorId: '',
        vname: '',
        companyIds: [],
        active: true
    };

    const [formData, setFormData] = useState(initialForm);
    const [editFormData, setEditFormData] = useState(initialEditForm);

    const companyMap = useMemo(() => {
        const map = {};

        companies.forEach(company => {
            map[company.companyId] = company;
        });

        return map;
    }, [companies]);

    const fetchCompanies = async () => {
        try {
            const response = await api.get(
                '/companies/page',
                {
                    params: {
                        page: 0,
                        size: 1000,
                        sort: 'cname,asc'
                    }
                }
            );

            setCompanies(response.data.data.content || []);
        } catch {
            alert('Failed to fetch companies');
        }
    };

    const fetchVendors = async (
        page = 0,
        search = '',
        field = 'vendorId',
        direction = 'asc'
    ) => {
        try {
            setLoading(true);

            const response = await api.get(
                '/vendors/page',
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
                data = data.filter(vendor =>
                    vendor.vname
                        .toLowerCase()
                        .includes(search.toLowerCase())

                    ||

                    (vendor.companyIds || [])
                        .some(companyId =>
                            getCompanyName(companyId)
                                .toLowerCase()
                                .includes(search.toLowerCase())
                        )
                );
            }

            setVendors(data);
            setCurrentPage(response.data.data.number || 0);
            setTotalPages(response.data.data.totalPages || 0);
            setTotalElements(response.data.data.totalElements || 0);
        } catch {
            alert('Failed to fetch vendors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    useEffect(() => {
        const delay = searchTerm.trim() ? 400 : 0;

        const timer = setTimeout(() => {
            fetchVendors(
                currentPage,
                searchTerm,
                sortField,
                sortDirection
            );
        }, delay);

        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, sortField, sortDirection]);

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

        if (!data.vname.trim()) {
            errors.vname = 'Vendor name is required';
        }

        if (data.vname.length > 100) {
            errors.vname = 'Maximum 100 characters allowed';
        }

        if (!data.companyIds.length) {
            errors.companyIds =
                'Please select at least one company';
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
        const { name, value, selectedOptions } = e.target;

        setter(prev => ({
            ...prev,
            [name]: name === 'active'
                ? value === 'true'
                : name === 'companyIds'
                    ? Array.from(
                        selectedOptions,
                        option => Number(option.value)
                    )
                    : value
        }));

        setErrors({
            ...errors,
            [name]: ''
        });
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return '-';

        return new Date(dateValue).toLocaleString();
    };

    const getCompanyName = (companyId) => {
        const company = companyMap[companyId];

        if (!company) return `Company #${companyId}`;

        return `${company.cname} (${company.cabbr})`;
    };

    const saveVendor = async (e) => {
        e.preventDefault();

        if (!validate(formData, setFormErrors)) {
            return;
        }

        try {
            setSaving(true);

            await api.post('/vendors', {
                vname: formData.vname,
                companyIds: formData.companyIds,
                active: formData.active
            });

            setFormData(initialForm);
            setOpenAddModal(false);

            fetchVendors(
                currentPage,
                searchTerm,
                sortField,
                sortDirection
            );
        } catch (err) {
            setFormErrors({
                apiError:
                    err.response?.data?.message ||
                    'Unable to save this vendor. Please try again.'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleEditClick = (vendor) => {
        setEditFormData({
            vendorId: vendor.vendorId,
            vname: vendor.vname,
            companyIds: vendor.companyIds || [],
            active: vendor.active
        });

        setEditErrors({});
        setOpenEditModal(true);
    };

    const updateVendor = async (e) => {
        e.preventDefault();

        if (!validate(editFormData, setEditErrors)) {
            return;
        }

        try {
            setEditSaving(true);

            await api.patch(
                `/vendors/${editFormData.vendorId}`,
                {
                    vname: editFormData.vname,
                    companyIds: editFormData.companyIds,
                    active: editFormData.active
                }
            );

            setVendors(prev =>
                prev.map(vendor =>
                    vendor.vendorId === editFormData.vendorId
                        ? {
                            ...vendor,
                            vname: editFormData.vname,
                            companyIds: editFormData.companyIds,
                            active: editFormData.active,
                            updatedAt: new Date().toISOString()
                        }
                        : vendor
                )
            );

            setOpenEditModal(false);
        } catch (err) {
            setEditErrors({
                apiError:
                    err.response?.data?.message ||
                    'Unable to update this vendor. Please try again.'
            });
        } finally {
            setEditSaving(false);
        }
    };

    const confirmDelete = (vendor) => {
        setDeleteError('');
        setDeleteTarget(vendor);
    };

    const deleteVendor = async () => {
        if (!deleteTarget) return;

        try {
            setDeleting(true);

            await api.delete(`/vendors/${deleteTarget.vendorId}`);

            setVendors(prev =>
                prev.filter(
                    vendor =>
                        vendor.vendorId !== deleteTarget.vendorId
                )
            );

            setTotalElements(prev => Math.max(prev - 1, 0));
            setDeleteTarget(null);
        } catch (err) {
            setDeleteError(
                err.response?.data?.message ||
                'Unable to delete this vendor. Please try again.'
            );
        } finally {
            setDeleting(false);
        }
    };

    const toggleVendorStatus = async (
        vendorId,
        currentStatus
    ) => {
        try {
            setToggleLoadingId(vendorId);

            await api.patch(
                `/vendors/${vendorId}`,
                {
                    active: !currentStatus
                }
            );

            setVendors(prev =>
                prev.map(vendor =>
                    vendor.vendorId === vendorId
                        ? {
                            ...vendor,
                            active: !currentStatus,
                            updatedAt: new Date().toISOString()
                        }
                        : vendor
                )
            );
        } catch (err) {
            alert(
                err.response?.data?.message ||
                'Unable to update vendor status'
            );
        } finally {
            setToggleLoadingId(null);
        }
    };

    if (loading) {
        return (
            <div className='flex justify-center items-center h-52'>
                <h1 className='text-lg font-semibold text-cyan-700'>
                    Loading Vendors...
                </h1>
            </div>
        );
    }

    return (
        <div className='p-4'>
            <div className='flex flex-col md:flex-row justify-between items-center gap-4 mb-6'>
                <div>
                    <h1 className='text-2xl font-semibold text-cyan-700'>
                        Vendor Management
                    </h1>

                    <p className='text-gray-500 mt-1'>
                        Total Vendors : {totalElements}
                    </p>
                </div>

                <div className='flex gap-2'>
                    <input
                        type='text'
                        placeholder='Search vendor...'
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(0);
                        }}
                        className='border rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500'
                    />

                    <button
                        onClick={() => {
                            setFormData(initialForm);
                            setFormErrors({});
                            setOpenAddModal(true);
                        }}
                        className='bg-cyan-700 hover:bg-cyan-800 text-white px-4 py-1.5 text-sm rounded-md'
                    >
                        + Add Vendor
                    </button>
                </div>
            </div>

            <div className='overflow-auto max-h-[520px] bg-white rounded-lg border border-gray-200'>
                <table className='min-w-full text-sm'>
                    <thead className='bg-cyan-700 text-white uppercase text-xs sticky top-0 z-10'>
                        <tr>
                            {[
                                ['vendorId', 'ID'],
                                ['vname', 'Vendor Name']
                            ].map(([field, label]) => (
                                <th
                                    key={field}
                                    onClick={() =>
                                        handleSort(field)
                                    }
                                    className='px-3 py-2 cursor-pointer text-left'
                                >
                                    {label}{' '}
                                    <span className='normal-case text-[10px]'>
                                        {getSortIcon(field)}
                                    </span>
                                </th>
                            ))}

                            <th className='px-3 py-2 text-left'>
                                Companies
                            </th>

                            {[
                                ['createdAt', 'Created At'],
                                ['updatedAt', 'Updated At']
                            ].map(([field, label]) => (
                                <th
                                    key={field}
                                    onClick={() =>
                                        handleSort(field)
                                    }
                                    className='px-3 py-2 cursor-pointer text-left'
                                >
                                    {label}{' '}
                                    <span className='normal-case text-[10px]'>
                                        {getSortIcon(field)}
                                    </span>
                                </th>
                            ))}

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
                        {vendors.length > 0 ? (
                            vendors.map(vendor => (
                                <tr
                                    key={vendor.vendorId}
                                    className='border-b hover:bg-cyan-50'
                                >
                                    <td className='px-3 py-2'>
                                        {vendor.vendorId}
                                    </td>

                                    <td className='px-3 py-2 font-semibold'>
                                        {vendor.vname}
                                    </td>

                                    <td className='px-3 py-2'>
                                        <div className='flex flex-wrap gap-1.5 max-w-xs'>
                                            {(vendor.companyIds || []).some(companyId => {
                                                const company = companyMap[companyId];
                                                return company?.active === true;
                                            }) ? (
                                                (vendor.companyIds || [])
                                                    .filter(companyId => companyMap[companyId]?.active === true)
                                                    .map(companyId => (
                                                        <span
                                                            key={companyId}
                                                            className='inline-flex items-center rounded-md bg-cyan-50 border border-cyan-200 px-2 py-0.5 text-xs font-medium text-cyan-800'
                                                        >
                                                            {getCompanyName(companyId)}
                                                        </span>
                                                    ))
                                            ) : (
                                                <span className='text-gray-400'>
                                                    No Company
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td className='px-3 py-2 text-gray-500'>
                                        {formatDate(vendor.createdAt)}
                                    </td>

                                    <td className='px-3 py-2 text-gray-500'>
                                        {formatDate(vendor.updatedAt)}
                                    </td>

                                    <td className='px-3 py-2 text-center'>
                                        <button
                                            type='button'
                                            onClick={() =>
                                                toggleVendorStatus(
                                                    vendor.vendorId,
                                                    vendor.active
                                                )
                                            }
                                            disabled={
                                                toggleLoadingId ===
                                                vendor.vendorId
                                            }
                                            className={`
                                                relative inline-flex h-5 w-10
                                                items-center rounded-full
                                                disabled:opacity-60
                                                disabled:cursor-not-allowed
                                                ${
                                                    vendor.active
                                                        ? 'bg-green-500'
                                                        : 'bg-red-500'
                                                }
                                            `}
                                            aria-label='Toggle vendor status'
                                        >
                                            <span
                                                className={`
                                                    h-4 w-4 bg-white
                                                    rounded-full transition-all
                                                    ${
                                                        vendor.active
                                                            ? 'translate-x-5'
                                                            : 'translate-x-1'
                                                    }
                                                `}
                                            />
                                        </button>
                                    </td>

                                    <td className='px-3 py-2 text-center'>
                                        <button
                                            type='button'
                                            onClick={() =>
                                                handleEditClick(vendor)
                                            }
                                            className='inline-flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 p-1.5 rounded-md'
                                            aria-label='Edit vendor'
                                        >
                                            <EditIcon />
                                        </button>
                                    </td>

                                    <td className='px-3 py-2 text-center'>
                                        <button
                                            type='button'
                                            onClick={() =>
                                                confirmDelete(vendor)
                                            }
                                            className='inline-flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-700 p-1.5 rounded-md'
                                            aria-label='Delete vendor'
                                        >
                                            <DeleteIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan='8'
                                    className='text-center py-6 text-gray-500'
                                >
                                    No Vendors Found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className='flex justify-between items-center mt-6'>
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
                    Page {totalPages === 0 ? 0 : currentPage + 1} of {totalPages}
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

            {openAddModal && (
                <VendorModal
                    title='Add Vendor'
                    data={formData}
                    errors={formErrors}
                    setData={setFormData}
                    setErrors={setFormErrors}
                    onSubmit={saveVendor}
                    onClose={() =>
                        setOpenAddModal(false)
                    }
                    loading={saving}
                    buttonText='Save Vendor'
                    handleChange={handleChange}
                    companies={activeCompanies}
                />
            )}

            {openEditModal && (
                <VendorModal
                    title='Edit Vendor'
                    data={editFormData}
                    errors={editErrors}
                    setData={setEditFormData}
                    setErrors={setEditErrors}
                    onSubmit={updateVendor}
                    onClose={() =>
                        setOpenEditModal(false)
                    }
                    loading={editSaving}
                    buttonText='Update Vendor'
                    handleChange={handleChange}
                    companies={activeCompanies}
                />
            )}

            {deleteTarget && (
                <DeleteConfirmationModal
                    vendor={deleteTarget}
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={deleteVendor}
                    loading={deleting}
                    error={deleteError}
                />
            )}
        </div>
    );
};

export default Vendor;
