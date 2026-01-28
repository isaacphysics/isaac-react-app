import React, {useEffect, useState} from 'react';
import {openActiveModal, useAppDispatch, useGetGroupMembersQuery, useGroupAssignments} from '../../state';
import {AppGroup, AppQuizAssignment, AssignmentOrderSpec, EnhancedAssignment} from '../../../IsaacAppTypes';
import {
    above,
    AssignmentOrder,
    getAssignmentProgressCSVDownloadLink,
    getGroupAssignmentProgressCSVDownloadLink,
    getGroupQuizProgressCSVDownloadLink,
    getQuizAssignmentCSVDownloadLink,
    isDefined,
    isPhy,
    isQuiz,
    isTeacherOrAbove,
    PATHS,
    siteSpecific,
    SortOrder,
    useDeviceSize
} from '../../services';
import {RegisteredUserDTO} from '../../../IsaacApiTypes';
import {Link, useLocation} from 'react-router-dom';
import {Spacer} from '../elements/Spacer';
import {formatDate} from '../elements/DateString';
import {Badge, Button, Card, CardBody, Col, Container, Input, Label, Row} from 'reactstrap';
import {TitleAndBreadcrumb} from '../elements/TitleAndBreadcrumb';
import {downloadLinkModal} from '../elements/modals/AssignmentProgressModalCreators';
import {InlineTabs} from '../elements/InlineTabs';
import {StyledDropdown} from '../elements/inputs/DropdownInput';
import {Loading} from '../handlers/IsaacSpinner';
import {skipToken} from '@reduxjs/toolkit/query';
import classNames from 'classnames';
import { useHistoryState } from '../../state/actions/history';

