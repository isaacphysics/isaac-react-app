import React, { useEffect } from "react";
import ResponsiveCarousel from "./Carousel";
import { AppState, clearEventsList, getEventsPodList, useAppDispatch, useAppSelector } from "../../state";
import { ShowLoading } from "../handlers/ShowLoading";
import { EventCard } from "./cards/EventCard";

const NUMBER_OF_EVENTS_IN_CAROUSEL = 6;

export const EventsCarousel = () => {
  const dispatch = useAppDispatch();
  const eventsState = useAppSelector((state: AppState) => state && state.events);
  useEffect(() => {
    dispatch(getEventsPodList(NUMBER_OF_EVENTS_IN_CAROUSEL));
    return function cleanUp() {
      dispatch(clearEventsList);
    };
  }, [dispatch]);

  return (
    <ShowLoading
      until={eventsState}
      thenRender={({ events }) => (
        <div className="events-carousel">
          <ResponsiveCarousel groupingLimit={3}>
            {events.map((event, index) => (
              <EventCard event={event} pod key={index} />
            ))}
          </ResponsiveCarousel>
        </div>
      )}
    />
  );
};
