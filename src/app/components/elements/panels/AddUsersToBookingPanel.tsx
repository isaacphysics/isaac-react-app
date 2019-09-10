import React from "react";
import * as RS from "reactstrap";
import {Accordion} from "../Accordion";

export const AddUsersToBookingPanel = ({eventBookingId}: {eventBookingId: string}) => {
    return <Accordion title="Add users to booking">
        Search Filters
        <RS.Table>
            SEARCH RESULTS
        </RS.Table>
    </Accordion>
};
