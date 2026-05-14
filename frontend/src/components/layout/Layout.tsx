import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSocket } from '../../hooks/useSocket';

export const Layout = () => {
  useSocket(); // initialize socket connection

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <Outlet />
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#fff',
            border: '1px solid #2A2A2A',
          },
        }}
      />
    </div>
  );
};