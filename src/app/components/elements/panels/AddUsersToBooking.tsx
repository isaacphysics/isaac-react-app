import React, {useCallback, useRef, useState} from "react";
import {Accordion} from "../Accordion";
import {
    openActiveModal,
    useAppDispatch,
    useAppSelector,
    useAdminSearchUsersMutation,
    selectors
} from "../../../state";
import {atLeastOne, formatManageBookingActionButtonMessage, zeroOrLess} from "../../../services";
import {DateString} from "../DateString";
import {userBookingModal} from "../modals/UserBookingModal";
import {AdminSearchEndpointParams} from "../../../../IsaacApiTypes";
import {produce} from "immer";
import {AugmentedEvent} from "../../../../IsaacAppTypes";
import { Form, Row, Col, Label, Input, Table, Button } from "reactstrap";
import { useTranslation } from 'react-i18next'

interface AddUsersToBookingProps {
    event: AugmentedEvent;
    eventBookingUserIds: number[];
}
export const AddUsersToBooking = ({event, eventBookingUserIds}: AddUsersToBookingProps) => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch();

    const [searchUsers, {isUninitialized}] = useAdminSearchUsersMutation();
    const userSearchResults = useAppSelector(selectors.admin.userSearch);
    const searchRequested = !isUninitialized;
    const [queryParams, setQueryParams] = useState<AdminSearchEndpointParams>({});
    const adminSearchResultsRef = useRef<HTMLDivElement>(null);

    function userSearch(formEvent: React.FormEvent<HTMLFormElement>) {
        if (formEvent) formEvent.preventDefault();
        adminSearchResultsRef.current?.scrollIntoView({behavior: "smooth"});
        searchUsers(queryParams);
    }

    const setParamIfNotDefault = useCallback((param: string, value: string, defaultValue: string) => {
        setQueryParams(produce(queryParams => {
            if (value === defaultValue) {
                delete (queryParams as {[k: string]: any})[param];
            } else {
                (queryParams as {[k: string]: any})[param] = value;
            }
        }));
    }, [setQueryParams]);

    return <Accordion trustedTitle="Add users to booking" disabled={event?.isCancelled && t('youCannotAddUsersToACancelledEvent', 'You cannot add users to a cancelled event')}>
        <Form onSubmit={userSearch}>
            <Row>
                <Col md={6}>
                    <div className="mb-3">
                        <Label htmlFor="user-search-familyName">{t('findAUserByFamilyName', 'Find a user by family name:')}</Label>
                        <Input
                            id="user-search-familyName" type="text" placeholder={t('enterUserFamilyName', 'Enter user family name')} value={queryParams.familyName || ""}
                            onChange={e => setParamIfNotDefault("familyName", e.target.value, "")}
                        />
                    </div>
                </Col>
                <Col md={6}>
                    <div className="mb-3">
                        <Label htmlFor="user-search-email">{t('findAUserByEmail', 'Find a user by email:')}</Label>
                        <Input
                            id="user-search-email" type="text" placeholder={t('enterUserEmail', 'Enter user email')} value={queryParams.email || ""}
                            onChange={e => setParamIfNotDefault("email", e.target.value, "")}
                        />
                    </div>
                </Col>
                <Col md={6}>
                    <div className="mb-3">
                        <Label htmlFor="user-search-role">{t('findByUserRole', 'Find by user role:')}</Label>
                        <Input
                            type="select" id="user-search-role" value={queryParams.role || "NO_ROLE"}
                            onChange={e => setParamIfNotDefault("role", e.target.value, "NO_ROLE")}
                        >
                            <option value="NO_ROLE">{t('anyRole2', 'Any Role')}</option>
                            <option value="TUTOR">{t('tutor2', 'Tutor')}</option>
                            <option value="TEACHER">{t('teacher', 'Teacher')}</option>
                            <option value="CONTENT_EDITOR">{t('contentEditor', 'Content editor')}</option>
                            <option value="ADMIN">{t('admin', 'Admin')}</option>
                        </Input>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button type="submit" color="secondary" className="w-100 my-2">{t('findUser', 'Find user')}</Button>
                </Col>
            </Row>
        </Form>

        {searchRequested && <hr className="text-center my-4" />}

        {userSearchResults && atLeastOne(userSearchResults.length) && <div className="overflow-auto">
            <Table bordered className="mb-0 bg-white" data-testid="user-search-table">
                <thead>
                    <tr>
                        <th className="align-middle">{t('actions', 'Actions')}</th>
                        <th className="align-middle">Name</th>
                        <th className="align-middle">{t('email2', 'Email')}</th>
                        <th className="align-middle">{t('userRole', 'User role')}</th>
                        <th className="align-middle">{t('schoolSet', 'School set')}</th>
                        <th className="align-middle">{t('memberSince', 'Member since')}</th>
                        <th className="align-middle">{t('lastSeen', 'Last seen')}</th>
                    </tr>
                </thead>
                <tbody>
                    {event && userSearchResults.map(result => <tr key={result.id}>
                        <td className="align-middle">
                            {!eventBookingUserIds.includes(result.id as number) &&
                            <Button color="keyline" className="btn-sm" onClick={() => dispatch(openActiveModal(userBookingModal(result, event, eventBookingUserIds)))}>
                                {formatManageBookingActionButtonMessage(event)}
                            </Button>
                            }
                            {eventBookingUserIds.includes(result.id as number) && <div className="text-center">{t('bookingExists', 'Booking exists')}</div>}
                        </td>
                        <td className="align-middle">{t('familynameGivenname', '{{familyName}}, {{givenName}}', { familyName: result.familyName, givenName: result.givenName })}</td>
                        <td className="align-middle">{result.email}</td>
                        <td className="align-middle">{result.role}</td>
                        <td className="align-middle">{result.schoolId != null ? 'Yes' : result.schoolOther != null ? t('yesOther', 'Yes (Other)') : t('noneSet', 'None Set')}</td>
                        <td className="align-middle"><DateString>{result.registrationDate}</DateString></td>
                        <td className="align-middle"><DateString>{result.lastSeen}</DateString></td>
                    </tr>)}
                </tbody>
            </Table>
        </div>}

        {searchRequested && userSearchResults && zeroOrLess(userSearchResults.length) && <div className="text-center">
            <strong>{t('noUsersReturnedFromQuery', 'No users returned from query')}</strong>
        </div>}
    </Accordion>;
};
