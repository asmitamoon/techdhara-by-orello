import React from 'react'
import { Outlet } from 'react-router'
import OrganizationSidebar from '../components/layout/OrganizationSidebar'
import OrganizationNavbar from '../components/layout/OrganizationNavbar'


const OrganizationLayout = () => {
  return (
    <div className="min-h-screen bg-page flex flex-col">
      <OrganizationNavbar />
      <div className="flex flex-1 pt-[70px]">
        <OrganizationSidebar />
        <main className="flex-1 p-6 lg:ml-72 bg-page">
          <div className='max-w-[1080px] 2xl:max-w-[1380px] mx-auto mt-4'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>

  )
}

export default OrganizationLayout
