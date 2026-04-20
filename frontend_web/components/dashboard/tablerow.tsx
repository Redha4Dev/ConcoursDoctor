export const TableRow = ({ title, date, condidatsNumber, status, statusColor, icon }: any) => (
  <div className="flex flex-row w-full border-b border-[#F1F5F9] items-center px-6 hover:bg-slate-50/50 transition-colors">
    {/* Icon Container: Centered 48x48px with dynamic status background */}
    <div className="w-[48px] h-[48px] flex items-center justify-center rounded-lg bg-opacity-15 flex-shrink-0" 
         style={{ backgroundColor: statusColor ? `${statusColor}20` : '#F1F5F9' }}>
      <div className={`${statusColor}`}>
        {icon}
      </div>
    </div>

    {/* Title and Date Section */}
    <div className="flex-1 p-6">
      <h2 className="font-['Google_Sans'] font-bold text-[16px] leading-5 text-[#0F172A]">
        {title}
      </h2>
      <p className="font-['Google_Sans'] font-normal text-[14px] leading-[18px] text-[#64748B] mt-1">
        {date}
      </p>
    </div>

    {/* Candidates and Status Section */}
    <div className="w-[250px] p-6 text-right">
      <h2 className="font-['Google_Sans'] font-bold text-[16px] leading-5 text-[#0F172A]">
        {condidatsNumber} conditats
      </h2>
      <p className={`font-['Google_Sans'] font-bold text-[12px] leading-[15px] mt-1 ${statusColor}`} >
        {status}
      </p>
    </div>
  </div>
);