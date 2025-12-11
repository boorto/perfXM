
import React, { useState, useMemo, useEffect } from 'react';
import type { Script } from '../contexts/ScriptContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useProjects } from '../contexts/ProjectContext';
import { useScripts } from '../contexts/ScriptContext';
import { UploadCloud, FileCode, Folder, Search, Download, Trash2, File, ChevronRight, X } from 'lucide-react';

export const ScriptManager: React.FC = () => {
    const { t } = useLanguage();
    const { projects, fetchProjects } = useProjects();
    const { scripts, loading, error, pagination, fetchScripts, createScript, updateScript, deleteScript } = useScripts();

    // 初始加载 - 加载脚本列表和项目列表
    useEffect(() => {
        fetchScripts();
        fetchProjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [selectedProject, setSelectedProject] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [scriptToDelete, setScriptToDelete] = useState<Script | null>(null);

    // Upload Form State
    const [uploadForm, setUploadForm] = useState({
        project_id: 0,
        script_version: '',
        script_type: 'jmeter',
        description: '',
        file: null as File | null,
        fileName: ''
    });

    const filteredScripts = useMemo(() => {
        return scripts.filter(script => {
            const matchesProject = selectedProject === 'ALL' || script.project_id.toString() === selectedProject;
            const matchesSearch = script.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesProject && matchesSearch;
        });
    }, [scripts, selectedProject, searchQuery]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploadForm({ ...uploadForm, file, fileName: file.name });
        }
    };

    const handleSaveUpload = async () => {
        if (!uploadForm.file || !uploadForm.project_id || !uploadForm.script_version) return;

        try {
            const formData = new FormData();
            formData.append('file', uploadForm.file);
            formData.append('name', uploadForm.fileName.replace(/\.[^/.]+$/, '')); // 文件名去掉扩展名作为脚本名称
            formData.append('project_id', uploadForm.project_id.toString());
            formData.append('script_version', uploadForm.script_version);
            formData.append('script_type', uploadForm.script_type);
            if (uploadForm.description) {
                formData.append('description', uploadForm.description);
            }

            await createScript(formData);
            setIsUploadModalOpen(false);
            setUploadForm({ project_id: 0, script_version: '', script_type: 'jmeter', description: '', file: null, fileName: '' });

            // 显示成功提示
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 3000);
        } catch (err) {
            console.error('Upload failed:', err);
            alert('上传失败：' + (err instanceof Error ? err.message : '未知错误'));
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteScript(id);
            setDeleteModalOpen(false);
            setScriptToDelete(null);
        } catch (err) {
            console.error('Delete failed:', err);
            alert('删除失败：' + (err instanceof Error ? err.message : '未知错误'));
        }
    };

    const openDeleteModal = (script: Script) => {
        setScriptToDelete(script);
        setDeleteModalOpen(true);
    };

    // 下载脚本
    const handleDownload = async (script: Script) => {
        try {
            // 从 file_path 中提取文件扩展名
            const fileExtension = script.file_path.split('.').pop() || '';
            const defaultFilename = fileExtension ? `${script.name}.${fileExtension}` : script.name;

            const token = localStorage.getItem('perfx_token');
            const response = await fetch(`http://localhost:8006/api/scripts/${script.id}/download`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('下载失败');
            }

            // 从响应头获取文件名
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = defaultFilename; // 使用动态生成的默认文件名

            if (contentDisposition) {
                // 尝试多种格式解析文件名
                // Content-Disposition: attachment; filename="zhiwen.jmx"
                // Content-Disposition: attachment; filename=zhiwen.jmx
                const matches = contentDisposition.match(/filename[^;=\n]*=\s*["']?([^"';\n]+)["']?/i);
                if (matches && matches[1]) {
                    filename = matches[1].trim();
                }
            }

            console.log('Download filename:', filename); // 调试日志

            // 创建下载链接
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
            alert('下载失败：' + (err instanceof Error ? err.message : '未知错误'));
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
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group ${selectedProject === 'ALL'
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
                            onClick={() => setSelectedProject(proj.id.toString())}
                            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group ${selectedProject === proj.id.toString()
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-2 truncate">
                                <ChevronRight size={14} className={`transition-transform ${selectedProject === proj.id.toString() ? 'rotate-90' : ''}`} />
                                <span className="truncate">{proj.name}</span>
                            </div>
                            <span className="text-xs text-slate-600 group-hover:text-slate-500">
                                {scripts.filter(s => s.project_id === proj.id).length}
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
                    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
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
                                                className="group hover:bg-slate-800/30 transition-colors"
                                            >
                                                <td className="px-5 py-4 pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-slate-800 rounded text-amber-500">
                                                            <FileCode size={18} />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-200">
                                                                {script.name}
                                                            </div>
                                                            <div className="text-xs text-slate-500 mt-0.5">Project ID: {script.project_id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300 font-mono">
                                                        {script.script_version}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-slate-400 font-mono text-xs">{script.file_size ? `${(script.file_size / 1024).toFixed(1)} KB` : '-'}</td>
                                                <td className="px-5 py-4 text-slate-400 text-xs">{new Date(script.updated_at).toLocaleString()}</td>
                                                <td className="px-5 py-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            className="p-2 hover:bg-slate-700 text-slate-400 hover:text-blue-400 rounded-lg transition-colors"
                                                            title={t.common.download}
                                                            onClick={() => handleDownload(script)}
                                                        >
                                                            <Download size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteModal(script)}
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
                                        value={uploadForm.project_id}
                                        onChange={(e) => setUploadForm({ ...uploadForm, project_id: parseInt(e.target.value) })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none text-sm"
                                    >
                                        <option value="0">Select Project</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">{t.scripts.modal.versionLabel}</label>
                                    <input
                                        type="text"
                                        value={uploadForm.script_version}
                                        onChange={(e) => setUploadForm({ ...uploadForm, script_version: e.target.value })}
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
                                disabled={!uploadForm.file || !uploadForm.project_id || !uploadForm.script_version}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-all"
                            >
                                {t.common.save}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && scriptToDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-800">
                            <h3 className="text-lg font-semibold text-white">确认删除</h3>
                            <button onClick={() => setDeleteModalOpen(false)} className="text-slate-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-slate-300 mb-2">确定要删除以下脚本吗？</p>
                            <div className="bg-slate-800/50 rounded-lg p-4 mt-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-700 rounded text-amber-500">
                                        <FileCode size={18} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">{scriptToDelete.name}</div>
                                        <div className="text-xs text-slate-500">版本: {scriptToDelete.script_version}</div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-rose-400 text-sm mt-4">⚠️ 此操作无法撤销</p>
                        </div>

                        <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white font-medium text-sm transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={() => handleDelete(scriptToDelete.id)}
                                className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium text-sm transition-all"
                            >
                                删除
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {showSuccessToast && (
                <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
                    <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium">脚本上传成功！</span>
                    </div>
                </div>
            )}
        </div>
    );
};
