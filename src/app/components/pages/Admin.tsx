import React, { useEffect, useState } from "react";
import {
  getContentVersion,
  requestConstantsSegueVersion,
  selectors,
  useAppDispatch,
  useAppSelector,
} from "../../state";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardTitle,
  Container,
  Form,
  Input,
  InputGroup,
  InputGroupAddon,
  ListGroup,
  ListGroupItem,
} from "reactstrap";
import { RegisteredUserDTO } from "../../../IsaacApiTypes";
import { ShowLoading } from "../handlers/ShowLoading";
import { EDITOR_COMPARE_URL, isAdmin } from "../../services";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import classnames from "classnames";
import { AnonymiseUsersCheckbox } from "../elements/AnonymiseUsersCheckbox";
import { MisuseStats } from "../elements/MisuseStats";

export const Admin = ({ user }: { user: RegisteredUserDTO }) => {
  const dispatch = useAppDispatch();
  const segueVersion = useAppSelector(selectors.segue.versionOrUnknown);
  const contentVersion = useAppSelector(selectors.segue.contentVersion);
  useEffect(() => {
    dispatch(getContentVersion());
    dispatch(requestConstantsSegueVersion());
  }, [dispatch]);

  const [newVersion, setNewVersion] = useState<string | null>(null);

  const displayVersion = newVersion || (contentVersion && contentVersion.liveVersion) || null;

  return (
    <Container id="admin-page">
      <TitleAndBreadcrumb currentPageTitle="Isaac administration" breadcrumbTitleOverride="Admin tools" />

      <div className="py-4">
        Hi, {user.givenName}!
        <Card className="p-3 my-3">
          <CardTitle tag="h2">Useful links</CardTitle>
          <ListGroup className="flex-row">
            <ListGroupItem className="w-auto">
              <Link to="/admin/usermanager">User Manager</Link>
            </ListGroupItem>
            <ListGroupItem className="w-auto">
              <Link to="/admin/emails">Admin emails</Link>
            </ListGroupItem>
            <ListGroupItem className="w-auto">
              <Link to="/admin/direct_emails">Custom emails</Link>
            </ListGroupItem>
            <ListGroupItem className="w-auto">
              <Link to="/equality">Equation builder</Link>
            </ListGroupItem>
            <ListGroupItem className="w-auto">
              <Link to="/free_text">Free-text builder</Link>
            </ListGroupItem>
            <ListGroupItem className="w-auto">
              <Link to="/markdown">Markdown builder</Link>
            </ListGroupItem>
          </ListGroup>
        </Card>
        <Card className="p-3 mb-3">
          <CardTitle tag="h2">Admin Console</CardTitle>
          <CardBody>
            <ul>
              <li>
                <strong>API Version:</strong> {segueVersion}
              </li>
            </ul>
          </CardBody>
        </Card>
        <Card className="p-3 mb-3">
          <CardTitle tag="h2">Administrative tools</CardTitle>
          <CardBody>
            <h3>Manage site content</h3>
            {contentVersion && (
              <React.Fragment>
                <div>
                  <strong>Live Content Version</strong>
                </div>
                <ShowLoading
                  until={displayVersion !== null}
                  thenRender={() => {
                    return (
                      displayVersion !== null && (
                        <Form>
                          <InputGroup>
                            <Input
                              aria-label="Live content commit SHA"
                              type="text"
                              value={displayVersion}
                              onChange={(e) => setNewVersion(e.target.value)}
                              placeholder="Enter commit SHA"
                            />
                            <InputGroupAddon addonType="append">
                              <a
                                className={classnames({
                                  "p-1 border-dark btn btn-secondary": true,
                                  disabled: displayVersion === contentVersion.liveVersion,
                                })}
                                href={`${EDITOR_COMPARE_URL}/${contentVersion?.liveVersion}/${displayVersion}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Preview Changes
                              </a>
                            </InputGroupAddon>
                          </InputGroup>
                        </Form>
                      )
                    );
                  }}
                />
              </React.Fragment>
            )}

            <h3 className={"mt-3"}>Demonstration Mode</h3>
            <AnonymiseUsersCheckbox />

            {isAdmin(user) && (
              <>
                <h3 className={"mt-3"}>Misuse statistics</h3>
                <MisuseStats />
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </Container>
  );
};
