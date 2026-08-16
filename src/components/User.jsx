import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

const AddUserModal = ({ data, errors, setData, setErrors, onSubmit, onClose, loading }) => (
  <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
    <div className='w-full max-w-lg rounded-xl bg-white p-6 shadow-xl'>
      <div className='flex items-center justify-between mb-5'>
        <h2 className='text-xl font-semibold text-slate-900'>Add User</h2>
        <button onClick={onClose} className='text-xl font-bold text-slate-500'>✕</button>
      </div>

      <form onSubmit={onSubmit} className='space-y-4'>
        {errors.apiError && (
          <div className='rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200'>
            {errors.apiError}
          </div>
        )}

        <div>
          <label className='block text-sm font-medium text-slate-700'>Name</label>
          <input
            name='userName'
            value={data.userName}
            onChange={(e) => setData(prev => ({ ...prev, userName: e.target.value }))}
            className='mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200'
            placeholder='Kiran Sarkar'
          />
          {errors.userName && <p className='mt-1 text-sm text-red-600'>{errors.userName}</p>}
        </div>

        <div>
          <label className='block text-sm font-medium text-slate-700'>Email</label>
          <input
            name='userEmail'
            type='email'
            value={data.userEmail}
            onChange={(e) => setData(prev => ({ ...prev, userEmail: e.target.value }))}
            className='mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200'
            placeholder='kiran.sarkar@yopmail.com'
          />
          {errors.userEmail && <p className='mt-1 text-sm text-red-600'>{errors.userEmail}</p>}
        </div>

        <div>
          <label className='block text-sm font-medium text-slate-700'>Password</label>
          <div className='relative mt-2'>
            <input
              name='userPassword'
              type={data.showPassword ? 'text' : 'password'}
              value={data.userPassword}
              onChange={(e) => setData(prev => ({ ...prev, userPassword: e.target.value }))}
              className='w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 pr-20 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200'
              placeholder='Kiran@1234'
            />
            <button
              type='button'
              onClick={() => setData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
              className='absolute inset-y-0 right-3 inline-flex items-center text-sm font-semibold text-slate-600 transition hover:text-slate-900'
            >
              {data.showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.userPassword && <p className='mt-1 text-sm text-red-600'>{errors.userPassword}</p>}
        </div>

        <div>
          <label className='block text-sm font-medium text-slate-700'>Confirm Password</label>
          <div className='relative mt-2'>
            <input
              name='confirmPassword'
              type={data.showPassword ? 'text' : 'password'}
              value={data.confirmPassword}
              onChange={(e) => setData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className='w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 pr-20 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200'
              placeholder='Confirm password'
            />
            <button
              type='button'
              onClick={() => setData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
              className='absolute inset-y-0 right-3 inline-flex items-center text-sm font-semibold text-slate-600 transition hover:text-slate-900'
            >
              {data.showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.confirmPassword && <p className='mt-1 text-sm text-red-600'>{errors.confirmPassword}</p>}
        </div>

        <div>
          <label className='block text-sm font-medium text-slate-700'>Role</label>
          <select
            name='userRole'
            value={data.userRole}
            onChange={(e) => setData(prev => ({ ...prev, userRole: e.target.value }))}
            className='mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200'
          >
            <option value='ROLE_USER'>ROLE_USER</option>
            <option value='ROLE_ADMIN'>ROLE_ADMIN</option>
          </select>
          {errors.userRole && <p className='mt-1 text-sm text-red-600'>{errors.userRole}</p>}
        </div>

        <div className='flex justify-end gap-3 pt-2'>
          <button type='button' onClick={onClose} className='rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100'>
            Cancel
          </button>
          <button type='submit' disabled={loading} className='rounded-2xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-cyan-300'>
            {loading ? 'Saving...' : 'Save User'}
          </button>
        </div>
      </form>
    </div>
  </div>
);

const EditUserModal = ({ data, onClose, onSubmit, loading }) => (
  <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
    <div className='w-full max-w-md rounded-xl bg-white p-6 shadow-xl'>
      <div className='flex items-center justify-between mb-5'>
        <h2 className='text-xl font-semibold text-slate-900'>Edit User</h2>
        <button onClick={onClose} className='text-xl font-bold text-slate-500'>✕</button>
      </div>

      <form onSubmit={onSubmit} className='space-y-4'>
        <div className='rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600'>
          Editing active status only. User name, email, and role are provided for reference.
        </div>

        <div>
          <p className='text-sm font-medium text-slate-700'>Name</p>
          <p className='mt-1 text-sm text-slate-900'>{data.userName}</p>
        </div>

        <div>
          <p className='text-sm font-medium text-slate-700'>Email</p>
          <p className='mt-1 text-sm text-slate-900'>{data.userEmail}</p>
        </div>

        <div>
          <p className='text-sm font-medium text-slate-700'>Role</p>
          <p className='mt-1 text-sm text-slate-900'>{data.userRole}</p>
        </div>

        <div>
          <label className='block text-sm font-medium text-slate-700'>Active</label>
          <select
            value={String(data.active)}
            onChange={(e) => data.setActive(e.target.value === 'true')}
            className='mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200'
          >
            <option value='true'>Active</option>
            <option value='false'>Inactive</option>
          </select>
        </div>

        <div className='flex justify-end gap-3 pt-2'>
          <button type='button' onClick={onClose} className='rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100'>
            Cancel
          </button>
          <button type='submit' disabled={loading} className='rounded-2xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-cyan-300'>
            {loading ? 'Updating...' : 'Update User'}
          </button>
        </div>
      </form>
    </div>
  </div>
);

const User = () => {
  const { token, userRole, userId: currentUserId } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('userId');
  const [sortDirection, setSortDirection] = useState('asc');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ userName: '', userEmail: '', userPassword: '', confirmPassword: '', userRole: 'ROLE_USER' });
  const [editFormData, setEditFormData] = useState({ userId: '', userName: '', userEmail: '', userRole: '', active: true, setActive: () => {} });

  const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });

  useEffect(() => {
    if (userRole === 'ROLE_ADMIN') {
      fetchUsers(currentPage, searchTerm, sortField, sortDirection);
    }
  }, [currentPage, searchTerm, sortField, sortDirection, userRole]);

  const fetchUsers = async (page = 0, search = '', field = 'userId', direction = 'asc') => {
    setLoading(true);
    try {
      const response = await api.get('/users/page', { params: { page, size: 10, sort: `${field},${direction}` } });
      const pageData = response.data.data;
      let userList = pageData.content || [];

      if (search.trim()) {
        const term = search.toLowerCase();
        userList = userList.filter(user =>
          user.userName.toLowerCase().includes(term) ||
          user.userEmail.toLowerCase().includes(term) ||
          user.userRole.toLowerCase().includes(term)
        );
      }

      setUsers(userList);
      setCurrentPage(pageData.number || 0);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
    } catch {
      setUsers([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.userName.trim()) nextErrors.userName = 'Name is required';
    if (!formData.userEmail.trim()) nextErrors.userEmail = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)) nextErrors.userEmail = 'Enter a valid email';
    if (!formData.userPassword.trim()) nextErrors.userPassword = 'Password is required';
    if (!formData.confirmPassword.trim()) nextErrors.confirmPassword = 'Confirm password is required';
    if (formData.userPassword.trim() && formData.confirmPassword.trim() && formData.userPassword !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords must match';
    }
    if (!formData.userRole.trim()) nextErrors.userRole = 'Role is required';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveUser = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      const { confirmPassword, ...payload } = formData;
      await api.post('/users', payload);
      setOpenAddModal(false);
      setFormData({ userName: '', userEmail: '', userPassword: '', confirmPassword: '', userRole: 'ROLE_USER' });
      fetchUsers(currentPage, searchTerm, sortField, sortDirection);
    } catch (err) {
      setErrors({ apiError: err.response?.data?.message || 'Unable to save user' });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (user) => {
    setEditFormData({
      userId: user.userId,
      userName: user.userName,
      userEmail: user.userEmail,
      userRole: user.userRole,
      active: user.active,
      setActive: (active) => setEditFormData(prev => ({ ...prev, active }))
    });
    setOpenEditModal(true);
  };

  const updateUser = async (event) => {
    event.preventDefault();

    try {
      setEditSaving(true);
      await api.patch(`/users/${editFormData.userId}`, { active: editFormData.active });
      setOpenEditModal(false);
      fetchUsers(currentPage, searchTerm, sortField, sortDirection);
    } catch (err) {
      setErrors({ apiError: err.response?.data?.message || 'Unable to update user' });
    } finally {
      setEditSaving(false);
    }
  };

  const toggleUserActive = async (user) => {
    if (user.userId === currentUserId) {
      return;
    }

    try {
      setSaving(true);
      await api.patch(`/users/${user.userId}`, { active: !user.active });
      fetchUsers(currentPage, searchTerm, sortField, sortDirection);
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (userId) => {
    try {
      setDeleting(true);
      await api.delete(`/users/delete/${userId}`);
      setDeleteTarget(null);
      fetchUsers(currentPage, searchTerm, sortField, sortDirection);
    } finally {
      setDeleting(false);
    }
  };

  if (userRole !== 'ROLE_ADMIN') {
    return (
      <div className='flex min-h-[60vh] items-center justify-center'>
        <div className='rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm'>
          <h2 className='text-xl font-semibold text-slate-900'>Access Denied</h2>
          <p className='mt-3 text-sm text-slate-600'>User management is available for administrators only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-4'>
      <div className='flex flex-col md:flex-row justify-between items-center gap-4 mb-6'>
        <div>
          <h1 className='text-2xl font-semibold text-cyan-700'>User Management</h1>
          <p className='text-gray-500 mt-1'>Total Users: {totalElements}</p>
        </div>

        <div className='flex gap-2'>
          <input
            type='text'
            placeholder='Search users...'
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
            className='border rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500'
          />

          <button
            type='button'
            onClick={() => setOpenAddModal(true)}
            className='bg-cyan-700 hover:bg-cyan-800 text-white px-4 py-1.5 text-sm rounded-md'
          >
            + Add User
          </button>
        </div>
      </div>

      <div className='overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm'>

        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-slate-200 text-sm'>
            <thead className='bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-slate-500'>
              <tr>
                <th className='px-4 py-3'>ID</th>
                <th className='px-4 py-3 cursor-pointer' onClick={() => handleSort('userName')}>Name</th>
                <th className='px-4 py-3'>Email</th>
                <th className='px-4 py-3'>Role</th>
                <th className='px-4 py-3'>Created At</th>
                <th className='px-4 py-3 text-center'>STATUS</th>
                <th className='px-4 py-3 text-center'>Delete</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-200'>
              {users.map((user) => (
                <tr key={user.userId} className='hover:bg-slate-50'>
                  <td className='px-4 py-4'>{user.userId}</td>
                  <td className='px-4 py-4 font-medium text-slate-900'>{user.userName}</td>
                  <td className='px-4 py-4'>{user.userEmail}</td>
                  <td className='px-4 py-4'>{user.userRole}</td>
                  <td className='px-4 py-4'>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className='px-4 py-4 text-center'>
                    {user.userId === currentUserId ? (
                      <span className='inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700'>
                        Current
                      </span>
                    ) : (
                      <button
                        type='button'
                        onClick={() => toggleUserActive(user)}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full disabled:opacity-60 disabled:cursor-not-allowed ${user.active ? 'bg-green-500' : 'bg-red-500'}`}
                        aria-label={user.active ? 'Set inactive' : 'Set active'}
                      >
                        <span className={`h-4 w-4 bg-white rounded-full transition-all ${user.active ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    )}
                  </td>
                  <td className='px-4 py-4 text-center'>
                    <button
                      type='button'
                      onClick={() => setDeleteTarget(user)}
                      disabled={user.userId === currentUserId}
                      className={`p-1.5 rounded-md ${user.userId === currentUserId ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-red-100 hover:bg-red-200 text-red-700'}`}
                      aria-label={user.userId === currentUserId ? 'Cannot delete current user' : 'Delete user'}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='flex justify-between items-center mt-6'>
          <button
            type='button'
            onClick={() => setCurrentPage(prev => prev - 1)}
            disabled={currentPage === 0}
            className='px-3 py-1.5 text-sm rounded-md bg-cyan-700 text-white disabled:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:filter disabled:blur-sm'
          >
            Previous
          </button>

          <div className='font-medium'>
            Page {currentPage + 1} of {totalPages}
          </div>

          <button
            type='button'
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
            disabled={currentPage >= totalPages - 1}
            className='px-3 py-1.5 text-sm rounded-md bg-cyan-700 text-white disabled:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:filter disabled:blur-sm'
          >
            Next
          </button>
        </div>
      </div>

      {openAddModal && (
        <AddUserModal
          data={formData}
          errors={errors}
          setData={setFormData}
          setErrors={setErrors}
          onSubmit={saveUser}
          onClose={() => setOpenAddModal(false)}
          loading={saving}
        />
      )}

      {openEditModal && (
        <EditUserModal
          data={editFormData}
          onClose={() => setOpenEditModal(false)}
          onSubmit={updateUser}
          loading={editSaving}
        />
      )}

      {deleteTarget && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <div className='w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl'>
            <h2 className='text-lg font-semibold text-slate-900'>Delete User</h2>
            <p className='mt-3 text-sm text-slate-600'>Are you sure you want to delete {deleteTarget.userName}?</p>
            <div className='mt-6 flex justify-end gap-3'>
              <button onClick={() => setDeleteTarget(null)} className='rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100'>Cancel</button>
              <button
                onClick={() => deleteUser(deleteTarget.userId)}
                disabled={deleting}
                className='rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;
