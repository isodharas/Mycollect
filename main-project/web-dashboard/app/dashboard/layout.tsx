import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <main className="flex-1 p-5 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  )
}
