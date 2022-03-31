import React, {useEffect} from "react";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {ShowLoading} from "../handlers/ShowLoading";
import queryString from "query-string";
import {withRouter} from "react-router-dom";
import {History} from "history";
import {clearEventsList, getEventMapData, getEventsList} from "../../state/actions";
import {EventCard} from "../elements/cards/EventCard";
import {PageFragment} from "../elements/PageFragment";
import {EventStatusFilter, EventTypeFilter} from "../../services/constants";
import {selectors} from "../../state/selectors";
import {isTeacher} from "../../services/user";
import {RenderNothing} from "../elements/RenderNothing";
import {CoronavirusWarningBanner} from "../navigation/CoronavirusWarningBanner";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {MetaDescription} from "../elements/MetaDescription";


interface EventsPageQueryParams {
    show_booked_only?: boolean;
    show_reservations_only?: boolean;
    event_status?: "all";
    types?: EventTypeFilter;
}

const EVENTS_PER_PAGE = 6;

export const Events = withRouter(({history, location}: {history: History; location: Location}) => {
    const query: EventsPageQueryParams = queryString.parse(location.search);

    const dispatch = useDispatch();
    const eventsState = useSelector((state: AppState) => state?.events);
    // const eventMapData = useSelector((state: AppState) => state?.eventMapData);
    const user = useSelector(selectors.user.orNull);
    const numberOfLoadedEvents = eventsState ? eventsState.events.length : 0;

    const statusFilter =
        (user && user.loggedIn && query.show_booked_only && EventStatusFilter["My booked events"]) ||
        (user && user.loggedIn && query.show_reservations_only && EventStatusFilter["My event reservations"]) ||
        (query.event_status === "all" && EventStatusFilter["All events"]) ||
        EventStatusFilter["Upcoming events"];
    const typeFilter = query.types || EventTypeFilter["All events"];

    useEffect(() => {
        const startIndex = 0;
        dispatch(clearEventsList);
        dispatch(getEventsList(startIndex, EVENTS_PER_PAGE, typeFilter, statusFilter));
        dispatch(getEventMapData(startIndex, -1, typeFilter, statusFilter));
    }, [dispatch, typeFilter, statusFilter]);

    const pageHelp = <span>
        Follow the links below to find out more about our FREE events.
    </span>;

    const metaDescriptionCS = "A level and GCSE Computer Science live online training. Free teacher CPD. Revision and extension workshops for students.";

    return <div>
        <RS.Container>
            <TitleAndBreadcrumb currentPageTitle={"Events"} help={pageHelp} />
            {SITE_SUBJECT === SITE.CS && <>
                <CoronavirusWarningBanner />
                <MetaDescription description={metaDescriptionCS} />
            </>}
            <div className="my-4">
                {/* Filters */}
                <RS.Form inline className="d-flex justify-content-end">
                    <RS.Label>Filter by
                        <RS.Input id="event-status-filter" className="ml-2 mr-3" type="select" value={statusFilter} onChange={e => {
                            const selectedFilter = e.target.value as EventStatusFilter;
                            query.show_booked_only = selectedFilter === EventStatusFilter["My booked events"] ? true : undefined;
                            query.show_reservations_only = selectedFilter === EventStatusFilter["My event reservations"] ? true : undefined;
                            query.event_status = selectedFilter == EventStatusFilter["All events"] ? "all" : undefined;
                            history.push({pathname: location.pathname, search: queryString.stringify(query as any)});
                        }}>
                            {Object.entries(EventStatusFilter)
                                .filter(([statusLabel, statusValue]) => (user && user.loggedIn) || statusValue !== EventStatusFilter["My booked events"])
                                .filter(([statusLabel, statusValue]) => (user && user.loggedIn && isTeacher(user)) || statusValue !== EventStatusFilter["My event reservations"])
                                .map(([statusLabel, statusValue]) =>
                                    <option key={statusValue} value={statusValue}>{statusLabel}</option>
                                )
                            }
                        </RS.Input>
                        <RS.Input id="event-type-filter" className="ml-2" type="select" value={typeFilter} onChange={e => {
                            const selectedType = e.target.value as EventTypeFilter;
                            query.types = selectedType !== EventTypeFilter["All events"] ? selectedType : undefined;
                            history.push({pathname: location.pathname, search: queryString.stringify(query as any)});
                        }}>
                            {Object.entries(EventTypeFilter).map(([typeLabel, typeValue]) =>
                                <option key={typeValue} value={typeValue}>{typeLabel}</option>
                            )}
                        </RS.Input>
                    </RS.Label>
                </RS.Form>

                {/* Results */}
                <ShowLoading until={eventsState} thenRender={({events, total}) => <div className="my-4">
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
                        {statusFilter === EventStatusFilter["My booked events"] && <p>
                            N.B. Events booked via Eventbrite may not appear here; for these if you have received email
                            confirmation you are booked.
                        </p>}
                    </div>}
                </div>
                } />
                <div className="mb-5">
                    <PageFragment fragmentId="event_type_descriptions" ifNotFound={RenderNothing}/>
                </div>
            </div>
        </RS.Container>
    </div>
});
