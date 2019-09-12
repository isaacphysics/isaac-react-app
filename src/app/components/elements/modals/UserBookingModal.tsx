import React from "react";
import {UserSummaryForAdminUsersDTO} from "../../../../IsaacApiTypes";
import {AugmentedEvent} from "../../../../IsaacAppTypes";
import {store} from "../../../state/store";
import {closeActiveModal} from "../../../state/actions";
import * as RS from "reactstrap";
import {history} from "../../../services/history";
import {zeroOrLess} from "../../../services/validation";
import {EventBookingForm} from "../EventBookingForm";

export function userBookingModal(selectedUser: UserSummaryForAdminUsersDTO, selectedEvent: AugmentedEvent, eventBookingIds: number[]) {
    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
        title: eventBookingIds.includes(selectedUser.id as number) && zeroOrLess(selectedEvent.placesAvailable) ?
            `Add ${selectedUser.givenName} ${selectedUser.familyName} to waiting list` :
            `Create a booking for ${selectedUser.givenName} ${selectedUser.familyName}`,
        body: function UserBookingModalBody() {
            return <div>
                {/*<EventBookingForm event={selectedEvent} user={selectedUser}/>*/}
            </div>
        },
    }
}

/*
    <div event-booking-form></div>
    <span>
        <p><small>Warning, by booking a user on this event, it may eventually lead to their personal information being shared with a third party. You must therefore confirm how this booking has been authorised. The data owner is always the Isaac user being booked on to the event.</small></p>

        <label for="authorisation">
            <strong>Booking / Personal Data Sharing Authorised By</strong>
            <span class="ru-form-required"></span>
        </label>
        <select id="authorisation" name="authorisation" ng-model="additionalInformation.authorisation" required>
            <option value="Telephone-Owner">Telephone - Data Owner</option>
            <option value="Email-Owner">Verified Email - Data Owner</option>
            <option value="OTHER">Other - Please specify</option>
        </select>

        <input ng-show="additionalInformation.authorisation == 'OTHER'" type="text" name="authorisation", ng-model="additionalInformation.authorisationOther"/>

        <a class="button" ng-show="eventSelected.eventStatus != 'WAITING_LIST_ONLY' && userBookings.indexOf(result.id) == -1 && eventSelected.placesAvailable > 0" href="javascript:void(0);" class="right" ng-click="bookUserOnEvent(eventSelected.id, targetUser.id, additionalInformation)">Book on event</a>
        <a class="button" ng-show="eventSelected.eventStatus == 'WAITING_LIST_ONLY' || (userBookings.indexOf(result.id) == -1 && eventSelected.placesAvailable <= 0)" href="javascript:void(0);" class="right" ng-click="bookUserOnEvent(eventSelected.id, targetUser.id, additionalInformation)">Add to waiting list</a>
    </span>
 */
