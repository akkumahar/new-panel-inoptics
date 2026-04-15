'use client';

import { useStore } from '@/store';
import { useState } from 'react';
import { Plus, Trash2, X, Tag } from 'lucide-react';

export default function TabBrands() {
  const { selectedExhibitor, brandsByExhibitor, addBrand, deleteBrand } = useStore();
  const id = selectedExhibitor!.id;
  const brands = brandsByExhibitor[id] || [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ brandName: '', category: '', description: '' });

  const handleAdd = () => {
    if (!form.brandName) return;
    addBrand({ id: Date.now().toString(), exhibitorId: id, ...form });
    setForm({ brandName: '', category: '', description: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Brands ({brands.length})</h3>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={13} /> Add Brand
        </button>
      </div>

      {showForm && (
        <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Brand Name *</label>
              <input value={form.brandName} onChange={(e) => setForm(f => ({ ...f, brandName: e.target.value }))}
                placeholder="Brand name"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <input value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                placeholder="e.g. Optical Instruments"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-400" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of brand/products"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-400" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1">
              <X size={12} /> Cancel
            </button>
            <button onClick={handleAdd}
              className="px-3 py-1.5 text-xs font-medium text-white bg-pink-600 rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-1">
              <Plus size={12} /> Add Brand
            </button>
          </div>
        </div>
      )}

      {brands.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {brands.map((brand) => (
            <div key={brand.id} className="relative bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
              <button onClick={() => deleteBrand(id, brand.id)}
                className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 text-white transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={11} />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Tag size={16} className="text-pink-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{brand.brandName}</p>
                  {brand.category && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-pink-100 text-pink-700 font-medium">
                      {brand.category}
                    </span>
                  )}
                </div>
              </div>
              {brand.description && (
                <p className="text-xs text-gray-500 line-clamp-2">{brand.description}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-sm text-gray-400 flex flex-col items-center gap-2">
          <Tag size={28} className="text-gray-300" />
          No brands added yet.
        </div>
      )}
    </div>
  );
}
