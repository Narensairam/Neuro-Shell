export function PlaceholderView({ title, desc }) {
    return (
        <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <div className="mb-6">
                <h1 className="text-[25px] font-extrabold text-shell-darkText tracking-tight">{title}</h1>
                <p className="font-mono text-[11px] text-gray-400 tracking-widest uppercase mt-1">{desc}</p>
            </div>
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50">
                <div className="text-center text-gray-400">
                    <div className="text-[37px] mb-3">🚧</div>
                    <div className="font-mono text-[12px] uppercase tracking-widest">Module Under Construction</div>
                </div>
            </div>
        </div>
    );
}
