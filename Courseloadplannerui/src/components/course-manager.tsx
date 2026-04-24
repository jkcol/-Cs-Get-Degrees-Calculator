import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Pencil, Trash2, X, Check, Loader2, Database } from 'lucide-react';
import type { CourseCatalogItem } from '../types/course';

interface CourseManagerProps {
    apiBase: string;
    onCatalogChange: () => void; // called after create/update/delete so parent re-fetches catalog
}

type Mode = 'search' | 'create' | 'edit';

export function CourseManager({ apiBase, onCatalogChange }: CourseManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<Mode>('search');

    // Search state
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<CourseCatalogItem[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    // Form state (create / edit)
    const [formId, setFormId] = useState('');
    const [formName, setFormName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);

    // ── Search ──────────────────────────────────────────────────────────────────
    const runSearch = useCallback(async (q: string) => {
        if (!q.trim()) { setResults([]); return; }
        setSearchLoading(true);
        try {
            const r = await fetch(`${apiBase}/api/courses/search?q=${encodeURIComponent(q.trim())}`);
            const data = await r.json();
            setResults(Array.isArray(data) ? data : []);
        } catch {
            setResults([]);
        } finally {
            setSearchLoading(false);
        }
    }, [apiBase]);

    useEffect(() => {
        const t = setTimeout(() => runSearch(query), 300);
        return () => clearTimeout(t);
    }, [query, runSearch]);

    // ── Create ──────────────────────────────────────────────────────────────────
    const handleCreate = async () => {
        if (!formId.trim() || !formName.trim()) {
            setFormError('Both Course ID and Course Name are required.');
            return;
        }
        setSubmitting(true);
        setFormError(null);
        setFormSuccess(null);
        try {
            const r = await fetch(`${apiBase}/api/courses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId: formId.trim(), courseName: formName.trim() }),
            });
            const data = await r.json();
            if (!r.ok) throw new Error(data.error ?? 'Create failed');
            setFormSuccess(`Course "${formId.toUpperCase()}" created!`);
            setFormId('');
            setFormName('');
            onCatalogChange();
        } catch (e: any) {
            setFormError(e.message);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Edit ────────────────────────────────────────────────────────────────────
    const openEdit = (course: CourseCatalogItem) => {
        setEditingId(course.id);
        setFormName(course.name);
        setFormError(null);
        setFormSuccess(null);
        setMode('edit');
    };

    const handleUpdate = async () => {
        if (!formName.trim()) { setFormError('Course Name is required.'); return; }
        setSubmitting(true);
        setFormError(null);
        setFormSuccess(null);
        try {
            const r = await fetch(`${apiBase}/api/courses/${encodeURIComponent(editingId!)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseName: formName.trim() }),
            });
            const data = await r.json();
            if (!r.ok) throw new Error(data.error ?? 'Update failed');
            setFormSuccess(`Course "${editingId}" updated!`);
            onCatalogChange();
            // refresh search results
            runSearch(query);
        } catch (e: any) {
            setFormError(e.message);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Delete ──────────────────────────────────────────────────────────────────
    const handleDelete = async (course: CourseCatalogItem) => {
        if (!window.confirm(`Delete "${course.code} – ${course.name}"? This cannot be undone.`)) return;
        try {
            const r = await fetch(`${apiBase}/api/courses/${encodeURIComponent(course.id)}`, {
                method: 'DELETE',
            });
            const data = await r.json();
            if (!r.ok) throw new Error(data.error ?? 'Delete failed');
            setResults((prev) => prev.filter((c) => c.id !== course.id));
            onCatalogChange();
        } catch (e: any) {
            alert(`Delete failed: ${e.message}`);
        }
    };

    // ── Reset & close ───────────────────────────────────────────────────────────
    const reset = () => {
        setMode('search');
        setQuery('');
        setResults([]);
        setFormId('');
        setFormName('');
        setEditingId(null);
        setFormError(null);
        setFormSuccess(null);
    };

    const close = () => { reset(); setIsOpen(false); };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#13294B] text-white text-sm font-semibold hover:bg-[#1a3a6b] transition-colors shadow"
            >
                <Database size={15} />
                Manage Courses
            </button>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Database size={16} className="text-[#FF5F05]" />
                    Course Manager
                </h3>
                <div className="flex items-center gap-2">
                    {/* Tab buttons */}
                    {(['search', 'create'] as Mode[]).map((m) => (
                        <button
                            key={m}
                            onClick={() => { setMode(m); setFormError(null); setFormSuccess(null); }}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${mode === m
                                ? 'bg-[#FF5F05] text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {m === 'search' ? 'Search / Edit' : 'Add New'}
                        </button>
                    ))}
                    <button onClick={close} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* ── SEARCH + EDIT/DELETE TAB ── */}
            {(mode === 'search' || mode === 'edit') && (
                <div className="space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input
                            type="text"
                            placeholder="Search by course ID or name…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-[#FF5F05] focus:bg-white transition-all"
                        />
                        {searchLoading && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" size={15} />
                        )}
                    </div>

                    {/* Search results */}
                    {results.length > 0 && mode === 'search' && (
                        <div className="max-h-60 overflow-y-auto space-y-1 border border-slate-100 rounded-xl p-2">
                            {results.map((course) => (
                                <div
                                    key={course.id}
                                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <div className="min-w-0 flex-1">
                                        <span className="text-sm font-bold text-[#13294B]">{course.code}</span>
                                        <span className="text-xs text-slate-500 ml-2 truncate">{course.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => openEdit(course)}
                                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil size={13} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course)}
                                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {query.trim() && !searchLoading && results.length === 0 && (
                        <p className="text-xs text-slate-400 text-center py-2">No courses found for "{query}"</p>
                    )}

                    {/* Inline edit form */}
                    {mode === 'edit' && editingId && (
                        <div className="border border-blue-100 bg-blue-50 rounded-xl p-4 space-y-3">
                            <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                                Editing: {editingId}
                            </p>
                            <input
                                type="text"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                placeholder="New course name"
                                className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                            />
                            {formError && <p className="text-xs text-red-600">{formError}</p>}
                            {formSuccess && <p className="text-xs text-emerald-600">{formSuccess}</p>}
                            <div className="flex gap-2">
                                <button
                                    onClick={handleUpdate}
                                    disabled={submitting}
                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {submitting ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                    Save
                                </button>
                                <button
                                    onClick={() => { setMode('search'); setFormError(null); setFormSuccess(null); }}
                                    className="px-4 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── CREATE TAB ── */}
            {mode === 'create' && (
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Course ID</label>
                        <input
                            type="text"
                            value={formId}
                            onChange={(e) => setFormId(e.target.value.toUpperCase())}
                            placeholder="e.g. CS499"
                            className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#FF5F05] bg-slate-50 focus:bg-white transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Course Name</label>
                        <input
                            type="text"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="e.g. Special Topics in CS"
                            className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#FF5F05] bg-slate-50 focus:bg-white transition-all"
                        />
                    </div>
                    {formError && <p className="text-xs text-red-600">{formError}</p>}
                    {formSuccess && <p className="text-xs text-emerald-600">{formSuccess}</p>}
                    <button
                        onClick={handleCreate}
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-[#FF5F05] text-white text-sm font-bold rounded-xl hover:bg-[#e55504] disabled:opacity-50 transition-colors"
                    >
                        {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        Add Course to Database
                    </button>
                </div>
            )}
        </div>
    );
}
