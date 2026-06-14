import { useEffect, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getCurrentUser } from '@store/slices/authSlice';
import AppRoutes from '@routes/AppRoutes';
import { Toaster } from 'react-hot-toast';
import { setAccessTokenGetter } from '@lib/axios';

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, accessToken } = useAppSelector((state) => state.auth);

  const getAccessToken = useMemo(() => () => accessToken, [accessToken]);

  useEffect(() => {
    setAccessTokenGetter(getAccessToken);
  }, [getAccessToken]);

  useEffect(() => {
    if (accessToken && !isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [accessToken, isAuthenticated, dispatch]);

  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
