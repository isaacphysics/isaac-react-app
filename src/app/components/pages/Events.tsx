import React, {useEffect, useMemo} from "react";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {selectors, useAppSelector, useLazyGetEventsQuery} from "../../state";
import queryString from "query-string";
import {useLocation, useNavigate} from "react-router-dom";
import {EventCard} from "../elements/cards/EventCard";
import {PageFragment} from "../elements/PageFragment";
import {
    EventStageMap,
    EventStatusFilter,
    EventTypeFilter,
    STAGE,
    isAda,
    isPhy,
    isTeacherOrAbove,
    siteSpecific,
    useDeviceSize,
} from "../../services";
import {RenderNothing} from "../elements/RenderNothing";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import { Container, Row, Button, Form, Input, Label, Col } from "reactstrap";
import { MainContent, SidebarLayout } from "../elements/layout/SidebarLayout";
import { EventsSidebar } from "../elements/sidebar/EventsSidebar";

export interface EventsPageQueryParams {
    show_booked_only?: boolean;
    show_reservations_only?: boolean;
    event_status?: "all";
    show_stage_only?: string;
    types?: EventTypeFilter;
}

const EVENTS_PER_PAGE = 6;

export const Events = () => {
    const location = useLocation();
    const query: EventsPageQueryParams = queryString.parse(location.search);

    const user = useAppSelector(selectors.user.orNull);
    const deviceSize = useDeviceSize();

    const [getEventsList, eventsQuery] = useLazyGetEventsQuery();

    const statusFilter =
        (user && user.loggedIn && query.show_booked_only && EventStatusFilter["My booked events"]) ||
        (user && user.loggedIn && query.show_reservations_only && EventStatusFilter["My event reservations"]) ||
        (query.event_status === "all" && EventStatusFilter["All events"]) ||
        EventStatusFilter["Upcoming events"];
    const typeFilter = query.types || EventTypeFilter["All groups"];
    const stageFilter = useMemo(() => query.show_stage_only?.split(',') as STAGE[] || [STAGE.ALL], [query.show_stage_only]);

    useEffect(() => {
        void getEventsList({
            startIndex: 0, 
            limit: EVENTS_PER_PAGE, 
            typeFilter, 
            statusFilter, 
            stageFilter
        });
    }, [typeFilter, statusFilter, stageFilter, getEventsList]);

    const pageHelp = <span>
        Follow the links below to find out more about our FREE events.
    </span>;

    const AdaEventFilters = () => {
        // Dropdown filters for Ada - these are radio buttons in the sidebar for phy
        const navigate = useNavigate();
        const reverseEventsMap = Object.entries(EventStageMap).reduce((acc, [key, value]) => {
            return {...acc, [value]: key};
        }, {} as {[key: string]: string});

        return <div className="my-4">
            <Form className="form-inline d-flex justify-content-end">
                <Label>Filter by
                    <Input id="event-status-filter" className="ms-3" type="select" value={statusFilter} onChange={e => {
                        const selectedFilter = e.target.value as EventStatusFilter;
                        query.show_booked_only = selectedFilter === EventStatusFilter["My booked events"] ? true : undefined;
                        query.show_reservations_only = selectedFilter === EventStatusFilter["My event reservations"] ? true : undefined;
                        query.event_status = selectedFilter == EventStatusFilter["All events"] ? "all" : undefined;
                        void navigate({pathname: location.pathname, search: queryString.stringify(query as any)});
                    }}>
                        {/* Tutors are considered students w.r.t. events currently, so cannot see teacher-only events */}
                        {Object.entries(EventStatusFilter)
                            .filter(([statusValue]) => (user && user.loggedIn) || statusValue !== EventStatusFilter["My booked events"])
                            .filter(([statusValue]) => (user && user.loggedIn && isTeacherOrAbove(user)) || statusValue !== EventStatusFilter["My event reservations"])
                            .map(([statusLabel, statusValue]) =>
                                <option key={statusValue} value={statusValue}>{statusLabel}</option>
                            )
                        }
                    </Input>
                    <Input id="event-type-filter" className="ms-3" type="select" value={typeFilter} onChange={e => {
                        const selectedType = e.target.value as EventTypeFilter;
                        query.types = selectedType !== EventTypeFilter["All groups"] ? selectedType : undefined;
                        void navigate({pathname: location.pathname, search: queryString.stringify(query as any)});
                    }}>
                        {Object.entries(EventTypeFilter).map(([typeLabel, typeValue]) =>
                            <option key={typeValue} value={typeValue}>{typeLabel}</option>
                        )}
                    </Input>
                    {Object.keys(EventStageMap).length > 1 && <Input id="event-stage-filter" className="ms-3" type="select" style={{minWidth: "140px"}}
                        value={query.show_stage_only && Object.keys(reverseEventsMap).includes(query.show_stage_only) ? query.show_stage_only : STAGE.ALL}
                        onChange={e => {
                            const selectedStage = e.target.value as STAGE;
                            query.show_stage_only = selectedStage !== STAGE.ALL ? selectedStage : undefined;
                            void navigate({pathname: location.pathname, search: queryString.stringify(query as any)});
                        }}>
                        {Object.entries(EventStageMap).map(([label, value]) =>
                            <option key={value} value={value}>{label}</option>
                        )}
                    </Input>}
                </Label>
            </Form>
        </div>;
    };

    return <div>
        <Container>
            <TitleAndBreadcrumb
                currentPageTitle={"Events"}
                help={pageHelp}
                icon={{type: "icon", icon: "icon-events"}}
            />
            <SidebarLayout site={isPhy}>
                <EventsSidebar/>
                <MainContent>
                    {isAda && <AdaEventFilters/>}
                    <ShowLoadingQuery
                        query={eventsQuery}
                        defaultErrorTitle={"Error loading events list"}
                        thenRender={({events, total}) => {
                            const numberOfLoadedEvents = events.length;

                            return <div className="my-4">
                                <div className="d-flex flex-col justify-content-end mb-2">
                                    Showing {numberOfLoadedEvents} of {total}
                                </div>

                                <Row className={`row-cols-1 row-cols-sm-2 ${siteSpecific("row-cols-lg-2 row-cols-xl-3", "row-cols-lg-3")}`}>
                                    {events.map(event => <Col key={event.id} className={siteSpecific("g-4", "p-3")}>
                                        {deviceSize==="md" && <div className="section-divider mb-4"/>}
                                        <EventCard event={event} />
                                    </Col>)}
                                </Row>

                                {/* Load More Button */}
                                {numberOfLoadedEvents < total && <div className="text-center mt-4 mb-7">
                                    <Button color="solid"
                                        onClick={() => {
                                            void getEventsList({startIndex: numberOfLoadedEvents, limit: EVENTS_PER_PAGE, typeFilter, statusFilter, stageFilter});
                                        }}>
                                        Load more events
                                    </Button>
                                </div>}

                                {/* No Results */}
                                {total === 0 && <div className="text-center">
                                    <p>Sorry, we cannot find any events that match your filter settings.</p>
                                </div>}
                            </div>;
                        }} />
                    <div className="mb-7">
                        <PageFragment fragmentId="event_type_descriptions" ifNotFound={RenderNothing}/>
                    </div>
                </MainContent>
            </SidebarLayout>
        </Container>
    </div>;
};
