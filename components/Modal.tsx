"use client";

import { ModalConfig } from "@/lib/types";

export default function Modal({
  config,
  visible,
  onHide,
}: {
  config: ModalConfig | null;
  visible: boolean;
  onHide: () => void;
}) {
  if (!visible || !config) return null;

  return (
    <div
      className="fixed inset-0 z-[400] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onHide();
      }}
    >
      <div
        className={
          "bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 pop-in border-4 " +
          config.borderColor
        }
      >
        <div className="text-6xl md:text-7xl text-center mb-3 md:mb-4">
          {config.icon}
        </div>
        <h2 className="text-xl md:text-2xl font-black text-center text-gray-900 mb-2">
          {config.title}
        </h2>
        <p
          className="text-center text-gray-700 text-sm md:text-base mb-6 font-medium"
          dangerouslySetInnerHTML={{ __html: config.message }}
        />
        <div className="flex gap-3">
          {config.buttons.map((btn, i) => (
            <button
              key={i}
              className={btn.className}
              onClick={() => {
                onHide();
                btn.onClick();
              }}
            >
              {btn.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
