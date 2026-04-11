export function ComplianceMatrixView() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <header className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-[25px] font-extrabold flex items-center gap-2 tracking-tight">
                        <span className="text-[21px]">🛡</span> Compliance Matrix
                    </h1>
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mt-1">Global Regulatory Readiness · InfoSec Validations</div>
                </div>
            </header>

            <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">SOX Auto-Reconciliations</div>
                    <div className="text-[31px] font-extrabold text-amber-500 leading-none">64<span className="text-[15px] text-gray-400 font-normal ml-1">%</span></div>
                    <div className="font-mono text-[10px] text-amber-600 mt-1">⚠ Audit Risk Flag (Target 90%)</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">GDPR / CCPA Erasure SLAs</div>
                    <div className="text-[31px] font-extrabold text-green-600 leading-none">99.8<span className="text-[15px] text-gray-400 font-normal ml-1">%</span></div>
                    <div className="font-mono text-[10px] text-gray-500 mt-1">Within 30-day window</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Code Penetration Tests</div>
                    <div className="text-[31px] font-extrabold text-shell-darkText leading-none">100<span className="text-[15px] text-gray-400 font-normal ml-1">%</span></div>
                    <div className="font-mono text-[10px] text-gray-500 mt-1">Platform layer fully vetted</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">ISO 27001 Validation</div>
                    <div className="text-[31px] font-extrabold text-green-600 leading-none">Pass</div>
                    <div className="font-mono text-[10px] text-gray-500 mt-1">Renewed Q1 2026</div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
                <h2 className="font-extrabold text-[15px] mb-4">Global Regulatory Framework Progress</h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-6 border-b border-gray-100 pb-3">
                        <div className="w-[120px] font-bold text-[13px]">EU AI Act</div>
                        <div className="flex-1"><div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-shell-yellow w-[65%]"></div></div></div>
                        <div className="w-[100px] text-right font-mono text-[11px] text-gray-500">65% Readiness</div>
                    </div>
                    <div className="flex items-center gap-6 border-b border-gray-100 pb-3">
                        <div className="w-[120px] font-bold text-[13px]">SEC Cyber Disclosures</div>
                        <div className="flex-1"><div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 w-[100%]"></div></div></div>
                        <div className="w-[100px] text-right font-mono text-[11px] text-gray-500">100% Prepared</div>
                    </div>
                    <div className="flex items-center gap-6 border-b border-gray-100 pb-3">
                        <div className="w-[120px] font-bold text-[13px]">UK Data Protection</div>
                        <div className="flex-1"><div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 w-[95%]"></div></div></div>
                        <div className="w-[100px] text-right font-mono text-[11px] text-gray-500">95% Scoped</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
