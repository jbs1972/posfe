import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProductModal = ({
    title,
    data,
    companies,
    units,
    errors,
    onChange,
    onSubmit,
    onClose,
    loading,
    buttonText
}) => (
    <div className='fixed inset-0 bg-black/40 flex justify-center items-center z-50'>
        <div className='bg-white w-full max-w-2xl rounded-lg shadow-lg p-4'>
            <div className='flex justify-between mb-4'>
                <h2 className='text-lg font-semibold text-cyan-700'>{title}</h2>
                <button onClick={onClose}>✕</button>
            </div>

            <form onSubmit={onSubmit}>
                {errors.apiError && (
                    <div className='bg-red-100 text-red-700 p-2 rounded mb-3'>
                        {errors.apiError}
                    </div>
                )}

                <div className='grid grid-cols-2 gap-3'>
                    <select name='companyId' value={data.companyId} onChange={onChange} className='border rounded px-3 py-2'>
                        <option value=''>Select Company</option>
                        {companies.map(c => (
                            <option key={c.companyId} value={c.companyId}>{c.cname}</option>
                        ))}
                    </select>

                    <select name='unitId' value={data.unitId} onChange={onChange} className='border rounded px-3 py-2'>
                        <option value=''>Select Unit</option>
                        {units.map(u => (
                            <option key={u.unitId} value={u.unitId}>{u.uname}</option>
                        ))}
                    </select>

                    <input name='pname' placeholder='Product Name' value={data.pname} onChange={onChange} className='border rounded px-3 py-2' />
                    <input name='hsn' placeholder='HSN' value={data.hsn} onChange={onChange} className='border rounded px-3 py-2' />
                    <input name='gst' placeholder='GST %' value={data.gst} onChange={onChange} className='border rounded px-3 py-2' />
                    <input name='unitPrice' placeholder='Unit Price' value={data.unitPrice} onChange={onChange} className='border rounded px-3 py-2' />
                    <input name='stock' placeholder='Stock' value={data.stock} onChange={onChange} className='border rounded px-3 py-2' />

                    <label className='flex items-center gap-2'>
                        <input type='checkbox' checked={data.active} onChange={(e)=>onChange({target:{name:'active',value:e.target.checked}})} />
                        Active
                    </label>
                </div>

                <div className='flex justify-end gap-2 mt-4'>
                    <button type='button' onClick={onClose} className='border px-4 py-2 rounded'>Cancel</button>
                    <button type='submit' className='bg-cyan-700 text-white px-4 py-2 rounded'>
                        {loading ? 'Processing...' : buttonText}
                    </button>
                </div>
            </form>
        </div>
    </div>
);

