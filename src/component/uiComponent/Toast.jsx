import { useEffect } from "react";

export default function Toast({ message, subMessage, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500); // auto hide after 3.5s
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 sm:right-6 z-50 animate-fade-in">
      <div className="bg-white shadow-xl border rounded-2xl px-5 py-4 w-[90vw] sm:w-[340px]">
        <div className="flex justify-between items-start gap-3">
          <div>
            <h3 className="font-semibold text-[16px] text-gray-900">
              {message}
            </h3>
            <p className="text-gray-600 text-[14px] mt-1">{subMessage}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
