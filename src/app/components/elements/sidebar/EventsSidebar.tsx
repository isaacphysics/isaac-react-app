import React from "react";
import { useLocation, useNavigate } from "react-router";
import { Form } from "reactstrap";
import { useDeviceSize, above, EventStatusFilter, isTeacherOrAbove, isDefined, EventTypeFilter, EventStageMap, STAGE } from "../../../services";
import { useAppSelector, selectors } from "../../../state";
import { EventsPageQueryParams } from "../../pages/Events";
import { StyledTabPicker } from "../inputs/StyledTabPicker";
import { ContentSidebar, SidebarProps } from "../layout/SidebarLayout";
import queryString from "query-string";

export const EventsSidebar = (props: SidebarProps) => {
    const deviceSize = useDeviceSize();
    const navigate = useNavigate();
    const location = useLocation();
    const query: EventsPageQueryParams = queryString.parse(location.search);
    const user = useAppSelector(selectors.user.orNull);

    return <ContentSidebar buttonTitle="Filter events" {...props}>
        <Form tag={"search"}>
            {above["lg"](deviceSize) && <div className="section-divider mt-7"/>}
            <h5 className="mb-3">Event type</h5>
            <ul>
                {Object.entries(EventStatusFilter)
                    .filter(([_statusLabel, statusValue]) => (user && user.loggedIn) || statusValue !== EventStatusFilter["My booked events"])
                    .filter(([_statusLabel, statusValue]) => (user && user.loggedIn && isTeacherOrAbove(user)) || statusValue !== EventStatusFilter["My event reservations"])
                    .map(([statusLabel, statusValue]) =>
                        <li key={statusValue}>
                            <StyledTabPicker
                                id={statusValue}
                                checkboxTitle={statusLabel}
                                checked={
                                    (!isDefined(query.event_status) && !query.show_booked_only && !query.show_reservations_only && statusValue === EventStatusFilter["Upcoming events"]) ||
                                    (query.show_booked_only && statusValue === EventStatusFilter["My booked events"]) ||
                                    (query.show_reservations_only && statusValue === EventStatusFilter["My event reservations"]) ||
                                    (query.event_status === "all" && statusValue === EventStatusFilter["All events"])
                                }
                                onChange={() => {
                                    query.show_booked_only = statusValue === EventStatusFilter["My booked events"] ? true : undefined;
                                    query.show_reservations_only = statusValue === EventStatusFilter["My event reservations"] ? true : undefined;
                                    query.event_status = statusValue === EventStatusFilter["All events"] ? "all" : undefined;
                                    void navigate({pathname: location.pathname, search: queryString.stringify(query)});
                                }}
                            />
                        </li>
                    )
                }
            </ul>

            <div className="section-divider"/>
            <h5 className="mb-3">Groups</h5>
            <ul>
                {Object.entries(EventTypeFilter).map(([typeLabel, typeValue]) =>
                    <li key={typeValue}>
                        <StyledTabPicker
                            id={typeValue}
                            checkboxTitle={typeLabel}
                            checked={query.types ? query.types === typeValue : typeValue === EventTypeFilter["All groups"]}
                            onChange={() => {
                                query.types = typeValue !== EventTypeFilter["All groups"] ? typeValue : undefined;
                                void navigate({pathname: location.pathname, search: queryString.stringify(query)});}}
                        />
                    </li>
                )
                }
            </ul>

            <div className="section-divider"/>
            <h5 className="mb-3">Stages</h5>
            <ul>
                {Object.entries(EventStageMap).map(([label, value]) =>
                    <li key={value}>
                        <StyledTabPicker
                            id={value}
                            checkboxTitle={label}
                            checked={query.show_stage_only ? query.show_stage_only === value : value === STAGE.ALL}
                            onChange={() => {
                                query.show_stage_only = value !== STAGE.ALL ? value : undefined;
                                void navigate({pathname: location.pathname, search: queryString.stringify(query)});
                            }}
                        />
                    </li>
                )
                }
            </ul>
        </Form>
    </ContentSidebar>;
};
