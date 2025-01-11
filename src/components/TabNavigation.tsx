import React, { useState, useEffect, useRef } from 'react';
    import { Layout, Calendar, BarChart, Sparkles, Brain, ClipboardList, Coins } from 'lucide-react';

    interface TabNavigationProps {
      activeTab: string;
      onTabChange: (tab: string) => void;
    }

    export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
      const tabs = [
        { id: 'evaluation', icon: <ClipboardList />, label: 'التقييم' },
        { id: 'weekly', icon: <Calendar />, label: 'الأيام' },
        { id: 'domains', icon: <Layout />, label: 'المجالات' },
        { id: 'financial', icon: <Coins />, label: 'المالية' },
      ];

      const navRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        if (navRef.current) {
          const activeTabElement = navRef.current.querySelector(`[data-tab-id="${activeTab}"]`);
          if (activeTabElement) {
            activeTabElement.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'center',
            });
          }
        }
      }, [activeTab]);

      return (
        <nav className="flex justify-center mb-8 overflow-x-auto scrollbar-hide">
          <div ref={navRef} className="flex gap-2 bg-black/30 p-1 rounded-lg whitespace-nowrap">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-white hover:bg-white/10'
                }`}
                data-tab-id={tab.id}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      );
    }
