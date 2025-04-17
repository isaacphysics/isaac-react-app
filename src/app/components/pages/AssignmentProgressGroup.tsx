import React, { useState } from 'react';
import { openActiveModal, useAppDispatch, useGetGroupMembersQuery, useGroupAssignments } from '../../state';
import { AppGroup, AppQuizAssignment, AssignmentOrderSpec, EnhancedAssignment } from '../../../IsaacAppTypes';
import { AssignmentOrder, getAssignmentCSVDownloadLink, getGroupProgressCSVDownloadLink, getGroupQuizProgressCSVDownloadLink, isDefined, isPhy, isQuiz, isTeacherOrAbove, PATHS, siteSpecific, SortOrder } from '../../services';
import { RegisteredUserDTO } from '../../../IsaacApiTypes';
import { Link } from 'react-router-dom';
import { Spacer } from '../elements/Spacer';
import { formatDate } from '../elements/DateString';
import { Badge, Button, Card, CardBody, Col, Container, Label, Row } from 'reactstrap';
import { TitleAndBreadcrumb } from '../elements/TitleAndBreadcrumb';
import { downloadLinkModal } from '../elements/modals/AssignmentProgressModalCreators';
import { InlineTabs } from '../elements/InlineTabs';
import { StyledDropdown } from '../elements/inputs/DropdownInput';
import { Loading } from '../handlers/IsaacSpinner';
import { skipToken } from '@reduxjs/toolkit/query';
import classNames from 'classnames';

// const AssignmentDetails = ({assignment}: {assignment: EnhancedAssignment}) => {
//     const dispatch = useAppDispatch();
//     const [isExpanded, setIsExpanded] = useState(false);

//     function openAssignmentDownloadLink(event: React.MouseEvent<HTMLButtonElement & HTMLAnchorElement>) {
//         event.stopPropagation();
//         event.preventDefault();
//         dispatch(openActiveModal(downloadLinkModal(event.currentTarget.href)));
//     }

//     function openSingleAssignment(event: React.MouseEvent<HTMLButtonElement & HTMLAnchorElement>) {
//         event.stopPropagation();
//         event.preventDefault();
//         window.open(event.currentTarget.href, '_blank');
//     }

//     const assignmentHasNotStarted = !hasAssignmentStarted(assignment);

//     return <div className="assignment-progress-gameboard" key={assignment.gameboardId}>
//         <div className={classNames("gameboard-header", {"text-muted": assignmentHasNotStarted})} onClick={() => setIsExpanded(!isExpanded)}>
//             <Button color="link" className="gameboard-title align-items-center" onClick={() => setIsExpanded(!isExpanded)} alt={`Expand assignment ${assignment.gameboard?.title}`}>
//                 <span className={classNames({"text-muted": assignmentHasNotStarted})}>
//                     {assignment.gameboard?.title}
//                     {assignmentHasNotStarted && <span className="gameboard-due-date">
//                         (Scheduled:&nbsp;{formatDate(getAssignmentStartDate(assignment))})
//                     </span>}
//                     {assignmentHasNotStarted && assignment.dueDate && " "}
//                     {assignment.dueDate && <span className="gameboard-due-date">
//                         (Due:&nbsp;{formatDate(assignment.dueDate)})
//                     </span>}
//                 </span>
//             </Button>
//             <div className="gameboard-links align-items-center">
//                 <Button className="d-none d-md-inline me-0" color="link" tag="a" href={getAssignmentCSVDownloadLink(assignment.id as number)} onClick={openAssignmentDownloadLink}>
//                     Download CSV
//                 </Button>
//                 <span className="d-none d-md-inline mx-1">&middot;</span>
//                 <Button className="d-none d-md-inline" color="link" tag="a" href={`${PATHS.ASSIGNMENT_PROGRESS}/${assignment.id}`} onClick={openSingleAssignment}>
//                     View individual assignment
//                 </Button>
//                 <img src={"/assets/common/icons/chevron-up.svg"} alt="" className={classNames("accordion-arrow", {"active" : isExpanded})}/>
//             </div>
//         </div>
//         {isExpanded && <ProgressLoader assignment={assignment} />}
//     </div>;
// };]

