import React, {useCallback, useContext, useState} from "react";
import {
    openActiveModal,
    useAppDispatch} from "../../state";
import {
    Card,
    CardBody,
    Col,
    Container,
    Label,
    Row} from "reactstrap";
import sortBy from "lodash/sortBy";
import {AppGroup, AssignmentProgressPageSettingsContext} from "../../../IsaacAppTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    RegisteredUserDTO
} from "../../../IsaacApiTypes";
import {Link} from "react-router-dom";
import {
    getGroupProgressCSVDownloadLink,
    getGroupQuizProgressCSVDownloadLink,
    GroupSortOrder,
    isPhy,
    isTeacherOrAbove,
    PATHS,
    siteSpecific} from "../../services";
import {downloadLinkModal} from "../elements/modals/AssignmentProgressModalCreators";
import {PageFragment} from "../elements/PageFragment";
import {RenderNothing} from "../elements/RenderNothing";
import { Spacer } from "../elements/Spacer";
import { ShowLoading } from "../handlers/ShowLoading";
import { SearchInputWithIcon } from "../elements/SearchInputs";
import { StyledDropdown } from "../elements/inputs/DropdownInput";
import classNames from "classnames";

// const QuizDetails = ({quizAssignment}: { quizAssignment: QuizAssignmentDTO }) => {
//     const dispatch = useAppDispatch();
//     const [isExpanded, setIsExpanded] = useState(false);

//     function openAssignmentDownloadLink(event: React.MouseEvent<HTMLAnchorElement & HTMLButtonElement>) {
//         event.stopPropagation();
//         event.preventDefault();
//         dispatch(openActiveModal(downloadLinkModal(event.currentTarget.href)));
//     }

//     function openSingleAssignment(event: React.MouseEvent<HTMLAnchorElement & HTMLButtonElement>) {
//         event.stopPropagation();
//         event.preventDefault();
//         window.open(event.currentTarget.href, '_blank');
//     }

//     const quizAssignmentHasNotStarted = quizAssignment.scheduledStartDate && quizAssignment.scheduledStartDate.valueOf() > Date.now();

//     return isDefined(quizAssignment.id) && quizAssignment.id > 0 ? <div className="assignment-progress-gameboard" key={quizAssignment.id}>
//         <div className={classNames("gameboard-header", {"text-muted": quizAssignmentHasNotStarted})} onClick={() => setIsExpanded(!isExpanded)}>
//             <Button color="link" className="gameboard-title align-items-center" onClick={() => setIsExpanded(!isExpanded)}>
//                 <span className={classNames({"text-muted": quizAssignmentHasNotStarted})}>
//                     {quizAssignment.quizSummary?.title || "This test has no title"}
//                     {quizAssignmentHasNotStarted && <span className="gameboard-due-date">
//                         (Scheduled:&nbsp;{formatDate(quizAssignment.scheduledStartDate)})
//                     </span>}
//                     {isDefined(quizAssignment.dueDate) && <span className="gameboard-due-date">
//                         (Due:&nbsp;{formatDate(quizAssignment.dueDate)})
//                     </span>}
//                 </span>
//             </Button>
//             <div className="gameboard-links align-items-center">
//                 <Button className="d-none d-md-inline me-0" color="link" tag="a" href={getQuizAssignmentCSVDownloadLink(quizAssignment.id)} onClick={openAssignmentDownloadLink}>
//                     Download CSV
//                 </Button>
//                 <span className="d-none d-md-inline mx-1">&middot;</span>
//                 <Button className="d-none d-md-inline" color="link" tag="a" href={`/test/assignment/${quizAssignment.id}/feedback`} onClick={openSingleAssignment}>View individual test</Button>
//                 <img src={"/assets/common/icons/chevron-up.svg"} alt="" className={classNames("accordion-arrow", {"active" : isExpanded})}/>
//             </div>
//         </div>
//         {isExpanded && <QuizProgressLoader key={quizAssignment.quizId} quizAssignmentId={quizAssignment.id} />}
//     </div> : null;
// };

// const GroupDetails = ({group, user}: {group: AppGroup, user: RegisteredUserDTO}) => {
//     const [activeTab, setActiveTab] = useState(MARKBOOK_TYPE_TAB.assignments);
//     const pageSettings = useContext(AssignmentProgressPageSettingsContext);

