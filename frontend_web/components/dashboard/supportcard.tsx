import React from 'react';
import { HelpCircle } from 'lucide-react'; // Using Lucide for the background icon

export const SupportCard = () => {
  return (
    <div className="relative flex flex-col items-start p-4 gap-1 isolation-auto w-[100%] h-[156px] bg-[#3014B8] rounded-[12px] overflow-hidden flex-none order-2 self-stretch grow-0">
      
      {/* Background Decorative Icon */}
      <div className="absolute w-[80px] h-[80px] -right-2 -bottom-2 opacity-10 flex items-center justify-center z-0">
        <HelpCircle size={80} color="#FFFFFF" strokeWidth={1.5} />
      </div>

      {/* Main Content Container */}
      <div className="flex flex-col items-start p-0 gap-1 w-full h-[124px] z-10 self-stretch grow-0">
        
        {/* Support Label */}
        <div className="flex flex-col items-start p-0 w-full h-[15px] opacity-60 self-stretch grow-0">
          <span className="w-full h-[15px] font-['Inter'] font-semibold text-[10px] leading-[15px] flex items-center uppercase text-white">
            Support
          </span>
        </div>

        {/* Heading */}
        <div className="flex flex-col items-start pt-1 p-0 w-full h-[24px] self-stretch grow-0">
          <h4 className="w-full h-5 font-['Google_Sans'] font-bold text-[16px] leading-5 flex items-center text-white">
            Need help?
          </h4>
        </div>

        {/* Description */}
        <div className="flex flex-col items-start pb-3 p-0 w-full h-[42px] opacity-80 self-stretch grow-0">
          <p className="w-full h-[30px] font-['Google_Sans'] font-normal text-[12px] leading-[15px] flex items-center text-white">
            Check the technical documentation or contact support.
          </p>
        </div>

        {/* Action Button */}
        <button className="flex flex-row justify-center items-center px-4 py-2 w-[122px] h-[31px] bg-white rounded-lg flex-none order-3 grow-0 hover:bg-opacity-90 transition-colors">
          <span className="w-[90px] h-[15px] font-['Google_Sans'] font-bold text-[12px] leading-[15px] flex items-center justify-center text-center text-[#3014B8]">
            Documentation
          </span>
        </button>

      </div>
    </div>
  );
};

