export const StatCard = ({ label, value, trend, trendColor, bgColor, iconColor ,icon:Icon }: any) => (
  <div className="relative flex-1 min-w-[222px] h-[162px] bg-white/45 border border-[#3014B8]/10 shadow-[6px_6px_24px_rgba(0,0,0,0.16)] backdrop-blur-[7.6px] rounded-xl p-[25px]">
    <div className="flex flex-row justify-between items-center mb-[24px]">
      <div className={`w-[38px] h-[32px] ${bgColor} rounded p-2 flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <span className={`font-bold text-[12px] ${trendColor}`}>{trend}</span>
    </div>
    <div className="mt-4">
      <h4 className="font-bold text-sm text-[#64748B]">{label}</h4>
      <h3 className="font-bold text-[36px] text-[#0F172A] leading-[45px]">{value}</h3>
    </div>
  </div>
);