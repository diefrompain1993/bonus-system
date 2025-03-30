// frontend/src/components/ProtectedRoute.jsx

import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, user, loading } = useSelector(state => state.auth);
  const location = useLocation();

  if (loading) {
    // Можно вернуть индикатор загрузки или null
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user) {
    // Если пользователь все еще не загружен, можно отобразить индикатор загрузки или перенаправить
    return null;
  }

  if (!allowedRoles.includes(user.role) && user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
