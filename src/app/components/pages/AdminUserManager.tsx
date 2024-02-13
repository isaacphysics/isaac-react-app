import React, { useEffect, useState } from "react";
import {
  FormGroup,
  Container,
  Card,
  Form,
  CardBody,
  Label,
  Input,
  CardFooter,
  Col,
  Row,
  CardTitle,
  Table,
  Button,
  UncontrolledButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  InputGroup,
  InputGroupAddon,
} from "reactstrap";
import { ShowLoading } from "../handlers/ShowLoading";
import {
  adminModifyTeacherPending,
  adminModifyUserEmailVerificationStatuses,
  adminModifyUserRoles,
  adminUserDelete,
  adminUserSearchRequest,
  AppState,
  getUserIdSchoolLookup,
  mergeUsers,
  resetPassword,
  selectors,
  showSuccessToast,
  useAppDispatch,
  useAppSelector,
} from "../../state";
import { EmailVerificationStatus, UserRole } from "../../../IsaacApiTypes";
import { DateString } from "../elements/DateString";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { ADMIN_CRUMB, isAdmin, isDefined } from "../../services";
import { Link } from "react-router-dom";

const verificationStatuses: EmailVerificationStatus[] = ["NOT_VERIFIED", "DELIVERY_FAILED"];

interface SearchQuery {
  familyName: string | null;
  email: string | null;
  role: UserRole | null;
  schoolURN: number | null;
  schoolOther: string | null;
  postcode: string | null;
  postcodeRadius: string;
}

const UserManagerSearch = ({
  searchQuery,
  setSearchQuery,
  setSearchRequested,
}: {
  searchQuery: SearchQuery;
  setSearchQuery: React.Dispatch<React.SetStateAction<SearchQuery>>;
  setSearchRequested: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const dispatch = useAppDispatch();
  const updateQuery = (update: { [key: string]: string | null }) => {
    // Replace empty strings with nulls
    const nulledUpdate: { [key: string]: string | null } = {};
    Object.entries(update).forEach(([key, value]) => (nulledUpdate[key] = value || null));
    // Create a copy so that we trigger a re-render
    setSearchQuery({ ...searchQuery, ...nulledUpdate });
  };

  const search = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchRequested(true);
    dispatch(adminUserSearchRequest(searchQuery));
  };

  return (
    <Card className="mt-5">
      <Form name="register" onSubmit={search}>
        <CardBody>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label htmlFor="family-name-search">Find a user by family name:</Label>
                <Input
                  id="family-name-search"
                  type="text"
                  defaultValue={searchQuery.familyName ?? undefined}
                  placeholder="e.g. Wilkes"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuery({ familyName: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="email-search">Find a user by email:</Label>
                <Input
                  id="email-search"
                  type="text"
                  defaultValue={searchQuery.email ?? undefined}
                  placeholder="e.g. teacher@school.org"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuery({ email: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="school-other-search">Find by manually entered school:</Label>
                <Input
                  id="school-other-search"
                  type="text"
                  defaultValue={searchQuery.schoolOther ?? undefined}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuery({ schoolOther: e.target.value })}
                />
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup>
                <Label htmlFor="role-search">Find by user role:</Label>
                <Input
                  id="role-search"
                  type="select"
                  defaultValue={String(searchQuery.role)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const role = e.target.value;
                    updateQuery({ role: role !== "null" ? role : null });
                  }}
                >
                  <option value="null">Any role</option>
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="CONTENT_EDITOR">Content editor</option>
                  <option value="EVENT_LEADER">Event leader</option>
                  <option value="EVENT_MANAGER">Event manager</option>
                  <option value="ADMIN">Admin</option>
                </Input>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="postcode-search">Find users with school within a given distance of postcode:</Label>
                <Row>
                  <Col md={7}>
                    <Input
                      id="postcode-search"
                      type="text"
                      defaultValue={searchQuery.postcode ?? undefined}
                      placeholder="e.g. CB3 0FD"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuery({ postcode: e.target.value })}
                    />
                  </Col>
                  <Col md={5} className="mt-2 mt-md-0">
                    <Input
                      id="postcode-radius-search"
                      type="select"
                      defaultValue={searchQuery.postcodeRadius}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateQuery({ postcodeRadius: e.target.value })
                      }
                    >
                      <option value="FIVE_MILES">5 miles</option>
                      <option value="TEN_MILES">10 miles</option>
                      <option value="FIFTEEN_MILES">15 miles</option>
                      <option value="TWENTY_MILES">20 miles</option>
                      <option value="TWENTY_FIVE_MILES">25 miles</option>
                      <option value="FIFTY_MILES">50 miles</option>
                    </Input>
                  </Col>
                </Row>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="school-urn-search">Find a user with school URN:</Label>
                <Input
                  id="school-urn-search"
                  type="text"
                  defaultValue={searchQuery.schoolURN ?? undefined}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuery({ schoolURN: e.target.value })}
                />
              </FormGroup>
            </Col>
          </Row>
        </CardBody>
        <CardFooter>
          <Row>
            <Col md={{ size: 4, offset: 4 }}>
              <Input type="submit" value="Search" className="btn btn-block btn-secondary border-0" />
            </Col>
          </Row>
        </CardFooter>
      </Form>
    </Card>
  );
};