//     const {groupBoardAssignments, groupQuizAssignments} = useGroupAssignments(user, group.id, pageSettings.assignmentOrder);
//     const assignments = groupBoardAssignments ?? [];
//     const quizAssignments = groupQuizAssignments ?? [];

//     const assignmentTabComponents = assignments.length > 0
//         ? assignments.map(assignment => <AssignmentDetails key={assignment.gameboardId} assignment={assignment}/>)
//         : <div className="p-4 text-center">There are no assignments for this group.</div>;
//     const quizTabComponents = quizAssignments.length > 0
//         ? quizAssignments.map(quizAssignment => <QuizDetails key={quizAssignment.id} quizAssignment={quizAssignment} />)
//         : <div className="p-4 text-center">There are no tests assigned to this group.</div>;

//     return <div className={"assignment-progress-details" + (pageSettings.colourBlind ? " colour-blind" : "")}>
//         <AssignmentProgressLegend showQuestionKey={activeTab === MARKBOOK_TYPE_TAB.tests} id={`legend-${group.id}`} />
//         {/* Only full teachers can see the tests tab */}
//         {pageSettings.isTeacher
//             ? <Tabs className="my-4 mb-5" tabContentClass="mt-4" activeTabOverride={activeTab} onActiveTabChange={setActiveTab}>
//                 {{
//                     [`Assignments (${assignments.length || 0})`]: assignmentTabComponents,
//                     [`Tests (${quizAssignments.length || 0})`]: quizTabComponents
//                 }}
//             </Tabs>
//             : assignmentTabComponents
//         }
//     </div>;
// };

export const GroupAssignmentProgress = ({group, user}: {group: AppGroup, user: RegisteredUserDTO}) => {
    const dispatch = useAppDispatch();
    
    // const location = useLocation();
    // const hashAnchor = location.hash !== "" && location.hash[0] === '#' ? location.hash.slice(1) : null;
    // const isInitiallyExpanded = hashAnchor === group.id?.toString();
    // const [isExpanded, setExpanded] = useState(isInitiallyExpanded);

    // useEffect(() => {
    //     if (isInitiallyExpanded) {
    //         document.getElementById(`progress-${group.id}`)?.scrollIntoView({behavior: "smooth"});
    //     }
    // }, []);

    const openDownloadLink = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
        event.stopPropagation();
        event.preventDefault();
        dispatch(openActiveModal(downloadLinkModal(event.currentTarget.href)));
    }, [dispatch]);
    
    // const deviceSize = useDeviceSize();

    // return <>
    //     <div id={`progress-${group.id}`} onClick={() => setExpanded(!isExpanded)} className={isExpanded ? "assignment-progress-group active align-items-center" : "assignment-progress-group align-items-center"}>
    //         <div className={classNames("group-name ps-2 ps-md-3 justify-content-between", {"flex-grow-1" : below['xs'](deviceSize)})}>
    //             <div className="d-flex align-items-center">
    //                 {siteSpecific(
    //                     <i className="icon icon-group icon-color-white layered me-2"/>,
    //                     <span className="icon-group"/>
