export const START_SCREEN_COPY = {
  title: "mrcastro.vercel.app",
  subtitle: "Select your section and enter your details",
  sectionLabel: "Select your class section:",
  nameLabel: "Full Name:",
  namePlaceholder: "Full Name",
  codeLabel: "Code:",
  codePlaceholder: "CODE",
  submitLoading: "Connecting...",
  submitIdle: "Start",
  teacherButton: "Open Teacher Dashboard",
};

export const THEME_CONFIG = {
  global: {
    errorBanner:
      "text-red-500 text-sm font-bold text-center bg-red-50 p-3 rounded-lg border border-red-100",
    submitBtn:
      "w-full bg-blue-600 text-white font-black text-xl py-4 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-200 mt-4",
    teacherBtn:
      "bg-slate-800 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-slate-700 shadow-md transition",
    labelCenter: "block text-sm font-bold mb-3 text-center",
    labelDefault: "block text-sm font-bold mb-2",
    title: "text-3xl font-black text-center mb-2",
    subtitle: "text-center opacity-75 mb-8 font-medium",
    skeletonBtn:
      "w-14 h-14 rounded-xl animate-pulse bg-slate-200 dark:bg-zinc-800",
  },
  variants: {
    default: {
      bg: "bg-slate-50 text-slate-900",
      card: "bg-white border-slate-100 text-slate-800",
      input:
        "w-full p-4 border-2 rounded-xl focus:outline-none text-lg font-medium bg-white border-slate-200 text-slate-900 focus:border-blue-500",
      sectionBtn:
        "w-14 h-14 rounded-xl font-bold text-lg transition-all bg-slate-100 text-slate-600 hover:bg-slate-200",
      activeSectionBtn:
        "w-14 h-14 rounded-xl font-bold text-lg transition-all bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110",
    },
    sepia: {
      bg: "bg-[#f4ecd8] text-[#3c2f2f]",
      card: "bg-[#fbf5e8] border-[#e2d4bd] text-[#3c2f2f]",
      input:
        "w-full p-4 border-2 rounded-xl focus:outline-none text-lg font-medium bg-[#f4ecd8] border-[#e2d4bd] text-[#3c2f2f] focus:border-amber-600",
      sectionBtn:
        "w-14 h-14 rounded-xl font-bold text-lg transition-all bg-[#eadfc5] text-[#3c2f2f] hover:bg-[#decfa8]",
      activeSectionBtn:
        "w-14 h-14 rounded-xl font-bold text-lg transition-all bg-amber-700 text-amber-50 shadow-md scale-110",
    },
    contrast: {
      bg: "bg-black text-white",
      card: "bg-zinc-900 border-white text-white",
      input:
        "w-full p-4 border-2 rounded-xl focus:outline-none text-lg font-medium bg-black border-zinc-700 text-white focus:border-blue-400",
      sectionBtn:
        "w-14 h-14 rounded-xl font-bold text-lg transition-all bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
      activeSectionBtn:
        "w-14 h-14 rounded-xl font-bold text-lg transition-all bg-white text-black shadow-md scale-110",
    },
  },
};
