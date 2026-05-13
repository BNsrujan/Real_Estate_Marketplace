import React, { useState } from "react";
import renderSvg from "@/svgImport";
import CommonButton from "./common_button";

export default function Notify() {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="w-full bg-[#4A1FCC] rounded-xl p-2">
      <div className="p-2 flex items-center">
        <div className="bg-[#5423E6] rounded-full border-[2px] border-[#5C26FF33]">
          <img
            src={renderSvg("multiplestar")}
            alt="multiplestar"
            className="p-4 w-full"
          />
        </div>
        <div className="flex-1 px-5 text-[#FDFDFE] font-tthoves-semiBold text-base">
          <div>
            We’ve just announced our Series A!{" "}
            <span className="text-[#BBA5FE] font-tthoves">
              {" "}
              Read about it from our CEO.
            </span>
          </div>
        </div>
        <div className="flex gap-4 mr-3">
          <div className="bg-[#ffffff] rounded-2xl">
            <CommonButton
              msg="Read update"
              borderColor="#5C26FF33"
              // textColor="#5423E6"
            />
          </div>
          <img
            src={renderSvg("closeIcon")}
            alt="close"
            onClick={handleClose}
            style={{ cursor: "pointer" }}
          />
        </div>
      </div>
    </div>
  );
}
