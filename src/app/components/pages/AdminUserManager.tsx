import React, {useState} from "react";
import * as RS from "reactstrap";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {ShowLoading} from "../handlers/ShowLoading";
import {connect} from "react-redux";
import {adminModifyUserRoles, adminUserSearch} from "../../state/actions";
import {AdminUserSearchState, AppState} from "../../state/reducers";
import {Role} from "../../../IsaacApiTypes";
import {DateString} from "../elements/DateString";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";

const stateToProps = (state: AppState) => {
    return {
        searchResults: state && state.adminUserSearch || null
    };
};
const dispatchToProps = {adminUserSearch, adminModifyUserRoles};

interface AdminUserMangerProps {
    user: LoggedInUser;
    adminUserSearch: (query: {}) => void;
    searchResults: AdminUserSearchState;
    adminModifyUserRoles: (role: Role, userIds: number[]) => void;
}

const AdminUserManagerComponent = ({adminUserSearch, adminModifyUserRoles, searchResults}: AdminUserMangerProps) => {
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

    const updateQuery = (update: {[key: string]: string | null}) => {
        // Replace empty strings with nulls
        const nulledUpdate: {[key: string]: string | null} = {};
        Object.entries(update).forEach(([key, value]) => nulledUpdate[key] = value || null);
        // Create a copy so that we trigger a re-render
        setSearchQuery(Object.assign({}, searchQuery, nulledUpdate))
    };
    const selectAllToggle = () => {
        if (searchResults && searchResults.length === selectedUserIds.length) {
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
        if (searchResults) {
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
            await adminModifyUserRoles(role, selectedUserIds);
            adminUserSearch(searchQuery);
            setSelectedUserIds([]);
        }
    };

    const search = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSearchRequested(true);
        adminUserSearch(searchQuery);
    };

    return <RS.Container>
        <TitleAndBreadcrumb intermediateCrumbs={[{title: "Admin", to: "/admin"}]} currentPageTitle="User manager"/>

        {/* Search */}
        <RS.Card className="mt-5">
            <RS.Form name="register" onSubmit={search}>
                <RS.CardBody>
                    <RS.Row>
                        <RS.Col md={6}>
                            <RS.FormGroup>
                                <RS.Label htmlFor="family-name-search">Find a user by family name:</RS.Label>
                                <RS.Input
                                    id="family-name-search" type="text" defaultValue={searchQuery.familyName || undefined} placeholder="Wilkes"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuery({familyName: e.target.value})}
                                />
                            </RS.FormGroup>
                            <RS.FormGroup>
                                <RS.Label htmlFor="email-search">Find a user by email:</RS.Label>
                                <RS.Input
                                    id="email-search" type="text" defaultValue={searchQuery.email || undefined} placeholder="teacher@school.org"
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
                                    <option value="null">Any Role</option>
                                    <option value="STUDENT">Student</option>
                                    <option value="TEACHER">Teacher</option>
                                    <option value="CONTENT_EDITOR">Content Editor</option>
                                    <option value="EVENT_ADMIN">Event Admin</option>
                                    <option value="ADMIN">Admin</option>
                                </RS.Input>
                            </RS.FormGroup>
                            <RS.FormGroup>
                                <RS.Label htmlFor="postcode-search">Find users with school within a given distance of postcode:</RS.Label>
                                <RS.Row>
                                    <RS.Col md={7}>
                                        <RS.Input
                                            id="postcode-search" type="text" defaultValue={searchQuery.postcode || undefined} placeholder="CB3 0FD"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuery({postcode: e.target.value})}
                                        />
                                    </RS.Col>
                                    <RS.Col md={5} className="mt-2 mt-md-0">
                                        <RS.Input
                                            id="postcode-radius-search" type="select" defaultValue={searchQuery.postcodeRadius}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuery({postcodeRadius: e.target.value})}
                                        >
                                            <option value="FIVE_MILES">5 Miles</option>
                                            <option value="TEN_MILES">10 Miles</option>
                                            <option value="FIFTEEN_MILES">15 Miles</option>
                                            <option value="TWENTY_MILES">20 Miles</option>
                                            <option value="TWENTY_FIVE_MILES">25 Miles</option>
                                            <option value="FIFTY_MILES">50 Miles</option>
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
                Manage Users ({searchResults && searchResults.length || 0})<br />
                Selected ({selectedUserIds.length})
            </RS.CardTitle>

            <RS.CardBody id="admin-search-results">
                {/* Action Buttons */}
                <RS.Row className="pb-4">
                    <RS.Col>
                        <RS.UncontrolledButtonDropdown>
                            <RS.DropdownToggle caret color="primary" outline>Modify Role</RS.DropdownToggle>
                            <RS.DropdownMenu>
                                <RS.DropdownItem header>Promote or demote selected users to:</RS.DropdownItem>
                                {["STUDENT", "TEACHER"].map(role =>
                                    <RS.DropdownItem
                                        key={role} disabled={selectedUserIds.length === 0}
                                        onClick={() => modifyUserRolesAndUpdateResults(role as Role)}
                                    >
                                        {role}
                                    </RS.DropdownItem>
                                )}
                            </RS.DropdownMenu>
                        </RS.UncontrolledButtonDropdown>
                    </RS.Col>
                </RS.Row>

                {/* Results */}
                {searchRequested &&
                    <ShowLoading until={searchResults}>
                        {searchResults && searchResults.length > 0 ?
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
                                            <th>Member since</th>
                                            <th>Verification status</th>
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
                                                <td>
                                                    {/*View*/} {/*Edit*/} {/*Delete*/}
                                                </td>
                                                <td>{user.familyName}, {user.givenName}</td>
                                                <td>{user.email}</td>
                                                <td>{user.role}</td>
                                                <td>{user.schoolId}</td>
                                                <td><DateString>{user.registrationDate}</DateString></td>
                                                <td>{user.emailVerificationStatus}</td>
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
    </RS.Container>
};

export const AdminUserManager = connect(stateToProps, dispatchToProps)(AdminUserManagerComponent);
