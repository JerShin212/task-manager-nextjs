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
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Categories
                </h2>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                        + Add Category
                    </button>
                )}
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Category name"
                        required
                        autoFocus
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <div className="flex gap-2 mb-3">
                        {colors.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setNewColor(color)}
                                className={`w-8 h-8 rounded-full transition-transform ${newColor === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                                    }`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
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
                            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
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
                        className="px-3 py-2 rounded-lg border flex items-center gap-2"
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
