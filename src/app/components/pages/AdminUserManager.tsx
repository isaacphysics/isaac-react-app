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
import { Trans, useTranslation } from "react-i18next";

export const AdminUserManager = () => {
    const { t } = useTranslation();
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
                    'Are you really sure you want to promote unverified user(s): ' +
                    '(' + unverifiedSelectedUsers.map(user => user.email) + ')?\n' +
                    'They may not be who they claim to be, may have an invalid email or have not yet verified their account.\n\n' +
                    'Pressing "Cancel" will abort promotion for all selected users.'
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
            alert(t("common:admin.userManager.search.validation"));
        }
        else {
            adminSearchResultsRef.current?.scrollIntoView({behavior: "smooth"});
            searchUsers(searchQuery);
        }
    };

    const confirmDeleteUser = (userid?: number) => {
        if (!isDefined(userid)) return;
        const confirmDeletion = window.confirm(t("common:admin.userManager.delete.confirm"));
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
        const confirmMerge = window.confirm(t("common:admin.userManager.merge.confirm", { sourceId, targetId, deletedId: sourceId }));
        if (confirmMerge) {
            mergeUsers({sourceId, targetId});
        }
    };

    return <Container>
        <TitleAndBreadcrumb intermediateCrumbs={[ADMIN_CRUMB]} currentPageTitle={t("common:admin.userManager.title")} icon={{type: "icon", icon: "icon-account"}}/>

        {/* Search */}
        <Card className="mt-7">
            <Form name="register" onSubmit={search}>
                <CardBody>
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="family-name-search">{t("common:admin.userManager.search.familyNameLabel")}</Label>
                                <Input
                                    id="family-name-search" type="text" defaultValue={searchQuery.familyName || undefined} placeholder={t("common:admin.userManager.search.familyNamePlaceholder")}
                                    onChange={e => setParamIfNotDefault("familyName", e.target.value, "")}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="email-search">{t("common:admin.userManager.search.emailLabel")}</Label>
                                <Input
                                    id="email-search" type="text" defaultValue={searchQuery.email || undefined} placeholder={t("common:admin.userManager.search.emailPlaceholder")}
                                    onChange={e => setParamIfNotDefault("email", e.target.value, "")}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="verification-status-search">{t("common:admin.userManager.search.verificationStatusLabel")}</Label>
                                <Input
                                    id="verification-status-search" type="select" defaultValue={String(searchQuery.emailVerificationStatus)}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setParamIfNotDefault("emailVerificationStatus", e.target.value === "null" ? "" : e.target.value, "");
                                    }}
                                >
                                    <option value="null">{t("common:admin.userManager.search.verificationStatusAny")}</option>
                                    <option value="VERIFIED">{t("common:admin.userManager.search.verificationStatusVerified")}</option>
                                    <option value="NOT_VERIFIED">{t("common:admin.userManager.search.verificationStatusNotVerified")}</option>
                                    <option value="DELIVERY_FAILED">{t("common:admin.userManager.search.verificationStatusDeliveryFailed")}</option>
                                </Input>
                            </FormGroup>
                        </Col>

                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="role-search">{t("common:admin.userManager.search.roleLabel")}</Label>
                                <Input
                                    id="role-search" type="select" defaultValue={String(searchQuery.role)}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const role = e.target.value;
                                        setParamIfNotDefault("role", role === "null" ? "" : role, "");
                                    }}
                                >
                                    <option value="null">{t("common:admin.userManager.search.roleAny")}</option>
                                    <option value="STUDENT">{t("common:admin.userManager.search.roleStudent")}</option>
                                    <option value="TEACHER">{t("common:admin.userManager.search.roleTeacher")}</option>
                                    <option value="CONTENT_EDITOR">{t("common:admin.userManager.search.roleContentEditor")}</option>
                                    <option value="EVENT_LEADER">{t("common:admin.userManager.search.roleEventLeader")}</option>
                                    <option value="EVENT_MANAGER">{t("common:admin.userManager.search.roleEventManager")}</option>
                                    <option value="ADMIN">{t("common:admin.userManager.search.roleAdmin")}</option>
                                </Input>
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="school-urn-search">{t("common:admin.userManager.search.schoolUrnLabel")}</Label>
                                <Input
                                    id="school-urn-search" type="text" defaultValue={searchQuery.schoolId || undefined}
                                    onChange={e => setParamIfNotDefault("schoolId", e.target.value, "")}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="school-other-search">{t("common:admin.userManager.search.schoolOtherLabel")}</Label>
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
                            <Button type="submit" color="secondary" className="w-100">{t("common:admin.userManager.search.button")}</Button>
                        </Col>
                    </Row>
                </CardFooter>
            </Form>
        </Card>

        {/* Result panel */}
        <Card className="my-4">
            <CardTitle data-testid="user-search-numbers" className="ps-4 pt-3 mb-0 h4">
                <Trans i18nKey="common:admin.userManager.results.title" components={{ br: <br /> }} values={{ resultCount: isDefined(searchResults) && searchResults.length || 0, selectedCount: selectedUserIds.length }} />
            </CardTitle>

            <CardBody innerRef={adminSearchResultsRef}>
                {/* Action Buttons */}
                <Row className="pb-4">
                    <Col>
                        <UncontrolledButtonDropdown>
                            <DropdownToggle caret disabled={userBeingModified} color="keyline">{t("common:admin.userManager.actions.modifyRole")}</DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem header>{t("common:admin.userManager.actions.promoteDemoteHeader")}</DropdownItem>
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
                            <DropdownToggle caret disabled={userBeingModified} color="keyline" className="ms-3">{t("common:admin.userManager.actions.emailStatus")}</DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem header>{t("common:admin.userManager.actions.emailStatusHeader")}</DropdownItem>
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
                            {t("common:admin.userManager.actions.email")}
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
                                                    <Button onClick={selectAllToggle} color="link">{t("common:admin.userManager.results.table.select")}</Button>
                                                </th>
                                                <th>{t("common:admin.userManager.results.table.actions")}</th>
                                                <th>{t("common:admin.userManager.results.table.name")}</th>
                                                <th>{t("common:admin.userManager.results.table.email")}</th>
                                                <th>{t("common:admin.userManager.results.table.role")}</th>
                                                <th>{t("common:admin.userManager.results.table.school")}</th>
                                                <th>{t("common:admin.userManager.results.table.verificationStatus")}</th>
                                                <th>{t("common:admin.userManager.results.table.memberSince")}</th>
                                                <th>{t("common:admin.userManager.results.table.lastSeen")}</th>
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
                                                            {t("common:admin.userManager.results.table.view")}
                                                        </Button>
                                                        <Button color="secondary btn-sm m-1" tag={Link} to={`/account?userId=${user.id}`} target="_blank">
                                                            {t("common:admin.userManager.results.table.edit")}
                                                        </Button>
                                                        <Button color="secondary btn-sm m-1" onClick={() => confirmDeleteUser(user.id)}>
                                                            {t("common:admin.userManager.results.table.delete")}
                                                        </Button>
                                                        <Button color="secondary btn-sm m-1" onClick={() => attemptPasswordReset(user.email)} disabled={user.emailVerificationStatus === "DELIVERY_FAILED"}>
                                                            {t("common:admin.userManager.results.table.resetPassword")}
                                                        </Button>
                                                    </td>
                                                    <td>{user.familyName}, {user.givenName}</td>
                                                    <td>{user.email}</td>
                                                    <td>{user.role}</td>
                                                    <td>{isDefined(user.id) && isDefined(userIdToSchoolMapping) && isDefined(userIdToSchoolMapping[user.id]) && (userIdToSchoolMapping[user.id].schoolName ?? "")}</td>
                                                    <td>{user.emailVerificationStatus}</td>
                                                    <td><DateString>{user.registrationDate}</DateString></td>
                                                    <td><DateString>{user.lastSeen}</DateString></td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                                :
                                <div data-testid="user-search-results-table" className="text-center"><em>{t("common:admin.userManager.results.emptyState")}</em></div>;
                        }
                        }/>
                }
            </CardBody>
        </Card>
        {isAdmin(currentUser) && <>
            <hr/>
            <Card className={"my-4"}>
                <CardBody>
                    <div className="h3">{t("common:admin.userManager.merge.title")}</div>
                    <FormGroup className="form-group">
                        <InputGroup className={"separate-input-group d-flex align-items-center"}>
                            <Input
                                type="text"
                                placeholder={t("common:admin.userManager.merge.keepPlaceholder")}
                                value={mergeTargetId}
                                onChange={(e => setMergeTargetId(e.target.value))}
                            />
                            <Input
                                type="text"
                                placeholder={t("common:admin.userManager.merge.deletePlaceholder")}
                                value={mergeSourceId}
                                onChange={(e => setMergeSourceId(e.target.value))}
                            />
                            <Button
                                type="button"
                                disabled={mergeTargetId === "" || Number.isNaN(Number(mergeTargetId)) || mergeSourceId === "" || Number.isNaN(Number(mergeSourceId))}
                                onClick={confirmMergeUsers}
                            >
                                {t("common:admin.userManager.merge.button")}
                            </Button>
                        </InputGroup>
                    </FormGroup>
                </CardBody>
            </Card>
        </>}
    </Container>;
};
