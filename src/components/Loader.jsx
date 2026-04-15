import React from 'react';

const Loader = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
    <div className="flex min-h-[220px] w-full max-w-md flex-col items-center justify-center rounded-3xl bg-white/95 px-6 py-8 shadow-2xl shadow-slate-900/10 backdrop-blur">
      <div className="relative mb-6 flex h-40 w-40 items-center justify-center">
        <svg className="h-full w-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle className="loader-ring loader-ring-a" cx="120" cy="120" r="105" stroke="#4F46E5" strokeWidth="20" strokeLinecap="round" />
          <circle className="loader-ring loader-ring-b" cx="120" cy="120" r="35" stroke="#9333EA" strokeWidth="20" strokeLinecap="round" />
          <circle className="loader-ring loader-ring-c" cx="85" cy="120" r="70" stroke="#2563EB" strokeWidth="20" strokeLinecap="round" />
          <circle className="loader-ring loader-ring-d" cx="155" cy="120" r="70" stroke="#EF4444" strokeWidth="20" strokeLinecap="round" />
        </svg>
      </div>

      <p className="text-center text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
        {message}
      </p>

      <style>{`
        .loader-ring {
          fill: none;
          stroke-dasharray: 0 660;
          stroke-dashoffset: -330;
          animation-duration: 2s;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }

        .loader-ring-a {
          animation-name: ringA;
        }

        .loader-ring-b {
          animation-name: ringB;
        }

        .loader-ring-c {
          animation-name: ringC;
        }

        .loader-ring-d {
          animation-name: ringD;
        }

        @keyframes ringA {
          0%, 4% { stroke-dasharray: 0 660; stroke-width: 20; stroke-dashoffset: -330; }
          12% { stroke-dasharray: 60 600; stroke-width: 30; stroke-dashoffset: -335; }
          32% { stroke-dasharray: 60 600; stroke-width: 30; stroke-dashoffset: -595; }
          40%, 54% { stroke-dasharray: 0 660; stroke-width: 20; stroke-dashoffset: -660; }
          62% { stroke-dasharray: 60 600; stroke-width: 30; stroke-dashoffset: -665; }
          82% { stroke-dasharray: 60 600; stroke-width: 30; stroke-dashoffset: -925; }
          90%, 100% { stroke-dasharray: 0 660; stroke-width: 20; stroke-dashoffset: -990; }
        }

        @keyframes ringB {
          0%, 12% { stroke-dasharray: 0 220; stroke-width: 20; stroke-dashoffset: -110; }
          20% { stroke-dasharray: 20 200; stroke-width: 30; stroke-dashoffset: -115; }
          40% { stroke-dasharray: 20 200; stroke-width: 30; stroke-dashoffset: -195; }
          48%, 62% { stroke-dasharray: 0 220; stroke-width: 20; stroke-dashoffset: -220; }
          70% { stroke-dasharray: 20 200; stroke-width: 30; stroke-dashoffset: -225; }
          90% { stroke-dasharray: 20 200; stroke-width: 30; stroke-dashoffset: -305; }
          98%, 100% { stroke-dasharray: 0 220; stroke-width: 20; stroke-dashoffset: -330; }
        }

        @keyframes ringC {
          0% { stroke-dasharray: 0 440; stroke-width: 20; stroke-dashoffset: 0; }
          8% { stroke-dasharray: 40 400; stroke-width: 30; stroke-dashoffset: -5; }
          28% { stroke-dasharray: 40 400; stroke-width: 30; stroke-dashoffset: -175; }
          36%, 58% { stroke-dasharray: 0 440; stroke-width: 20; stroke-dashoffset: -220; }
          66% { stroke-dasharray: 40 400; stroke-width: 30; stroke-dashoffset: -225; }
          86% { stroke-dasharray: 40 400; stroke-width: 30; stroke-dashoffset: -395; }
          94%, 100% { stroke-dasharray: 0 440; stroke-width: 20; stroke-dashoffset: -440; }
        }

        @keyframes ringD {
          0%, 8% { stroke-dasharray: 0 440; stroke-width: 20; stroke-dashoffset: 0; }
          16% { stroke-dasharray: 40 400; stroke-width: 30; stroke-dashoffset: -5; }
          36% { stroke-dasharray: 40 400; stroke-width: 30; stroke-dashoffset: -175; }
          44%, 50% { stroke-dasharray: 0 440; stroke-width: 20; stroke-dashoffset: -220; }
          58% { stroke-dasharray: 40 400; stroke-width: 30; stroke-dashoffset: -225; }
          78% { stroke-dasharray: 40 400; stroke-width: 30; stroke-dashoffset: -395; }
          86%, 100% { stroke-dasharray: 0 440; stroke-width: 20; stroke-dashoffset: -440; }
        }
      `}</style>
    </div>
  </div>
);

export default Loader;
