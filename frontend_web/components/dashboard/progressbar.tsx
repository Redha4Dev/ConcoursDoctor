export const ProgressBar = ({ label, percent, color }: any) => (
  <div className="flex flex-col gap-1 flex-1">
    <h4 className="font-['Google_Sans'] font-bold text-sm text-[#64748B]">{label}</h4>
    <div className="flex items-center gap-2">
      <div className="relative h-2 bg-[#F1F5F9] rounded-full flex-grow">
        <div className={`absolute left-0 top-0 h-full rounded-full ${color}`} style={{ width: `${percent}%` }}></div>
      </div>
      <span className="text-[12px] font-medium text-[#0F172A]">{percent}%</span>
    </div>
  </div>
);