const AssignmentLikeLink = ({assignment}: {assignment: EnhancedAssignment | AppQuizAssignment}) => {
    const dispatch = useAppDispatch();
    const quiz = isQuiz(assignment);

    function openAssignmentDownloadLink(event: React.MouseEvent<HTMLButtonElement & HTMLAnchorElement> | React.MouseEvent<HTMLAnchorElement>) {
        event.stopPropagation();
        event.preventDefault();
        dispatch(openActiveModal(downloadLinkModal(event.currentTarget.href)));
    }

    const csvDownloadLink = quiz
        ? getQuizAssignmentCSVDownloadLink(assignment.id as number)
        : getAssignmentProgressCSVDownloadLink(assignment.id as number);

    const isScheduled = assignment.scheduledStartDate && new Date(assignment.scheduledStartDate) > new Date();

    return <Link to={quiz ? `/test/assignment/${assignment.id}/feedback` : `${PATHS.ASSIGNMENT_PROGRESS}/${assignment.id}`} className="w-100 d-block no-underline mt-2">
        <div className="d-flex align-items-center assignment-progress-group w-100 p-3">
            <div className="d-flex flex-column">
                <span className="d-inline-flex flex-wrap">
                    <b data-testid="assignment-name">{(quiz ? assignment.quizSummary?.title : assignment.gameboard?.title) ?? "Unknown quiz"}</b>
                    {isScheduled && <em className="mx-1">(scheduled)</em>}
                    <a className="new-tab-link" href={quiz ? assignment.quizSummary?.url : `${PATHS.GAMEBOARD}#${assignment.gameboard?.id}`} target="_blank" onClick={(e) => e.stopPropagation()}>
                        <i className="icon icon-new-tab" />
                    </a>
                </span>
                <div className="d-flex flex-column flex-sm-row align-items-start gap-2 me-2">
                    {isScheduled && <Badge className="d-flex align-items-center text-black fw-bold" color={siteSpecific("neutral-light", "cultured-grey")}>
                        <i className="icon icon-event-upcoming me-2" color="primary"/>
                        {`Starts: ${formatDate(assignment.scheduledStartDate)}`}
                    </Badge>}
                    {assignment.dueDate && <Badge className="d-flex align-items-center text-black fw-bold" color={siteSpecific("neutral-light", "cultured-grey")}>
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
            {!isScheduled && <strong className="align-content-center mw-max-content">
                <a href={csvDownloadLink} className="assignment-csv-download-link" target="_blank" rel="noopener" onClick={(e) => openAssignmentDownloadLink(e)}>
                    Download CSV
                </a>
            </strong>}
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
    const deviceSize = useDeviceSize();
    const location = useLocation();

    const [searchText, setSearchText] = useState("");
    const [activeTab, setActiveTab] = useHistoryState<"assignments" | "tests">("markbookTab", "assignments");

    useEffect(() => {
        const hash = location.hash.replace("#", "");
        if (hash === "assignments" || hash === "tests") {
            setActiveTab(hash);
        }
    }, [location.hash, setActiveTab]);

    const assignmentLikeListing = activeTab === "assignments" ? groupBoardAssignments : groupQuizAssignments;

    const filteredAssignments = assignmentLikeListing?.filter(al => (isQuiz(al) ? al.quizSummary?.title : al.gameboard?.title)?.toLowerCase().includes(searchText.toLowerCase()));

    return <Container className="mb-5">
        <TitleAndBreadcrumb
            currentPageTitle={group?.groupName ?? "Group progress"}
            intermediateCrumbs={[{title: siteSpecific("Assignment progress", "Markbook"), to: PATHS.ASSIGNMENT_PROGRESS}]}
            icon={{type: "icon", icon: "icon-group"}}
        />

        {isPhy && <Link to={PATHS.ASSIGNMENT_PROGRESS} className={classNames("d-flex align-items-center mb-2 mt-4 d-md-none")}>
            <i className="icon icon-arrow-left me-2"/>
            Back to assignment progress
        </Link>}

        <div className={classNames("d-flex flex-wrap mb-4 gap-2", siteSpecific("mt-md-4", "mt-xl-4"))}>
            {isPhy && <Link to={PATHS.ASSIGNMENT_PROGRESS} className={classNames("d-none align-items-center d-md-flex")}>
                <i className="icon icon-arrow-left me-2"/>
                Back to assignment progress
            </Link>}
            {isDefined(group?.id) && <>
                {isPhy && above[siteSpecific("sm", "lg")](deviceSize) && <Spacer/>}
                <Button className="d-flex align-items-center" color="solid" onClick={() => dispatch(openActiveModal(downloadLinkModal(getGroupAssignmentProgressCSVDownloadLink(group.id as number))))}>
                    Download assignments CSV
                    <i className="icon icon-download ms-2" color="white"/>
                </Button>
                {isTeacherOrAbove(user) && <Button className="d-flex align-items-center" color="solid" onClick={() => dispatch(openActiveModal(downloadLinkModal(getGroupQuizProgressCSVDownloadLink(group.id as number))))}>
                    Download tests CSV
                    <i className="icon icon-download ms-2" color="white"/>
                </Button>}
            </>}
        </div>

        {/* group overview */}
        <Card className="my-4">
            <CardBody className="d-flex flex-column flex-lg-row assignment-progress-group-overview row-gap-2">
                <div className="d-flex align-items-center flex-grow-1 fw-bold">
                    <i className={"icon icon-group icon-sm me-2"} color="secondary"/>
                    {groupMembers?.length ? `${groupMembers?.length} student${groupMembers?.length !== 1 ? "s" : ""}` : "Unknown"}
                </div>
                <div className="d-flex align-items-center flex-grow-1 fw-bold">
                    <i className={"icon icon-file icon-sm me-2"} color="secondary"/>
                    {groupBoardAssignments?.length} assignment{groupBoardAssignments?.length !== 1 ? "s" : ""}
                </div>
                <div className="d-flex align-items-center flex-grow-1 fw-bold">
                    <i className={"icon icon-school icon-sm me-2"} color="secondary"/>
                    {groupQuizAssignments?.length} test{groupQuizAssignments?.length !== 1 ? "s" : ""}
                </div>
            </CardBody>
        </Card>

        {/* assignments and tests */}
        <Card>
            <CardBody>
                <Row className="mb-3">
                    <Col xs={12}>
                        <h3>Assignments and tests</h3>
                        <span>View this group&apos;s progress on assignment and tests.</span>
                    </Col>
                    <Col xs={12} sm={6} lg={4}>
                        <Label className="m-0 fw-bold mt-2 mt-lg-3">Search:</Label>
                        <Input
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder={`Search for ${activeTab === "assignments" ? "assignments" : "tests"}...`}
                        />
                    </Col>
                    <Col xs={12} sm={6} lg={{size: 4, offset: 4}} className="d-flex flex-column">
                        <Label for="sort-by-dropdown" className="m-0 fw-bold mt-2 mt-lg-3">Sort by:</Label>
                        <StyledDropdown
                            value={Object.values(AssignmentOrder).findIndex(item => item.type === assignmentOrder.type && item.order === assignmentOrder.order)}
                            onChange={(e) => setAssignmentOrder(Object.values(AssignmentOrder)[parseInt(e.target.value)])}
                            id="sort-by-dropdown"
                        >
                            {Object.values(AssignmentOrder).map((item, index) =>
                                <option key={item.type + item.order} value={index}>{item.type} ({item.order === SortOrder.ASC ? "ascending" : "descending"})</option>
                            )}
                        </StyledDropdown>
                    </Col>
                </Row>

                {/* Only teachers can view tests */}
                <InlineTabs
                    tabs={[
                        {label: "Assignments" + (groupBoardAssignments?.length ? ` (${groupBoardAssignments.length})` : ""), value: "assignments"},
                        ...(isTeacherOrAbove(user) ? [{label: "Tests" + (groupQuizAssignments?.length ? ` (${groupQuizAssignments.length})` : ""), value: "tests" as const}] : [])]}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                <div>
                    {isFetching
                        ? <Loading/>
                        : assignmentLikeListing?.length
                            ? filteredAssignments?.length
                                ? filteredAssignments.map(assignment => <AssignmentLikeLink key={assignment.id} assignment={assignment} />)
                                : <div className={classNames("d-flex flex-column m-2 p-2 hf-12 text-center gap-2 justify-content-center", siteSpecific("bg-neutral-light", "bg-cultured-grey"))}>
                                    <span>No {activeTab === "assignments" ? "assignments" : "tests"} match your search.</span>
                                </div>
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


