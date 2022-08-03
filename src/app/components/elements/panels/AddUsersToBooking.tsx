import React, {useState} from "react";
import * as RS from "reactstrap";
import {Accordion} from "../Accordion";
import {
    adminUserSearchRequest,
    openActiveModal,
    useAppDispatch,
    useAppSelector,
    selectors,
    AppState
} from "../../../state";
import {atLeastOne, zeroOrLess} from "../../../services/validation";
import {DateString} from "../DateString";
import {NOT_FOUND} from "../../../services/constants";
import {userBookingModal} from "../modals/UserBookingModal";
import {formatManageBookingActionButtonMessage} from "../../../services/events";

export const AddUsersToBooking = () => {
    const dispatch = useAppDispatch();
    const userResults = useAppSelector(selectors.admin.userSearch) || [];
    const selectedEvent = useAppSelector((state: AppState) => state && state.currentEvent || null);
    const userBookings = useAppSelector((state: AppState) =>
        state && state.eventBookings && state.eventBookings.map(b => b.userBooked && b.userBooked.id) as number[] || []
    );

    const [searched, setSearched] = useState(false);
    const [queryParams, setQueryParams] = useState({familyName: null, email: null, role: null});

    function userSearch(formEvent: React.FormEvent<HTMLFormElement>) {
        if (formEvent) {formEvent.preventDefault()}
        setSearched(true);
        dispatch(adminUserSearchRequest(queryParams));
    }

    function nullIfDefault(value: string, defaultValue: string) {
        return (value !== defaultValue) ? value : null;
    }

    return <Accordion trustedTitle="Add users to booking">
        <RS.Form onSubmit={userSearch}>
            <RS.Row>
                <RS.Col md={6}>
                    <div className="mb-3">
                        <RS.Label htmlFor="user-search-familyName">Find a user by family name:</RS.Label>
                        <RS.Input
                            id="user-search-familyName" type="text" placeholder="Enter user family name" value={queryParams.familyName || ""}
                            onChange={e => setQueryParams(Object.assign({}, queryParams, {familyName: nullIfDefault(e.target.value, "")}))}
                        />
                    </div>
                </RS.Col>
                <RS.Col md={6}>
                    <div className="mb-3">
                        <RS.Label htmlFor="user-search-email">Find a user by email:</RS.Label>
                        <RS.Input
                            id="user-search-email" type="text" placeholder="Enter user email" value={queryParams.email || ""}
                            onChange={e => setQueryParams(Object.assign({}, queryParams, {email: nullIfDefault(e.target.value, "")}))}
                        />
                    </div>
                </RS.Col>
                <RS.Col md={6}>
                    <div className="mb-3">
                        <RS.Label htmlFor="user-search-role">Find by user role:</RS.Label>
                        <RS.Input
                            type="select" id="user-search-role" value={queryParams.role || "NO_ROLE"}
                            onChange={e => setQueryParams(Object.assign({}, queryParams, {role: nullIfDefault(e.target.value, "NO_ROLE")}))}
                        >
                            <option value="NO_ROLE">Any Role</option>
                            <option value="TEACHER">Teacher</option>
                            <option value="CONTENT_EDITOR">Content editor</option>
                            <option value="ADMIN">Admin</option>
                        </RS.Input>
                    </div>
                </RS.Col>
            </RS.Row>
            <RS.Row>
                <RS.Col>
                    <RS.Input type="submit" className="btn btn-block btn-secondary border-0 my-2" value="Find user" />
                </RS.Col>
            </RS.Row>
        </RS.Form>

        {searched && <hr className="text-center my-4" />}

        {atLeastOne(userResults.length) && <div className="overflow-auto">
            <RS.Table bordered className="mb-0 bg-white">
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
                    {selectedEvent && selectedEvent !== NOT_FOUND && userResults.map(result => <tr key={result.id}>
                        <td className="align-middle">
                            {!userBookings.includes(result.id as number) &&
                            <RS.Button color="primary" outline className="btn-sm" onClick={() => dispatch(openActiveModal(userBookingModal(result, selectedEvent, userBookings)))}>
                                {formatManageBookingActionButtonMessage(selectedEvent)}
                            </RS.Button>
                            }
                            {userBookings.includes(result.id as number) && <div className="text-center">Booking exists</div>}
                        </td>
                        <td className="align-middle">{result.familyName}, {result.givenName}</td>
                        <td className="align-middle">{result.email}</td>
                        <td className="align-middle">{result.role}</td>
                        <td className="align-middle">{result.schoolId != null ? 'Yes' : result.schoolOther != null ? 'Yes (Other)' : 'None Set'}</td>
                        <td className="align-middle"><DateString>{result.registrationDate}</DateString></td>
                        <td className="align-middle"><DateString>{result.lastSeen}</DateString></td>
                    </tr>)}
                </tbody>
            </RS.Table>
        </div>}

        {searched && zeroOrLess(userResults.length) && <div className="text-center">
            <strong>No users returned from query</strong>
        </div>}
    </Accordion>
};
