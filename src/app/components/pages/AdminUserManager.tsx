import React, {useEffect, useState} from "react";
import * as RS from "reactstrap";
import {FormGroup} from "reactstrap";
import {ShowLoading} from "../handlers/ShowLoading";
import {useAppDispatch, useAppSelector} from "../../state/store";
import {
    adminModifyUserEmailVerificationStatuses,
    adminModifyUserRoles,
    adminUserDelete,
    adminUserSearch,
    getUserIdSchoolLookup,
    mergeUsers, resetPassword
} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {EmailVerificationStatus, Role} from "../../../IsaacApiTypes";
import {DateString} from "../elements/DateString";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ADMIN_CRUMB} from "../../services/constants";
import {Link} from "react-router-dom";
import {isAdmin} from "../../services/user";
import {selectors} from "../../state/selectors";
import { isDefined } from "../../services/miscUtils";

export const AdminUserManager = () => {
    const dispatch = useAppDispatch();
    const searchResults = useAppSelector(selectors.admin.userSearch);
    const [userUpdating, setUserUpdating] = useState(false);
    const [searchRequested, setSearchRequested] = useState(false);
    const [searchQuery, setSearchQuery] = useState({
        familyName: null,
        email: null,
        role: null,
        schoolURN: null,
        schoolOther: null,
        postcode: null,
        postcodeRadius: "FIVE_MILES",
    });
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [mergeTargetId, setMergeTargetId] = useState<string>("");
    const [mergeSourceId, setMergeSourceId] = useState<string>("");
    const userIdToSchoolMapping = useAppSelector(selectors.admin.userSchoolLookup);
    const currentUser = useAppSelector((state: AppState) => state?.user?.loggedIn && state.user || null);
    let promotableRoles: Role[] = ["STUDENT", "TEACHER", "EVENT_LEADER", "CONTENT_EDITOR"];
    const verificationStatuses: EmailVerificationStatus[] = ["NOT_VERIFIED", "DELIVERY_FAILED"];
    if (currentUser && currentUser.role == "ADMIN") {
        promotableRoles = ["STUDENT", "TEACHER", "EVENT_LEADER", "CONTENT_EDITOR", "EVENT_MANAGER", "ADMIN"];
    }

    useEffect(() => {
        if (searchResults && searchResults.length > 0) {
            dispatch(getUserIdSchoolLookup(searchResults.map((result) => result.id).filter((result) => result != undefined) as number[]));
        }
    }, [dispatch, searchResults]);

    const updateQuery = (update: {[key: string]: string | null}) => {
        // Replace empty strings with nulls
        const nulledUpdate: {[key: string]: string | null} = {};
        Object.entries(update).forEach(([key, value]) => nulledUpdate[key] = value || null);
        // Create a copy so that we trigger a re-render
        setSearchQuery(Object.assign({}, searchQuery, nulledUpdate))
    };
    const selectAllToggle = () => {
        if (isDefined(searchResults) && searchResults.length === selectedUserIds.length) {
            setSelectedUserIds([]);
        } else if (searchResults) {
            setSelectedUserIds(searchResults.filter((result => !!result)).map(result => result.id as number));
        }
    };
    const updateUserSelection = (userId: number, checked: boolean) => {
        if (checked) {
            setSelectedUserIds([...selectedUserIds, userId]);
        } else {
            setSelectedUserIds(selectedUserIds.filter((selectedId) => selectedId !== userId));
        }
    };
    const confirmUnverifiedUserPromotions = function(){
        if (isDefined(searchResults)) {
            const unverifiedSelectedUsers = selectedUserIds
                .map(selectedId => searchResults.filter(result => result.id === selectedId)[0])
                .filter(result => result.emailVerificationStatus !== "VERIFIED");
            if (unverifiedSelectedUsers.length > 0) {
                return window.confirm(
                    'Are you really sure you want to promote unverified user(s): ' +
                    '(' + unverifiedSelectedUsers.map(user => user.email) + ')?\n' +
                    'They may not be who they claim to be, may have an invalid email or have not yet verified their account.\n\n' +
                    'Pressing "Cancel" will abort promotion for all selected users.'
                )
            } else {
                return true;
            }
        }
    };
    const modifyUserRolesAndUpdateResults = async (role: Role) => {
        let confirmed = (role === "STUDENT") || confirmUnverifiedUserPromotions();
        if (confirmed) {
            setUserUpdating(true);
            await dispatch(adminModifyUserRoles(role, selectedUserIds));
            dispatch(adminUserSearch(searchQuery));
            setSelectedUserIds([]);
            setUserUpdating(false);
        }
    };

    const modifyUserEmailVerificationStatusesAndUpdateResults = async (status: EmailVerificationStatus) => {
        setUserUpdating(true);
        const selectedEmails = searchResults?.filter(user => user.id && selectedUserIds.includes(user.id)).map(user => user.email || '') || [];
        await dispatch(adminModifyUserEmailVerificationStatuses(status, selectedEmails));
        dispatch(adminUserSearch(searchQuery));
        setSelectedUserIds([]);
        setUserUpdating(false);
    };

    const search = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSearchRequested(true);
        dispatch(adminUserSearch(searchQuery));
    };

    const editUser = (userid: number | undefined) => {
        window.open(`/account?userId=${userid}`, '_blank');
    };

    const deleteUser = async (userid: number | undefined) => {
        await dispatch(adminUserDelete(userid));
        dispatch(adminUserSearch(searchQuery));
    };

    const attemptPasswordReset = (email: string | undefined) => {
        if (isDefined(email)) {
            dispatch(resetPassword({email: email}));
        }
    };

    return <RS.Container>
        <TitleAndBreadcrumb intermediateCrumbs={[ADMIN_CRUMB]} currentPageTitle="User manager"/>

        {/* Search */}
        <RS.Card className="mt-5">
            <RS.Form name="register" onSubmit={search}>
                <RS.CardBody>
                    <RS.Row>
                        <RS.Col md={6}>
                            <RS.FormGroup>
                                <RS.Label htmlFor="family-name-search">Find a user by family name:</RS.Label>
                                <RS.Input
                                    id="family-name-search" type="text" defaultValue={searchQuery.familyName || undefined} placeholder="e.g. Wilkes"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuery({familyName: e.target.value})}
                                />
                            </RS.FormGroup>
                            <RS.FormGroup>
                                <RS.Label htmlFor="email-search">Find a user by email:</RS.Label>
                                <RS.Input
                                    id="email-search" type="text" defaultValue={searchQuery.email || undefined} placeholder="e.g. teacher@school.org"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuery({email: e.target.value})}
                                />
                            </RS.FormGroup>
                            <RS.FormGroup>
                                <RS.Label htmlFor="school-other-search">Find by manually entered school:</RS.Label>
                                <RS.Input
                                    id="school-other-search" type="text" defaultValue={searchQuery.schoolOther || undefined}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuery({schoolOther: e.target.value})}
                                />
                            </RS.FormGroup>
                        </RS.Col>

                        <RS.Col md={6}>
                            <RS.FormGroup>
                                <RS.Label htmlFor="role-search">Find by user role:</RS.Label>
                                <RS.Input
                                    id="role-search" type="select" defaultValue={String(searchQuery.role)}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const role = e.target.value;
                                        updateQuery({role: role !== "null" ? role : null})
                                    }}
                                >
                                    <option value="null">Any role</option>
                                    <option value="STUDENT">Student</option>
                                    <option value="TEACHER">Teacher</option>
                                    <option value="CONTENT_EDITOR">Content editor</option>
                                    <option value="EVENT_LEADER">Event leader</option>
                                    <option value="EVENT_MANAGER">Event manager</option>
                                    <option value="ADMIN">Admin</option>
                                </RS.Input>
                            </RS.FormGroup>
                            <RS.FormGroup>
                                <RS.Label htmlFor="postcode-search">Find users with school within a given distance of postcode:</RS.Label>
                                <RS.Row>
                                    <RS.Col md={7}>
                                        <RS.Input
                                            id="postcode-search" type="text" defaultValue={searchQuery.postcode || undefined} placeholder="e.g. CB3 0FD"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuery({postcode: e.target.value})}
                                        />
                                    </RS.Col>
                                    <RS.Col md={5} className="mt-2 mt-md-0">
                                        <RS.Input
                                            id="postcode-radius-search" type="select" defaultValue={searchQuery.postcodeRadius}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuery({postcodeRadius: e.target.value})}
                                        >
                                            <option value="FIVE_MILES">5 miles</option>
                                            <option value="TEN_MILES">10 miles</option>
                                            <option value="FIFTEEN_MILES">15 miles</option>
                                            <option value="TWENTY_MILES">20 miles</option>
                                            <option value="TWENTY_FIVE_MILES">25 miles</option>
                                            <option value="FIFTY_MILES">50 miles</option>
                                        </RS.Input>
                                    </RS.Col>
                                </RS.Row>
                            </RS.FormGroup>
                            <RS.FormGroup>
                                <RS.Label htmlFor="school-urn-search">Find a user with school URN:</RS.Label>
                                <RS.Input
                                    id="school-urn-search" type="text" defaultValue={searchQuery.schoolURN || undefined}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuery({schoolURN: e.target.value})}
                                />
                            </RS.FormGroup>
                        </RS.Col>
                    </RS.Row>
                </RS.CardBody>
                <RS.CardFooter>
                    <RS.Row>
                        <RS.Col md={{size: 4, offset: 4}} >
                            <RS.Input type="submit" value="Search" className="btn btn-block btn-secondary border-0"/>
                        </RS.Col>
                    </RS.Row>
                </RS.CardFooter>
            </RS.Form>
        </RS.Card>

        {/* Result panel */}
        <RS.Card className="my-4">
            <RS.CardTitle tag="h4" className="pl-4 pt-3 mb-0">
                Manage users ({isDefined(searchResults) && searchResults.length || 0})<br />
                Selected ({selectedUserIds.length})
            </RS.CardTitle>

            <RS.CardBody id="admin-search-results">
                {/* Action Buttons */}
                <RS.Row className="pb-4">
                    <RS.Col>
                        <RS.UncontrolledButtonDropdown>
                            <RS.DropdownToggle caret disabled={userUpdating} color="primary" outline>Modify Role</RS.DropdownToggle>
                            <RS.DropdownMenu>
                                <RS.DropdownItem header>Promote or demote selected users to:</RS.DropdownItem>
                                {(promotableRoles).map(role =>
                                    <RS.DropdownItem
                                        key={role} disabled={selectedUserIds.length === 0}
                                        onClick={() => modifyUserRolesAndUpdateResults(role)}
                                    >
                                        {role}
                                    </RS.DropdownItem>
                                )}
                            </RS.DropdownMenu>
                        </RS.UncontrolledButtonDropdown>
                        {isDefined(currentUser) && currentUser.role === 'ADMIN' && <RS.UncontrolledButtonDropdown>
                            <RS.DropdownToggle caret disabled={userUpdating} color="primary" outline className="ml-3">Email Status</RS.DropdownToggle>
                            <RS.DropdownMenu>
                                <RS.DropdownItem header>Change email verification status for users to:</RS.DropdownItem>
                                {(verificationStatuses).map(status =>
                                    <RS.DropdownItem
                                        key={status} disabled={selectedUserIds.length === 0}
                                        onClick={() => modifyUserEmailVerificationStatusesAndUpdateResults(status)}
                                    >
                                        {status}
                                    </RS.DropdownItem>
                                )}
                            </RS.DropdownMenu>
                        </RS.UncontrolledButtonDropdown>}
                    </RS.Col>
                    <RS.Col>
                        <Link className="btn float-right btn-secondary border-0" to={{
                            pathname: "/admin/emails",
                            state: {
                                csvIDs: selectedUserIds
                            }
                        }}>Email</Link>
                    </RS.Col>
                </RS.Row>

                {/* Results */}
                {searchRequested &&
                    <ShowLoading until={searchResults}>
                        {isDefined(searchResults) && searchResults.length > 0 ?
                            <div className="overflow-auto">
                                <RS.Table bordered>
                                    <thead>
                                        <tr>
                                            <th>
                                                <RS.Button onClick={selectAllToggle} color="link">Select</RS.Button>
                                            </th>
                                            <th>Actions</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>User role</th>
                                            <th>School</th>
                                            <th>Verification status</th>
                                            <th>Member since</th>
                                            <th>Last seen</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {searchResults.map((user) =>
                                            <tr key={user.id}>
                                                <td className="text-center">
                                                    <RS.Input
                                                        type="checkbox" className="m-0 position-relative"
                                                        checked={user.id && selectedUserIds.includes(user.id) || undefined}
                                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                            user.id && updateUserSelection(user.id, event.target.checked)
                                                        }}
                                                    />
                                                </td>
                                                <td className="text-center">
                                                    <RS.Button color="secondary btn-sm m-1" tag={Link} to={`/progress/${user.id}`} target="_blank">
                                                        View
                                                    </RS.Button>
                                                    <RS.Button color="secondary btn-sm m-1" onClick={() => editUser(user.id)}>
                                                        Edit
                                                    </RS.Button>
                                                    <RS.Button color="secondary btn-sm m-1" onClick={() => deleteUser(user.id)}>
                                                        Delete
                                                    </RS.Button>
                                                    <RS.Button color="secondary btn-sm m-1" onClick={() => attemptPasswordReset(user.email)} disabled={user.emailVerificationStatus === "DELIVERY_FAILED"}>
                                                        Reset password
                                                    </RS.Button>
                                                </td>
                                                <td>{user.familyName}, {user.givenName}</td>
                                                <td>{user.email}</td>
                                                <td>{user.role}</td>
                                                <td>{isDefined(user.id) && isDefined(userIdToSchoolMapping) && isDefined(userIdToSchoolMapping[user.id]) && (userIdToSchoolMapping[user.id].name ?? "")}</td>
                                                <td>{user.emailVerificationStatus}</td>
                                                <td><DateString>{user.registrationDate}</DateString></td>
                                                <td><DateString>{user.lastSeen}</DateString></td>
                                            </tr>
                                        )}
                                    </tbody>
                                </RS.Table>
                            </div>
                            :
                            <div className="text-center"><em>No results found</em></div>
                        }
                    </ShowLoading>
                }
            </RS.CardBody>
        </RS.Card>
        {isAdmin(currentUser) && <>
        <hr/>
        <RS.Card className={"my-4"}>
            <RS.CardBody>
                <h3>Merge user accounts</h3>
                <FormGroup>
                    <RS.InputGroup>
                        <RS.Input
                            type="text"
                            placeholder="User ID to keep"
                            value={mergeTargetId}
                            onChange={(e => setMergeTargetId(e.target.value))}
                        />
                        <RS.Input
                            type="text"
                            placeholder="User ID to delete"
                            value={mergeSourceId}
                            onChange={(e => setMergeSourceId(e.target.value))}
                        />
                        <RS.InputGroupAddon addonType="append">
                            <RS.Button
                                type="button" className="p-0 border-dark"
                                disabled={mergeTargetId === "" || Number.isNaN(Number(mergeTargetId)) || mergeSourceId === "" || Number.isNaN(Number(mergeSourceId))}
                                onClick={() => dispatch(mergeUsers(Number(mergeTargetId), Number(mergeSourceId)))}
                            >
                                Merge
                            </RS.Button>
                        </RS.InputGroupAddon>
                    </RS.InputGroup>
                </FormGroup>
            </RS.CardBody>
        </RS.Card>
        </>}
    </RS.Container>;
};
