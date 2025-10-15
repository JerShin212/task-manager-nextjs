import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import TaskList from '@/components/TaskList';
import CategoryManager from '@/components/CategoryManager';
import LogoutButton from '@/components/LogoutButton';
import { authOptions } from '@/lib/auth';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Task Manager
              </h1>
              <p className="text-gray-600">Welcome back, {session.user?.name || session.user?.email}!</p>
            </div>
            <LogoutButton />
          </div>
        </div>

        <CategoryManager />

        <TaskList />

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Built with Next.js + Prisma + NextAuth
        </div>
      </div>
    </main>
  );
}
