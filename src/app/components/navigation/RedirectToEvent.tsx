import React from "react";
import { Redirect, RouteComponentProps } from "react-router";

export const RedirectToEvent = ({
  match: {
    params: { eventId },
  },
}: RouteComponentProps<{ eventId: string }>) => {
  return <Redirect to={`/events/${eventId}`} />;
};