const AssignmentLikeLink = ({assignment}: {assignment: EnhancedAssignment | AppQuizAssignment}) => {
    const dispatch = useAppDispatch();
    const quiz = isQuiz(assignment);

    function openAssignmentDownloadLink(event: React.MouseEvent<HTMLButtonElement & HTMLAnchorElement> | React.MouseEvent<HTMLAnchorElement>) {
        event.stopPropagation();
        event.preventDefault();
        dispatch(openActiveModal(downloadLinkModal(event.currentTarget.href)));
    }

    return <Link to={quiz ? `/test/assignment/${assignment.id}/feedback` : `${PATHS.ASSIGNMENT_PROGRESS}/${assignment.id}`} className="w-100 no-underline my-2">
        <div className="d-flex align-items-center assignment-progress-group w-100 p-3">
            <div className="d-flex flex-column">
                <b data-testid="assignment-name">{(quiz ? assignment.quizSummary?.title : assignment.gameboard?.title) ?? "Unknown quiz"}</b>
                <div className="d-flex">
                    {assignment.dueDate && <Badge className="d-flex align-items-center me-2 text-black fw-bold" color={siteSpecific("neutral-light", "cultured-grey")}>
                        <i className="icon icon-event-upcoming me-2" color="primary"/>
                        {`Due: ${formatDate(assignment.dueDate)}`}
                    </Badge>}
                    {/* // TODO: restore this badge when group progress data is available at this level */}
                    {/* <Badge className="d-flex align-items-center me-2 text-black fw-bold" color="cultured-grey">
                        <i className="icon icon-group me-2" color="primary"/>
                        x of y attempted
                    </Badge> */}
                </div>
            </div>
            <Spacer/>
            <strong className="align-content-center">
                <a href={getAssignmentCSVDownloadLink(assignment.id as number)} target="_blank" rel="noopener" onClick={(e) => openAssignmentDownloadLink(e)}>
                    Download CSV
                </a>
            </strong>
            <i className="icon icon-chevron-right ms-3" color="tertiary"/>
        </div>
    </Link>;
};    

