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

interface AddUsersToBookingProps {
    event: AugmentedEvent;
    eventBookingUserIds: number[];
}
export const AddUsersToBooking = ({event, eventBookingUserIds}: AddUsersToBookingProps) => {
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

    return <Accordion trustedTitle="Add users to booking" disabled={event?.isCancelled && "You cannot add users to a cancelled event"}>
        <Form onSubmit={userSearch}>
            <Row>
                <Col md={6}>
                    <div className="mb-3">
                        <Label htmlFor="user-search-familyName">Find a user by family name:</Label>
                        <Input
                            id="user-search-familyName" type="text" placeholder="Enter user family name" value={queryParams.familyName || ""}
                            onChange={e => setParamIfNotDefault("familyName", e.target.value, "")}
                        />
                    </div>
                </Col>
                <Col md={6}>
                    <div className="mb-3">
                        <Label htmlFor="user-search-email">Find a user by email:</Label>
                        <Input
                            id="user-search-email" type="text" placeholder="Enter user email" value={queryParams.email || ""}
                            onChange={e => setParamIfNotDefault("email", e.target.value, "")}
                        />
                    </div>
                </Col>
                <Col md={6}>
                    <div className="mb-3">
                        <Label htmlFor="user-search-role">Find by user role:</Label>
                        <Input
                            type="select" id="user-search-role" value={queryParams.role || "NO_ROLE"}
                            onChange={e => setParamIfNotDefault("role", e.target.value, "NO_ROLE")}
                        >
                            <option value="NO_ROLE">Any Role</option>
                            <option value="TUTOR">Tutor</option>
                            <option value="TEACHER">Teacher</option>
                            <option value="CONTENT_EDITOR">Content editor</option>
                            <option value="ADMIN">Admin</option>
                        </Input>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Input type="submit" className="btn w-100 btn-secondary border-0 my-2" value="Find user" />
                </Col>
            </Row>
        </Form>

        {searchRequested && <hr className="text-center my-4" />}

        {userSearchResults && atLeastOne(userSearchResults.length) && <div className="overflow-auto">
            <Table bordered className="mb-0 bg-white" data-testid="user-search-table">
                <thead>
                    <tr>
                        <th className="align-middle">Actions</th>
                        <th className="align-middle">Name</th>
                        <th className="align-middle">Email</th>
                        <th className="align-middle">User role</th>
                        <th className="align-middle">School set</th>
                        <th className="align-middle">Member since</th>
                        <th className="align-middle">Last seen</th>
                    </tr>
                </thead>
                <tbody>
                    {event && userSearchResults.map(result => <tr key={result.id}>
                        <td className="align-middle">
                            {!eventBookingUserIds.includes(result.id as number) &&
                            <Button color="primary" outline className="btn-sm" onClick={() => dispatch(openActiveModal(userBookingModal(result, event, eventBookingUserIds)))}>
                                {formatManageBookingActionButtonMessage(event)}
                            </Button>
                            }
                            {eventBookingUserIds.includes(result.id as number) && <div className="text-center">Booking exists</div>}
                        </td>
                        <td className="align-middle">{result.familyName}, {result.givenName}</td>
                        <td className="align-middle">{result.email}</td>
                        <td className="align-middle">{result.role}</td>
                        <td className="align-middle">{result.schoolId != null ? 'Yes' : result.schoolOther != null ? 'Yes (Other)' : 'None Set'}</td>
                        <td className="align-middle"><DateString>{result.registrationDate}</DateString></td>
                        <td className="align-middle"><DateString>{result.lastSeen}</DateString></td>
                    </tr>)}
                </tbody>
            </Table>
        </div>}

        {searchRequested && userSearchResults && zeroOrLess(userSearchResults.length) && <div className="text-center">
            <strong>No users returned from query</strong>
        </div>}
    </Accordion>;
};
