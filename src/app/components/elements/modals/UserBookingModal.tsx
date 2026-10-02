import React, {useState} from "react";
import {UserSummaryForAdminUsersDTO} from "../../../../IsaacApiTypes";
import {AdditionalInformation, AugmentedEvent} from "../../../../IsaacAppTypes";
import {
    closeActiveModal,
    showErrorToast,
    store,
    useAppDispatch,
    useBookUserOnEventMutation
} from "../../../state";
import {
    atLeastOne,
    formatBookingModalConfirmMessage,
    SITE_TITLE_SHORT,
    zeroOrLess
} from "../../../services";
import {EventBookingForm} from "../EventBookingForm";
import { Form, Label, Input } from "reactstrap";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

export function userBookingModal(selectedUser: UserSummaryForAdminUsersDTO, selectedEvent: AugmentedEvent, eventBookingIds: number[]) {
    return {
        closeAction: () => {store.dispatch(closeActiveModal());},

        title: eventBookingIds.includes(selectedUser.id as number) && zeroOrLess(selectedEvent.placesAvailable) ?
            i18next.t("common:events.userBooking.waitingListTitle", { givenName: selectedUser.givenName, familyName: selectedUser.familyName }) :
            i18next.t("common:events.userBooking.bookingTitle", { givenName: selectedUser.givenName, familyName: selectedUser.familyName }),

        body: function UserBookingModalBody() {
            const { t } = useTranslation();
            const dispatch = useAppDispatch();

            const [additionalInformation, setAdditionalInformation] = useState<AdditionalInformation>({});

            function updateAdditionalInformation(update: AdditionalInformation) {
                setAdditionalInformation(Object.assign({}, additionalInformation, update));
            }
            const userCanBeBookedOnEvent = selectedEvent.eventStatus != 'WAITING_LIST_ONLY' &&
                !eventBookingIds.includes(selectedUser.id as number) && atLeastOne(selectedEvent.placesAvailable);
            const userCanBeAddedToWaitingList = selectedEvent.eventStatus == 'WAITING_LIST_ONLY' ||
                (!eventBookingIds.includes(selectedUser.id as number) && zeroOrLess(selectedEvent.placesAvailable));

            const [bookUserOnEvent] = useBookUserOnEventMutation();
            function makeUserBooking(formEvent: React.FormEvent) {
                if (formEvent) {formEvent.preventDefault();}
                if (additionalInformation.authorisation === undefined || (additionalInformation.authorisation === "OTHER" && additionalInformation.authorisationOther === undefined)) {
                    dispatch(showErrorToast(t("common:events.userBooking.errorTitle"), t("common:events.userBooking.errorMessage")));
                    return;
                }
                bookUserOnEvent({eventId: selectedEvent.id as string, userId: selectedUser.id as number, additionalInformation})
                    .then(() => dispatch(closeActiveModal()));
            }

            return <Form onSubmit={makeUserBooking} className="mb-4">
                <EventBookingForm
                    event={selectedEvent} targetUser={selectedUser}
                    additionalInformation={additionalInformation} updateAdditionalInformation={updateAdditionalInformation}
                />
                <span>
                    <p>
                        <small>
                            {t("common:events.userBooking.dataWarning", { siteTitle: SITE_TITLE_SHORT })}
                        </small>
                    </p>

                    <Label htmlFor="form-authorisation" className="form-required">
                        {t("common:events.userBooking.authorisationLabel")}
                    </Label>
                    <Input
                        type="select" id="form-authorisation" name="form-authorisation" value={additionalInformation.authorisation || ""}
                        onChange={event => updateAdditionalInformation({authorisation: event.target.value})}
                    >
                        <option value="" />
                        <option value="Telephone-Owner">{t("common:events.userBooking.optionTelephoneOwner")}</option>
                        <option value="Email-Owner">{t("common:events.userBooking.optionEmailOwner")}</option>
                        <option value="OTHER">{t("common:events.userBooking.optionOther")}</option>
                    </Input>
                    {additionalInformation.authorisation === "OTHER" && <Input
                        type="text" className="mt-2" value={additionalInformation.authorisationOther || ""}
                        onChange={event => updateAdditionalInformation({authorisationOther: event.target.value})}
                    />}

                    {(userCanBeBookedOnEvent || userCanBeAddedToWaitingList) && <Input className="btn w-100 btn-secondary border-0 mt-3"
                        type="submit" value={formatBookingModalConfirmMessage(selectedEvent, userCanBeBookedOnEvent)}
                    />}
                </span>
            </Form>;
        },
    };
}
