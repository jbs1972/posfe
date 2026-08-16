import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

const pageSize = 10;

const EyeIcon = () => (
    <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
        <path d='M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z' />
        <circle cx='12' cy='12' r='3' />
    </svg>
);

const DeleteIcon = () => (
    <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
        <path d='M3 6h18' />
        <path d='M8 6V4h8v2' />
        <path d='M19 6l-1 16H6L5 6' />
        <path d='M10 11v6' />
        <path d='M14 11v6' />
    </svg>
);

const PlusIcon = () => (
    <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
        <path d='M12 5v14' />
        <path d='M5 12h14' />
    </svg>
);

const emptyItem = {
    productId: '',
    mrp: '',
    totalQty: '',
    discountPer: '',
    grossAmount: 0,
    discountAmount: 0,
    taxableAmount: 0,
    gstAmount: 0,
    payableAmount: 0
};

const today = new Date().toISOString().slice(0, 10);

const money = value =>
    Number(value || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

const num = value => Number(value || 0);

const PurchaseModal = ({
    title,
    buttonText,
    formData,
    setFormData,
    vendors,
    companies,
    products,
    errors,
    saving,
    onClose,
    onSubmit
}) => {
    const safeVendors = Array.isArray(vendors) ? vendors : [];
    const safeCompanies = Array.isArray(companies) ? companies : [];
    const safeProducts = Array.isArray(products) ? products : [];

    const activeVendors = useMemo(
        () => safeVendors.filter(vendor => vendor.active === true),
        [safeVendors]
    );

    const activeCompanies = useMemo(
        () => safeCompanies.filter(company => company.active === true),
        [safeCompanies]
    );

    const selectedVendor = activeVendors.find(v => Number(v.vendorId) === Number(formData.vendorId));

    const allowedCompanyIds = Array.isArray(selectedVendor?.companyIds)
        ? selectedVendor.companyIds.map(Number)
        : [];

    const availableCompanies = allowedCompanyIds.length
        ? activeCompanies.filter(c => allowedCompanyIds.includes(Number(c.companyId)))
        : activeCompanies;

    const availableProducts = safeProducts.filter(
        product => Number(product.companyId) === Number(formData.companyId)
    );

    useEffect(() => {
        if (formData.vendorId && !selectedVendor) {
            setFormData(prev => ({
                ...prev,
                vendorId: '',
                companyId: '',
                items: [{ ...emptyItem }]
            }));
            return;
        }

        if (
            formData.companyId &&
            !availableCompanies.some(company => String(company.companyId) === String(formData.companyId))
        ) {
            setFormData(prev => ({
                ...prev,
                companyId: '',
                items: [{ ...emptyItem }]
            }));
        }
    }, [formData.vendorId, formData.companyId, selectedVendor, availableCompanies, setFormData]);

    const updateForm = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'vendorId' ? { companyId: '', items: [{ ...emptyItem }] } : {}),
            ...(name === 'companyId' ? { items: [{ ...emptyItem }] } : {})
        }));
    };

    const calculateItem = (item, productId = item.productId) => {
        const product = products.find(p => Number(p.productId) === Number(productId));
        const mrp = num(item.mrp || product?.unitPrice);
        const totalQty = num(item.totalQty);
        const discountPer = num(item.discountPer);
        const gstPer = num(product?.gst);

        const grossAmount = mrp * totalQty;
        const discountAmount = (grossAmount * discountPer) / 100;
        const taxableAmount = grossAmount - discountAmount;
        const gstAmount = (taxableAmount * gstPer) / 100;
        const payableAmount = taxableAmount + gstAmount;

        return {
            ...item,
            productId,
            mrp,
            grossAmount,
            discountAmount,
            taxableAmount,
            gstAmount,
            payableAmount
        };
    };

    const updateItem = (index, name, value) => {
        setFormData(prev => {
            const items = prev.items.map((item, itemIndex) => {
                if (itemIndex !== index) return item;

                const nextItem = { ...item, [name]: value };

                if (name === 'productId') {
                    const product = products.find(p => Number(p.productId) === Number(value));
                    nextItem.mrp = product?.unitPrice || '';
                }

                return calculateItem(nextItem, nextItem.productId);
            });

            return { ...prev, items };
        });
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { ...emptyItem }]
        }));
    };

    const removeItem = index => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.length === 1
                ? [{ ...emptyItem }]
                : prev.items.filter((_, itemIndex) => itemIndex !== index)
        }));
    };

    const totals = useMemo(() => {
        const activeItems = formData.items.filter(item => item.productId);

        return {
            netItemCount: activeItems.length,
            netGross: activeItems.reduce((sum, item) => sum + num(item.grossAmount), 0),
            netDiscount: activeItems.reduce((sum, item) => sum + num(item.discountAmount), 0),
            taxableAmount: activeItems.reduce((sum, item) => sum + num(item.taxableAmount), 0),
            netGstAmount: activeItems.reduce((sum, item) => sum + num(item.gstAmount), 0),
            netPayableAmount: activeItems.reduce((sum, item) => sum + num(item.payableAmount), 0)
        };
    }, [formData.items]);

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3'>
            <div className='w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-lg bg-white shadow-lg'>
                <div className='sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3'>
                    <h2 className='text-lg font-semibold text-cyan-700'>{title}</h2>
                    <button type='button' onClick={onClose} className='text-xl leading-none'>x</button>
                </div>

                <form onSubmit={onSubmit} className='p-4'>
                    {errors.apiError && (
                        <div className='mb-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-700'>
                            {errors.apiError}
                        </div>
                    )}

                    <div className='grid grid-cols-1 gap-3 md:grid-cols-4'>
                        <div>
                            <label className='mb-1 block text-sm font-semibold'>Vendor</label>
                            <select
                                value={formData.vendorId}
                                onChange={e => updateForm('vendorId', e.target.value)}
                                className='w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500'
                            >
                                <option value=''>Select Vendor</option>
                                {activeVendors.map(vendor => (
                                    <option key={vendor.vendorId} value={vendor.vendorId}>
                                        {vendor.vname || vendor.vendorName}
                                    </option>
                                ))}
                            </select>
                            {errors.vendorId && <p className='mt-1 text-xs text-red-600'>{errors.vendorId}</p>}
                        </div>

                        <div>
                            <label className='mb-1 block text-sm font-semibold'>Company</label>
                            <select
                                value={formData.companyId}
                                onChange={e => updateForm('companyId', e.target.value)}
                                disabled={!formData.vendorId}
                                className='w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-100'
                            >
                                <option value=''>Select Company</option>
                                {availableCompanies.map(company => (
                                    <option key={company.companyId} value={company.companyId}>
                                        {company.cname || company.companyName}
                                    </option>
                                ))}
                            </select>
                            {errors.companyId && <p className='mt-1 text-xs text-red-600'>{errors.companyId}</p>}
                        </div>

                        <div>
                            <label className='mb-1 block text-sm font-semibold'>Invoice No</label>
                            <input
                                value={formData.invoiceNo}
                                onChange={e => updateForm('invoiceNo', e.target.value)}
                                className='w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500'
                            />
                            {errors.invoiceNo && <p className='mt-1 text-xs text-red-600'>{errors.invoiceNo}</p>}
                        </div>

                        <div>
                            <label className='mb-1 block text-sm font-semibold'>Invoice Date</label>
                            <input
                                type='date'
                                value={formData.invoiceDate}
                                onChange={e => updateForm('invoiceDate', e.target.value)}
                                className='w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500'
                            />
                        </div>
                    </div>

                    <div className='mt-5 rounded-lg border'>
                        <div className='flex items-center justify-between border-b bg-gray-50 px-3 py-2'>
                            <h3 className='font-semibold text-gray-700'>Purchase Products</h3>
                            <button
                                type='button'
                                onClick={addItem}
                                disabled={!formData.companyId}
                                className='inline-flex items-center gap-1 rounded-md bg-cyan-700 px-3 py-1.5 text-sm text-white disabled:bg-gray-300'
                            >
                                <PlusIcon /> Add Product
                            </button>
                        </div>

                        <div className='max-h-72 overflow-auto'>
                            <table className='min-w-full text-sm'>
                                <thead className='sticky top-0 bg-cyan-700 text-xs uppercase text-white'>
                                    <tr>
                                        <th className='px-2 py-2 text-left'>Product</th>
                                        <th className='px-2 py-2'>MRP</th>
                                        <th className='px-2 py-2'>Qty</th>
                                        <th className='px-2 py-2'>Disc %</th>
                                        <th className='px-2 py-2'>Gross</th>
                                        <th className='px-2 py-2'>Discount</th>
                                        <th className='px-2 py-2'>Taxable</th>
                                        <th className='px-2 py-2'>GST</th>
                                        <th className='px-2 py-2'>Payable</th>
                                        <th className='px-2 py-2'>Delete</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {formData.items.map((item, index) => (
                                        <tr key={index} className='border-b'>
                                            <td className='px-2 py-2'>
                                                <select
                                                    value={item.productId}
                                                    onChange={e => updateItem(index, 'productId', e.target.value)}
                                                    className='w-52 rounded-md border px-2 py-1.5 text-sm'
                                                >
                                                    <option value=''>Select Product</option>
                                                    {availableProducts.map(product => (
                                                        <option key={product.productId} value={product.productId}>
                                                            {product.pname || product.productName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className='px-2 py-2'>
                                                <input type='number' value={item.mrp} onChange={e => updateItem(index, 'mrp', e.target.value)} className='w-24 rounded-md border px-2 py-1.5 text-right' />
                                            </td>
                                            <td className='px-2 py-2'>
                                                <input type='number' value={item.totalQty} onChange={e => updateItem(index, 'totalQty', e.target.value)} className='w-20 rounded-md border px-2 py-1.5 text-right' />
                                            </td>
                                            <td className='px-2 py-2'>
                                                <input type='number' value={item.discountPer} onChange={e => updateItem(index, 'discountPer', e.target.value)} className='w-20 rounded-md border px-2 py-1.5 text-right' />
                                            </td>
                                            <td className='px-2 py-2 text-right'>{money(item.grossAmount)}</td>
                                            <td className='px-2 py-2 text-right'>{money(item.discountAmount)}</td>
                                            <td className='px-2 py-2 text-right'>{money(item.taxableAmount)}</td>
                                            <td className='px-2 py-2 text-right'>{money(item.gstAmount)}</td>
                                            <td className='px-2 py-2 text-right font-semibold'>{money(item.payableAmount)}</td>
                                            <td className='px-2 py-2 text-center'>
                                                <button type='button' onClick={() => removeItem(index)} className='rounded-md bg-red-100 p-1.5 text-red-700 hover:bg-red-200'>
                                                    <DeleteIcon />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {errors.items && <p className='px-3 py-2 text-sm text-red-600'>{errors.items}</p>}
                    </div>

                    <div className='mt-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 text-sm md:grid-cols-6'>
                        <div><span className='text-gray-500'>Items</span><p className='font-semibold'>{totals.netItemCount}</p></div>
                        <div><span className='text-gray-500'>Gross</span><p className='font-semibold'>{money(totals.netGross)}</p></div>
                        <div><span className='text-gray-500'>Discount</span><p className='font-semibold'>{money(totals.netDiscount)}</p></div>
                        <div><span className='text-gray-500'>Taxable</span><p className='font-semibold'>{money(totals.taxableAmount)}</p></div>
                        <div><span className='text-gray-500'>GST</span><p className='font-semibold'>{money(totals.netGstAmount)}</p></div>
                        <div><span className='text-gray-500'>Final</span><p className='font-semibold text-cyan-700'>{money(totals.netPayableAmount)}</p></div>
                    </div>

                    <div className='mt-5 flex justify-end gap-3'>
                        <button type='button' onClick={onClose} className='rounded-md border px-4 py-1.5 text-sm hover:bg-gray-100'>
                            Cancel
                        </button>
                        <button type='submit' disabled={saving} className='rounded-md bg-cyan-700 px-4 py-1.5 text-sm text-white hover:bg-cyan-800 disabled:opacity-60'>
                            {saving ? 'Saving...' : buttonText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Purchase = () => {
    const { token } = useAuth();
    const api = axios.create({
        baseURL: 'http://localhost:8080/api',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });

    const [purchases, setPurchases] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [products, setProducts] = useState([]);

    const activeVendors = useMemo(
        () => vendors.filter(vendor => vendor.active === true),
        [vendors]
    );

    const activeCompanies = useMemo(
        () => companies.filter(company => company.active === true),
        [companies]
    );

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [editingPurchase, setEditingPurchase] = useState(null);
    const [detailPurchase, setDetailPurchase] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [errors, setErrors] = useState({});

    const initialForm = {
        vendorId: '',
        companyId: '',
        invoiceNo: `PUR-${new Date().getFullYear()}-`,
        invoiceDate: today,
        items: [{ ...emptyItem }]
    };

    const [formData, setFormData] = useState(initialForm);

    React.useEffect(() => {
        setFormData(initialForm);
        setOpenAddModal(false);
        setErrors({});
        setDeleteTarget(null);
        setDetailPurchase(null);
    }, []);

    const fetchPurchases = async (page = 0) => {
        try {
            setLoading(true);
            const response = await api.get('/purchases/page', {
                params: { page, size: pageSize }
            });

            const pageData = response.data.data;
            setPurchases(pageData.content || []);
            setCurrentPage(pageData.number || 0);
            setTotalPages(pageData.totalPages || 0);
            setTotalElements(pageData.totalElements || 0);
        } finally {
            setLoading(false);
        }
    };

    const fetchLookups = async () => {
        const [vendorRes, companyRes, productRes] = await Promise.all([
            api.get('/vendors/page', { params: { page: 0, size: 1000 } }),
            api.get('/companies/page', { params: { page: 0, size: 1000 } }),
            api.get('/products/page', { params: { page: 0, size: 1000 } })
        ]);

        setVendors(vendorRes.data.data.content || []);
        setCompanies(companyRes.data.data.content || []);
        setProducts(productRes.data.data.content || []);
    };

    useEffect(() => {
        fetchLookups();
    }, []);

    useEffect(() => {
        fetchPurchases(currentPage);
    }, [currentPage]);

    const validate = () => {
        const nextErrors = {};

        if (!formData.vendorId) nextErrors.vendorId = 'Vendor is required';
        if (!formData.companyId) nextErrors.companyId = 'Company is required';
        if (!formData.invoiceNo.trim()) nextErrors.invoiceNo = 'Invoice number is required';

        const validItems = formData.items.filter(
            item => item.productId && num(item.totalQty) > 0 && num(item.mrp) > 0
        );

        if (!validItems.length) {
            nextErrors.items = 'Add at least one product with MRP and quantity';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const savePurchase = async e => {
        e.preventDefault();

        if (!validate()) return;

        const validItems = formData.items.filter(item => item.productId);

        const totals = {
            netItemCount: validItems.length,
            netGross: validItems.reduce((sum, item) => sum + num(item.grossAmount), 0),
            netDiscount: validItems.reduce((sum, item) => sum + num(item.discountAmount), 0),
            taxableAmount: validItems.reduce((sum, item) => sum + num(item.taxableAmount), 0),
            netGstAmount: validItems.reduce((sum, item) => sum + num(item.gstAmount), 0),
            netPayableAmount: validItems.reduce((sum, item) => sum + num(item.payableAmount), 0)
        };

        const payload = {
            vendorId: Number(formData.vendorId),
            companyId: Number(formData.companyId),
            invoiceNo: formData.invoiceNo.trim(),
            invoiceDate: formData.invoiceDate,
            ...totals,
            finalAmount: totals.netPayableAmount,
            items: validItems.map(item => ({
                productId: Number(item.productId),
                mrp: num(item.mrp),
                totalQty: num(item.totalQty),
                grossAmount: num(item.grossAmount),
                discountPer: num(item.discountPer),
                discountAmount: num(item.discountAmount),
                taxableAmount: num(item.taxableAmount),
                gstAmount: num(item.gstAmount),
                payableAmount: num(item.payableAmount)
            }))
        };

        try {
            setSaving(true);
            await api.post('/purchases', payload);
            setOpenAddModal(false);
            setFormData(initialForm);
            setErrors({});
            fetchPurchases(0);
        } catch (err) {
            setErrors({
                apiError: err.response?.data?.message || 'Unable to save purchase'
            });
        } finally {
            setSaving(false);
        }
    };

    const closeModal = () => {
        setOpenAddModal(false);
        setOpenEditModal(false);
        setEditingPurchase(null);
        setFormData(initialForm);
        setErrors({});
    };

    const handleEditClick = (purchase) => {
        setFormData({
            pmId: purchase.pmId,
            vendorId: String(purchase.vendorId || ''),
            companyId: String(purchase.companyId || ''),
            invoiceNo: purchase.invoiceNo || '',
            invoiceDate: purchase.invoiceDate || today,
            items: Array.isArray(purchase.items) && purchase.items.length > 0
                ? purchase.items.map(item => ({
                    productId: String(item.productId || ''),
                    mrp: item.mrp ?? '',
                    totalQty: item.totalQty ?? '',
                    discountPer: item.discountPer ?? '',
                    grossAmount: item.grossAmount ?? 0,
                    discountAmount: item.discountAmount ?? 0,
                    taxableAmount: item.taxableAmount ?? 0,
                    gstAmount: item.gstAmount ?? 0,
                    payableAmount: item.payableAmount ?? 0
                }))
                : [{ ...emptyItem }]
        });
        setEditingPurchase(purchase);
        setErrors({});
        setOpenEditModal(true);
    };

    const updatePurchase = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        const validItems = formData.items.filter(item => item.productId);

        const totals = {
            netItemCount: validItems.length,
            netGross: validItems.reduce((sum, item) => sum + num(item.grossAmount), 0),
            netDiscount: validItems.reduce((sum, item) => sum + num(item.discountAmount), 0),
            taxableAmount: validItems.reduce((sum, item) => sum + num(item.taxableAmount), 0),
            netGstAmount: validItems.reduce((sum, item) => sum + num(item.gstAmount), 0),
            netPayableAmount: validItems.reduce((sum, item) => sum + num(item.payableAmount), 0)
        };

        const payload = {
            vendorId: Number(formData.vendorId),
            companyId: Number(formData.companyId),
            invoiceNo: formData.invoiceNo.trim(),
            invoiceDate: formData.invoiceDate,
            ...totals,
            finalAmount: totals.netPayableAmount,
            items: validItems.map(item => ({
                productId: Number(item.productId),
                mrp: num(item.mrp),
                totalQty: num(item.totalQty),
                grossAmount: num(item.grossAmount),
                discountPer: num(item.discountPer),
                discountAmount: num(item.discountAmount),
                taxableAmount: num(item.taxableAmount),
                gstAmount: num(item.gstAmount),
                payableAmount: num(item.payableAmount)
            }))
        };

        try {
            setSaving(true);
            await api.patch(`/purchases/${formData.pmId}`, payload);
            setOpenEditModal(false);
            setEditingPurchase(null);
            setFormData(initialForm);
            setErrors({});
            fetchPurchases(currentPage);
        } catch (err) {
            setErrors({
                apiError: err.response?.data?.message || 'Unable to update purchase'
            });
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            setDeleting(true);
            await api.delete(`/purchases/${deleteTarget.pmId}`);
            setPurchases(prev => prev.filter(p => p.pmId !== deleteTarget.pmId));
            setTotalElements(prev => Math.max(prev - 1, 0));
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className='p-4'>
            <div className='mb-6 flex flex-col items-center justify-between gap-4 md:flex-row'>
                <div>
                    <h1 className='text-2xl font-semibold text-cyan-700'>Purchase Management</h1>
                    <p className='mt-1 text-gray-500'>Total Purchases : {totalElements}</p>
                </div>

                <button
                    onClick={() => {
                        setFormData(initialForm);
                        setErrors({});
                        setOpenAddModal(true);
                    }}
                    className='inline-flex items-center gap-2 rounded-md bg-cyan-700 px-4 py-1.5 text-sm text-white hover:bg-cyan-800'
                >
                    <PlusIcon /> Add Purchase
                </button>
            </div>

            <div className='max-h-[520px] overflow-auto rounded-lg border border-gray-200 bg-white'>
                <table className='min-w-full text-sm'>
                    <thead className='sticky top-0 z-10 bg-cyan-700 text-xs uppercase text-white'>
                        <tr>
                            <th className='px-3 py-2 text-left'>ID</th>
                            <th className='px-3 py-2 text-left'>Invoice No</th>
                            <th className='px-3 py-2 text-left'>Date</th>
                            <th className='px-3 py-2 text-left'>Vendor</th>
                            <th className='px-3 py-2 text-left'>Company</th>
                            <th className='px-3 py-2 text-left'>Status</th>
                            <th className='px-3 py-2 text-right'>Items</th>
                            <th className='px-3 py-2 text-right'>Gross</th>
                            <th className='px-3 py-2 text-right'>GST</th>
                            <th className='px-3 py-2 text-right'>Final</th>
                            <th className='px-3 py-2 text-center'>Edit</th>
                            <th className='px-3 py-2 text-center'>View</th>
                            <th className='px-3 py-2 text-center'>Delete</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan='13' className='py-8 text-center text-gray-500'>Loading purchases...</td>
                            </tr>
                        ) : purchases.length ? (
                            purchases.map(purchase => (
                                <tr key={purchase.pmId} className='border-b hover:bg-cyan-50'>
                                    <td className='px-3 py-2'>{purchase.pmId}</td>
                                    <td className='px-3 py-2 font-semibold'>{purchase.invoiceNo}</td>
                                    <td className='px-3 py-2'>{purchase.invoiceDate}</td>
                                    <td className='px-3 py-2'>{purchase.vendorName}</td>
                                    <td className='px-3 py-2'>{purchase.companyName}</td>
                                    <td className='px-3 py-2'>
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${purchase.active ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                                            {purchase.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className='px-3 py-2 text-right'>{purchase.netItemCount}</td>
                                    <td className='px-3 py-2 text-right'>{money(purchase.netGross)}</td>
                                    <td className='px-3 py-2 text-right'>{money(purchase.netGstAmount)}</td>
                                    <td className='px-3 py-2 text-right font-semibold'>{money(purchase.finalAmount)}</td>
                                    <td className='px-3 py-2 text-center'>
                                        <button
                                            type='button'
                                            onClick={() => handleEditClick(purchase)}
                                            className='bg-blue-100 hover:bg-blue-200 text-blue-700 p-1.5 rounded-md'
                                            aria-label='Edit purchase'
                                        >
                                            ✏️
                                        </button>
                                    </td>
                                    <td className='px-3 py-2 text-center'>
                                        <button
                                            type='button'
                                            onClick={() => setDetailPurchase(purchase)}
                                            className='bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-md'
                                            aria-label='View purchase details'
                                        >
                                            <EyeIcon />
                                        </button>
                                    </td>
                                    <td className='px-3 py-2 text-center'>
                                        <button
                                            type='button'
                                            onClick={() => setDeleteTarget(purchase)}
                                            className='bg-red-100 hover:bg-red-200 text-red-700 p-1.5 rounded-md'
                                            aria-label='Delete purchase'
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan='13' className='py-8 text-center text-gray-500'>No purchases found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className='mt-6 flex items-center justify-between'>
                <button
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    disabled={currentPage === 0}
                    className='rounded-md bg-cyan-700 px-3 py-1.5 text-sm text-white disabled:cursor-not-allowed disabled:bg-gray-300'
                >
                    Previous
                </button>

                <div className='font-medium'>
                    Page {totalPages === 0 ? 0 : currentPage + 1} of {totalPages}
                </div>

                <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={totalPages === 0 || currentPage === totalPages - 1}
                    className='rounded-md bg-cyan-700 px-3 py-1.5 text-sm text-white disabled:cursor-not-allowed disabled:bg-gray-300'
                >
                    Next
                </button>
            </div>

            {openAddModal && (
                <PurchaseModal
                    title='Add Purchase'
                    buttonText='Save Purchase'
                    formData={formData}
                    setFormData={setFormData}
                    vendors={vendors}
                    companies={companies}
                    products={products}
                    errors={errors}
                    saving={saving}
                    onClose={closeModal}
                    onSubmit={savePurchase}
                />
            )}
            {openEditModal && (
                <PurchaseModal
                    title='Edit Purchase'
                    buttonText='Update Purchase'
                    formData={formData}
                    setFormData={setFormData}
                    vendors={vendors}
                    companies={companies}
                    products={products}
                    errors={errors}
                    saving={saving}
                    onClose={closeModal}
                    onSubmit={updatePurchase}
                />
            )}

            {detailPurchase && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3'>
                    <div className='w-full max-w-5xl rounded-lg bg-white p-4 shadow-lg'>
                        <div className='mb-4 flex items-center justify-between'>
                            <h2 className='text-lg font-semibold text-cyan-700'>
                                Purchase Details - {detailPurchase.invoiceNo}
                            </h2>
                            <button onClick={() => setDetailPurchase(null)} className='text-xl'>x</button>
                        </div>

                        <div className='max-h-[65vh] overflow-auto rounded-lg border'>
                            <table className='min-w-full text-sm'>
                                <thead className='bg-cyan-700 text-xs uppercase text-white'>
                                    <tr>
                                        <th className='px-3 py-2 text-left'>Product</th>
                                        <th className='px-3 py-2 text-right'>MRP</th>
                                        <th className='px-3 py-2 text-right'>Qty</th>
                                        <th className='px-3 py-2 text-right'>Sold</th>
                                        <th className='px-3 py-2 text-right'>Gross</th>
                                        <th className='px-3 py-2 text-right'>Discount</th>
                                        <th className='px-3 py-2 text-right'>Taxable</th>
                                        <th className='px-3 py-2 text-right'>GST</th>
                                        <th className='px-3 py-2 text-right'>Payable</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(detailPurchase.items || []).map(item => (
                                        <tr key={item.psId} className='border-b'>
                                            <td className='px-3 py-2 font-medium'>{item.productName}</td>
                                            <td className='px-3 py-2 text-right'>{money(item.mrp)}</td>
                                            <td className='px-3 py-2 text-right'>{item.totalQty}</td>
                                            <td className='px-3 py-2 text-right'>{item.soldQty}</td>
                                            <td className='px-3 py-2 text-right'>{money(item.grossAmount)}</td>
                                            <td className='px-3 py-2 text-right'>{money(item.discountAmount)}</td>
                                            <td className='px-3 py-2 text-right'>{money(item.taxableAmount)}</td>
                                            <td className='px-3 py-2 text-right'>{money(item.gstAmount)}</td>
                                            <td className='px-3 py-2 text-right font-semibold'>{money(item.payableAmount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3'>
                    <div className='w-full max-w-sm rounded-lg bg-white p-4 shadow-lg'>
                        <h2 className='mb-3 text-lg font-semibold text-cyan-700'>Confirm Deletion</h2>
                        <p className='mb-5 text-sm text-gray-700'>
                            Delete purchase <strong>{deleteTarget.invoiceNo}</strong>? This action cannot be undone.
                        </p>

                        <div className='flex justify-end gap-3'>
                            <button onClick={() => setDeleteTarget(null)} className='rounded-md border px-4 py-1.5 text-sm hover:bg-gray-100'>
                                Cancel
                            </button>
                            <button onClick={confirmDelete} disabled={deleting} className='rounded-md bg-red-700 px-4 py-1.5 text-sm text-white hover:bg-red-800 disabled:opacity-60'>
                                {deleting ? 'Deleting...' : 'Delete Purchase'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Purchase;