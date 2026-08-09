import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

const UnitModal = ({
    title, data, errors, onSubmit, onClose, loading, buttonText, handleChange
}) => (
    <div className='fixed inset-0 bg-black/40 flex justify-center items-center z-50'>
        <div className='bg-white w-full max-w-sm rounded-lg shadow-lg p-4'>
            <div className='flex justify-between mb-5'>
                <h2 className='text-lg font-semibold text-cyan-700'>{title}</h2>
                <button onClick={onClose}>✕</button>
            </div>

            <form onSubmit={onSubmit}>
                {errors.apiError && <div className='bg-red-100 text-red-700 p-3 rounded-lg mb-4'>{errors.apiError}</div>}

                {['uname', 'uabbr'].map(field => (
                    <div key={field} className='mb-4'>
                        <label className='block mb-2 font-semibold'>{field === 'uname' ? 'Unit Name' : 'Unit Abbreviation'}</label>
                        <input
                            type='text'
                            name={field}
                            value={data[field]}
                            onChange={handleChange}
                            className='w-full border rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-cyan-500' />
                        {errors[field] && <p className='text-red-600 text-sm mt-1'>{errors[field]}</p>}
                    </div>
                ))}

                <div className='flex justify-end gap-3 mt-5'>
                    <button type='button' onClick={onClose} className='px-4 py-1.5 text-sm border rounded-md'>Cancel</button>
                    <button type='submit' disabled={loading} className='bg-cyan-700 text-white px-4 py-1.5 text-sm rounded-md'>
                        {loading ? 'Processing...' : buttonText}
                    </button>
                </div>
            </form>
        </div>
    </div>
);

const DeleteConfirmationModal = ({ unit, onCancel, onConfirm, loading, error }) => (
    <div className='fixed inset-0 bg-black/40 flex justify-center items-center z-50'>
        <div className='bg-white w-full max-w-sm rounded-lg shadow-lg p-4'>
            <h2 className='text-lg font-semibold text-cyan-700 mb-4'>Confirm Deletion</h2>
            <p className='mb-4'>Delete <strong>{unit?.uname}</strong> ?</p>
            {error && <div className='bg-red-100 text-red-700 p-3 rounded-lg mb-4'>{error}</div>}
            <div className='flex justify-end gap-2'>
                <button onClick={onCancel} className='border px-4 py-1.5 rounded-md'>Cancel</button>
                <button onClick={onConfirm} disabled={loading} className='bg-red-600 text-white px-4 py-1.5 rounded-md'>
                    {loading ? 'Deleting...' : 'Delete Unit'}
                </button>
            </div>
        </div>
    </div>
);