//                 )}
    //                 <span data-testid={"group-name"}>{group.groupName}</span>
    //             </div>
    //             <div className="flex-grow-1 flex-grow-sm-0"/>
    //             <div className="d-block d-sm-none justify-self-end ms-2 assignment-count-pill">{assignmentCount}</div>
    //         </div>

    //         <div className="flex-sm-grow-1"/>

    //         <div className="d-none d-sm-block py-2"><strong>{assignmentCount}</strong> assignment{assignmentCount != 1 && "s"} or test{assignmentCount != 1 && "s"}<span className="d-none d-md-inline"> set</span></div>

    //         <div className="d-none d-lg-inline-block">
    //             <a className={"download-csv-link"} href={getGroupProgressCSVDownloadLink(group.id as number)} target="_blank" rel="noopener" onClick={openDownloadLink}>
    //                 (Download group assignments CSV)
    //             </a>
    //             {pageSettings.isTeacher && <a className={"download-csv-link ms-2"} href={getGroupQuizProgressCSVDownloadLink(group.id as number)} target="_blank" rel="noopener" onClick={openDownloadLink}>
    //                 (Download group tests CSV)
    //             </a>}
    //             <Button color="link" className={classNames("d-inline-flex", {"px-2": isPhy})} tabIndex={0} onClick={() => setExpanded(!isExpanded)}>
    //                 <img src={"/assets/common/icons/chevron-up.svg"} alt="" className={classNames("accordion-arrow", {"active": isExpanded})} />
    //                 <span className="visually-hidden">{isExpanded ? "Hide" : "Show"}{` ${group.groupName} assignments`}</span>
    //             </Button>
    //         </div>
    //         <UncontrolledButtonDropdown className="d-flex d-lg-none align-self-center align-self-sm-start p-0">
    //             <DropdownToggle caret className="text-nowrap py-2 me-2" size="sm" color="link" onClick={e => e.stopPropagation()}>
    //                 Downloads
    //             </DropdownToggle>
    //             <DropdownMenu>
    //                 <a className={"download-csv-link mx-3 w-max-content"} href={getGroupProgressCSVDownloadLink(group.id as number)} target="_blank" rel="noopener" onClick={openDownloadLink}>
    //                     Group assignments CSV
    //                 </a>
    //                 <DropdownItem divider />
    //                 {pageSettings.isTeacher && <a className={"download-csv-link mx-3 w-max-content"} href={getGroupQuizProgressCSVDownloadLink(group.id as number)} target="_blank" rel="noopener" onClick={openDownloadLink}>
    //                     Group tests CSV
    //                 </a>}
    //             </DropdownMenu>
    //         </UncontrolledButtonDropdown>
    //     </div>
    //     {isExpanded && <GroupDetails group={group} user={user} />}
    // </>;

    return <Link to={`${PATHS.ASSIGNMENT_PROGRESS}/group/${group.id}`} className="w-100 no-underline my-2">
        <div className="d-flex assignment-progress-group w-100 p-3 align-items-center">
            <div className="d-flex flex-grow-1 flex-column flex-lg-row">
                <b data-testid="group-name">{group.groupName}</b>
                <Spacer/>
                <strong>
                    <a className={classNames("d-flex align-items-center pe-3", {"text-brand": isPhy})} href={getGroupProgressCSVDownloadLink(group.id as number)} target="_blank" rel="noopener" onClick={openDownloadLink}>
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
            <i className="icon icon-chevron-right ms-lg-3" color="tertiary"/>
        </div>

    </Link>;
};

export const AssignmentProgressGroupsListing = ({user, groups}: {user: RegisteredUserDTO, groups?: AppGroup[]}) => {

    const [groupSearch, setGroupSearch] = useState("");
    const pageSettings = useContext(AssignmentProgressPageSettingsContext);
    const {groupSortOrder, setGroupSortOrder} = pageSettings ?? {};

    const pageHelp = <span>
        Click on your groups to see the assignments you have set. View your students&apos; progress by question.
    </span>;

    return <>
        <Container>
            <TitleAndBreadcrumb
                currentPageTitle={siteSpecific("Assignment Progress", "Markbook")}
                help={pageHelp}
                modalId="help_modal_assignment_progress"
                icon={{type: "hex", icon: "icon-revision"}}
            />
            <PageFragment fragmentId={siteSpecific("help_toptext_assignment_progress", "markbook_help")} ifNotFound={RenderNothing} />
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
                            return <div className="assignment-progress-container mb-5">
                                {/* <AssignmentProgressPageSettingsContext.Provider value={pageSettings}> */}
                                {sortedGroups.map(group => <GroupAssignmentProgress key={group.id} group={group} user={user} />)}
                                {/* </AssignmentProgressPageSettingsContext.Provider> */}
                                {sortedGroups.length === 0 && <Container className="py-5">
                                    <h3 className="text-center">
                                        You&apos;ll need to create a group using <Link to="/groups">Manage groups</Link> to set an assignment.
                                    </h3>
                                </Container>}
                            </div>;
                        }}
                    />
                </CardBody>
            </Card>
        </Container>
    </>;
};
