import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Upload, Loader2, AlertCircle } from 'lucide-react';
import { addCategory, updateCategory, deleteCategory, uploadCompressedImage, subscribeToCategories } from '../../firebase';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Admin Categories: Setting up subscription...');
    const unsubscribe = subscribeToCategories((data) => {
      console.log('Admin Categories: Categories received:', data);
      setCategories(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredCategories = categories.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
      } catch (err) {
        setError('Failed to delete category');
      }
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(JSON.parse(JSON.stringify(category)));
    setShowModal(true);
    setError(null);
  };

  const handleAddNew = () => {
    setEditingCategory({
      name: '',
      title: '',
      description: '',
      image: '',
      icon: '',
      startingPrice: '',
      tourCount: '',
      order: categories.length + 1,
      status: 'active'
    });
    setShowModal(true);
    setError(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadCompressedImage(file, `categories/${Date.now()}_${file.name}`, 200);
      setEditingCategory({ ...editingCategory, image: url });
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const form = e.target;
      const formData = new FormData(form);

      const categoryData = {
        name: formData.get('name') || editingCategory.name,
        title: formData.get('title') || editingCategory.title,
        description: formData.get('description') || editingCategory.description,
        image: editingCategory.image || '',
        icon: editingCategory.icon || '',
        startingPrice: formData.get('startingPrice') ? Number(formData.get('startingPrice')) : (editingCategory.startingPrice || 0),
        tourCount: formData.get('tourCount') ? Number(formData.get('tourCount')) : (editingCategory.tourCount || 0),
        order: parseInt(formData.get('order')) || editingCategory.order,
        status: formData.get('status') || 'active'
      };

      if (editingCategory.id) {
        await updateCategory(editingCategory.id, categoryData);
      } else {
        await addCategory(categoryData);
      }

      setShowModal(false);
    } catch (err) {
      setError('Failed to save category. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">Manage Categories</h1>
          <p className="text-gray-400 text-xs mt-0.5">{categories.length} categories total</p>
        </div>
        <button onClick={handleAddNew} className="bg-primary-500 hover:bg-primary-600 text-white py-1.5 px-3.5 rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5">
          <Plus size={15} /> Add Category
        </button>
      </div>

      <div className="p-3 sm:p-5">
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-xs">
            <AlertCircle size={16} />
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-700 hover:text-red-950"><X size={16} /></button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-gray-200 bg-white">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search categories..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
              />
            </div>
          </div>

          <div className="overflow-x-auto min-w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-[11px] font-bold uppercase text-gray-500 tracking-wider">
                  <th className="py-2.5 px-3 whitespace-nowrap">Category</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Order</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={category.image || category.icon || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200'} 
                          alt={category.name || category.title} 
                          className="w-12 h-9 rounded object-cover bg-gray-100 border border-gray-200 flex-shrink-0" 
                        />
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate max-w-[200px]">{category.name || category.title}</div>
                          <div className="text-gray-400 text-[11px] truncate max-w-[250px]">{category.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-gray-600 whitespace-nowrap">{category.order}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        category.status === 'active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {category.status?.charAt(0).toUpperCase() + category.status?.slice(1)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => handleEdit(category)} 
                          className="w-7 h-7 bg-primary-50 rounded flex items-center justify-center text-primary-600 hover:bg-primary-100 border border-primary-200 transition-colors"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(category.id)} 
                          className="w-7 h-7 bg-red-50 rounded flex items-center justify-center text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && editingCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-gray-200 my-auto">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCategory.id ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-gray-750 font-semibold text-sm mb-2">Category Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={editingCategory.name || editingCategory.title} 
                  required
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                />
              </div>

              <div>
                <label className="block text-gray-750 font-semibold text-sm mb-2">Title</label>
                <input 
                  type="text" 
                  name="title" 
                  defaultValue={editingCategory.title}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                />
              </div>

              <div>
                <label className="block text-gray-750 font-semibold text-sm mb-2">Description</label>
                <textarea 
                  name="description" 
                  rows={3} 
                  defaultValue={editingCategory.description}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 resize-none focus:ring-1 focus:ring-primary-500" 
                />
              </div>

              <div>
                <label className="block text-gray-750 font-semibold text-sm mb-2">Category Image</label>
                <div className="flex items-center gap-4">
                  {editingCategory.image && (
                    <img src={editingCategory.image} alt="" className="w-20 h-16 rounded-lg object-cover bg-gray-100 border border-gray-200" />
                  )}
                  <label className="flex-1 flex items-center justify-center gap-3 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    {uploading ? (
                      <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-500 text-sm font-semibold">Upload Image</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold text-sm mb-2">Starting Price (₹)</label>
                  <input 
                    type="number" 
                    name="startingPrice" 
                    defaultValue={editingCategory.startingPrice || ''} 
                    placeholder="e.g. 4999"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold text-sm mb-2">Trip / Tour Count</label>
                  <input 
                    type="number" 
                    name="tourCount" 
                    defaultValue={editingCategory.tourCount || ''} 
                    placeholder="e.g. 8"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-750 font-semibold text-sm mb-2">Display Order</label>
                  <input 
                    type="number" 
                    name="order" 
                    defaultValue={editingCategory.order} 
                    min="1"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                  />
                </div>

                <div>
                  <label className="block text-gray-755 font-semibold text-sm mb-2">Status</label>
                  <select 
                    name="status" 
                    defaultValue={editingCategory.status || 'active'}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4 pb-2 border-t border-gray-200 sticky bottom-0 bg-white z-10 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:border-gray-400 bg-white transition-colors font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2">
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingCategory.id ? 'Save Changes' : 'Add Category'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
