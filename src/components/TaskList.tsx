'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Circle, Trash2, Calendar, Search } from 'lucide-react';
import TaskForm from './TaskForm';

interface Category {
    id: number;
    name: string;
    color: string;
}

interface Task {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
    createdAt: string;
    dueDate: string | null;
    category: Category | null;
}

export default function TaskList() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);

    const fetchTasks = useCallback(async () => {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (selectedCategory) params.append('categoryId', selectedCategory);

        const res = await fetch(`/api/tasks?${params}`);
        const data = await res.json();
        setTasks(data);
    }, [searchQuery, selectedCategory]);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();

            if (!res.ok || !Array.isArray(data)) {
                setCategories([]);
                return;
            }

            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
            setCategories([]);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

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

    const toggleTask = async (id: number, completed: boolean) => {
        await fetch(`/api/tasks/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: !completed })
        });

        await fetchTasks();
        window.dispatchEvent(new Event('tasks:changed'));
    };

    const deleteTask = async (id: number) => {
        await fetch(`/api/tasks/${id}`, { method: 'DELETE' });

        await fetchTasks();
        window.dispatchEvent(new Event('tasks:changed'));
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
    });

    const activeCount = tasks.filter(t => !t.completed).length;
    const completedCount = tasks.filter(t => t.completed).length;

    const isOverdue = (dueDate: string | null) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date() && !tasks.find(t => t.dueDate === dueDate)?.completed;
    };

    return (
        <div>
            {/* Search and Filter Bar */}
            <div className="mb-8 space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tasks..."
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>

                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="text-3xl font-bold text-gray-900">{tasks.length}</div>
                    <div className="text-sm text-gray-600 mt-1">Total Tasks</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
                    <div className="text-3xl font-bold text-orange-600">{activeCount}</div>
                    <div className="text-sm text-orange-600 mt-1">Active</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                    <div className="text-3xl font-bold text-green-600">{completedCount}</div>
                    <div className="text-sm text-green-600 mt-1">Completed</div>
                </div>
            </div>

            {/* Task Form */}
            <div className="mb-8">
                <TaskForm
                    onTaskAdded={() => {
                        fetchTasks()
                            .then(() => {
                                window.dispatchEvent(new Event('tasks:changed'));
                            })
                            .catch((error) => {
                                console.error('Failed to refresh tasks after add:', error);
                            });
                        setIsFormOpen(false);
                    }}
                    isOpen={isFormOpen}
                    onToggle={setIsFormOpen}
                />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
                {(['all', 'active', 'completed'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all capitalize ${filter === f
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Tasks List */}
            <div className="space-y-3">
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <div className="text-6xl mb-4">📋</div>
                        <p className="text-gray-500">No tasks found</p>
                        <p className="text-sm text-gray-400 mt-2">
                            {searchQuery || selectedCategory
                                ? 'Try adjusting your filters'
                                : 'Create your first task to get started'}
                        </p>
                    </div>
                ) : (
                    filteredTasks.map((task) => (
                        <div
                            key={task.id}
                            className={`group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all ${task.completed ? 'opacity-75' : ''
                                } ${isOverdue(task.dueDate) ? 'border-red-200 bg-red-50/30' : ''}`}
                        >
                            <div className="flex items-start gap-4">
                                <button
                                    onClick={() => toggleTask(task.id, task.completed)}
                                    className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
                                >
                                    {task.completed ? (
                                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    ) : (
                                        <Circle className="w-6 h-6 text-gray-300 hover:text-indigo-500" />
                                    )}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className={`font-medium text-gray-900 ${task.completed ? 'line-through text-gray-500' : ''
                                            }`}>
                                            {task.title}
                                        </h3>
                                        {task.category && (
                                            <span
                                                className="px-2 py-1 text-xs rounded-lg font-medium"
                                                style={{
                                                    backgroundColor: `${task.category.color}20`,
                                                    color: task.category.color
                                                }}
                                            >
                                                {task.category.name}
                                            </span>
                                        )}
                                    </div>

                                    {task.description && (
                                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                                    )}

                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(task.createdAt).toLocaleDateString()}
                                        </div>
                                        {task.dueDate && (
                                            <div className={`flex items-center gap-1 ${isOverdue(task.dueDate) ? 'text-red-500 font-medium' : ''
                                                }`}>
                                                <Calendar className="w-3 h-3" />
                                                Due: {new Date(task.dueDate).toLocaleDateString()}
                                                {isOverdue(task.dueDate) && ' (Overdue)'}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => deleteTask(task.id)}
                                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
