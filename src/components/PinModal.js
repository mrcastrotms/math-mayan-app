import { useState, useEffect, useRef } from "react";

export default function PinModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  placeholder = "Enter PIN",
}) {
  const [pin, setPin] = useState("");
  const inputRef = useRef(null);

  // Auto-focus the input box whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setPin("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(pin);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Modal Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-xl font-black text-slate-800 mb-4 text-center">
          {title}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-center text-2xl font-mono tracking-widest text-slate-900"
            placeholder={placeholder}
          />

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-200"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
