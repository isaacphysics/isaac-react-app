import React, {useEffect} from "react";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {ShowLoading} from "../handlers/ShowLoading";
import queryString from "query-string";
import {withRouter} from "react-router-dom";
import {History} from "history";
import {clearEventsList, getEventsList} from "../../state/actions";
import {EventCard} from "../elements/cards/EventCard";
import {PageFragment} from "../elements/PageFragment";

/* eslint-disable @typescript-eslint/camelcase */

interface EventsPageQueryParams {
    show_booked_only?: boolean;
    event_status?: "all";
    types?: TypeFilter;
}

export enum StatusFilter {
    "All events" = "all",
    "Upcoming events" = "upcoming",
    "My booked events" = "showBookedOnly",
}
export enum TypeFilter {
    "All events" = "all",
    "Student events" = "student",
    "Teacher events" = "teacher",
    "Online tutorials" = "virtual",
}
const EVENTS_PER_PAGE = 6;

export const Events = withRouter(({history, location}: {history: History; location: Location}) => {
    const query: EventsPageQueryParams = queryString.parse(location.search);

    const dispatch = useDispatch();
    const eventsState = useSelector((state: AppState) => state && state.events);
    const user = useSelector((state: AppState) => state && state.user);
    const numberOfLoadedEvents = eventsState ? eventsState.events.length : 0;

    const statusFilter =
        (user && user.loggedIn && query.show_booked_only && StatusFilter["My booked events"]) ||
        (query.event_status === "all" && StatusFilter["All events"]) ||
        StatusFilter["Upcoming events"];
    const typeFilter = query.types || TypeFilter["All events"];

    useEffect(() => {
        const startIndex = 0;
        dispatch(clearEventsList);
        dispatch(getEventsList(startIndex, EVENTS_PER_PAGE, typeFilter, statusFilter));
    }, [typeFilter, statusFilter]);

    return <RS.Container>
        <TitleAndBreadcrumb currentPageTitle={"Events"} help="Follow the links below to find out more about our FREE events." />

        <div className="my-4">
            {/* Filters */}
            <PageFragment fragmentId="event_type_descriptions" renderFragmentNotFound={false}/>
            <RS.Form inline className="d-flex justify-content-end">
                <RS.Label>Filter by
                    <RS.Input className="ml-2 mr-3" type="select" value={statusFilter} onChange={e => {
                        const selectedFilter = e.target.value as StatusFilter;
                        query.show_booked_only = selectedFilter === StatusFilter["My booked events"] ? true : undefined;
                        query.event_status = selectedFilter == StatusFilter["All events"] ? "all" : undefined;
                        history.push({pathname: location.pathname, search: queryString.stringify(query)});
                    }}>
                        {Object.entries(StatusFilter)
                            .filter(([statusLabel, statusValue]) => (user && user.loggedIn) || statusValue !== StatusFilter["My booked events"])
                            .map(([statusLabel, statusValue]) =>
                                <option key={statusValue} value={statusValue}>{statusLabel}</option>
                            )
                        }
                    </RS.Input>
                    <RS.Input className="ml-2" type="select" value={typeFilter} onChange={e => {
                        const selectedType = e.target.value as TypeFilter;
                        query.types = selectedType !== TypeFilter["All events"] ? selectedType : undefined;
                        history.push({pathname: location.pathname, search: queryString.stringify(query)});
                    }}>
                        {Object.entries(TypeFilter).map(([typeLabel, typeValue]) =>
                            <option key={typeValue} value={typeValue}>{typeLabel}</option>
                        )}
                    </RS.Input>
                </RS.Label>
            </RS.Form>

            {/* Results */}
            <ShowLoading until={eventsState} thenRender={({events, total}) => <div className="my-4">
                {/* Map */}

                {/* Event Cards */}
                <RS.Row>
                    {events.map(event => <div key={event.id} className="col-xs-12 col-sm-6 col-md-4 d-flex">
                        <EventCard event={event} />
                    </div>)}
                </RS.Row>

                {/* Load More Button */}
                {numberOfLoadedEvents < total && <div className="text-center mb-5">
                    <RS.Button onClick={() => {
                        dispatch(getEventsList(numberOfLoadedEvents, EVENTS_PER_PAGE, typeFilter, statusFilter));
                    }}>
                        Load more events
                    </RS.Button>
                </div>}

                {/* No Results */}
                {total === 0 && <div className="text-center">
                    <p>Sorry, we cannot find any events that match your filter settings.</p>
                    {statusFilter === StatusFilter["My booked events"] && <p>
                        N.B. Events booked via Eventbrite may not appear here; for these if you have received email
                        confirmation you are booked.
                    </p>}
                </div>}
            </div>
            } />
        </div>
    </RS.Container>
});

/* eslint-enable @typescript-eslint/camelcase */
