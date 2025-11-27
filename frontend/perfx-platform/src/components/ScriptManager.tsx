
import React, { useState, useMemo } from 'react';
import type{ Script } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useProjects } from '../contexts/ProjectContext';
import { useScripts } from '../contexts/ScriptContext';
import { UploadCloud, FileCode, Folder, Search, Download, Trash2, Eye, X, File, ChevronRight } from 'lucide-react';

export const ScriptManager: React.FC = () => {
  const { t } = useLanguage();
  const { projects } = useProjects();
  const { scripts, addScript, deleteScript } = useScripts();

  const [selectedProject, setSelectedProject] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    project: '',
    version: '',
    file: null as File | null,
    fileName: ''
  });

  const filteredScripts = useMemo(() => {
    return scripts.filter(script => {
      const matchesProject = selectedProject === 'ALL' || script.project === selectedProject;
      const matchesSearch = script.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            script.project.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesProject && matchesSearch;
    });
  }, [scripts, selectedProject, searchQuery]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadForm({ ...uploadForm, file, fileName: file.name });
    }
  };

  const handleSaveUpload = () => {
    if (!uploadForm.file || !uploadForm.project || !uploadForm.version) return;

    const newScript: Script = {
      id: Date.now().toString(),
      name: uploadForm.fileName,
      project: uploadForm.project,
      version: uploadForm.version,
      size: `${(uploadForm.file.size / 1024).toFixed(1)} KB`,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      content: '<!-- Uploaded Content Placeholder -->'
    };

    addScript(newScript);
    setIsUploadModalOpen(false);
    setUploadForm({ project: '', version: '', file: null, fileName: '' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this script?')) {
      deleteScript(id);
      if (selectedScript?.id === id) setSelectedScript(null);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6 animate-in fade-in">
      {/* Sidebar - Projects from Context */}
      <div className="w-64 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-800/30">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Folder size={18} className="text-blue-500" />
            {t.scripts.projects}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <button
            onClick={() => setSelectedProject('ALL')}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group ${
              selectedProject === 'ALL' 
              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span>{t.scripts.allProjects}</span>
            <span className="bg-slate-800 text-xs px-2 py-0.5 rounded-full text-slate-500 group-hover:text-slate-300">
              {scripts.length}
            </span>
          </button>
          
          <div className="my-2 border-t border-slate-800 mx-2"></div>
          
          {projects.map(proj => (
            <button
              key={proj.id}
              onClick={() => setSelectedProject(proj.name)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group ${
                selectedProject === proj.name
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <ChevronRight size={14} className={`transition-transform ${selectedProject === proj.name ? 'rotate-90' : ''}`} />
                <span className="truncate">{proj.name}</span>
              </div>
              <span className="text-xs text-slate-600 group-hover:text-slate-500">
                {scripts.filter(s => s.project === proj.name).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Toolbar */}
        <div className="flex justify-between items-center">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.common.search}
                    className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none w-72 transition-all"
                />
            </div>
            <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
            >
                <UploadCloud size={18} />
                {t.scripts.upload}
            </button>
        </div>

        {/* Script List & Preview Split */}
        <div className="flex-1 flex gap-6 overflow-hidden">
            {/* Table */}
            <div className={`flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col ${selectedScript ? 'hidden lg:flex' : ''}`}>
                <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase sticky top-0 z-10 font-semibold">
                            <tr>
                                <th className="px-5 py-4 pl-6">{t.scripts.table.name}</th>
                                <th className="px-5 py-4">{t.scripts.table.version}</th>
                                <th className="px-5 py-4">{t.scripts.table.size}</th>
                                <th className="px-5 py-4">{t.scripts.table.updated}</th>
                                <th className="px-5 py-4 text-right pr-6">{t.scripts.table.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-sm">
                            {filteredScripts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-500 italic">
                                        No scripts found. Upload one to get started.
                                    </td>
                                </tr>
                            ) : (
                                filteredScripts.map(script => (
                                    <tr 
                                        key={script.id} 
                                        onClick={() => setSelectedScript(script)}
                                        className={`group cursor-pointer transition-colors ${selectedScript?.id === script.id ? 'bg-blue-500/5' : 'hover:bg-slate-800/30'}`}
                                    >
                                        <td className="px-5 py-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-800 rounded text-amber-500">
                                                    <FileCode size={18} />
                                                </div>
                                                <div>
                                                    <div className={`font-medium ${selectedScript?.id === script.id ? 'text-blue-400' : 'text-slate-200'}`}>
                                                        {script.name}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-0.5">{script.project}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300 font-mono">
                                                {script.version}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-slate-400 font-mono text-xs">{script.size}</td>
                                        <td className="px-5 py-4 text-slate-400 text-xs">{script.updatedAt}</td>
                                        <td className="px-5 py-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors" title={t.common.preview} onClick={() => setSelectedScript(script)}>
                                                    <Eye size={16} />
                                                </button>
                                                <button className="p-2 hover:bg-slate-700 text-slate-400 hover:text-blue-400 rounded-lg transition-colors" title={t.common.download}>
                                                    <Download size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(script.id)}
                                                    className="p-2 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded-lg transition-colors" 
                                                    title={t.common.delete}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Preview Panel */}
            {selectedScript && (
                <div className="w-[500px] flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-in slide-in-from-right-4">
                    <div className="h-14 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-800/30">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <FileCode size={16} className="text-blue-500 flex-shrink-0" />
                            <h3 className="font-medium text-white truncate text-sm" title={selectedScript.name}>{selectedScript.name}</h3>
                        </div>
                        <button onClick={() => setSelectedScript(null)} className="text-slate-500 hover:text-white p-1 rounded-md hover:bg-slate-700">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto bg-[#0d1117] p-4 font-mono text-xs text-slate-300 leading-relaxed">
                        <pre>{selectedScript.content || '<!-- Binary file content -->'}</pre>
                    </div>
                    <div className="p-3 border-t border-slate-800 bg-slate-800/30 flex justify-between items-center">
                        <span className="text-xs text-slate-500">{selectedScript.size}</span>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors">
                            <Download size={14} />
                            {t.common.download}
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-800">
                    <h3 className="text-lg font-semibold text-white">{t.scripts.modal.title}</h3>
                    <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 space-y-5">
                    {/* File Drop Zone */}
                    <div className="relative">
                        <input 
                            type="file" 
                            accept=".jmx,.xml"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${uploadForm.fileName ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/50'}`}>
                            {uploadForm.fileName ? (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-3">
                                        <File size={24} />
                                    </div>
                                    <p className="text-emerald-400 font-medium text-sm truncate max-w-full px-4">{uploadForm.fileName}</p>
                                    <p className="text-slate-500 text-xs mt-1">{(uploadForm.file?.size || 0) / 1024 > 1024 ? `${((uploadForm.file?.size || 0) / 1024 / 1024).toFixed(2)} MB` : `${((uploadForm.file?.size || 0) / 1024).toFixed(1)} KB`}</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
                                        <UploadCloud size={24} />
                                    </div>
                                    <p className="text-slate-300 font-medium text-sm mb-1">{t.scripts.modal.dropText}</p>
                                    <p className="text-slate-500 text-xs">Supports .jmx (JMeter)</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Metadata Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">{t.scripts.modal.projectLabel}</label>
                            <select
                                value={uploadForm.project}
                                onChange={(e) => setUploadForm({...uploadForm, project: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none text-sm"
                            >
                                <option value="">Select Project</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">{t.scripts.modal.versionLabel}</label>
                            <input 
                                type="text" 
                                value={uploadForm.version}
                                onChange={(e) => setUploadForm({...uploadForm, version: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none text-sm"
                                placeholder="v1.0.0"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
                    <button 
                        onClick={() => setIsUploadModalOpen(false)}
                        className="px-4 py-2 text-slate-400 hover:text-white font-medium text-sm"
                    >
                        {t.common.cancel}
                    </button>
                    <button 
                        onClick={handleSaveUpload}
                        disabled={!uploadForm.file || !uploadForm.project || !uploadForm.version}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-all"
                    >
                        {t.common.save}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
