import React from "react";

interface CustomButtonProps {
  msg?: React.ReactNode;
  borderColor?: string;
  textColor?: string;
  textSize?: string; // Add textSize prop
}

const CustomButton: React.FC<CustomButtonProps> = ({
  msg,
  borderColor,
  textColor,
  textSize,
}) => {
  return (
    <div
      className={`border-[1px] rounded-3xl corner-squircle px-4 py-2 cursor-pointer font-tthoves-semiBold text-center text-nowrap`}
      style={{
        borderColor: borderColor || "#D6D6D8", // Default border color
        color: textColor || "#303036", // Default text color
        fontSize: textSize || "1rem", // Default text size
      }}
    >
      {msg || "Discard"}
    </div>
  );
};

export default CustomButton;