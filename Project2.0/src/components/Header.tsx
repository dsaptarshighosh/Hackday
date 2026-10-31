import React from 'react';
import { Leaf, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Overview' },
  { id: 'media_monitoring', label: 'Analyze media' },
  { id: 'forests', label: 'Forest areas' },
  { id: 'citizens', label: 'Recipients' },
  { id: 'email_arch', label: 'Email notifications' },
];

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab, isDarkMode, onToggleTheme }) => (
  <header className="sticky top-0 z-40 border-b border-[#d7dfd4] bg-[#f5f7f1]/95 backdrop-blur-sm">
    <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-8">
      <button
        onClick={() => onSelectTab('dashboard')}
        className="flex shrink-0 items-center gap-3 text-left text-[#19382f]"
        aria-label="Living Lens overview"
      >
        <Leaf className="h-6 w-6 text-[#54713f]" strokeWidth={1.7} />
        <span>
          <span className="block text-[17px] font-semibold tracking-[-0.04em]">Living Lens</span>
          <span className="mt-0.5 hidden text-[11px] text-[#718075] sm:block">Wildlife field monitoring</span>
        </span>
      </button>

      <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            aria-current={activeTab === item.id ? 'page' : undefined}
            className={`relative py-2 text-[13px] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#59713b] ${
              activeTab === item.id
                ? 'font-semibold text-[#294736] after:absolute after:inset-x-0 after:-bottom-[2px] after:h-[2px] after:bg-[#6e874b]'
                : 'text-[#67776b] hover:text-[#294736]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <button
        type="button"
        onClick={onToggleTheme}
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#d4ded2] px-3 py-2 text-sm font-medium text-[#294736] transition-colors hover:bg-[#e3ebe1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#59713b]"
      >
        {isDarkMode ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
        <span className="hidden sm:inline">{isDarkMode ? 'Light mode' : 'Dark mode'}</span>
      </button>
    </div>

    <nav aria-label="Main navigation" className="flex gap-6 overflow-x-auto border-t border-[#d7dfd4] px-5 py-2 md:hidden">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelectTab(item.id)}
          aria-current={activeTab === item.id ? 'page' : undefined}
          className={`shrink-0 py-1 text-xs ${activeTab === item.id ? 'font-semibold text-[#294736]' : 'text-[#718075]'}`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  </header>
);

