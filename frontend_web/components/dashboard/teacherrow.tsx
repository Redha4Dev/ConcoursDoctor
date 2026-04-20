import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';

interface TeacherRowProps {
  name: string;
  email: string;
  initials: string;
  roles: string[];
  active: boolean;
  id?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const TeacherRow = ({
  name,
  email,
  initials,
  roles,
  active,
  onEdit,
  onDelete,
}: TeacherRowProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-[#3014B8]/10 rounded-sm text-[#3014B8] font-bold text-[13px]">
            {initials}
          </div>
          <div className="text-[14px] font-bold text-[#0F172A]">{name}</div>
        </div>
      </td>
      
      <td className="px-6 py-4 text-[14px] text-[#0F172A]">
        {email}
      </td>

      <td className="px-6 py-4">
        <div className="flex gap-1 flex-wrap">
          {roles.map((role) => (
            <span
              key={role}
              className="px-2 py-1 bg-[#F1F5F9] text-[#475569] text-[12px] font-bold rounded-lg"
            >
              {role}
            </span>
          ))}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${active ? 'bg-[#10B981]' : 'bg-[#94A3B8]'}`} />
          <span className={`text-[12px] font-bold ${active ? 'text-[#059669]' : 'text-[#64748B]'}`}>
            {active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </td>

      <td className="px-6 py-4 text-right relative">
        <div ref={menuRef} className="inline-block text-left">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#94A3B8] hover:text-[#3014B8]"
          >
            <MoreVertical size={20} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden">
              <button
                onClick={() => { onEdit?.(); setIsOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit2 size={14} className="text-gray-400" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => { onDelete?.(); setIsOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} className="text-red-400" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};