import React from "react";

export default function CommonButton({
  msg = "",
  borderColor = "#000",
}: {
  msg?: string;
  borderColor?: string;
}) {
  return (
    <button
      style={{ border: `1px solid ${borderColor}` }}
      className="px-4 py-2"
    >
      {msg}
    </button>
  );
}
