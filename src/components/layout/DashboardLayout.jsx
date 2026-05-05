import React, { useEffect, useRef } from "react";
import Sidebar from "../dashboard/Sidebar";
import Header from "../dashboard/Header";
import { UsersProvider } from "../../context/users-context";
export default function DashboardLayout({ children }) {

  return (
    <UsersProvider>
      <div style={{ backgroundColor: 'var(--content-bg)' }} className="flex min-h-screen gap-2 md:gap-4">
        <Sidebar className="flex-shrink-0" />
        <div
          style={{
            backgroundColor: 'var(--content-card-bg)',
            borderColor: 'var(--border-light)',
            boxShadow: 'var(--shadow-lg)'
          }}
          className="flex-1 flex flex-col min-h-[calc(100vh-2rem)] rounded-xl md:rounded-[2rem] relative border my-2 mr-2 md:my-4 md:mr-4 shadow-sm"
        >
          <Header />
          <main
            className="flex-1 p-4 relative"
          >
            <div className="min-h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </UsersProvider>
  );
}