const UserManagerResults = ({ searchRequested, searchQuery }: { searchRequested: boolean; searchQuery: object }) => {
  const dispatch = useAppDispatch();
  const searchResults = useAppSelector(selectors.admin.userSearch) ?? [];
  const modifyTeacherPendingMessage = useAppSelector(selectors.admin.modifyTeacherPending);
  const userIdToSchoolMapping = useAppSelector(selectors.admin.userSchoolLookup);
  const currentUser = useAppSelector((state: AppState) => (state?.user?.loggedIn && state.user) || null);

  const [userUpdating, setUserUpdating] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  let promotableRoles: UserRole[] = ["STUDENT", "TEACHER", "EVENT_LEADER", "CONTENT_EDITOR"];

  useEffect(() => {
    if (modifyTeacherPendingMessage) dispatch(showSuccessToast("Teacher Pending Status", modifyTeacherPendingMessage));
  }, [dispatch, modifyTeacherPendingMessage]);

  if (currentUser && currentUser.role === "ADMIN") {
    promotableRoles = ["STUDENT", "TUTOR", "TEACHER", "EVENT_LEADER", "CONTENT_EDITOR", "EVENT_MANAGER"];
  }

  const selectAllToggle = () => {
    if (searchResults.length === selectedUserIds.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(searchResults.filter((result) => !!result).map((result) => result.id as number));
    }
  };
  const updateUserSelection = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUserIds([...selectedUserIds, userId]);
    } else {
      setSelectedUserIds(selectedUserIds.filter((selectedId) => selectedId !== userId));
    }
  };

  const modifyUserRolesAndUpdateResults = async (role: UserRole) => {
    const confirmed = role === "STUDENT" || confirmUnverifiedUserPromotions();
    if (confirmed) {
      setUserUpdating(true);
      await dispatch(adminModifyUserRoles(role, selectedUserIds));
      dispatch(adminUserSearchRequest(searchQuery));
      setSelectedUserIds([]);
      setUserUpdating(false);
    }
  };

  const modifyUserEmailVerificationStatusesAndUpdateResults = async (status: EmailVerificationStatus) => {
    setUserUpdating(true);
    const selectedEmails = searchResults
      .filter((user) => user.id && selectedUserIds.includes(user.id))
      .map((user) => user.email ?? "");
    await dispatch(adminModifyUserEmailVerificationStatuses(status, selectedEmails));
    dispatch(adminUserSearchRequest(searchQuery));
    setSelectedUserIds([]);
    setUserUpdating(false);
  };

  const declineTeacherUpgradeAndUpdateResults = async () => {
    setUserUpdating(true);
    await dispatch(adminModifyTeacherPending(false, selectedUserIds));
    dispatch(adminUserSearchRequest(searchQuery));
    setSelectedUserIds([]);
    setUserUpdating(false);
  };

  const confirmUnverifiedUserPromotions = function () {
    if (searchResults) {
      const unverifiedSelectedUsers = selectedUserIds
        .map((selectedId) => searchResults.find((user) => user.id === selectedId)!)
        .filter((user) => user.emailVerificationStatus !== "VERIFIED");
      if (unverifiedSelectedUsers.length > 0) {
        return window.confirm(
          "Are you really sure you want to promote unverified user(s): " +
            "(" +
            unverifiedSelectedUsers.map((user) => user.email) +
            ")?\n" +
            "They may not be who they claim to be, may have an invalid email or have not yet verified their account.\n\n" +
            'Pressing "Cancel" will abort promotion for all selected users.',
        );
      } else {
        return true;
      }
    }
  };

  const editUser = (userid: number | undefined) => {
    window.open(`/account?userId=${userid}`, "_blank");
  };

  const deleteUser = async (userid: number | undefined) => {
    await dispatch(adminUserDelete(userid));
    dispatch(adminUserSearchRequest(searchQuery));
  };

  const attemptPasswordReset = (email: string | undefined) => {
    if (isDefined(email)) {
      dispatch(resetPassword({ email: email }));
    }
  };

  return (
    <Card className="my-4 mx-n4 mx-sm-n5">
      <CardTitle tag="h4" className="pl-4 pt-3 mb-0">
        Manage users ({searchResults.length})<br />
        Selected ({selectedUserIds.length})
      </CardTitle>

      <CardBody id="admin-search-results">
        {/* Action Buttons */}
        <Row className="pb-4">
          <Col className="d-flex flex-wrap" style={{ gap: "13px" }}>
            <UncontrolledButtonDropdown>
              <DropdownToggle caret disabled={userUpdating} color="primary">
                Modify Role
              </DropdownToggle>
              <DropdownMenu data-testid="modify-role-options">
                <DropdownItem header>Promote or demote selected users to:</DropdownItem>
                {promotableRoles.map((role) => (
                  <DropdownItem
                    key={role}
                    disabled={selectedUserIds.length === 0}
                    onClick={() => modifyUserRolesAndUpdateResults(role)}
                  >
                    {role}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </UncontrolledButtonDropdown>
            <Button
              disabled={userUpdating || selectedUserIds.length === 0}
              color="primary"
              onClick={() => declineTeacherUpgradeAndUpdateResults()}
            >
              Decline Teacher Upgrade
            </Button>
            {isDefined(currentUser) && currentUser.role === "ADMIN" && (
              <UncontrolledButtonDropdown>
                <DropdownToggle caret disabled={userUpdating} color="primary">
                  Email Status
                </DropdownToggle>
                <DropdownMenu data-testid="email-status-options">
                  <DropdownItem header>Change email verification status for users to:</DropdownItem>
                  {verificationStatuses.map((status) => (
                    <DropdownItem
                      key={status}
                      disabled={selectedUserIds.length === 0}
                      onClick={() => modifyUserEmailVerificationStatusesAndUpdateResults(status)}
                    >
                      {status}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </UncontrolledButtonDropdown>
            )}
          </Col>
          <Col xs={2}>
            <Link
              className="btn float-right btn-secondary border-0"
              to={{
                pathname: "/admin/emails",
                state: {
                  csvIDs: selectedUserIds,
                },
              }}
            >
              Email
            </Link>
          </Col>
        </Row>

        {/* Results */}
        {searchRequested && (
          <ShowLoading until={searchResults}>
            {searchResults.length ? (
              <div className="overflow-auto">
                <Table bordered className="mb-0 bg-white table-hover table-sm">
                  <thead>
                    <tr>
                      <th>
                        <Button onClick={selectAllToggle} color="link">
                          Select
                        </Button>
                      </th>
                      <th>Actions</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>User role</th>
                      <th>School</th>
                      <th>Verification status</th>
                      <th>Teacher pending?</th>
                      <th>Member since</th>
                      <th>Last seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((user) => (
                      <tr key={user.id}>
                        <td className="text-center">
                          <Input
                            type="checkbox"
                            className="m-0 position-relative"
                            checked={(user.id && selectedUserIds.includes(user.id)) || false}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                              user.id && updateUserSelection(user.id, event.target.checked);
                            }}
                          />
                        </td>
                        <td className="text-center">
                          <Button color="secondary btn-sm m-1" tag={Link} to={`/progress/${user.id}`} target="_blank">
                            View
                          </Button>
                          <Button color="secondary btn-sm m-1" onClick={() => editUser(user.id)}>
                            Edit
                          </Button>
                          <Button color="secondary btn-sm m-1" onClick={() => deleteUser(user.id)}>
                            Delete
                          </Button>
                          <Button
                            color="secondary btn-sm m-1"
                            onClick={() => attemptPasswordReset(user.email)}
                            disabled={user.emailVerificationStatus === "DELIVERY_FAILED"}
                          >
                            Reset password
                          </Button>
                        </td>
                        <td>
                          {user.familyName}, {user.givenName}
                        </td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          {isDefined(user.id) &&
                            isDefined(userIdToSchoolMapping) &&
                            isDefined(userIdToSchoolMapping[user.id]) &&
                            (userIdToSchoolMapping[user.id].name ?? "")}
                        </td>
                        <td>{user.emailVerificationStatus}</td>
                        <td>{user.teacherPending === true ? "Y" : "N"}</td>
                        <td>
                          <DateString>{user.registrationDate}</DateString>
                        </td>
                        <td>
                          <DateString>{user.lastSeen}</DateString>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="text-center">
                <em>No results found</em>
              </div>
            )}
          </ShowLoading>
        )}
      </CardBody>
    </Card>
  );
};

const MergeAccounts = () => {
  const dispatch = useAppDispatch();
  const [mergeTargetId, setMergeTargetId] = useState<string>("");
  const [mergeSourceId, setMergeSourceId] = useState<string>("");
  return (
    <>
      <hr />
      <Card className={"my-4"}>
        <CardBody>
          <h3>Merge user accounts</h3>
          <FormGroup>
            <InputGroup>
              <Input
                type="text"
                placeholder="User ID to keep"
                value={mergeTargetId}
                onChange={(e) => setMergeTargetId(e.target.value)}
              />
              <Input
                type="text"
                placeholder="User ID to delete"
                value={mergeSourceId}
                onChange={(e) => setMergeSourceId(e.target.value)}
              />
              <InputGroupAddon addonType="append">
                <Button
                  type="button"
                  className="p-0 border-dark"
                  disabled={
                    mergeTargetId === "" ||
                    Number.isNaN(Number(mergeTargetId)) ||
                    mergeSourceId === "" ||
                    Number.isNaN(Number(mergeSourceId))
                  }
                  onClick={() => dispatch(mergeUsers(Number(mergeTargetId), Number(mergeSourceId)))}
                >
                  Merge
                </Button>
              </InputGroupAddon>
            </InputGroup>
          </FormGroup>
        </CardBody>
      </Card>
    </>
  );
};

export const AdminUserManager = () => {
  const dispatch = useAppDispatch();
  const searchResults = useAppSelector(selectors.admin.userSearch);

  const [searchRequested, setSearchRequested] = useState(false);
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    familyName: null,
    email: null,
    role: null,
    schoolURN: null,
    schoolOther: null,
    postcode: null,
    postcodeRadius: "FIVE_MILES",
  });

  const currentUser = useAppSelector((state: AppState) => (state?.user?.loggedIn && state.user) || null);

  useEffect(() => {
    if (searchResults?.length) {
      dispatch(
        getUserIdSchoolLookup(
          searchResults.map((result) => result.id).filter((result) => result != undefined) as number[],
        ),
      );
    }
  }, [dispatch, searchResults]);

  return (
    <Container>
      <TitleAndBreadcrumb intermediateCrumbs={[ADMIN_CRUMB]} currentPageTitle="User manager" />
      <UserManagerSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setSearchRequested={setSearchRequested}
      />
      <UserManagerResults searchRequested={searchRequested} searchQuery={searchQuery} />
      {isAdmin(currentUser) && <MergeAccounts />}
    </Container>
  );
};
