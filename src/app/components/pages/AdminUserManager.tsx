import React, {useState} from "react";
import * as RS from "reactstrap";
import {BreadcrumbTrail} from "../elements/BreadcrumbTrail";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {ShowLoading} from "../handlers/ShowLoading";
import {connect} from "react-redux";
import {adminUserSearch} from "../../state/actions";
import {AdminUserSearchState, AppState} from "../../state/reducers";

const stateToProps = (state: AppState) => {
    return {
        searchResults: state && state.adminUserSearch || null
    };
};
const dispatchToProps = {adminUserSearch};

interface AdminUserMangerProps {
    user: LoggedInUser;
    adminUserSearch: (query: {}) => void;
    searchResults: AdminUserSearchState;
}

/*
api.adminUserSearch.search({
    'familyName' : ($scope.userSearch.searchTerms.familyName == "") ? null : $scope.userSearch.searchTerms.familyName,
    'email' : ($scope.userSearch.searchTerms.email == "") ? null : $scope.userSearch.searchTerms.email,
    'role' : ($scope.userSearch.searchTerms.role == "" || $scope.userSearch.searchTerms.role == "NO_ROLE") ? null : $scope.userSearch.searchTerms.role,
    'schoolURN': ($scope.userSearch.searchTerms.schoolURN == "") ? null : $scope.userSearch.searchTerms.schoolURN,
    'schoolOther' : ($scope.userSearch.searchTerms.schoolOther == "") ? null : $scope.userSearch.searchTerms.schoolOther,
    'postcode' : ($scope.userSearch.searchTerms.postcode == "") ? null : $scope.userSearch.searchTerms.postcode,
    'postcodeRadius': ($scope.userSearch.searchTerms.postcoderadius == "") ? null : $scope.userSearch.searchTerms.postcoderadius,
    'subjectOfInterest': ($scope.userSearch.searchTerms.subjectOfInterest == "") ? null : $scope.userSearch.searchTerms.subjectOfInterest
})
 */

const AdminUserManagerComponent = ({adminUserSearch, searchResults}: AdminUserMangerProps) => {
    const [searchRequested, setSearchRequested] = useState(false);
    const [searchQuery, setSearchQuery] = useState({
        familyName: null,
        email: null,
        schoolURN: null,
    });
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

    const updateQuery = (update: {}) => {
        setSearchQuery(Object.assign({}, searchQuery, update))
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

    const search = (event: React.FormEvent<HTMLInputElement>) => {
        event.preventDefault();
        setSearchRequested(true);
        adminUserSearch(searchQuery);
    };

    return <RS.Container>
        <BreadcrumbTrail intermediateCrumbs={[{title: "Admin", to: "/admin"}]} currentPageTitle="User manager"/>
        <h1 className="h-title">User manager</h1>

        <RS.Card className="mt-5">
            <RS.Form name="register" onSubmit={search}>
                <RS.CardBody>
                    <RS.Row>
                        <RS.Col md={6}>
                            <RS.FormGroup>
                                <RS.Label htmlFor="family-name-search">Find a user by family name</RS.Label>
                                <RS.Input
                                    id="family-name-search" type="text" defaultValue={searchQuery.familyName}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuery({familyName: e.target.value})}
                                />
                            </RS.FormGroup>
                            <RS.FormGroup>
                                <RS.Label htmlFor="email-search">Find a user by email</RS.Label>
                                <RS.Input
                                    id="email-search" type="text" defaultValue={searchQuery.email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuery({email: e.target.value})}
                                />
                            </RS.FormGroup>
                        </RS.Col>

                        <RS.Col md={6}>
                            <RS.FormGroup>
                                <RS.Label htmlFor="school-urn-search">Find a user with school URN</RS.Label>
                                <RS.Input
                                    id="school-urn-search" type="text" defaultValue={searchQuery.schoolURN}
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

        <RS.Card className="my-5">
            <RS.CardTitle tag="h4" className="pl-3 pt-2">
                Manage Users ({searchResults && searchResults.length || 0})<br />
                Selected ({selectedUserIds.length})
            </RS.CardTitle>

            

            <RS.CardBody>
                {searchRequested &&
                    <ShowLoading until={searchResults}>
                        {searchResults && searchResults.length > 0 ?
                            <div className="overflow-auto">
                                <RS.Table>
                                    <thead>
                                        <tr>
                                            <th>
                                                <RS.Button onClick={selectAllToggle} color="link">
                                                    Select
                                                </RS.Button>
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
                                                        checked={user.id && selectedUserIds.includes(user.id)}
                                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                            user.id && updateUserSelection(user.id, event.target.checked)
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    View
                                                    Edit
                                                    Delete
                                                </td>
                                                <td>{user.familyName}, {user.familyName}</td>
                                                <td>{user.email}</td>
                                                <td>{user.role}</td>
                                                <td>{user.schoolId}</td>
                                                <td>{user.registrationDate}</td>
                                                <td>{user.emailVerificationStatus}</td>
                                                <td>{user.lastSeen && new Date(user.lastSeen).toUTCString()}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </RS.Table>
                            </div>
                            :
                            <em>No results found</em>
                        }
                    </ShowLoading>
                }
            </RS.CardBody>
        </RS.Card>


    </RS.Container>
};

export const AdminUserManager = connect(stateToProps, dispatchToProps)(AdminUserManagerComponent);
