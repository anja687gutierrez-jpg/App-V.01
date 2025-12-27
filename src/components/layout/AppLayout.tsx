import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleCollapsed = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {!isMobile && (
        <Sidebar 
          isCollapsed={isCollapsed} 
          onToggleCollapse={toggleCollapsed}
        />
      )}
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header 
          onMenuClick={isMobile ? toggleSidebar : toggleCollapsed}
          showMenuButton={isMobile}
        />
        
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={closeSidebar} 
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-card border-r flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Iconic Pathways USA AI</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeSidebar}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar 
                isCollapsed={false}
                onClose={closeSidebar}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}