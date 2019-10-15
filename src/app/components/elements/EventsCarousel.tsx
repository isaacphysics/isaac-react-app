import React, {useEffect} from "react";
import ResponsiveCarousel from "./Carousel";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {clearEventsList, getEventsPodList} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {EventCard} from "./cards/EventCard";

const NUMBER_OF_EVENTS_IN_CAROUSEL = 6;

export const EventsCarousel = () => {
    const dispatch = useDispatch();
    const eventsState = useSelector((state: AppState) => state && state.events);
    useEffect(() => {
        dispatch(getEventsPodList(NUMBER_OF_EVENTS_IN_CAROUSEL));
        return function cleanUp() { dispatch(clearEventsList); }
    }, []);

    return <ShowLoading until={eventsState} thenRender={({events, total}) => <div className="events-carousel">
        <ResponsiveCarousel>
            {events.map((event, index) => <EventCard event={event} pod key={index} />)}
        </ResponsiveCarousel>
    </div>} />
};
