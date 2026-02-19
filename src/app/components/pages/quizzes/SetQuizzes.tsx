import React, {useEffect, useMemo, useState} from "react";
import {
    useAppDispatch,
    useGetGroupsQuery,
    useGetQuizAssignmentsSetByMeQuery,
    useCancelQuizAssignmentMutation,
    useUpdateQuizAssignmentMutation,
    openActiveModal
} from "../../../state";
import {Link} from "react-router-dom";
import {ShowLoading} from "../../handlers/ShowLoading";
import {QuizAssignmentDTO, QuizSummaryDTO, RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {formatDate, formatISODateOnly} from "../../elements/DateString";
import {AppQuizAssignment} from "../../../../IsaacAppTypes";
import {
    above,
    below, confirmThen,
    ifKeyIsEnter,
    isAda,
    isDefined,
    isEventLeaderOrStaff,
    isPhy, KEY,
    MANAGE_QUIZ_TAB,
    nthHourOf, persistence, SITE_TITLE_SHORT,
    siteSpecific,
    Subject,
    tags,
    TODAY,
    useDeviceSize,
    useFilteredQuizzes
} from "../../../services";
import {Tabs} from "../../elements/Tabs";
import {IsaacSpinner} from "../../handlers/IsaacSpinner";
import {ShowLoadingQuery} from "../../handlers/ShowLoadingQuery";
import {PageFragment} from "../../elements/PageFragment";
import {RenderNothing} from "../../elements/RenderNothing";
import { useHistoryState } from "../../../state/actions/history";
import classNames from "classnames";
import { ExtendDueDateModal } from "../../elements/modals/ExtendDueDateModal";
import { UncontrolledTooltip, Button, Table, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Row, ListGroup, ListGroupItem, Col, Alert, Input, UncontrolledDropdown } from "reactstrap";
import { ListView } from "../../elements/list-groups/ListView";
import { HexIcon } from "../../elements/svg/HexIcon";
import { AffixButton } from "../../elements/AffixButton";
import { PageMetadata } from "../../elements/PageMetadata";
import { PageContainer } from "../../elements/layout/PageContainer";
import { MyAdaSidebar } from "../../elements/sidebar/MyAdaSidebar";
import { SetQuizzesModal } from "../../elements/modals/SetQuizzesModal";
import { SetQuizzesSidebar } from "../../elements/sidebar/SetQuizzesSidebar";
import { ManageQuizzesSidebar } from "../../elements/sidebar/ManageQuizzesSidebar";

interface SetQuizzesPageProps {
    user: RegisteredUserDTO;
}

interface AssignedGroup {
    assignment: QuizAssignmentDTO;
    group: string;
}

interface QuizAssignmentProps {
    user: RegisteredUserDTO;
    assignedGroups: AssignedGroup[];
    index: number;
}

interface InnerTableHeader {
    title: string;
    sort: (a: AssignedGroup, b: AssignedGroup) => number;
}

const filterByDate = (dateFilterType: string, assignmentDate: Date | number | undefined, comparisonDate: Date | number) => {
    if (!assignmentDate) return false;
    switch (dateFilterType) {
        case 'after':
            return assignmentDate >= nthHourOf(24, comparisonDate);
        case 'before':
            return assignmentDate <= nthHourOf(0, comparisonDate);
        case 'on':
            return assignmentDate >= nthHourOf(0, comparisonDate) && assignmentDate <= nthHourOf(24, comparisonDate);
    }
};

const _compareStrings = (a: string | undefined, b: string | undefined): number => {
    // sorts by string ascending (A-Z), then undefined
    if (!a && !b) return 0;
    if (!a) return -1;
    if (!b) return 1;
    return a.localeCompare(b);
};

const _compareDates = (a: Date | number | undefined, b: Date | number | undefined): number => {
    // sorts by date descending (most recent first), then undefined
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;
    return b.valueOf() - a.valueOf();
};

function QuizAssignment({assignedGroups, index}: QuizAssignmentProps) {

    const compareGroupNames = (a: AssignedGroup, b: AssignedGroup) => _compareStrings(a?.group, b?.group);
    const compareCreationDates = (a: AssignedGroup, b: AssignedGroup) => _compareDates(a?.assignment?.creationDate, b?.assignment?.creationDate);
    const compareStartDates = (a: AssignedGroup, b: AssignedGroup) => _compareDates(a?.assignment?.scheduledStartDate ?? a?.assignment?.creationDate, b?.assignment?.scheduledStartDate ?? b?.assignment?.creationDate);
    const compareDueDates = (a: AssignedGroup, b: AssignedGroup) => _compareDates(a?.assignment?.dueDate, b?.assignment?.dueDate);

    const dispatch = useAppDispatch();
    const deviceSize = useDeviceSize();
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentSort, setCurrentSort] = useState(() => compareCreationDates);
    const [reverseSort, setReverseSort] = useState(false);
    const [selectedCol, setSelectedCol] = useState<string | undefined>(undefined);
    const [markQuizAsCancelled, {isLoading: isCancelling}] = useCancelQuizAssignmentMutation();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedQuiz, setSelectedQuiz] = useState<QuizAssignmentDTO | undefined>(undefined);
    const [_updateQuiz, {isLoading: isUpdatingQuiz}] = useUpdateQuizAssignmentMutation();

    if (assignedGroups.length === 0) return <></>;

    const setSort = (sort: (a: AssignedGroup, b: AssignedGroup) => number) => {
        if (currentSort.name === sort.name) {
            setReverseSort(r => !r);
        } else {
            setCurrentSort(() => sort);
            setReverseSort(false);
        }
    };

    function conditionalReverse<T>(t: T[]) : T[] {
        return reverseSort ? t.reverse() : t;
    }

    const ReverseSortButtons = ({active} : {active: boolean}) => <div className="sort">
        <span className={classNames("up", {"active": active && !reverseSort})} >▲</span>
        <span className={classNames("down", {"active": active && reverseSort})}>▼</span>
    </div>;

    // assignedGroups[n].assignment is the same for all n *with the exception of the quizId*.
    const assignment = assignedGroups[0].assignment;
    const quizTitle = (assignment.quizSummary?.title || assignment.quizId);

    const cancel = () => confirmThen(
        "Are you sure you want to cancel?\r\nStudents will no longer be able to take the test or see any feedback, and all previous attempts will be lost.",
        () => markQuizAsCancelled(assignment.id as number)
    );

    const determineQuizSubject = (quizSummary?: QuizSummaryDTO) => {
        return quizSummary?.tags?.filter(tag => tags.allSubjectTags.map(t => t.id.valueOf()).includes(tag.toLowerCase())).reduce((acc, tag) => acc + `${tag.toLowerCase()}`, "");
    };

    const subject = determineQuizSubject(assignment.quizSummary) || "physics";

    const innerTableHeaders : InnerTableHeader[] = [
        {title: "Group name", sort: compareGroupNames},
        above["md"](deviceSize) ? {title: "Creation date", sort: compareCreationDates} : undefined,
        above["sm"](deviceSize) ? {title: "Start date", sort: compareStartDates} : undefined,
        {title: "Due date", sort: compareDueDates}
    ].filter(isDefined);

    return <>
        {selectedQuiz && selectedQuiz.dueDate && <ExtendDueDateModal
            isOpen={isModalOpen}
            toggle={() => setIsModalOpen(false)}
            currDueDate={selectedQuiz.dueDate}
            numericQuizAssignmentId={selectedQuiz.id as number}
        />}
        <tr className={classNames("bg-white set-quiz-table-dropdown p-0 w-100", {"active": isExpanded, "list-group-item": isPhy})} tabIndex={0}
            onClick={() => setIsExpanded(e => !e)} onKeyDown={ifKeyIsEnter(() => setIsExpanded(e => !e))}
        >
            {siteSpecific(
                <>
                    <Row className="w-100 ms-0 d-flex flex-row">
                        <Col className="d-flex align-items-center col-7 col-sm-8 col-md-6">
                            <HexIcon icon={{name: "icon-tests", size: "lg"}} subject={subject as Subject} className="d-none d-sm-block assignment-hex"/>

                            <span className="manage-quiz-title me-3">{quizTitle}</span>
                        </Col>
                        <Col className="d-flex align-items-center justify-content-end col-5 col-sm-4 col-md-6">
                            <AffixButton size="sm" affix={{ affix: "icon-arrow-right", position: "suffix", type: "icon" }} className="me-3"
                                onClick={(e) => {
                                    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                                    assignment.quizSummary && dispatch(openActiveModal(SetQuizzesModal({quiz: assignment.quizSummary})));
                                    e.stopPropagation();}}>
                                Set test
                            </AffixButton>
                            <div className="d-none d-md-block w-max-content text-center text-nowrap me-3">
                                Assigned to
                                <div className="board-bubble-info-sm">{assignedGroups.length}</div>
                                group{assignedGroups.length !== 1 && "s"}
                            </div>
                            <i className={classNames("icon icon-md icon-chevron-right icon-dropdown-90", {"active": isExpanded})} aria-hidden="true" />
                        </Col>
                    </Row>
                    <div className="section-divider my-0 py-0"/>
                </>,

                <>
                    <td id={"group-td-" + index} className="group-counter align-middle">
                        <span><strong>{assignedGroups.length}</strong>&nbsp;</span><br/>
                        <span>group{(!assignedGroups || assignedGroups.length != 1) && "s"}</span>
                        <UncontrolledTooltip placement={"top"} target={"#group-td-" + index}>{assignedGroups.length === 0 ?
                            "No groups have been assigned."
                            : (`Test assigned to: ` + assignedGroups.map(g => g.group).join(", "))}
                        </UncontrolledTooltip>
                    </td>
                    <td className={classNames("set-quiz-table-title align-middle ps-4")}>{quizTitle}</td>
                    <td className="align-middle pe-4 d-none d-sm-table-cell">
                        <Button className={`d-block h-4 ${below["md"](deviceSize) ? "btn-sm set-quiz-button-md" : "set-quiz-button-sm"}`}
                            onClick={(e) => {
                                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                                assignment.quizSummary && dispatch(openActiveModal(SetQuizzesModal({quiz: assignment.quizSummary})));
                                e.stopPropagation();
                            }}
                        >
                            Set test
                        </Button>
                    </td>
                    <td className="text-center align-middle">
                        <i className={classNames("icon icon-chevron-right icon-dropdown-90", {"active": isExpanded})} aria-hidden="true" />
                    </td>
                </>
            )}

        </tr>
        {isExpanded && <tr>
            <td colSpan={siteSpecific(5, 4)} className={classNames("bg-white border-0", {"px-2 pb-2 d-flex": isPhy})}>
                <Table striped className="w-100 set-quiz-table-inner mb-1">
                    <thead>
                        <tr>
                            {innerTableHeaders.map(header => <th key={header.title} onClick={() => {
                                setSort(header.sort);
                                setSelectedCol(header.title);
                            }} className="px-1 py-1">
                                <div className="d-flex flex-row justify-content-center">
                                    <span role="button" tabIndex={0} onKeyDown={ifKeyIsEnter(() => setSort(header.sort))} onClick={(e) => {
                                        e.stopPropagation();
                                        setSort(header.sort);
                                        setSelectedCol(header.title);
                                    }}>{header.title}</span>
                                    <ReverseSortButtons active={(selectedCol ?? "Creation date") === header.title && currentSort.name === header.sort.name} />
                                </div>
                            </th>)}
                            <th className={`px-1 py-1 text-center ${below["md"](deviceSize) ? "actions-header-sm" : ""}`} colSpan={2}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {conditionalReverse(assignedGroups.sort(currentSort)).map(assignedGroup => {
                            const assignmentNotYetStarted = assignedGroup.assignment?.scheduledStartDate && nthHourOf(0, assignedGroup.assignment?.scheduledStartDate) > TODAY();
                            return <tr key={assignedGroup.group}>
                                <td className="text-center text-break">{assignedGroup.group}</td>
                                {above["md"](deviceSize) && <td className="text-center">{formatDate(assignedGroup.assignment.creationDate)}</td>}
                                <td className="text-center">{formatDate(assignedGroup.assignment.scheduledStartDate ?? assignedGroup.assignment.creationDate)}</td>
                                {above["sm"](deviceSize) &&
                                    <td className="text-center">
                                        {assignedGroup.assignment.dueDate
                                            ? <span>{formatDate(assignedGroup.assignment.dueDate)}</span>
                                            : "-"
                                        }
                                    </td>
                                }
                                <td className={isPhy ? "text-end" : "text-center"}>
                                    <Button tag={Link} size="sm" to={`/test/assignment/${assignedGroup.assignment.id}/feedback`} disabled={isCancelling} color="tertiary" className={classNames(`px-2 text-center ${below["md"](deviceSize) ? "btn-collapsed" : "btn-full"}`, {"bg-transparent": isAda})}>
                                        View {assignmentNotYetStarted ? "details" : "results"}
                                    </Button>
                                </td>

                                <td className={isPhy ? "text-start" : "text-center"}>
                                    <UncontrolledButtonDropdown>
                                        <DropdownToggle caret className={`text-nowrap ${below["md"](deviceSize) ? "btn-collapsed" : "btn-full"}`} size="sm" color="link">
                                            More
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            <DropdownItem color="tertiary" size="sm" disabled={isUpdatingQuiz || !assignedGroup.assignment?.dueDate} onClick={() => {
                                                setSelectedQuiz(assignedGroup.assignment);
                                                setIsModalOpen(true);
                                            }}>
                                                Extend Due Date
                                            </DropdownItem>
                                            <DropdownItem color="tertiary" size="sm" onClick={cancel} disabled={isCancelling}>
                                                {isCancelling ? <><IsaacSpinner size="sm" /> Cancelling...</> : "Cancel test"}
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </UncontrolledButtonDropdown>
                                </td>
                            </tr>;
                        })}
                    </tbody>
                </Table>
            </td>
        </tr>}
    </>;
}

