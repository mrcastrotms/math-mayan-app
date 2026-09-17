// src/components/PinModal.js
import { useState, useRef, useEffect } from "react";

export default function PinModal({
  isOpen,
  onClose,
  onSubmit,
  title = "Enter PIN",
  description,
  placeholder = "Enter PIN",
  type = "password",
  confirmColor = "bg-blue-600 hover:bg-blue-700 shadow-blue-200",
  confirmText = "Confirm",
  showInput = true,
}) {
  const [pin, setPin] = useState("");
  const inputRef = useRef(null);

  // Pure side-effect: DOM focus only, no setState calls
  useEffect(() => {
    if (isOpen && showInput) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showInput]);

  if (!isOpen) return null;

  const handleClose = () => {
    setPin("");
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(pin);
    setPin("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <h3 className="text-xl font-black text-slate-800 mb-2 text-center">
          {title}
        </h3>

        {description && (
          <p className="text-xs text-slate-500 mb-4 text-center">
            {description}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {showInput && (
            <input
              ref={inputRef}
              type={type}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full p-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-center text-2xl font-mono tracking-widest text-slate-900"
              placeholder={placeholder}
            />
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 py-3 text-white font-bold rounded-xl transition shadow-md active:scale-95 ${confirmColor}`}
            >
              {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