const Unit = () => {
    const { token } = useAuth();
    const api = axios.create({
        baseURL: 'http://localhost:8080/api',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });

    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('unitId');
    const [sortDirection, setSortDirection] = useState('asc');

    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);

    const [saving, setSaving] = useState(false);
    const [editSaving, setEditSaving] = useState(false);
    const [toggleLoadingId, setToggleLoadingId] = useState(null);

    const isFirstPage = currentPage === 0;
    const isLastPage = currentPage === totalPages - 1;

    const [formErrors, setFormErrors] = useState({});
    const [editErrors, setEditErrors] = useState({});
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const [formData, setFormData] = useState({ uname: '', uabbr: '' });
    const [editFormData, setEditFormData] = useState({ unitId: '', uname: '', uabbr: '' });

    const fetchUnits = async (page = 0) => {
        try {
            setLoading(true);
            const response = await api.get('/units/page', { params: { page, size: 10 } });
            let data = response.data.data.content;
            if (searchTerm.trim()) {
                data = data.filter(u => u.uname.toLowerCase().includes(searchTerm.toLowerCase()) || u.uabbr.toLowerCase().includes(searchTerm.toLowerCase()));
            }
            setUnits(data);
            setCurrentPage(response.data.data.number);
            setTotalPages(response.data.data.totalPages);
            setTotalElements(response.data.data.totalElements);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchUnits(currentPage) }, [currentPage]);
    useEffect(() => {
        const t = setTimeout(() => fetchUnits(0), 400);
        return () => clearTimeout(t);
    }, [searchTerm]);

    const validate = (data, setErrors) => {
        const e = {};
        if (!data.uname.trim()) e.uname = 'Unit name required';
        if (!data.uabbr.trim()) e.uabbr = 'Unit abbreviation required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (openEditModal) setEditFormData(p => ({ ...p, [name]: value }));
        else setFormData(p => ({ ...p, [name]: value }));
    };

    const saveUnit = async (e) => {
        e.preventDefault();
        if (!validate(formData, setFormErrors)) return;
        try {
            setSaving(true);
            await api.post('/units', formData);
            setOpenAddModal(false);
            setFormData({ uname: '', uabbr: '' });
            fetchUnits(currentPage);
        } catch (err) { setFormErrors({ apiError: err.response?.data?.message }) }
        finally { setSaving(false); }
    };

    const updateUnit = async (e) => {
        e.preventDefault();
        if (!validate(editFormData, setEditErrors)) return;
        try {
            setEditSaving(true);
            await api.patch(`/units/${editFormData.unitId}`, { uname: editFormData.uname, uabbr: editFormData.uabbr });
            setOpenEditModal(false);
            fetchUnits(currentPage);
        } catch (err) { setEditErrors({ apiError: err.response?.data?.message }) }
        finally { setEditSaving(false); }
    };

    const deleteUnit = async () => {
        try {
            setDeleting(true);
            await api.delete(`/units/${deleteTarget.unitId}`);
            setDeleteTarget(null);
            fetchUnits(currentPage);
        } catch (err) { setDeleteError(err.response?.data?.message) }
        finally { setDeleting(false); }
    };

    const toggleUnitStatus = async (unit) => {
        try {
            setToggleLoadingId(unit.unitId);
            await api.patch(`/units/${unit.unitId}`, { active: !unit.active });
            fetchUnits(currentPage);
        } finally { setToggleLoadingId(null); }
    };

    return (
        <div className='p-4'>
            <div className='flex flex-col md:flex-row justify-between items-center gap-4 mb-6'>
                <div>
                    <h1 className='text-2xl font-semibold text-cyan-700'>Unit Management</h1>
                    <p className='text-gray-500 mt-1'>Total Units : {totalElements}</p>
                </div>
                <div className='flex gap-2'>
                    <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder='Search unit...' className='border rounded-md px-3 py-1.5 text-sm' />
                    <button onClick={() => setOpenAddModal(true)} className='bg-cyan-700 text-white px-4 py-1.5 text-sm rounded-md'>+ Add Unit</button>
                </div>
            </div>

            <div className='overflow-x-auto max-h-[500px] bg-white rounded-lg border border-gray-200'>
                <table className='min-w-full text-sm'>
                    <thead className='bg-cyan-700 text-white text-xs'>
                        <tr>
                            <th className='px-3 py-2'>ID</th><th className='px-3 py-2'>Unit Name</th><th className='px-3 py-2'>Abbreviation</th>
                            <th className='px-3 py-2'>Created At</th><th className='px-3 py-2'>Updated At</th>
                            <th className='px-3 py-2'>Status</th><th className='px-3 py-2'>Edit</th><th className='px-3 py-2'>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {units.map(unit => (<tr key={unit.unitId} className='border-b hover:bg-cyan-50'>
                            <td className='px-3 py-2'>{unit.unitId}</td>
                            <td className='px-3 py-2 font-semibold'>{unit.uname}</td>
                            <td className='px-3 py-2'>{unit.uabbr}</td>
                            <td className='px-3 py-2'>{new Date(unit.createdAt).toLocaleString()}</td>
                            <td className='px-3 py-2'>{new Date(unit.updatedAt).toLocaleString()}</td>
                            <td className='px-3 py-2'>
                                <button onClick={() => toggleUnitStatus(unit)} disabled={toggleLoadingId === unit.unitId}
                                    className={`relative inline-flex items-center h-5 w-10 rounded-full ${unit.active ? 'bg-green-500' : 'bg-red-500'}`}>
                                    <span className={`h-4 w-4 bg-white rounded-full ${unit.active ? 'translate-x-5' : 'translate-x-1'}`}></span>
                                </button>
                            </td>
                            <td className='text-center'><button onClick={() => { setEditFormData(unit); setOpenEditModal(true) }}>✏️</button></td>
                            <td className='text-center'><button onClick={() => setDeleteTarget(unit)}>🗑️</button></td>
                        </tr>))}
                    </tbody>
                </table>
            </div>

            <div className='flex justify-between items-center mt-6'>
                <button
                    onClick={() => setCurrentPage(p => p - 1)}
                    disabled={isFirstPage}
                    className='px-3 py-1.5 text-sm rounded-md bg-cyan-700 text-white disabled:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:filter disabled:blur-sm'
                >Previous</button>
                <div>Page {currentPage + 1} of {totalPages}</div>
                <button
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={isLastPage}
                    className='px-3 py-1.5 text-sm rounded-md bg-cyan-700 text-white disabled:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:filter disabled:blur-sm'
                >Next</button>
            </div>

            {openAddModal && <UnitModal title='Add Unit' data={formData} errors={formErrors} onSubmit={saveUnit} onClose={() => setOpenAddModal(false)} loading={saving} buttonText='Save Unit' handleChange={handleChange} />}
            {openEditModal && <UnitModal title='Edit Unit' data={editFormData} errors={editErrors} onSubmit={updateUnit} onClose={() => setOpenEditModal(false)} loading={editSaving} buttonText='Update Unit' handleChange={handleChange} />}
            {deleteTarget && <DeleteConfirmationModal unit={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={deleteUnit} loading={deleting} error={deleteError} />}
        </div>
    );
}

export default Unit;
