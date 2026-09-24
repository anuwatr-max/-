import React, { useState, useRef, useEffect } from 'react';
import { MonitorSmartphone, Smartphone, Tablet, Check } from 'lucide-react';

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

interface DeviceDropdownProps {
  deviceMode: DeviceMode;
  onChangeDeviceMode: (mode: DeviceMode) => void;
  className?: string;
}

export const DeviceDropdown: React.FC<DeviceDropdownProps> = ({
  deviceMode,
  onChangeDeviceMode,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const options: { id: DeviceMode; label: string; icon: React.ReactNode }[] = [
    {
      id: 'desktop',
      label: 'Current screen size',
      icon: <MonitorSmartphone className="h-4 w-4" />,
    },
    {
      id: 'mobile',
      label: 'Mobile',
      icon: <Smartphone className="h-4 w-4" />,
    },
    {
      id: 'tablet',
      label: 'Tablet',
      icon: <Tablet className="h-4 w-4" />,
    },
  ];

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button: matches image "[Icon] Device" */}
      <button
        type="button"
        id="device-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer select-none"
        title="เลือกมุมมองอุปกรณ์ (Device preview)"
        aria-expanded={isOpen}
      >
        <MonitorSmartphone className="h-4 w-4 text-slate-700" />
        <span className="font-medium">Device</span>
      </button>

      {/* Dropdown Menu matching user uploaded screenshot */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white shadow-xl border border-slate-200/80 py-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-100 focus:outline-hidden">
          {options.map(opt => {
            const isSelected = deviceMode === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  onChangeDeviceMode(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors cursor-pointer select-none ${
                  isSelected
                    ? 'text-blue-700 font-semibold bg-blue-50/70'
                    : 'text-slate-700 hover:bg-slate-100 font-normal'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isSelected ? 'text-blue-700' : 'text-slate-600'}>
                    {opt.icon}
                  </span>
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 ml-2 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
