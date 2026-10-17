import React from 'react'
import { Outlet } from 'react-router'
import AdminSidebar from '../components/layout/AdminSidebar'
import AdminNavbar from '../components/layout/AdminNavbar'

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-page flex flex-col">
      <AdminNavbar />
      <div className="flex flex-1 pt-[70px]">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:ml-72 bg-page">
          <div className='max-w-[1080px] 2xl:max-w-[1380px] mx-auto mt-4'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout