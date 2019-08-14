import React, {useEffect, useMemo, useState} from "react";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {ShowLoading} from "../handlers/ShowLoading";
import queryString from "query-string";
import {withRouter} from "react-router-dom";
import {History} from "history";
import {getEventsList} from "../../state/actions";
import {EventCard} from "../elements/EventCard";

/* eslint-disable @typescript-eslint/camelcase */

interface EventsPageQueryParams {
    show_booked_only?: boolean;
    event_status?: "all";
    types?: TypeFilter;
}

export enum StatusFilter {
    "All Events" = "all",
    "Upcoming Events" = "upcoming",
    "My Booked Events" = "showBookedOnly",
}
export enum TypeFilter {
    "All Events" = "all",
    "Student Events" = "student",
    "Teacher Events" = "teacher",
    "Online Tutorials" = "virtual",
}
const eventsPerPage = 6;

// Events get displayed nicely
// Events get augmented, probably in an events service
// A call for more events is provided when appropriate

export const Events = withRouter(({history, location}: {history: History; location: Location}) => {
    const query: EventsPageQueryParams = queryString.parse(location.search);

    const dispatch = useDispatch();
    const eventsState = useSelector((state: AppState) => state && state.events);

    const statusFilter =
        (query.show_booked_only && StatusFilter["My Booked Events"]) ||
        (query.event_status === "all" && StatusFilter["All Events"]) ||
        StatusFilter["Upcoming Events"];
    const typeFilter = query.types || TypeFilter["All Events"];

    useEffect(() => {
        const startIndex = 0;
        const filterTags = typeFilter !== TypeFilter["All Events"] ? typeFilter : null;
        const showActiveOnly = statusFilter === StatusFilter["Upcoming Events"];
        const showBookedOnly = statusFilter === StatusFilter["My Booked Events"];
        const showInactiveOnly = false;
        dispatch(getEventsList(startIndex, eventsPerPage, filterTags, showActiveOnly, showInactiveOnly, showBookedOnly));
    }, [typeFilter, statusFilter]);

    return <RS.Container>
        <TitleAndBreadcrumb currentPageTitle={"Events"} help="Follow the links below to find out more about our FREE events." />

        <div className="my-4">
            {/* Filters */}
            <RS.Form inline className="d-flex justify-content-end">
                <RS.Label>Filter by
                    <RS.Input className="ml-2 mr-3" type="select" value={statusFilter} onChange={e => {
                        const selectedFilter = e.target.value as StatusFilter;
                        query.show_booked_only = selectedFilter === StatusFilter["My Booked Events"] ? true : undefined;
                        query.event_status = selectedFilter == StatusFilter["All Events"] ? "all" : undefined;
                        history.push({pathname: location.pathname, search: queryString.stringify(query)});
                    }}>
                        {Object.entries(StatusFilter).map(([statusLabel, statusValue]) =>
                            <option key={statusValue} value={statusValue}>{statusLabel}</option>
                        )}
                    </RS.Input>
                    <RS.Input className="ml-2" type="select" value={typeFilter} onChange={e => {
                        const selectedType = e.target.value as TypeFilter;
                        query.types = selectedType !== TypeFilter["All Events"] ? selectedType : undefined;
                        history.push({pathname: location.pathname, search: queryString.stringify(query)});
                    }}>
                        {Object.entries(TypeFilter).map(([typeLabel, typeValue]) =>
                            <option key={typeValue} value={typeValue}>{typeLabel}</option>
                        )}
                    </RS.Input>
                </RS.Label>
            </RS.Form>

            {/* Results */}
            <ShowLoading until={eventsState} render={({events, total}) => <div className="my-4">
                {/* Map */}

                {/* Event Cards */}
                <RS.Row>
                    {events.map(event => <div key={event.id} className="col-xs-12 col-sm-6 col-md-4">
                        <EventCard event={event} />
                    </div>)}
                </RS.Row>

                {/* Load More Button */}
                {events.length < total && <div className="text-center">
                    <RS.Button>
                        Load more events
                    </RS.Button>
                </div>}

                {/* No Results */}
                {total === 0 && <div className="text-center">
                    <p>Sorry, we cannot find any events that match your filter settings.</p>
                    {statusFilter === StatusFilter["My Booked Events"] && <p>
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
