'use client';

import { useCallback, useEffect, useState } from 'react';
import { Tag, Pencil, Trash2 } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    color: string;
    _count?: {
        tasks: number;
    };
}

export default function CategoryManager() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState('#6366f1');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('#6366f1');
    const [deletingCategoryIds, setDeletingCategoryIds] = useState<number[]>([]);

    const DELETION_ANIMATION_MS = 250;

    const colors = [
        '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
        '#10b981', '#3b82f6', '#ef4444', '#06b6d4'
    ];

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch('/api/categories');
            if (!res.ok) {
                throw new Error('Failed to fetch categories');
            }

            const data = await res.json();
            if (Array.isArray(data)) {
                setCategories(data);
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        const refreshCategories = () => {
            fetchCategories();
        };

        window.addEventListener('categories:updated', refreshCategories);
        window.addEventListener('tasks:changed', refreshCategories);
        return () => {
            window.removeEventListener('categories:updated', refreshCategories);
            window.removeEventListener('tasks:changed', refreshCategories);
        };
    }, [fetchCategories]);

    const resetEditingState = () => {
        setEditingId(null);
        setEditName('');
        setEditColor('#6366f1');
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedName = newName.trim();
        if (!trimmedName) return;

        const res = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: trimmedName, color: newColor })
        });

        if (!res.ok) {
            console.error('Failed to add category');
            return;
        }

        setNewName('');
        setNewColor('#6366f1');
        setIsAdding(false);
        await fetchCategories();
        window.dispatchEvent(new Event('categories:updated'));
    };

    const startEditing = (category: Category) => {
        setIsAdding(false);
        setEditingId(category.id);
        setEditName(category.name);
        setEditColor(category.color);
    };

    const handleEdit = async (e: React.FormEvent, id: number) => {
        e.preventDefault();

        const trimmedName = editName.trim();
        if (!trimmedName) return;

        const res = await fetch(`/api/categories/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: trimmedName, color: editColor })
        });

        if (!res.ok) {
            console.error('Failed to update category');
            return;
        }

        resetEditingState();
        await fetchCategories();
        window.dispatchEvent(new Event('categories:updated'));
    };

    const handleDelete = async (id: number) => {
        if (deletingCategoryIds.includes(id)) return;

        setDeletingCategoryIds((prev) => prev.includes(id) ? prev : [...prev, id]);

        const res = await fetch(`/api/categories/${id}`, {
            method: 'DELETE'
        });

        if (!res.ok) {
            console.error('Failed to delete category');
            setDeletingCategoryIds((prev) => prev.filter((categoryId) => categoryId !== id));
            return;
        }

        if (editingId === id) {
            resetEditingState();
        }

        setTimeout(() => {
            setCategories((prev) => prev.filter((category) => category.id !== id));
            fetchCategories()
                .catch((error) => {
                    console.error('Failed to refresh categories after delete:', error);
                })
                .finally(() => {
                    window.dispatchEvent(new Event('categories:updated'));
                    setDeletingCategoryIds((prev) => prev.filter((categoryId) => categoryId !== id));
                });
        }, DELETION_ANIMATION_MS);
    };

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-slate-100">
                    <Tag className="w-5 h-5" />
                    Categories
                </h2>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200"
                    >
                        + Add Category
                    </button>
                )}
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="mb-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Category name"
                        required
                        autoFocus
                        className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
                    />

                    <div className="flex gap-2 mb-3">
                        {colors.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setNewColor(color)}
                                className={`h-8 w-8 rounded-full transition-transform ${newColor === color ? 'scale-110 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''
                                    }`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                        >
                            Add
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsAdding(false);
                                setNewName('');
                                setNewColor('#6366f1');
                            }}
                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="flex flex-col gap-3">
                {categories.map((cat) => {
                    const isDeleting = deletingCategoryIds.includes(cat.id);
                    return (
                        <div
                            key={cat.id}
                            className={`rounded-xl border border-gray-200 bg-white p-4 transition-all dark:border-slate-800 dark:bg-slate-900 ${isDeleting ? 'animate-fade-out pointer-events-none' : ''}`}
                        >
                            {editingId === cat.id ? (
                                <form onSubmit={(e) => handleEdit(e, cat.id)} className="space-y-3">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Category name"
                                        required
                                        autoFocus
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
                                    />

                                    <div className="flex flex-wrap gap-2">
                                        {colors.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setEditColor(color)}
                                                className={`h-8 w-8 rounded-full transition-transform ${editColor === color ? 'scale-110 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetEditingState}
                                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="flex h-3 w-3 rounded-full"
                                            style={{ backgroundColor: cat.color }}
                                        />
                                        <span className="font-medium text-gray-900 dark:text-slate-100">{cat.name}</span>
                                        {cat._count && (
                                            <span className="text-xs text-gray-500 dark:text-slate-400">
                                                {cat._count.tasks} {cat._count.tasks === 1 ? 'task' : 'tasks'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => startEditing(cat)}
                                            disabled={isDeleting}
                                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:disabled:opacity-40"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(cat.id)}
                                            disabled={isDeleting}
                                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60 disabled:hover:bg-transparent dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10 dark:disabled:opacity-40"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
