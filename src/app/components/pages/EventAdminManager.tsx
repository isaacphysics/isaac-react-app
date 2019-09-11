import React, {useEffect, useRef, useState} from "react";
import * as RS from "reactstrap";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ADMIN_CRUMB} from "../../services/constants";
import {scrollVerticallyIntoView} from "../../services/scrollManager";
import {EventOverviewsPanel} from "../elements/panels/EventOverviewsPanel";
import {SelectedEventDetailsPanel} from "../elements/panels/SelectedEventDetailsPanel";
import {ManageExistingBookingsPanel} from "../elements/panels/ManageExistingBookingsPanel";
import {AddUsersToBookingPanel} from "../elements/panels/AddUsersToBookingPanel";


export const EventAdminManager = ({user}: {user: LoggedInUser}) => {
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    const selectedEventRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (selectedEventId !== null && selectedEventRef.current !== null) {
            scrollVerticallyIntoView(selectedEventRef.current);
        }
    }, [selectedEventId]);

    return  <RS.Container>
        <TitleAndBreadcrumb intermediateCrumbs={[ADMIN_CRUMB]} currentPageTitle="Event booking admin"/>
        <RS.Card className="my-5">
            <RS.CardBody>
                <div>
                    <EventOverviewsPanel setSelectedEventId={setSelectedEventId} />
                </div>
                {selectedEventId !== null && <React.Fragment>
                    <div ref={selectedEventRef} className="mb-3">
                        <SelectedEventDetailsPanel eventId={selectedEventId} />
                    </div>
                    <div>
                        <ManageExistingBookingsPanel user={user} eventBookingId={selectedEventId} />
                    </div>
                    <div>
                        <AddUsersToBookingPanel />
                    </div>
                    {/*<div>*/}
                    {/*    <EventAttendancePanel eventBookingId={selectedEventId} />*/}
                    {/*</div>*/}
                </React.Fragment>}
            </RS.CardBody>
        </RS.Card>
    </RS.Container>
};
