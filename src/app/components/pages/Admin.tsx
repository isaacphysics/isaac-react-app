import React, {useState} from 'react';
import {Link} from "react-router-dom";
import * as RS from "reactstrap";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {ShowLoading} from "../handlers/ShowLoading";
import {EDITOR_COMPARE_URL} from "../../services/constants";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import classnames from "classnames";
import {AnonymiseUsersCheckbox} from "../elements/AnonymiseUsersCheckbox";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import {isAdmin} from "../../services/user";
import {api} from "../../state/slices/api";

export const Admin = ({user}: {user: RegisteredUserDTO}) => {
    const segueVersion = api.endpoints.getSegueVersion.useQueryState().currentData ?? "unknown";
    const { currentData: liveContentVersion } = api.endpoints.getLiveContentVersion.useQuery();
    const [ setLiveContentVersion, { originalArgs: updatedLiveContentVersion, isLoading, isSuccess, isError } ] = api.endpoints.setLiveContentVersion.useMutation();

    const [newVersion, setNewVersion] = useState<string | null>(null);

    const displayVersion = newVersion || liveContentVersion || null;

    const startVersionUpdate = function(event?: React.FormEvent) {
        if (event) {
            event.preventDefault();
        }
        if (liveContentVersion && displayVersion !== liveContentVersion && newVersion != null) {
            setLiveContentVersion(newVersion);
        }
    };

    return <RS.Container id="admin-page">
        <TitleAndBreadcrumb currentPageTitle="Isaac administration" breadcrumbTitleOverride="Admin tools" />

        <div className="py-4">

            Hi, {user.givenName}!

            <RS.Card className="p-3 my-3">
                <RS.CardTitle tag="h2">Useful links</RS.CardTitle>
                <RS.ListGroup className="flex-row">
                    <RS.ListGroupItem className="w-auto"><Link to="/admin/usermanager">User Manager</Link></RS.ListGroupItem>
                    <RS.ListGroupItem className="w-auto"><Link to="/admin/emails">Admin emails</Link></RS.ListGroupItem>
                    <RS.ListGroupItem className="w-auto"><Link to="/equality">Equation builder</Link></RS.ListGroupItem>
                    <RS.ListGroupItem className="w-auto"><Link to="/free_text">Free-text builder</Link></RS.ListGroupItem>
                    <RS.ListGroupItem className="w-auto"><Link to="/markdown">Markdown builder</Link></RS.ListGroupItem>
                </RS.ListGroup>
            </RS.Card>

            <RS.Card className="p-3 mb-3">
                <RS.CardTitle tag="h2">Admin Console</RS.CardTitle>
                <RS.CardBody>
                    <ul>
                        <li><strong>API Version:</strong> {segueVersion}</li>
                    </ul>
                </RS.CardBody>
            </RS.Card>

            <RS.Card className="p-3 mb-3">
                <RS.CardTitle tag="h2">Administrative tools</RS.CardTitle>
                <RS.CardBody>
                    <h3>Manage site content</h3>
                    {liveContentVersion && <React.Fragment>
                        <div>
                            <strong>Live Content Version</strong>
                        </div>
                        <ShowLoading until={displayVersion !== null} thenRender={() => {
                            return displayVersion !== null && !isLoading &&
                                <RS.Form onSubmit={startVersionUpdate}>
                                    <RS.InputGroup>
                                        <RS.Input
                                            aria-label="Live content commit SHA"
                                            type="text" value={displayVersion}
                                            onChange={e => setNewVersion(e.target.value)}
                                            placeholder="Enter commit SHA"
                                        />
                                        <RS.InputGroupAddon addonType="append">
                                            <a
                                                className={classnames({
                                                    "p-1 border-dark btn btn-secondary": true,
                                                    "disabled": displayVersion === liveContentVersion
                                                })}
                                                href={`${EDITOR_COMPARE_URL}/${liveContentVersion}/${displayVersion}`}
                                                target="_blank" rel="noopener"
                                            >
                                                Preview Changes
                                            </a>
                                        </RS.InputGroupAddon>
                                        <RS.InputGroupAddon addonType="append">
                                            <RS.Button
                                                type="button" className="p-0 border-dark"
                                                onClick={startVersionUpdate}
                                                disabled={!isAdmin(user) || displayVersion === liveContentVersion}
                                            >
                                                Set Version
                                            </RS.Button>
                                        </RS.InputGroupAddon>
                                    </RS.InputGroup>
                                </RS.Form>
                        }} />
                        {isLoading &&
                            <RS.Alert color="info">
                                <h4>Updating...</h4>
                                <p>Replacing version {liveContentVersion} with {updatedLiveContentVersion}</p>
                                <IsaacSpinner />
                            </RS.Alert>
                        }
                        {isSuccess &&
                            <RS.Alert color="success">
                                <h4>Content version changed successfully.</h4>
                            </RS.Alert>
                        }
                        {isError &&
                            <RS.Alert color="danger">
                                <h4>Error: Content version could not be changed.</h4>
                            </RS.Alert>
                        }
                    </React.Fragment>}

                    <h3 className={"mt-2"}>Demonstration Mode</h3>
                    <AnonymiseUsersCheckbox/>
                </RS.CardBody>
            </RS.Card>

        </div>
    </RS.Container>;
};
