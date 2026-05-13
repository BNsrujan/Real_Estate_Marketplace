"use client";
import React, { useEffect } from "react";
import renderSvg from "@/svgImport";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className={`absolute right-0 mt-2 z-50 bg-white rounded-3xl corner-squircle shadow-2xl border border-gray-100 overflow-hidden p-4 ${className}`}
      >
        {title && (
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <h2 className="text-lg font-tthoves-bold text-[#0A0A0A]">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <img src={renderSvg("close")} alt="Close" className="w-4 h-4" />
            </button>
          </div>
        )}
        <div>{children}</div>
      </div>
    </>
  );
};

export default Modal;