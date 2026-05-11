"use client";
import React from "react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  properties: string;
  properties2: string;
  useEffectExists?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, properties, properties2, useEffectExists = false }) => {
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  useEffect(() => {
    if (useEffectExists && isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, useEffectExists]);

  if (!isOpen) return null;

  return (
    <div
      className={properties}
      onClick={onClose}
    >
      <div
        className={properties2}
        onClick={handleModalClick}
        style={{ animation: "modalIn 0.2s ease-out" }}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;