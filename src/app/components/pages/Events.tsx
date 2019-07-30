import React, {useState} from "react";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useSelector} from "react-redux";
import {AppState} from "../../state/reducers";

enum StatusFilter {
    "All Events" = "all",
    "Upcoming Events" = "upcoming",
    "My Booked Events" = "showBookedOnly",
}
enum TypeFilter {
    "All Events" = "all",
    "Student Events" = "student",
    "Teacher Events" = "teacher",
    "Online Tutorials" = "virtual",
}

export const Events = () => {
    // Redux state
    const events = useSelector((state: AppState) => []);

    // Local state
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("upcoming" as StatusFilter);
    const [typeFilter, setTypeFilter] = useState<TypeFilter>("all" as TypeFilter);

    // Render
    // @ts-ignore
    return <RS.Container>
        <TitleAndBreadcrumb currentPageTitle={"Events"} help="Follow the links below to find out more about our FREE events." />

        <div className="my-5">
            {/* Filters */}
            <RS.Form inline className="d-flex justify-content-end">
                <RS.Label>Filter by
                    <RS.Input className="ml-2 mr-3" type="select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)}>
                        {Object.entries(StatusFilter).map(([statusLabel, statusValue]) => <option key={statusValue} value={statusValue}>{statusLabel}</option>)}
                    </RS.Input>
                    <RS.Input className="ml-2" type="select" value={typeFilter} onChange={e => setTypeFilter(e.target.value as TypeFilter)}>
                        {Object.entries(TypeFilter).map(([typeLabel, typeValue]) => <option key={typeValue} value={typeValue}>{typeLabel}</option>)}
                    </RS.Input>
                </RS.Label>
            </RS.Form>

            {/* Map */}
            <h1 className="text-center my-5 py-5">MAP</h1>

            {/* Event Cards */}

            {/* Load More */}

            {/* No Results */}
            {events.length === 0 && <div className="text-center">
                <p>Sorry, we cannot find any events that match your filter settings.</p>
                {statusFilter === StatusFilter["My Booked Events"] && <p>
                    N.B. Events booked via Eventbrite may not appear here; for these if you have received email confirmation you are booked.
                </p>}
            </div>}
        </div>
    </RS.Container>
};
