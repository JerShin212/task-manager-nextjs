'use client';

import { useCallback, useEffect, useState } from 'react';
import { Tag } from 'lucide-react';

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

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();

        await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName, color: newColor })
        });

        setNewName('');
        setNewColor('#6366f1');
        setIsAdding(false);
        await fetchCategories();
        window.dispatchEvent(new Event('categories:updated'));
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

            <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        className="flex items-center gap-2 rounded-lg border px-3 py-2"
                        style={{
                            backgroundColor: `${cat.color}10`,
                            borderColor: `${cat.color}30`,
                            color: cat.color
                        }}
                    >
                        <span className="font-medium">{cat.name}</span>
                        {cat._count && (
                            <span className="text-xs opacity-75">({cat._count.tasks})</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
