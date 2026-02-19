import React, {useCallback, useContext, useState} from "react";
import {openActiveModal, useAppDispatch} from "../../state";
import {Card, CardBody, Col, Label, Row} from "reactstrap";
import sortBy from "lodash/sortBy";
import {AppGroup, AssignmentProgressPageSettingsContext} from "../../../IsaacAppTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {Link} from "react-router-dom";
import {
    getGroupAssignmentProgressCSVDownloadLink,
    getGroupQuizProgressCSVDownloadLink,
    GroupSortOrder,
    isPhy,
    isTeacherOrAbove,
    PATHS,
    siteSpecific
} from "../../services";
import {downloadLinkModal} from "../elements/modals/AssignmentProgressModalCreators";
import {PageFragment} from "../elements/PageFragment";
import {RenderNothing} from "../elements/RenderNothing";
import {Spacer} from "../elements/Spacer";
import {ShowLoading} from "../handlers/ShowLoading";
import {SearchInputWithIcon} from "../elements/SearchInputs";
import {StyledDropdown} from "../elements/inputs/DropdownInput";
import classNames from "classnames";
import { PageMetadata } from "../elements/PageMetadata";
import { PageContainer } from "../elements/layout/PageContainer";
import { MyAdaSidebar } from "../elements/sidebar/MyAdaSidebar";

export const GroupAssignmentProgress = ({group, user}: {group: AppGroup, user: RegisteredUserDTO}) => {
    const dispatch = useAppDispatch();

    const openDownloadLink = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
        event.stopPropagation();
        event.preventDefault();
        dispatch(openActiveModal(downloadLinkModal(event.currentTarget.href)));
    }, [dispatch]);

    return <Link to={`${PATHS.ASSIGNMENT_PROGRESS}/group/${group.id}`} className="w-100 d-block no-underline mt-2">
        <div className="d-flex assignment-progress-group w-100 p-3 align-items-center">
            <div className="d-flex flex-grow-1 flex-column flex-lg-row align-items-start">
                <b data-testid="group-name">{group.groupName}</b>
                <Spacer/>
                <strong>
                    <a className={classNames("d-flex align-items-center pe-4", {"text-brand": isPhy})} href={getGroupAssignmentProgressCSVDownloadLink(group.id as number)} target="_blank" rel="noopener" onClick={openDownloadLink}>
                        Download assignments CSV
                        <i className="icon icon-download ms-2"/>
                    </a>
                </strong>
                {isTeacherOrAbove(user) && <strong>
                    <a className={classNames("d-flex align-items-center", {"text-brand": isPhy})} href={getGroupQuizProgressCSVDownloadLink(group.id as number)} target="_blank" rel="noopener" onClick={openDownloadLink}>
                        Download tests CSV
                        <i className="icon icon-download ms-2"/>
                    </a>
                </strong>}
            </div>
            <div className="flex-grow-1 flex-lg-grow-0"/>
            <i className="icon icon-chevron-right ms-lg-4" color="tertiary"/>
        </div>

    </Link>;
};

export const AssignmentProgressGroupsListing = ({user, groups}: {user: RegisteredUserDTO, groups?: AppGroup[]}) => {

    const [groupSearch, setGroupSearch] = useState("");
    const pageSettings = useContext(AssignmentProgressPageSettingsContext);
    const {groupSortOrder, setGroupSortOrder} = pageSettings ?? {};

    return <>
        <PageContainer
            pageTitle={
                <TitleAndBreadcrumb
                    currentPageTitle={siteSpecific("Assignment progress", "Markbook")}
                    icon={{type: "icon", icon: "icon-revision"}}
                />
            }
            sidebar={siteSpecific(
                null, 
                <MyAdaSidebar />
            )}
        >
            <PageMetadata noTitle helpModalId="help_modal_assignment_progress">
                <PageFragment fragmentId={siteSpecific("help_toptext_assignment_progress", "markbook_landing_toptext")} ifNotFound={RenderNothing} />
            </PageMetadata>
            <Card>
                <CardBody>
                    <Row className="row-gap-2">
                        <Col xs={12} md={7} lg={4} xl={3} className="d-flex flex-column">
                            <Label className="m-0">Search for a group:</Label>
                            <SearchInputWithIcon onChange={(e) => setGroupSearch(e.target.value)}/>
                        </Col>

                        <Col xs={6} md={5} lg={{size: 3, offset: 5}} xl={{size: 2, offset: 7}} className="d-flex flex-column">
                            <Label className="m-0">Sort by:</Label>
                            <StyledDropdown
                                value={groupSortOrder}
                                onChange={(e) => setGroupSortOrder?.(e.target.value as GroupSortOrder)}
                            >
                                {Object.values(GroupSortOrder).map(item =>
                                    <option key={item} value={item}>{item}</option>
                                )}
                            </StyledDropdown>
                        </Col>
                    </Row>

                    <ShowLoading
                        until={groups}
                        thenRender={(groups) => {
                            const sortedGroups = (groupSortOrder === GroupSortOrder.Alphabetical
                                ? sortBy(groups, g => g.groupName && g.groupName.toLowerCase())
                                : sortBy(groups, g => g.created).reverse()
                            ).filter(g => !groupSearch || g.groupName?.toLowerCase().includes(groupSearch.toLowerCase()));

                            const isGroupsEmptyState = groups.length === 0;

                            return <div className="assignment-progress-container my-3">
                                {/* <AssignmentProgressPageSettingsContext.Provider value={pageSettings}> */}
                                {sortedGroups.map(group => <GroupAssignmentProgress key={group.id} group={group} user={user} />)}
                                {/* </AssignmentProgressPageSettingsContext.Provider> */}
                                {sortedGroups.length === 0 && <div>
                                    <div className={classNames("d-flex flex-column my-2 py-2 hf-12 text-center gap-2 justify-content-center", siteSpecific("bg-neutral-light", "bg-cultured-grey"))}>
                                        <span>
                                            { isGroupsEmptyState ?
                                                "You have no teaching groups yet." : "No groups match your criteria."
                                            }
                                        </span>
                                        { isGroupsEmptyState &&
                                            <strong>
                                                <Link to={PATHS.MANAGE_GROUPS} className={classNames("btn btn-link", {"fw-bold": isPhy})}>
                                                    Create new group
                                                </Link>
                                            </strong>
                                        }
                                    </div>
                                </div>}
                            </div>;
                        }}
                    />
                </CardBody>
            </Card>
        </PageContainer>
    </>;
};
