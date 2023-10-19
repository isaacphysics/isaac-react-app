import React from "react";

export function Spacer(props: { width?: number }) {
  if (props.width !== undefined) {
    return <span className={"w-" + props.width} />;
  }
  return <span className="flex-grow-1" />;
}
