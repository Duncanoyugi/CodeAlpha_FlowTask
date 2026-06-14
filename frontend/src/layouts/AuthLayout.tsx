import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">TaskFlow</h1>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;