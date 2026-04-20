import { Search, Bell, CircleQuestionMark } from "lucide-react";

export default function Navbar () {
  return (
    <header className="box-border flex flex-row justify-between items-center px-8 py-1 absolute w-full h-[53.78px] left-0 top-0 bg-white/50 border-b border-[#E2E8F0] z-[2]">      
      {/* Search Input Container */}
      <div className="flex flex-col items-start p-0 w-[864px] h-[44.78px] flex-none order-0 flex-grow-0">
        <div className="flex flex-row items-center px-4 py-2 gap-4 w-full h-full bg-white/50 shadow-[6px_6px_24px_rgba(0,0,0,0.16)] backdrop-blur-[7.6px] rounded-xl self-stretch flex-none order-0 flex-grow-0">
          
          {/* Search Icon Container */}
          <div className="flex flex-col justify-center items-center p-0 w-[13.5px] h-[28.78px] flex-none order-0 flex-grow-0">
            <Search size={16} className="text-[#64748B]" />
          </div>

          {/* Search Input Field */}
          <div className="flex flex-col items-start p-0 w-[802.5px] h-[18px] flex-none order-1 flex-grow">
            <input 
              type="text"
              placeholder="Search applications, results, or candidates..."
              className="w-full h-full bg-transparent border-none outline-none font-['Google_Sans'] font-normal text-[14px] leading-[18px] flex items-center text-[#64748B] placeholder-[#64748B]"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons Container */}
      <div className="flex flex-row items-center p-0 gap-4 w-[96px] h-[40px] flex-none order-1 flex-grow-0">
        
        {/* Notification Button */}
        <button className="flex flex-row justify-center items-center p-0 relative isolate w-10 h-10 rounded flex-none order-0 flex-grow-0">
          <div className="flex flex-col items-center p-0 w-4 h-5 flex-none order-0 flex-grow-0 z-0">
            {/* Notification Icon */}
            <Bell size={20} className="text-[#475569]" />
          </div>
          {/* Red Notification Dot/Badge */}
          <div className="box-border absolute w-2 h-2 right-2 top-2 bg-[#EF4444] border-2 border-white rounded-xl flex-none order-1 flex-grow-0 z-[1]" />
        </button>

        {/* Profile/Settings Button */}
        <button className="flex flex-row justify-center items-center p-0 w-10 h-10 rounded flex-none order-1 flex-grow-0">
          <div className="flex flex-col items-center p-0 w-5 h-5 flex-none order-0 flex-grow-0">
            {/* Profile Icon */}
            <CircleQuestionMark size={20} className="text-[#475569]" />
          </div>
        </button>
        
      </div>
    </header>
  );
};