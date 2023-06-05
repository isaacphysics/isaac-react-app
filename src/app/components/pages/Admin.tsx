import React, {useState} from 'react';
import {
    isaacApi,
} from "../../state";
import {Link} from "react-router-dom";
import * as RS from "reactstrap";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {EDITOR_COMPARE_URL, isAdmin, isDefined, isPhy, siteSpecific} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import classnames from "classnames";
import {AnonymisationCheckboxes} from "../elements/AnonymisationCheckboxes";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import {MisuseStats} from "../elements/MisuseStats";
import classNames from "classnames";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";

export const Admin = ({user}: {user: RegisteredUserDTO}) => {
    const {data: segueVersion} = isaacApi.endpoints.getSegueVersion.useQuery();

    const liveContentVersionQuery = isaacApi.endpoints.getContentVersion.useQuery();
    const {data: liveContentVersion} = liveContentVersionQuery;

    const [updateContentVersion, {
        isLoading: contentVersionUpdateIsLoading,
        isError: contentVersionUpdateIsError,
        isSuccess: contentVersionUpdateIsSuccess
    }] = isaacApi.endpoints.updateContentVersion.useMutation();

    const [newVersion, setNewVersion] = useState<string | null>(null);

    const startVersionUpdate = function(event?: React.FormEvent) {
        if (event) {
            event.preventDefault();
        }
        if (liveContentVersion && newVersion && newVersion !== liveContentVersion) {
            updateContentVersion(newVersion);
        }
    };

    return <RS.Container id="admin-page">
        <TitleAndBreadcrumb currentPageTitle={`${siteSpecific("Isaac", "Ada")} administration`} breadcrumbTitleOverride="Admin tools" />

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
                    <ShowLoadingQuery
                        defaultErrorTitle={"Error loading content version"}
                        query={liveContentVersionQuery}
                        thenRender={liveContentVersion => {
                            const displayVersion = newVersion || liveContentVersion || null;
                            return <>
                                <div>
                                    <strong>Live Content Version</strong>
                                </div>
                                {isDefined(displayVersion) && !contentVersionUpdateIsLoading &&
                                    <RS.Form onSubmit={startVersionUpdate}>
                                        <RS.InputGroup className={"separate-input-group"}>
                                            <RS.Input
                                                aria-label="Live content commit SHA"
                                                type="text" value={displayVersion}
                                                onChange={e => setNewVersion(e.target.value)}
                                                placeholder="Enter commit SHA"
                                            />
                                            <RS.InputGroupAddon addonType="append">
                                                <a
                                                    className={classnames("btn btn-secondary", {
                                                        "p-1 border-dark": isPhy,
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
                                                    type="button" className={classNames("py-0", {"px-0 border-dark": isPhy})}
                                                    onClick={startVersionUpdate}
                                                    disabled={!isAdmin(user) || displayVersion === liveContentVersion}
                                                >
                                                    Set Version
                                                </RS.Button>
                                            </RS.InputGroupAddon>
                                        </RS.InputGroup>
                                    </RS.Form>
                                }
                                {contentVersionUpdateIsLoading &&
                                    <RS.Alert color="info">
                                        <h4>Updating...</h4>
                                        <p>Replacing version {liveContentVersion} with {newVersion}</p>
                                        <IsaacSpinner />
                                    </RS.Alert>
                                }
                                {contentVersionUpdateIsSuccess &&
                                    <RS.Alert color="success">
                                        <h4>Content version changed successfully.</h4>
                                    </RS.Alert>
                                }
                                {contentVersionUpdateIsError &&
                                    <RS.Alert color="danger">
                                        <h4>Error: Content version could not be changed.</h4>
                                    </RS.Alert>
                                }
                            </>
                        }}
                    />
                    <h3 className={"mt-3"}>Demonstration Mode</h3>
                    <AnonymisationCheckboxes/>

                    {isAdmin(user) && <>
                        <h3 className={"mt-3"}>Misuse statistics</h3>
                        <MisuseStats/>
                    </>}
                </RS.CardBody>
            </RS.Card>

        </div>
    </RS.Container>;
};
