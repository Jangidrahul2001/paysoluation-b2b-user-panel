import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { AnimatePresence, m } from 'framer-motion';
import { Navigate } from 'react-router-dom';

export const AuthWrapper = () => {
  const location = useLocation();
  const token = localStorage.getItem('authToken');

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const pageConfig = {
    '/login': {
      imagePosition: 'left'
    },
    '/signup': {
      imagePosition: 'right'
    },
    '/forgot-password': {
      imagePosition: 'left'
    }
  };

  const config = pageConfig[location.pathname] || pageConfig['/login'];

  return (
    <AuthLayout
      imagePosition={config.imagePosition}
    >
      <AnimatePresence mode="wait">
        <m.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut"
            }
          }}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn"
            }
          }}
          className="w-full"
        >
          <Outlet />
        </m.div>
      </AnimatePresence>
    </AuthLayout>
  );
};
