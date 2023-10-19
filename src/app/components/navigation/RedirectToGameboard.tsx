import React from "react";
import { Redirect, RouteComponentProps } from "react-router";

export const RedirectToGameboard = ({
  match: {
    params: { gameboardId },
  },
}: RouteComponentProps<{ gameboardId: string }>) => {
  return <Redirect to={`/gameboards#${gameboardId}`} />;
};
