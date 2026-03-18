export const TableRow = ({ title, date, proctors, capacity, status, statusColor }: any) => (
  <div className="flex flex-row w-full border-b border-[#F1F5F9] items-center">
    <div className="flex-1 p-6 font-bold text-sm text-[#0F172A]">{title}</div>
    <div className="w-[102px] p-6 text-sm text-[#0F172A] font-normal leading-tight">{date}</div>
    <div className="w-[119px] p-6 text-sm text-[#0F172A]">{proctors}</div>
    <div className="w-[114px] p-6 text-sm text-[#0F172A]">{capacity}</div>
    <div className="w-[128px] p-6">
      <span className={`px-2 py-1 rounded-lg text-[12px] font-bold ${statusColor}`}>
        {status}
      </span>
    </div>
  </div>
);