import React, {useEffect, useMemo} from "react";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {selectors, useAppSelector, useLazyGetEventsQuery} from "../../state";
import queryString from "query-string";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {EventCard} from "../elements/cards/EventCard";
import {PageFragment} from "../elements/PageFragment";
import {
    EventStageMap,
    EventStatusFilter,
    EventTypeFilter,
    STAGE,
    isTeacherOrAbove,
    siteSpecific,
} from "../../services";
import {RenderNothing} from "../elements/RenderNothing";
import {MetaDescription} from "../elements/MetaDescription";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
interface EventsPageQueryParams {
    show_booked_only?: boolean;
    show_reservations_only?: boolean;
    event_status?: "all";
    show_stage_only?: string;
    types?: EventTypeFilter;
}

const EVENTS_PER_PAGE = 6;

export const Events = withRouter(({history, location}: RouteComponentProps) => {
    const query: EventsPageQueryParams = queryString.parse(location.search);

    const user = useAppSelector(selectors.user.orNull);

    const [getEventsList, eventsQuery] = useLazyGetEventsQuery();

    const statusFilter =
        (user && user.loggedIn && query.show_booked_only && EventStatusFilter["My booked events"]) ||
        (user && user.loggedIn && query.show_reservations_only && EventStatusFilter["My event reservations"]) ||
        (query.event_status === "all" && EventStatusFilter["All events"]) ||
        EventStatusFilter["Upcoming events"];
    const typeFilter = query.types || EventTypeFilter["All events"];
    const stageFilter = useMemo(() => query.show_stage_only?.split(',') as STAGE[] || [STAGE.ALL], [query.show_stage_only]);

    useEffect(() => {
        getEventsList({startIndex: 0, limit: EVENTS_PER_PAGE, typeFilter, statusFilter, stageFilter});
    }, [typeFilter, statusFilter, stageFilter]);

    const pageHelp = <span>
        Follow the links below to find out more about our FREE events.
    </span>;

    // FIXME does Ada want an events page summary?
    const metaDescription = siteSpecific(
        "See all of our Isaac Physics Events, online and in-person, for students and teachers.",
        undefined);

    const reverseEventsMap = Object.entries(EventStageMap).reduce((acc, [key, value]) => {
        return {...acc, [value]: key};
    }, {} as {[key: string]: string});

    return <div>
        <RS.Container>
            <TitleAndBreadcrumb currentPageTitle={"Events"} help={pageHelp} />
            <MetaDescription description={metaDescription} />
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
                            {/* Tutors are considered students w.r.t. events currently, so cannot see teacher-only events */}
                            {Object.entries(EventStatusFilter)
                                .filter(([statusLabel, statusValue]) => (user && user.loggedIn) || statusValue !== EventStatusFilter["My booked events"])
                                .filter(([statusLabel, statusValue]) => (user && user.loggedIn && isTeacherOrAbove(user)) || statusValue !== EventStatusFilter["My event reservations"])
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
                        <RS.Input id="event-stage-filter" className="ml-2" type="select" 
                            value={query.show_stage_only && Object.keys(reverseEventsMap).includes(query.show_stage_only) ? query.show_stage_only : STAGE.ALL}
                            onChange={e => {
                                const selectedStage = e.target.value as STAGE;
                                query.show_stage_only = selectedStage !== STAGE.ALL ? selectedStage : undefined;
                                history.push({pathname: location.pathname, search: queryString.stringify(query as any)});
                            }}>
                            {Object.entries(EventStageMap).map(([label, value]) =>
                                <option key={value} value={value}>{label}</option>
                            )}
                        </RS.Input>
                    </RS.Label>
                </RS.Form>

                {/* Results */}
                <ShowLoadingQuery
                    query={eventsQuery}
                    defaultErrorTitle={"Error loading events list"}
                    thenRender={({events, total}) => {
                        const numberOfLoadedEvents = events.length;

                        return <div className="my-4">
                            <RS.Row>
                                {events.map(event => <div key={event.id} className="col-xs-12 col-sm-6 col-md-4 d-flex">
                                    <EventCard event={event} />
                                </div>)}
                            </RS.Row>

                            {/* Load More Button */}
                            {numberOfLoadedEvents < total && <div className="text-center mb-5">
                                <RS.Button onClick={() => {
                                    getEventsList({startIndex: numberOfLoadedEvents, limit: EVENTS_PER_PAGE, typeFilter, statusFilter, stageFilter});
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
                        </div>;
                }} />
                <div className="mb-5">
                    <PageFragment fragmentId="event_type_descriptions" ifNotFound={RenderNothing}/>
                </div>
            </div>
        </RS.Container>
    </div>
});
