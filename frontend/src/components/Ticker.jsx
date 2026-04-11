export function Ticker() {
    return (
        <div className="fixed bottom-0 left-[240px] right-0 h-[26px] bg-white border-t border-gray-200 flex items-center z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
            <div className="px-3 font-mono text-[10px] text-shell-red font-bold tracking-widest uppercase border-r border-gray-200 h-full flex items-center bg-red-50/50 flex-shrink-0 animate-pulse">
                Live Ticker
            </div>
            <div className="flex-1 overflow-hidden relative h-full flex items-center bg-gray-50/50">
                <div className="absolute whitespace-nowrap animate-[scrollTicker_40s_linear_infinite] font-mono text-[11px] text-gray-500 flex gap-12 pl-4">
                    <span><b className="text-gray-800">Models Live:</b> <span className="text-green-600">47 active</span></span>
                    <span><b className="text-gray-800">Brent Crude:</b> $82.40/bbl <span className="text-red-500">▼ −0.8%</span></span>
                    <span><b className="text-gray-800">LNG Spot (JKM):</b> $12.45/MMBtu <span className="text-green-600">▲ +2.1%</span></span>
                    <span><b className="text-gray-800">Downtime Reduction:</b> <span className="text-green-600">22% achieved</span> · Target 35%</span>
                    <span><b className="text-gray-800">L1 Deflection:</b> <span className="text-green-600">42%</span> of 50K tickets · 21K hrs saved</span>
                    <span><b className="text-gray-800">OT Tags Connected:</b> 42,847 / 500,000</span>
                    <span><b className="text-gray-800">S/4HANA Migration:</b> <span className="text-green-600">55% complete</span> · Q3 2026 on track</span>
                    <span><b className="text-gray-800">Finance Close:</b> <span className="text-amber-500">9 days</span> · Target 5–7</span>
                    <span><b className="text-gray-800">ROI Delivered:</b> <span className="text-green-600">$180M</span> of $2B target</span>
                    <span><b className="text-gray-800">CoE:</b> Phase 1 Month 8 · <span className="text-amber-500">8 Shell secondees</span></span>
                    <span><b className="text-gray-800">Critical Alerts:</b> <span className="text-red-500">3 open</span> · OT · Governance · Finance</span>
                </div>
            </div>
            <style>{`
        @keyframes scrollTicker {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
        </div>
    );
}
