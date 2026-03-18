import React, { useState } from 'react';

const CommLink: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleTransmit = () => {
    const subject = encodeURIComponent("Kavach Comm Link Feedback");
    const body = encodeURIComponent(message);
    window.location.href = `mailto:developer@kavach.ai?subject=${subject}&body=${body}`;
    setIsOpen(false);
    setMessage('');
  };

  return (
    <>
      {/* Launch Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 hud-panel flex items-center justify-center text-hud-cyan-border hover:text-hud-cyan transition-colors cursor-pointer group hover:scale-105 active:scale-95 border border-hud-cyan-border shadow-[0_0_15px_rgba(34,211,238,0.15)] overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSIjMjJkM2VlIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-50 z-0" />
        <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {/* Standard Comms Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90">
          <div className="fixed inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSIjMTBiOTgxIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-50 z-10"></div>

          <div className="relative w-full max-w-3xl hud-panel flex flex-col z-20 shadow-[0_0_30px_rgba(16,185,129,0.15)] overflow-hidden border-hud-emerald">

            <style>{`.border-hud-emerald::after{background-color:rgba(16,185,129,0.4);}`}</style>

            <div className="px-6 py-4 flex items-center justify-between border-b border-hud-emerald/40 bg-black/40">
              <div className="flex flex-col">
                <h2 className="hud-title text-xl text-hud-emerald tracking-[0.2em] mb-1">DEVELOPER COMM LINK</h2>
                <span className="hud-data text-[9px] text-hud-emerald/60">STANDARD MAILTO ROUTING // OS DEFAULT CLIENT</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-hud-emerald/60 hover:text-hud-emerald transition-colors hud-bracketed px-2 py-1 z-50 cursor-pointer">
                <span className="hud-data font-bold tracking-[0.2em]">[ CLOSE ]</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 relative">
              <div className="absolute top-8 left-6 w-1 h-12 bg-hud-emerald opacity-20" />

              <div className="ml-4 hud-data text-[10px] text-hud-text-muted mb-2">
                {">"} AWAITING FEEDBACK OR BUG REPORT...
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Input intelligence or anomaly report here..."
                className="w-full h-48 bg-hud-emerald/5 border border-hud-emerald/20 text-hud-emerald placeholder-hud-emerald/30 focus:outline-none focus:border-hud-emerald/60 transition-colors resize-none p-4 hud-data text-[12px] leading-relaxed relative z-50"
              />

              <div className="flex justify-between items-end mt-4">
                <div className="fui-barcode w-32 h-4 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #10b981 0px, #10b981 2px, transparent 2px, transparent 4px, #10b981 4px, #10b981 5px, transparent 5px, transparent 8px)' }} />
                <button
                  onClick={handleTransmit}
                  disabled={!message.trim()}
                  className="px-6 py-3 bg-hud-emerald/10 text-hud-emerald border border-hud-emerald hud-data font-bold tracking-[0.2em] hover:bg-hud-emerald hover:text-black transition-all disabled:opacity-30 disabled:hover:bg-hud-emerald/10 disabled:hover:text-hud-emerald cursor-pointer z-50"
                >
                  [ OPEN LOCAL MAIL CLIENT ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommLink;