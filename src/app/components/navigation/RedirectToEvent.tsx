import React from "react";
import {Navigate, useParams} from "react-router";

export const RedirectToEvent = () => {
    const {eventId} = useParams<{eventId: string}>();
    return <Navigate to={`/events/${eventId}`} />;
};
