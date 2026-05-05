import React from 'react';
import { SidebarPageTransition } from '../components/layout/sidebar-PageTransition';

export default function PlaceholderPage({ title }) {
  return (
    <SidebarPageTransition>
      <div className="min-h-screen py-10 px-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
        <p className="text-gray-600">This feature is coming soon.</p>
      </div>
    </SidebarPageTransition>
  );
}
