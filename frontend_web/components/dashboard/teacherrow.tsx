import { MoreVertical } from 'lucide-react';

export const TeacherRow = ({ name, id, email, phone, initials, roles, active }: any) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center bg-[#3014B8]/10 rounded-sm text-[#3014B8] font-bold">
          {initials}
        </div>
        <div>
          <div className="text-[14px] font-bold text-[#0F172A]">{name}</div>
          <div className="text-[12px] text-[#64748B]">ID: {id}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 text-[14px]">
      <div className="text-[#0F172A]">{email}</div>
      <div className="text-[#64748B]">{phone}</div>
    </td>
    <td className="px-6 py-4">
      <div className="flex gap-1">
        {roles.map((role: string) => (
          <span key={role} className="px-2 py-1 bg-[#F1F5F9] text-[#475569] text-[12px] font-bold rounded-lg">
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
    <td className="px-6 py-4 text-right">
      <button className="text-[#94A3B8] hover:text-[#3014B8]">
        <MoreVertical size={20} />
      </button>
    </td>
  </tr>
  
);