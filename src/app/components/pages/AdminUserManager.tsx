import React, {useCallback, useRef, useState} from "react";
import {Button, Card, CardBody, CardFooter, CardTitle, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Form, FormGroup, Input, InputGroup, Label, Row, Table, UncontrolledButtonDropdown} from "reactstrap";
import {
    AppState,
    resetPassword,
    selectors,
    useAppDispatch,
    useAppSelector,
    useMergeUsersMutation,
    useAdminSearchUsersMutation,
    useAdminDeleteUserMutation,
    useAdminModifyUserEmailVerificationStatusMutation,
    useAdminModifyUserRolesMutation,
    useAdminGetUserIdsSchoolLookupQuery,
} from "../../state";
import {AdminSearchEndpointParams, EmailVerificationStatus, UserRole} from "../../../IsaacApiTypes";
import {DateString} from "../elements/DateString";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ADMIN_CRUMB, isAdmin, isAdminOrEventManager, isDefined} from "../../services";
import {Link} from "react-router-dom";
import {ShowLoading} from "../handlers/ShowLoading";
import {produce} from "immer";
import {skipToken} from "@reduxjs/toolkit/query";
import { useTranslation, Trans } from 'react-i18next'

export const AdminUserManager = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch();

    const [searchUsers, {isUninitialized: searchNotRequested, isLoading: searchLoading}] = useAdminSearchUsersMutation();
    const searchResults = useAppSelector(selectors.admin.userSearch);
    const [searchQuery, setSearchQuery] = useState<AdminSearchEndpointParams>({});
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const adminSearchResultsRef = useRef<HTMLDivElement>(null);

    const [mergeUsers] = useMergeUsersMutation();
    const [mergeTargetId, setMergeTargetId] = useState<string>("");
    const [mergeSourceId, setMergeSourceId] = useState<string>("");

    const [deleteUser, {isLoading: userBeingDeleted}] = useAdminDeleteUserMutation();
    const [modifyUserRoles, {isLoading: userRoleBeingModified}] = useAdminModifyUserRolesMutation();
    const [modifyUserEmailVerificationStatuses, {isLoading: userVerificationStatusBeingModified}] = useAdminModifyUserEmailVerificationStatusMutation();
    const userBeingModified = userBeingDeleted || userRoleBeingModified || userVerificationStatusBeingModified;

    const currentUser = useAppSelector((state: AppState) => state?.user?.loggedIn && state.user || null);
    let promotableRoles: UserRole[] = ["STUDENT", "TUTOR", "TEACHER", "EVENT_LEADER", "CONTENT_EDITOR"];
    const verificationStatuses: EmailVerificationStatus[] = ["NOT_VERIFIED", "DELIVERY_FAILED"];
    if (currentUser && currentUser.role == "ADMIN") {
        promotableRoles = ["STUDENT", "TUTOR", "TEACHER", "EVENT_LEADER", "CONTENT_EDITOR", "EVENT_MANAGER", "ADMIN"];
    }

    const schoolLookupParam = searchResults && searchResults.length > 0 ? searchResults.map((result) => result.id).filter(isDefined) : skipToken;
    const {data: userIdToSchoolMapping} = useAdminGetUserIdsSchoolLookupQuery(schoolLookupParam);

    const setParamIfNotDefault = useCallback((param: string, value: string, defaultValue: string) => {
        setSearchQuery(produce(queryParams => {
            if (value === defaultValue) {
                delete (queryParams as {[k: string]: any})[param];
            } else {
                (queryParams as {[k: string]: any})[param] = value;
            }
        }));
    }, [setSearchQuery]);

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
                    t('areYouReallySureYouWantToPromoteUnverifiedUsers', 'Are you really sure you want to promote unverified user(s): ') +
                    '(' + unverifiedSelectedUsers.map(user => user.email) + ')?\n' +
                    t('theyMayNotBeWhoTheyClaimToBeMayHaveAnInvalidEmailOrHaveNotYetVerifiedTheirAccount', 'They may not be who they claim to be, may have an invalid email or have not yet verified their account.\n\n') +
                    t('pressingCancelWillAbortPromotionForAllSelectedUsers', 'Pressing "Cancel" will abort promotion for all selected users.')
                );
            } else {
                return true;
            }
        }
    };
    const modifyUserRolesAndUpdateResults = async (role: UserRole) => {
        const confirmed = (role === "STUDENT") || confirmUnverifiedUserPromotions();
        if (confirmed) {
            await modifyUserRoles({role, userIds: selectedUserIds});
            setSelectedUserIds([]);
        }
    };

    const modifyUserEmailVerificationStatusesAndUpdateResults = async (status: EmailVerificationStatus) => {
        const selectedEmails = searchResults?.filter(user => user.id && selectedUserIds.includes(user.id)).map(user => user.email || '') || [];
        await modifyUserEmailVerificationStatuses({status, emails: selectedEmails});
        setSelectedUserIds([]);
    };

    const search = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        let hasFilterSet = false;
        for (const filter in searchQuery) {
            if (filter) {
                hasFilterSet = true;
            }
        }
        if (!hasFilterSet) {
            alert("At least one search filter must be set.");
        }
        else {
            adminSearchResultsRef.current?.scrollIntoView({behavior: "smooth"});
            searchUsers(searchQuery);
        }
    };

    const confirmDeleteUser = (userid?: number) => {
        if (!isDefined(userid)) return;
        const confirmDeletion = window.confirm("Are you sure you want to delete this user?");
        if (confirmDeletion) {
            deleteUser(userid);
        }
    };

    const attemptPasswordReset = (email: string | undefined) => {
        if (isDefined(email)) {
            dispatch(resetPassword({email: email}));
        }
    };

    const confirmMergeUsers = () => {
        const sourceId = Number(mergeSourceId);
        const targetId = Number(mergeTargetId);
        const confirmMerge = window.confirm(`Are you sure you want to merge user ${sourceId} into user ${targetId}? This will delete user ${sourceId}.`);
        if (confirmMerge) {
            mergeUsers({sourceId, targetId});
        }
    };

    return <Container>
        <TitleAndBreadcrumb intermediateCrumbs={[ADMIN_CRUMB]} currentPageTitle="User manager" icon={{type: "icon", icon: "icon-account"}}/>

        {/* Search */}
        <Card className="mt-7">
            <Form name="register" onSubmit={search}>
                <CardBody>
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="family-name-search">{t('findAUserByFamilyName', 'Find a user by family name:')}</Label>
                                <Input
                                    id="family-name-search" type="text" defaultValue={searchQuery.familyName || undefined} placeholder={t('egWilkes', 'e.g. Wilkes')}
                                    onChange={e => setParamIfNotDefault("familyName", e.target.value, "")}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="email-search">{t('findAUserByEmail', 'Find a user by email:')}</Label>
                                <Input
                                    id="email-search" type="text" defaultValue={searchQuery.email || undefined} placeholder={t('egTeacherschoolorg', 'e.g. teacher@school.org')}
                                    onChange={e => setParamIfNotDefault("email", e.target.value, "")}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="verification-status-search">{t('findByEmailVerificationStatus', 'Find by email verification status:')}</Label>
                                <Input
                                    id="verification-status-search" type="select" defaultValue={String(searchQuery.emailVerificationStatus)}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setParamIfNotDefault("emailVerificationStatus", e.target.value === "null" ? "" : e.target.value, "");
                                    }}
                                >
                                    <option value="null">{t('anyVerificationStatus', 'Any verification status')}</option>
                                    <option value="VERIFIED">{t('verified', 'Verified')}</option>
                                    <option value="NOT_VERIFIED">{t('notVerified', 'Not verified')}</option>
                                    <option value="DELIVERY_FAILED">{t('deliveryFailed', 'Delivery failed')}</option>
                                </Input>
                            </FormGroup>
                        </Col>

                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="role-search">{t('findByUserRole', 'Find by user role:')}</Label>
                                <Input
                                    id="role-search" type="select" defaultValue={String(searchQuery.role)}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const role = e.target.value;
                                        setParamIfNotDefault("role", role === "null" ? "" : role, "");
                                    }}
                                >
                                    <option value="null">{t('anyRole', 'Any role')}</option>
                                    <option value="STUDENT">{t('student', 'Student')}</option>
                                    <option value="TEACHER">{t('teacher', 'Teacher')}</option>
                                    <option value="CONTENT_EDITOR">{t('contentEditor', 'Content editor')}</option>
                                    <option value="EVENT_LEADER">{t('eventLeader', 'Event leader')}</option>
                                    <option value="EVENT_MANAGER">{t('eventManager', 'Event manager')}</option>
                                    <option value="ADMIN">{t('admin', 'Admin')}</option>
                                </Input>
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="school-urn-search">{t('findAUserWithSchoolUrn', 'Find a user with school URN:')}</Label>
                                <Input
                                    id="school-urn-search" type="text" defaultValue={searchQuery.schoolURN || undefined}
                                    onChange={e => setParamIfNotDefault("schoolURN", e.target.value, "")}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="school-other-search">{t('findByManuallyEnteredSchool', 'Find by manually entered school:')}</Label>
                                <Input
                                    id="school-other-search" type="text" defaultValue={searchQuery.schoolOther || undefined}
                                    onChange={e => setParamIfNotDefault("schoolOther", e.target.value, "")}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
                <CardFooter>
                    <Row>
                        <Col md={{size: 4, offset: 4}} >
                            <Button type="submit" color="secondary" className="w-100">{t('search', 'Search')}</Button>
                        </Col>
                    </Row>
                </CardFooter>
            </Form>
        </Card>

        {/* Result panel */}
        <Card className="my-4">
            <CardTitle data-testid="user-search-numbers" tag="h4" className="ps-4 pt-3 mb-0">
                {t('manageUsers', 'Manage users (')}{isDefined(searchResults) && searchResults.length || 0}<Trans i18nKey="brSelectedLengthSelecteduseridslength">)<br />
                Selected ({{ length: selectedUserIds.length }})</Trans></CardTitle>

            <CardBody innerRef={adminSearchResultsRef}>
                {/* Action Buttons */}
                <Row className="pb-4">
                    <Col>
                        <UncontrolledButtonDropdown>
                            <DropdownToggle caret disabled={userBeingModified} color="keyline">{t('modifyRole', 'Modify Role')}</DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem header>{t('promoteOrDemoteSelectedUsersTo', 'Promote or demote selected users to:')}</DropdownItem>
                                {(promotableRoles).map(role =>
                                    <DropdownItem
                                        key={role} disabled={selectedUserIds.length === 0}
                                        onClick={() => modifyUserRolesAndUpdateResults(role)}
                                    >
                                        {role}
                                    </DropdownItem>
                                )}
                            </DropdownMenu>
                        </UncontrolledButtonDropdown>
                        {isDefined(currentUser) && isAdminOrEventManager(currentUser) && <UncontrolledButtonDropdown>
                            <DropdownToggle caret disabled={userBeingModified} color="keyline" className="ms-3">{t('emailStatus', 'Email Status')}</DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem header>{t('changeEmailVerificationStatusForUsersTo', 'Change email verification status for users to:')}</DropdownItem>
                                {(verificationStatuses).map(status =>
                                    <DropdownItem
                                        key={status} disabled={selectedUserIds.length === 0}
                                        onClick={() => modifyUserEmailVerificationStatusesAndUpdateResults(status)}
                                    >
                                        {status}
                                    </DropdownItem>
                                )}
                            </DropdownMenu>
                        </UncontrolledButtonDropdown>}
                    </Col>
                    <Col>
                        <Link className="btn btn-secondary float-end" to="/admin/emails" state={{csvIDs: selectedUserIds}}>
                            {t('email2', 'Email')}
                        </Link>
                    </Col>
                </Row>

                {/* Results */}
                {!searchNotRequested &&
                    <ShowLoading
                        until={searchLoading ? undefined : searchResults}
                        thenRender={searchResults => {
                            return searchResults.length > 0 ?
                                <div className="overflow-auto">
                                    <Table bordered data-testid="user-search-results-table">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <Button onClick={selectAllToggle} color="link">{t('select', 'Select')}</Button>
                                                </th>
                                                <th>{t('actions', 'Actions')}</th>
                                                <th>Name</th>
                                                <th>{t('email2', 'Email')}</th>
                                                <th>{t('userRole', 'User role')}</th>
                                                <th>{t('school', 'School')}</th>
                                                <th>{t('verificationStatus', 'Verification status')}</th>
                                                <th>{t('memberSince', 'Member since')}</th>
                                                <th>{t('lastSeen', 'Last seen')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {searchResults.map((user) =>
                                                <tr key={user.id} data-testid="user-search-result-row">
                                                    <td className="text-center">
                                                        <Input
                                                            type="checkbox" className="m-0 position-relative"
                                                            checked={user.id && selectedUserIds.includes(user.id) || undefined}
                                                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                                user.id && updateUserSelection(user.id, event.target.checked);
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="text-center">
                                                        <Button color="secondary btn-sm m-1" tag={Link} to={`/progress/${user.id}`} target="_blank">
                                                            {t('view', 'View')}
                                                        </Button>
                                                        <Button color="secondary btn-sm m-1" tag={Link} to={`/account?userId=${user.id}`} target="_blank">
                                                            {t('edit', 'Edit')}
                                                        </Button>
                                                        <Button color="secondary btn-sm m-1" onClick={() => confirmDeleteUser(user.id)}>
                                                            {t('delete', 'Delete')}
                                                        </Button>
                                                        <Button color="secondary btn-sm m-1" onClick={() => attemptPasswordReset(user.email)} disabled={user.emailVerificationStatus === "DELIVERY_FAILED"}>
                                                            {t('resetPassword', 'Reset password')}
                                                        </Button>
                                                    </td>
                                                    <td>{t('familynameGivenname', '{{familyName}}, {{givenName}}', { familyName: user.familyName, givenName: user.givenName })}</td>
                                                    <td>{user.email}</td>
                                                    <td>{user.role}</td>
                                                    <td>{isDefined(user.id) && isDefined(userIdToSchoolMapping) && isDefined(userIdToSchoolMapping[user.id]) && (userIdToSchoolMapping[user.id].name ?? "")}</td>
                                                    <td>{user.emailVerificationStatus}</td>
                                                    <td><DateString>{user.registrationDate}</DateString></td>
                                                    <td><DateString>{user.lastSeen}</DateString></td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                                :
                                <div data-testid="user-search-results-table" className="text-center"><em>{t('noResultsFound', 'No results found')}</em></div>;
                        }
                        }/>
                }
            </CardBody>
        </Card>
        {isAdmin(currentUser) && <>
            <hr/>
            <Card className={"my-4"}>
                <CardBody>
                    <h3>{t('mergeUserAccounts', 'Merge user accounts')}</h3>
                    <FormGroup className="form-group">
                        <InputGroup className={"separate-input-group d-flex align-items-center"}>
                            <Input
                                type="text"
                                placeholder={t('userIdToKeep', 'User ID to keep')}
                                value={mergeTargetId}
                                onChange={(e => setMergeTargetId(e.target.value))}
                            />
                            <Input
                                type="text"
                                placeholder={t('userIdToDelete', 'User ID to delete')}
                                value={mergeSourceId}
                                onChange={(e => setMergeSourceId(e.target.value))}
                            />
                            <Button
                                type="button"
                                disabled={mergeTargetId === "" || Number.isNaN(Number(mergeTargetId)) || mergeSourceId === "" || Number.isNaN(Number(mergeSourceId))}
                                onClick={confirmMergeUsers}
                            >
                                {t('merge', 'Merge')}
                            </Button>
                        </InputGroup>
                    </FormGroup>
                </CardBody>
            </Card>
        </>}
    </Container>;
};
