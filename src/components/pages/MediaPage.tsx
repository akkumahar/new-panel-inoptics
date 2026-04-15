'use client';

import { useState } from 'react';
import { Upload, Image, File, Trash2, Download, Search, Grid, List } from 'lucide-react';

const mediaFiles = [
  { id: '1', name: 'exhibition-hall-a.jpg', type: 'image', size: '2.4 MB', date: '2024-03-01', url: '' },
  { id: '2', name: 'exhibitor-brochure.pdf', type: 'document', size: '1.2 MB', date: '2024-03-02', url: '' },
  { id: '3', name: 'stall-layout.png', type: 'image', size: '3.1 MB', date: '2024-03-05', url: '' },
  { id: '4', name: 'event-banner.jpg', type: 'image', size: '1.8 MB', date: '2024-03-06', url: '' },
  { id: '5', name: 'sponsor-logos.zip', type: 'archive', size: '5.4 MB', date: '2024-03-08', url: '' },
  { id: '6', name: 'registration-form.pdf', type: 'document', size: '0.8 MB', date: '2024-03-10', url: '' },
];

export default function MediaPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');

  const filtered = mediaFiles.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const colors: Record<string, string> = {
    image: 'bg-purple-100 text-purple-600',
    document: 'bg-red-100 text-red-600',
    archive: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Media</h2>
          <p className="text-sm text-gray-500">Manage files and media assets</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Upload size={16} />
          Upload
        </button>
      </div>

      {/* Upload Area */}
      <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl p-8 text-center">
        <Upload size={28} className="text-blue-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-blue-700">Drag & drop files here</p>
        <p className="text-xs text-blue-500 mt-1">or click to browse — PNG, JPG, PDF up to 10MB</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 shadow-sm">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((file) => (
            <div key={file.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 group hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-lg ${colors[file.type] || 'bg-gray-100 text-gray-600'} flex items-center justify-center mb-3`}>
                {file.type === 'image' ? <Image size={20} /> : <File size={20} />}
              </div>
              <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{file.size}</p>
              <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 text-gray-400 hover:text-blue-600 rounded"><Download size={13} /></button>
                <button className="p-1 text-gray-400 hover:text-red-600 rounded"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">File</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Size</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${colors[file.type] || 'bg-gray-100 text-gray-600'} flex items-center justify-center`}>
                        {file.type === 'image' ? <Image size={16} /> : <File size={16} />}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="text-sm text-gray-600 capitalize">{file.type}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-sm text-gray-600">{file.size}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="text-sm text-gray-600">{file.date}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Download size={15} /></button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
