import React from "react";
import { UncontrolledTooltip } from "reactstrap";

interface CustomTooltipProps {
  id: string;
  message: string;
  placement?: "top" | "bottom" | "left" | "right";
  className?: string;
}

const CustomTooltip = ({ id, message, placement = "bottom", className }: CustomTooltipProps) => {
  return (
    <>
      <span id={id} className={`icon-help ml-1 ${className ?? ""}`} />
      <UncontrolledTooltip target={id} placement={placement}>
        {message}
      </UncontrolledTooltip>
    </>
  );
};

export default CustomTooltip;