const Product = () => {
    const api = axios.create({ baseURL: 'http://localhost:8080/api' });

    const [products,setProducts] = useState([]);
    const [companies,setCompanies] = useState([]);
    const [units,setUnits] = useState([]);
    const [companyNames,setCompanyNames] = useState({});
    const [unitNames,setUnitNames] = useState({});
    const [openModal,setOpenModal] = useState(false);
    const [editMode,setEditMode] = useState(false);
    const [errors,setErrors] = useState({});
    const [loading,setLoading] = useState(false);

    const initialForm = {
        companyId:'',
        unitId:'',
        pname:'',
        hsn:'',
        gst:'',
        unitPrice:'',
        stock:'',
        active:true
    };

    const [formData,setFormData] = useState(initialForm);

    const fetchProducts = async()=>{
        const res = await api.get('/products/page?page=0&size=10');
        const productList = res.data.data.content;
        setProducts(productList);
        fetchProductLookupNames(productList);
    };

    const fetchProductLookupNames = async(productList)=>{
        const companyIds = [...new Set(productList.map(p => p.companyId).filter(Boolean))];
        const unitIds = [...new Set(productList.map(p => p.unitId).filter(Boolean))];

        const companyResults = await Promise.all(companyIds.map(async(id)=>{
            try{
                const res = await api.get(`/companies/${id}`);
                const company = res.data.data || res.data;
                return [id, company.cname || id];
            }catch{
                return [id, id];
            }
        }));

        const unitResults = await Promise.all(unitIds.map(async(id)=>{
            try{
                const res = await api.get(`/units/${id}`);
                const unit = res.data.data || res.data;
                return [id, unit.uname || id];
            }catch{
                return [id, id];
            }
        }));

        setCompanyNames(Object.fromEntries(companyResults));
        setUnitNames(Object.fromEntries(unitResults));
    };

    const fetchCompanies = async()=>{
        const res = await api.get('/companies/page?page=0&size=100');
        setCompanies(res.data.data.content);
    };

    const fetchUnits = async()=>{
        const res = await api.get('/units/page?page=0&size=100');
        setUnits(res.data.data.content);
    };

    useEffect(()=>{
        fetchProducts();
        fetchCompanies();
        fetchUnits();
    },[]);

    const handleChange=(e)=>{
        const {name,value}=e.target;
        setFormData(prev=>({...prev,[name]:value}));
    };

    const saveProduct = async(e)=>{
        e.preventDefault();
        setLoading(true);
        try{
            if(editMode){
                await api.patch(`/products/${formData.productId}`,formData);
            }else{
                await api.post('/products',formData);
            }
            await fetchProducts();
            setOpenModal(false);
            setFormData(initialForm);
            setEditMode(false);
        }finally{
            setLoading(false);
        }
    };

    const editProduct=(row)=>{
        setFormData(row);
        setEditMode(true);
        setOpenModal(true);
    };

    const deleteProduct=async(id)=>{
        if(!window.confirm('Delete product ?')) return;
        await api.delete(`/products/${id}`);
        fetchProducts();
    };

    return (
        <div className='p-4'>
            <div className='flex justify-between items-center mb-6'>
                <h1 className='text-2xl font-semibold text-cyan-700'>Product Management</h1>
                <button
                    onClick={()=>{setFormData(initialForm);setEditMode(false);setOpenModal(true);}}
                    className='bg-cyan-700 text-white px-4 py-2 rounded-md'
                >
                    + Add Product
                </button>
            </div>

            <div className='overflow-auto max-h-[600px] bg-white border rounded-lg'>
                <table className='min-w-full text-sm'>
                    <thead className='bg-cyan-700 text-white'>
                        <tr>
                            <th className='p-2'>ID</th>
                            <th className='p-2'>Product</th>
                            <th className='p-2'>HSN</th>
                            <th className='p-2'>GST</th>
                            <th className='p-2'>Price</th>
                            <th className='p-2'>Stock</th>
                            <th className='p-2'>Company</th>
                            <th className='p-2'>Unit</th>
                            <th className='p-2'>Updated</th>
                            <th className='p-2'>Edit</th>
                            <th className='p-2'>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p=>(
                            <tr key={p.productId} className='border-b hover:bg-cyan-50'>
                                <td className='p-2'>{p.productId}</td>
                                <td className='p-2'>{p.pname}</td>
                                <td className='p-2'>{p.hsn}</td>
                                <td className='p-2'>{p.gst}</td>
                                <td className='p-2'>{p.unitPrice}</td>
                                <td className='p-2'>{p.stock}</td>
                                <td className='p-2'>{companyNames[p.companyId] || p.companyId}</td>
                                <td className='p-2'>{unitNames[p.unitId] || p.unitId}</td>
                                <td className='p-2'>{new Date(p.updatedAt).toLocaleString()}</td>
                                <td className='p-2 text-center'>
                                    <button onClick={()=>editProduct(p)}>✏️</button>
                                </td>
                                <td className='p-2 text-center'>
                                    <button onClick={()=>deleteProduct(p.productId)}>🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {openModal && (
                <ProductModal
                    title={editMode ? 'Edit Product' : 'Add Product'}
                    data={formData}
                    companies={companies}
                    units={units}
                    errors={errors}
                    onChange={handleChange}
                    onSubmit={saveProduct}
                    onClose={()=>setOpenModal(false)}
                    loading={loading}
                    buttonText={editMode ? 'Update Product' : 'Save Product'}
                />
            )}
        </div>
    );
};

export default Product;
