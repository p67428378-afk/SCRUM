import React from "react";

export default function SplitLayout({
  left,
  right,
  leftRatio = "flex-[6_0_0]",
  rightRatio = "flex-[4_0_0]",
}) {
  return (
    <div className="content-stretch flex flex-col md:flex-row gap-[24px] items-start overflow-clip relative shrink-0 w-full">
      <div
        className={`content-stretch flex ${leftRatio} flex-col items-start min-w-px overflow-clip relative self-stretch w-full`}
      >
        {left}
      </div>
      <div
        className={`content-stretch flex ${rightRatio} flex-col gap-[16px] items-start min-w-px overflow-clip relative self-stretch w-full`}
      >
        {right}
      </div>
    </div>
  );
}
