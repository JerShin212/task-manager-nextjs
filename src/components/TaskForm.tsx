'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Tag, Calendar as CalendarIcon } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    color: string;
}

interface TaskFormProps {
    onTaskAdded: () => void;
    isOpen: boolean;
    onToggle: (open: boolean) => void;
}

export default function TaskForm({ onTaskAdded, isOpen, onToggle }: TaskFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);

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
        if (!isOpen) return;
        fetchCategories();
    }, [isOpen, fetchCategories]);

    useEffect(() => {
        const handleCategoriesUpdated = () => {
            fetchCategories();
        };

        window.addEventListener('categories:updated', handleCategoriesUpdated);
        return () => {
            window.removeEventListener('categories:updated', handleCategoriesUpdated);
        };
    }, [fetchCategories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                description,
                categoryId: categoryId || null,
                dueDate: dueDate || null,
            })
        });

        setTitle('');
        setDescription('');
        setCategoryId('');
        setDueDate('');
        onTaskAdded();
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => onToggle(true)}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 font-medium text-white transition-all shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl dark:from-indigo-500 dark:to-purple-500"
            >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                Add New Task
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title..."
                required
                autoFocus
                className="mb-3 w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
            />

            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="mb-3 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
            />

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-300">
                        <Tag className="w-4 h-4" />
                        Category
                    </label>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    >
                        <option value="">No category</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-300">
                        <CalendarIcon className="w-4 h-4" />
                        Due Date
                    </label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    />
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    type="submit"
                    className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-medium text-white transition-all hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500"
                >
                    Add Task
                </button>
                <button
                    type="button"
                    onClick={() => {
                        onToggle(false);
                        setTitle('');
                        setDescription('');
                        setCategoryId('');
                        setDueDate('');
                    }}
                    className="rounded-xl border border-gray-200 px-6 py-3 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