export const AssignmentProgressGroup = ({user, group}: {user: RegisteredUserDTO, group?: AppGroup}) => {

    // TODO: if possible, we would rather use the groupId from the URL than require a wrapper on this component, as it would save loading all groups
    // const {assignmentCount, groupBoardAssignments, groupQuizAssignments} = useGroupAssignmentSummary(user, parseInt(groupId));
    const [assignmentOrder, setAssignmentOrder] = useState<AssignmentOrderSpec>(AssignmentOrder.startDateDescending);
    const {groupBoardAssignments, groupQuizAssignments, isFetching} = useGroupAssignments(user, group?.id, assignmentOrder);
    const {data: groupMembers} = useGetGroupMembersQuery(isDefined(group?.id) ? group.id : skipToken);
    const dispatch = useAppDispatch();


    const [activeTab, setActiveTab] = useState<"assignments" | "tests">("assignments");

    const assignmentLikeListing = activeTab === "assignments" ? groupBoardAssignments : groupQuizAssignments;

    return <Container className="mb-5">
        <TitleAndBreadcrumb
            currentPageTitle={group?.groupName ?? "Group progress"}
            intermediateCrumbs={[{title: siteSpecific("Assignment progress", "Markbook"), to: PATHS.ASSIGNMENT_PROGRESS}]}
            icon={{type: "hex", icon: "icon-group"}}
        />

        {isDefined(group?.id) && <div className="d-flex flex-wrap my-4 gap-3">
            <Button className="d-flex align-items-center" color="solid" onClick={() => dispatch(openActiveModal(downloadLinkModal(getGroupProgressCSVDownloadLink(group.id as number))))}>
                Download assignments CSV
                <i className="icon icon-download ms-2" color="white"/>
            </Button>
            {isTeacherOrAbove(user) && <Button className="d-flex align-items-center" color="solid" onClick={() => dispatch(openActiveModal(downloadLinkModal(getGroupQuizProgressCSVDownloadLink(group.id as number))))}>
                Download quizzes CSV
                <i className="icon icon-download ms-2" color="white"/>
            </Button>}
        </div>}

        {/* group overview */}
        <Card className="my-4">
            <CardBody className="d-flex flex-column flex-lg-row assignment-progress-group-overview row-gap-2">
                <div className="d-flex align-items-center flex-grow-1 fw-bold">
                    <i className="icon icon-group icon-md me-2" color="secondary"/>
                    {groupMembers?.length ? `${groupMembers?.length} student${groupMembers?.length !== 1 ? "s" : ""}` : "Unknown"}
                </div>
                <div className="d-flex align-items-center flex-grow-1 fw-bold">
                    <i className="icon icon-file icon-md me-2" color="secondary"/>
                    {groupBoardAssignments?.length} assignment{groupBoardAssignments?.length !== 1 ? "s" : ""}
                </div>
                <div className="d-flex align-items-center flex-grow-1 fw-bold">
                    <i className="icon icon-school icon-md me-2" color="secondary"/>
                    {groupQuizAssignments?.length} test{groupQuizAssignments?.length !== 1 ? "s" : ""}
                </div>
            </CardBody>
        </Card>
        
        {/* assignments and tests */}
        <Card>
            <CardBody>
                <Row className="mb-4">
                    <Col xs={12} lg={8}>
                        <h3>Assignments and tests</h3>
                        <span>View this group&apos;s progress on assignment and tests.</span>
                    </Col>
                    <Col xs={12} sm={8} md={6} lg={4} className="d-flex flex-column">
                        <Label className="m-0 fw-bold mt-2 mt-lg-0">Sort by:</Label>
                        <StyledDropdown
                            value={Object.values(AssignmentOrder).findIndex(item => item.type === assignmentOrder.type && item.order === assignmentOrder.order)}
                            onChange={(e) => setAssignmentOrder(Object.values(AssignmentOrder)[parseInt(e.target.value)])}
                        >
                            {Object.values(AssignmentOrder).map((item, index) =>
                                <option key={item.type + item.order} value={index}>{item.type} ({item.order === SortOrder.ASC ? "ascending" : "descending"})</option>
                            )}
                        </StyledDropdown>
                    </Col>
                </Row>

                {/* Only teachers can view tests */}
                <InlineTabs
                    tabs={[{label: "Assignments", value: "assignments"}, ...(isTeacherOrAbove(user) ? [{label: "Tests", value: "tests" as const}] : [])]}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                <div>
                    {isFetching
                        ? <Loading/>
                        : assignmentLikeListing?.length
                            ? assignmentLikeListing.map(assignment => <AssignmentLikeLink key={assignment.id} assignment={assignment} />)
                            : <div className={classNames("d-flex flex-column m-2 p-2 hf-12 text-center gap-2 justify-content-center", siteSpecific("bg-neutral-light", "bg-cultured-grey"))}>
                                <span>You haven&apos;t {activeTab === "assignments" ? "set any assignments" : "assigned any tests"} yet.</span>
                                <strong><Link to={activeTab === "assignments" ? PATHS.SET_ASSIGNMENTS : "/set_tests"} className={classNames("btn btn-link", {"fw-bold": isPhy})}>
                                    {activeTab === "assignments" ? "Manage assignments" : "Manage tests"}
                                </Link></strong>
                            </div>
                    }
                </div>
                
            </CardBody>
        </Card>
    </Container>;
};