export const SetQuizzes = ({user}: SetQuizzesPageProps) => {
    const dispatch = useAppDispatch();
    const deviceSize = useDeviceSize();
    const hashAnchor = location.hash?.slice(1) ?? null;
    const [activeTab, setActiveTab] = useHistoryState("currentTab", MANAGE_QUIZ_TAB.set);

    const { data: groups } = useGetGroupsQuery(false);
    const groupIdToName = useMemo<{[id: number]: string | undefined}>(() => groups?.reduce((acc, group) => group?.id ? {...acc, [group.id]: group.groupName} : acc, {} as {[id: number]: string | undefined}) ?? {}, [groups]);
    const quizAssignmentsQuery = useGetQuizAssignmentsSetByMeQuery();

    // Set active tab using hash anchor
    useEffect(() => {
        // @ts-ignore
        const tab: MANAGE_QUIZ_TAB =
            (hashAnchor && MANAGE_QUIZ_TAB[hashAnchor as any]) ||
            MANAGE_QUIZ_TAB.set;
        setActiveTab(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hashAnchor]);

    const {titleFilter, setTitleFilter, filteredQuizzes} = useFilteredQuizzes(user);
    const undeprecatedQuizzes = filteredQuizzes?.filter(quiz => !quiz.deprecated);

    const [showFilters, setShowFilters] = useState(false);
    const [manageQuizzesTitleFilter, setManageQuizzesTitleFilter] = useState("");
    const [manageQuizzesGroupNameFilter, setManageQuizzesGroupNameFilter] = useState("");
    const [quizSetDateFilterType, setQuizSetDateFilterType] = useState('after');
    const [quizDueDateFilterType, setQuizDueDateFilterType] = useState('before');
    const [quizStartDate, setQuizStartDate] = useState<Date | undefined>(undefined);
    const [quizDueDate, setQuizDueDate] = useState<Date | undefined>(undefined);

    const pageTitle= siteSpecific("Set / manage tests", "Manage tests");
    const pageHelp = <span>
        Use this page to manage and set tests to your groups. You can assign any test the {SITE_TITLE_SHORT} team have built.
        <br />
        Students in the group will be emailed when you set a new test.
    </span>;

    // If the user is event admin or above, and the quiz is hidden from teachers, then show that
    // Otherwise, show if the quiz is visible to students
    const roleVisibilitySummary = (quiz: QuizSummaryDTO) => <>
        {isEventLeaderOrStaff(user) && quiz.hiddenFromRoles && quiz.hiddenFromRoles?.includes("TEACHER") && <div className="small text-muted d-block ms-2">hidden from teachers</div>}
        {((quiz.hiddenFromRoles && !quiz.hiddenFromRoles?.includes("STUDENT")) || quiz.visibleToStudents) && <div className="small text-muted d-block ms-2">visible to students</div>}
    </>;

    const rowFiltersView = above["md"](deviceSize);

    const titleFilterInput = <Row>
        <Input
            id="manage-quizzes-title-filter" type="search" className={rowFiltersView ? "mb-4" : "mb-2"}
            value={manageQuizzesTitleFilter} onChange={event => setManageQuizzesTitleFilter(event.target.value)}
            placeholder="Filter by title" aria-label="Filter by title"
        />
    </Row>;

    const groupFilterInput = <Row>
        <Input
            id="manage-quizzes-group-name-filter" type="search" className={rowFiltersView ? "mb-4" : "mb-2"}
            value={manageQuizzesGroupNameFilter} onChange={event => setManageQuizzesGroupNameFilter(event.target.value)}
            placeholder="Filter by group" aria-label="Filter by group"
        />
    </Row>;

    const dateFilterTypeSelector = (dateFilterType: string, setDateFilterType: React.Dispatch<React.SetStateAction<string>>) => <UncontrolledDropdown className={classNames("quiz-date-filter-type", rowFiltersView ? "mb-4" : "mb-2")}>
        <DropdownToggle className="p-0 m-1 bg-transparent" color="tertiary" caret>{dateFilterType}</DropdownToggle>
        <DropdownMenu>
            <DropdownItem onClick={() => setDateFilterType('after')}>
                after
            </DropdownItem>
            <DropdownItem onClick={() => setDateFilterType('before')}>
                before
            </DropdownItem>
            <DropdownItem onClick={() => setDateFilterType('on')}>
                on
            </DropdownItem>
        </DropdownMenu>
    </UncontrolledDropdown>;

    const setDateFilterInput = <div className="d-flex align-items-baseline">
        <span className={classNames("p-1 quiz-filter-date-span", rowFiltersView ? "mb-4" : "mb-2")}>Starting</span>
        {dateFilterTypeSelector(quizSetDateFilterType, setQuizSetDateFilterType)}
        <Input
            id="manage-quizzes-set-date-filter" type="date" className={classNames("quiz-filter-date-input p-1 vertical-center", rowFiltersView ? "mb-4" : "mb-2")}
            value={quizStartDate && !isNaN(quizStartDate.valueOf()) ? formatISODateOnly(quizStartDate) : undefined} onChange={event => setQuizStartDate(new Date(event.target.value))}
            placeholder="Filter by set date" aria-label="Filter by set date"
        />
    </div>;

    const dueDateFilterInput = <div className="d-flex align-items-baseline">
        <span className={classNames("p-1 quiz-filter-date-span", rowFiltersView ? "mb-4" : "mb-2")}>Due</span>
        {dateFilterTypeSelector(quizDueDateFilterType, setQuizDueDateFilterType)}
        <Input
            id="manage-quizzes-due-date-filter" type="date" className={classNames("quiz-filter-date-input p-1 vertical-center", rowFiltersView ? "mb-4" : "mb-2")}
            value={quizDueDate && !isNaN(quizDueDate.valueOf()) ? formatISODateOnly(quizDueDate) : undefined} onChange={event => setQuizDueDate(new Date(event.target.value))}
            placeholder="Filter by due date" aria-label="Filter by due date"
        />
    </div>;

    return <PageContainer
        pageTitle={
            <TitleAndBreadcrumb currentPageTitle={pageTitle} icon={{type: "icon", icon: "icon-tests"}} help={pageHelp} />
        }
        sidebar={siteSpecific(
            activeTab === MANAGE_QUIZ_TAB.set
                ? <SetQuizzesSidebar titleFilter={titleFilter} setTitleFilter={setTitleFilter} hideButton />
                : <ManageQuizzesSidebar manageQuizzesTitleFilter={manageQuizzesTitleFilter} setManageQuizzesTitleFilter={setManageQuizzesTitleFilter}
                    quizStartDate={quizStartDate} setQuizStartDate={setQuizStartDate} quizSetDateFilterType={quizSetDateFilterType}
                    setQuizSetDateFilterType={setQuizSetDateFilterType} quizDueDate={quizDueDate} setQuizDueDate={setQuizDueDate}
                    quizDueDateFilterType={quizDueDateFilterType} setQuizDueDateFilterType={setQuizDueDateFilterType}
                    manageQuizzesGroupNameFilter={manageQuizzesGroupNameFilter} setManageQuizzesGroupNameFilter={setManageQuizzesGroupNameFilter}
                    hideButton />,
            <MyAdaSidebar />        
        )}
    >
        <PageMetadata noTitle showSidebarButton sidebarButtonText="Search tests" helpModalId="help_modal_set_tests">
            <PageFragment fragmentId={siteSpecific("help_toptext_set_tests", "set_tests_help")} ifNotFound={RenderNothing} />
        </PageMetadata>
        <Tabs style="tabs" className="my-4 mb-7" tabContentClass="mt-4" activeTabOverride={activeTab} onActiveTabChange={setActiveTab}>
            {{
                [siteSpecific("Set tests", "Available tests")]:
                <ShowLoading until={undeprecatedQuizzes}>
                    {undeprecatedQuizzes && <>
                        <p>The following tests are available to set to your groups.</p>

                        {undeprecatedQuizzes.length === 0 && <p><em>There are no tests you can set which match your search term.</em></p>}

                        {siteSpecific(
                            <ListView type="quiz" items={undeprecatedQuizzes} isQuizSetter/>,
                            <ListGroup className="mb-2 quiz-list">
                                {undeprecatedQuizzes.map(quiz => <ListGroupItem className="p-0 bg-transparent" key={quiz.id}>
                                    <Row className="w-100">
                                        <Col xs={9} md={8} lg={9} className="d-flex align-items-center">
                                            <div className="p-3">
                                                <span className="mb-2 mb-sm-0 pe-2">{quiz.title}</span>
                                                {roleVisibilitySummary(quiz)}
                                            </div>
                                        </Col>
                                        <Col md={3} lg={2} className="py-3 justify-content-end justify-content-md-center justify-content-lg-end align-items-center d-none d-md-flex">
                                            <Button className={`d-none d-md-block h-4 p-0 ${above["md"](deviceSize) ? "set-quiz-button-md" : "btn-sm set-quiz-button-sm"}`} onClick={() => dispatch(openActiveModal(SetQuizzesModal({quiz: quiz})))}>
                                                Set test
                                            </Button>
                                        </Col>
                                        <Col md={1} className="d-flex justify-content-end align-items-center d-none d-md-flex p-0">
                                            <Link className={`my-3 d-flex justify-content-end me-1`} to={{pathname: `/test/preview/${quiz.id}`}}>
                                                <span>Preview</span>
                                            </Link>
                                        </Col>
                                        <Col xs={3} className="d-flex align-items-center justify-content-end">
                                            <UncontrolledButtonDropdown className="d-flex d-md-none ">
                                                <DropdownToggle caret className="text-nowrap" size="sm" color="link">
                                                    Actions
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    <DropdownItem onClick={() => dispatch(openActiveModal(SetQuizzesModal({quiz: quiz})))} style={{zIndex: '1'}}>
                                                        Set test
                                                    </DropdownItem>
                                                    <DropdownItem divider />
                                                    <Link className="w-100" style={{textDecoration: 'none'}} to={{pathname: `/test/preview/${quiz.id}`}}>
                                                        <DropdownItem>
                                                            Preview
                                                        </DropdownItem>
                                                    </Link>
                                                </DropdownMenu>
                                            </UncontrolledButtonDropdown>
                                        </Col>
                                    </Row>
                                </ListGroupItem>)}
                            </ListGroup>)}
                    </>}
                </ShowLoading>,

                [siteSpecific("Manage tests", "Previously set tests")]:
                <>
                    {isAda && <div className="d-flex justify-content-center mb-4">
                        <Button color="tertiary" size="sm" onClick={() => setShowFilters(s => !s)}>
                            {showFilters ? "Hide filters" : "Show filters"}
                        </Button>
                    </div>}

                    {/* Ada filters */}
                    {showFilters && (rowFiltersView
                        ? <Row>
                            <Col xs={6} className="d-flex flex-column align-items-center">
                                {titleFilterInput}
                                {setDateFilterInput}
                            </Col>
                            <Col xs={6} className="d-flex flex-column align-items-center">
                                {groupFilterInput}
                                {dueDateFilterInput}
                            </Col>
                        </Row>
                        : <Col className="d-flex flex-column align-items-center">
                            {titleFilterInput}
                            {groupFilterInput}
                            {setDateFilterInput}
                            {dueDateFilterInput}
                        </Col>)
                    }

                    <ShowLoadingQuery
                        query={quizAssignmentsQuery}
                        ifError={() => <Alert color="warning">Tests you have assigned have failed to load, please try refreshing the page.</Alert>}
                        thenRender={quizAssignments => {
                            let quizAssignmentsWithGroupNames: AppQuizAssignment[] = quizAssignments.map(assignment => {
                                const groupName = persistence.load(KEY.ANONYMISE_GROUPS) === "YES"
                                    ? `Demo Group ${assignment.groupId}`
                                    : groupIdToName[assignment.groupId as number] ?? "Unknown Group";
                                return {...assignment, groupName};
                            }).reverse();

                            if (showFilters || isPhy) {
                                const filters = [];
                                if (manageQuizzesTitleFilter !== "") {
                                    filters.push((assignment : AppQuizAssignment) => assignment.quizSummary?.title?.toLowerCase().includes(manageQuizzesTitleFilter));
                                }
                                if (manageQuizzesGroupNameFilter !== "") {
                                    filters.push((assignment : AppQuizAssignment) => assignment.groupName?.toLowerCase().includes(manageQuizzesGroupNameFilter.toLowerCase()));
                                }
                                if (quizStartDate && !isNaN(quizStartDate.valueOf())) {
                                    filters.push((assignment : AppQuizAssignment) => {
                                        return filterByDate(quizSetDateFilterType, assignment.scheduledStartDate ?? assignment.creationDate, quizStartDate);
                                    });
                                }
                                if (quizDueDate && !isNaN(quizDueDate.valueOf())) {
                                    filters.push((assignment : AppQuizAssignment) => {
                                        return filterByDate(quizDueDateFilterType, assignment.dueDate, quizDueDate);
                                    });
                                }
                                quizAssignmentsWithGroupNames = quizAssignmentsWithGroupNames.filter(filters.reduce((acc, filter) => (assignment) => acc(assignment) && filter(assignment), () => true));
                            }

                            // an array of objects, each representing one test and the groups it is assigned to
                            const quizAssignment: QuizAssignmentProps[] = quizAssignmentsWithGroupNames.reduce((acc, assignment) => {
                                const existing = acc.find(q => q.assignedGroups.map(a => a.assignment.quizId).includes(assignment.quizId));
                                if (existing) {
                                    existing.assignedGroups.push({group: assignment.groupName, assignment: assignment});
                                } else {
                                    acc.push({user: user, assignedGroups: [{group: assignment.groupName, assignment: assignment}], index: 0});
                                }
                                return acc;
                            }, [] as QuizAssignmentProps[]);

                            // sort the outermost table by quiz title
                            quizAssignment.sort((a, b) => a.assignedGroups[0].assignment.quizSummary?.title?.localeCompare(b.assignedGroups[0].assignment.quizSummary?.title ?? "") ?? 0);

                            return <>
                                {quizAssignments.length === 0 && <p>You have not set any tests to your groups yet.</p>}
                                {quizAssignments.length > 0 && <Table borderless={isAda} className="w-100 set-quiz-table">
                                    {isAda && <colgroup>
                                        <col width={"120px"}/>
                                        <col width={"auto"}/>
                                        {below["xs"](deviceSize) ? <></> : below["lg"](deviceSize) ? <col width="90px"/> : <col width="160px"/>}
                                        <col width={"60px"}/>
                                    </colgroup>}
                                    <tbody className={siteSpecific("list-group list-group-links", "")}>
                                        {quizAssignment.map((g, i) => <QuizAssignment key={g.assignedGroups?.[0].assignment.id ?? 0} user={g.user} assignedGroups={g.assignedGroups} index={i} />)}
                                    </tbody>
                                </Table>}
                            </>;
                        }}
                    />
                </>
            }}
        </Tabs>
    </PageContainer>;
};
