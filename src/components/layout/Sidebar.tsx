import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation, useNavigate } from 'react-router-dom'; // Import router hooks
import { 
  Map, 
  Route, 
  MapPin, 
  MessageCircle, 
  User, 
  History, 
  Compass,
  Navigation,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onClose?: () => void;
}

const navigation = [
  { name: 'Dashboard', icon: Map, href: '/' },
  { name: 'Route Planner', icon: Route, href: '/plan', badge: 'New' },
  { name: 'Discover POIs', icon: MapPin, href: '/discover' },
  { name: 'AI Guide', icon: MessageCircle, href: '/guide', badge: 'AI' },
  { name: 'My Trips', icon: History, href: '/trips' },
  { name: 'Favorites', icon: Star, href: '/favorites' },
];

const quickActions = [
  { name: 'Emergency', icon: Navigation, color: 'text-red-500', href: '/emergency' },
  { name: 'Nearby', icon: Compass, color: 'text-blue-500', href: '/nearby' },
];

export function Sidebar({ isCollapsed = false, onToggleCollapse, onClose }: SidebarProps) {
  const navigate = useNavigate(); // Hook to move between pages
  const location = useLocation(); // Hook to know where we are right now

  const handleNavigation = (href: string) => {
    navigate(href);
    if (onClose) onClose(); // Close sidebar on mobile after clicking
  };

  return (
    <div className={cn(
      "bg-sidebar-background border-r border-sidebar-border flex flex-col h-full transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="border-b border-sidebar-border flex-shrink-0 p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Compass className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-sidebar-foreground">Iconic Pathways</h1>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
              <Compass className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
          {onToggleCollapse && !onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href; // Check if this button matches current page
            
            return (
              <Button
                key={item.name}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isCollapsed && "px-2",
                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
                onClick={() => handleNavigation(item.href)} // ACTIVATE NAVIGATION
              >
                <Icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                {!isCollapsed && (
                  <span className="flex-1 text-left">{item.name}</span>
                )}
                {!isCollapsed && item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="pt-4 border-t border-sidebar-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Quick Actions</p>
            <div className="space-y-1">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.name}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    onClick={() => handleNavigation(action.href)}
                  >
                    <Icon className={cn("h-4 w-4 mr-2", action.color)} />
                    {action.name}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border flex-shrink-0 p-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isCollapsed && "px-2",
            location.pathname === '/profile' && "bg-sidebar-accent" // Highlight if on profile
          )}
          onClick={() => handleNavigation('/profile')}
        >
          <User className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
          {!isCollapsed && <span>Profile & Settings</span>}
        </Button>
      </div>
    </div>
  );
}