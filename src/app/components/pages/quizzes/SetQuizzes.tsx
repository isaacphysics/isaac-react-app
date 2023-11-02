import React, {useEffect, useMemo, useState} from "react";
import {
    showQuizSettingModal,
    useAppDispatch,
    useGetGroupsQuery,
    useGetQuizAssignmentsSetByMeQuery,
    useCancelQuizAssignmentMutation
} from "../../../state";
import {Link, RouteComponentProps, withRouter} from "react-router-dom";
import * as RS from "reactstrap";
import {ShowLoading} from "../../handlers/ShowLoading";
import {QuizAssignmentDTO, QuizSummaryDTO, RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {Spacer} from "../../elements/Spacer";
import {formatDate, formatISODateOnly} from "../../elements/DateString";
import {AppQuizAssignment} from "../../../../IsaacAppTypes";
import {
    above,
    below, confirmThen,
    ifKeyIsEnter,
    isAda,
    isDefined,
    isEventLeaderOrStaff,
    isPhy, isStaff, KEY,
    MANAGE_QUIZ_TAB,
    nthHourOf, persistence,
    siteSpecific,
    TODAY,
    useDeviceSize,
    useFilteredQuizzes
} from "../../../services";
import {Tabs} from "../../elements/Tabs";
import {IsaacSpinner} from "../../handlers/IsaacSpinner";
import {ShowLoadingQuery} from "../../handlers/ShowLoadingQuery";
import {PageFragment} from "../../elements/PageFragment";
import {RenderNothing} from "../../elements/RenderNothing";
import classNames from "classnames";

interface SetQuizzesPageProps extends RouteComponentProps {
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

const _compareDates = (a: Date | undefined, b: Date | undefined): number => {
    // sorts by date descending (most recent first), then undefined
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;
    return b.valueOf() - a.valueOf();
};

function QuizAssignment({user, assignedGroups, index}: QuizAssignmentProps) {

    const compareGroupNames = (a: AssignedGroup, b: AssignedGroup) => _compareStrings(a?.group, b?.group);
    const compareCreationDates = (a: AssignedGroup, b: AssignedGroup) => _compareDates(a?.assignment?.creationDate, b?.assignment?.creationDate);
    const compareStartDates = (a: AssignedGroup, b: AssignedGroup) => _compareDates(a?.assignment?.scheduledStartDate ?? a?.assignment?.creationDate, b?.assignment?.scheduledStartDate ?? b?.assignment?.creationDate);
    const compareDueDates = (a: AssignedGroup, b: AssignedGroup) => _compareDates(a?.assignment?.dueDate, b?.assignment?.dueDate);
    
    const dispatch = useAppDispatch();
    const deviceSize = useDeviceSize();
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentSort, setCurrentSort] = useState(() => compareCreationDates);
    const [reverseSort, setReverseSort] = useState(false);
    const [markQuizAsCancelled, {isLoading: isCancelling}] = useCancelQuizAssignmentMutation();
    
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

    const reverseSortButtons = <div className="sort">
        <span className={classNames("up", {"active": reverseSort})} >▲</span>
        <span className={classNames("down", {"active": !reverseSort})}>▼</span>
    </div>;
    
    // assignedGroups[n].assignment is the same for all n *with the exception of the quizId*.
    const assignment = assignedGroups[0].assignment;
    const quizTitle = (assignment.quizSummary?.title || assignment.quizId);

    const cancel = () => confirmThen(
        "Are you sure you want to cancel?\r\nStudents will no longer be able to take the test or see any feedback, and all previous attempts will be lost.",
        () => markQuizAsCancelled(assignment.id as number)
    );

    const determineQuizSubjects = (quizSummary?: QuizSummaryDTO) => {
        return quizSummary?.tags?.filter(tag => ["physics", "chemistry", "maths", "biology"].includes(tag.toLowerCase())).reduce((acc, tag) => acc + `subject-${tag.toLowerCase()} `, "");
    };

    const subjects = determineQuizSubjects(assignment.quizSummary) || "subject-physics";

    interface innerTableHeader {
        title: string;
        sort: (a: AssignedGroup, b: AssignedGroup) => number;
    }

    const innerTableHeaders : innerTableHeader[] = [
        {title: "Group name", sort: compareGroupNames},
        above["md"](deviceSize) ? {title: "Creation date", sort: compareCreationDates} : undefined,
        above["sm"](deviceSize) ? {title: "Start date", sort: compareStartDates} : undefined,
        {title: "Due date", sort: compareDueDates}
    ].filter(isDefined);
    
    return <>
        <tr className="bg-white set-quiz-table-dropdown" onClick={() => setIsExpanded(e => !e)}>
            {/* <td className="p-2">{assignedGroups.length ?? "Unknown"}</td> */}
            {isPhy && <td id={"group-hex-" + index} className={classNames("board-subject-hexagon-container", {"set-quiz-table-border" : !isExpanded})}>
                <div className={`board-subject-hexagon ${subjects} d-flex justify-content-center align-items-center`}>    
                    <span className="set-quiz-table-group-hex" title={"Number of groups assigned"}>
                        <strong>{assignedGroups.length}</strong>
                        group{(!assignedGroups || assignedGroups.length != 1) && "s"}
                        <RS.UncontrolledTooltip placement={"top"} target={"#group-hex-" + index}>{assignedGroups.length === 0 ?
                            "No groups have been assigned."
                            : (`Test assigned to: ` + assignedGroups.map(g => g.group).join(", "))}
                        </RS.UncontrolledTooltip>
                    </span>
                </div>
            </td>}
            {isAda && <td id={"group-td-" + index} className={classNames("group-counter", {"set-quiz-table-border" : !isExpanded})}>
                <span><strong>{assignedGroups.length}</strong>&nbsp;</span><br/>
                <span>group{(!assignedGroups || assignedGroups.length != 1) && "s"}</span>
                <RS.UncontrolledTooltip placement={"top"} target={"#group-td-" + index}>{assignedGroups.length === 0 ?
                    "No groups have been assigned."
                    : (`Test assigned to: ` + assignedGroups.map(g => g.group).join(", "))}
                </RS.UncontrolledTooltip>
            </td>}
            <td className={classNames("set-quiz-table-title set-quiz-table-border", {"pl-4": isAda})}>{quizTitle}</td>
            <td className="set-quiz-table-border">
                <RS.Button className={`d-block h-4 ${below["sm"](deviceSize) ? "btn-sm" : ""}`} 
                    style={{minWidth: `${below["md"](deviceSize) ? "90px" : "140px"}`, zIndex: '100'}} 
                    onClick={(e) => {
                        assignment.quizSummary && dispatch(showQuizSettingModal(assignment.quizSummary, isStaff(user)));
                        e.stopPropagation();
                    }}
                >
                    {siteSpecific("Set Test", "Set test")}
                </RS.Button>
            </td>
        </tr>
        {isExpanded && <tr className="set-quiz-table-border">
            <td colSpan={3} className={classNames("bg-white", {"pl-2": isPhy})}>
                <table className="w-100 set-quiz-table-inner">
                    <thead>
                        <tr>
                            {innerTableHeaders.map(header => <th key={header.title} onClick={() => setSort(header.sort)} className="pb-1 pt-1">
                                <div className="d-flex flex-row">
                                    <span role="button" tabIndex={0} onKeyDown={ifKeyIsEnter(() => setSort(header.sort))} onClick={(e) => {
                                        e.stopPropagation();
                                        setSort(header.sort);
                                    }}>{header.title}</span>
                                    {currentSort.name === header.sort.name && reverseSortButtons}
                                </div>
                            </th>)}
                            <th colSpan={2}/>
                        </tr>
                    </thead>
                    <tbody>
                        {conditionalReverse(assignedGroups.sort(currentSort)).map(assignedGroup => {
                        const assignmentNotYetStarted = assignedGroup.assignment?.scheduledStartDate && nthHourOf(0, assignedGroup.assignment?.scheduledStartDate) > TODAY();
                        return <tr key={assignedGroup.group}>
                            <td>{assignedGroup.group}</td>
                            {above["md"](deviceSize) ? <td>{formatDate(assignedGroup.assignment.creationDate)}</td> : <></>}
                            <td>{formatDate(assignedGroup.assignment.scheduledStartDate ?? assignedGroup.assignment.creationDate)}</td>
                            {above["sm"](deviceSize) ? <td>{assignedGroup.assignment.dueDate ? formatDate(assignedGroup.assignment.dueDate) : "-"}</td> : <></>}
                            <td colSpan={2}>
                                <div className="d-flex justify-content-end">
                                    <RS.Button tag={Link} size="sm" to={`/test/assignment/${assignedGroup.assignment.id}/feedback`} disabled={isCancelling} color="tertiary" className="ml-1 bg-transparent">
                                        View {assignmentNotYetStarted ? siteSpecific("Details", "details") : siteSpecific("Results", "results")}
                                    </RS.Button>
                                    <Spacer width={5} />
                                    <RS.Button color="tertiary" size="sm" onClick={cancel} disabled={isCancelling} className="mr-1 bg-transparent">
                                        {isCancelling ? <><IsaacSpinner size="sm" /> Cancelling...</> : siteSpecific("Cancel Test", "Cancel test")}
                                    </RS.Button>
                                </div>
                            </td>
                        </tr>;
                        })}
                    </tbody>
                </table>
            </td>
        </tr>}
    </>;
}

const SetQuizzesPageComponent = ({user, location}: SetQuizzesPageProps) => {
    const dispatch = useAppDispatch();
    const deviceSize = useDeviceSize();
    const hashAnchor = location.hash?.slice(1) ?? null;
    const [activeTab, setActiveTab] = useState(MANAGE_QUIZ_TAB.set);

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
    }, [hashAnchor]);

    const {titleFilter, setTitleFilter, filteredQuizzes} = useFilteredQuizzes(user);

    const [showFilters, setShowFilters] = useState(false);
    const [manageQuizzesTitleFilter, setManageQuizzesTitleFilter] = useState("");
    const [manageQuizzesGroupNameFilter, setManageQuizzesGroupNameFilter] = useState("");
    const [quizSetDateFilterType, setQuizSetDateFilterType] = useState('after');
    const [quizDueDateFilterType, setQuizDueDateFilterType] = useState('before');
    const [quizStartDate, setQuizStartDate] = useState<Date | undefined>(undefined);
    const [quizDueDate, setQuizDueDate] = useState<Date | undefined>(undefined);
    
    const pageTitle= siteSpecific("Set / Manage Tests", "Manage tests");
    const pageHelp = <span>
        Use this page to manage and set tests to your groups. You can assign any test the {siteSpecific("Isaac", "Ada")} team have built.
        <br />
        Students in the group will be emailed when you set a new test.
    </span>;

    // If the user is event admin or above, and the quiz is hidden from teachers, then show that
    // Otherwise, show if the quiz is visible to students
    const roleVisibilitySummary = (quiz: QuizSummaryDTO) => <>
        {isEventLeaderOrStaff(user) && quiz.hiddenFromRoles && quiz.hiddenFromRoles?.includes("TEACHER") && <div className="small text-muted d-block ml-2">hidden from teachers</div>}
        {((quiz.hiddenFromRoles && !quiz.hiddenFromRoles?.includes("STUDENT")) || quiz.visibleToStudents) && <div className="small text-muted d-block ml-2">visible to students</div>}
    </>;

    const rowFiltersView = ((isPhy && above["sm"](deviceSize)) || (isAda && above["md"](deviceSize)));

    const titleFilterInput = <RS.Row>
        <RS.Input
            id="manage-quizzes-title-filter" type="search" className={rowFiltersView ? "mb-4" : "mb-2"}
            value={manageQuizzesTitleFilter} onChange={event => setManageQuizzesTitleFilter(event.target.value)}
            placeholder="Filter by title" aria-label="Filter by title"
        />
    </RS.Row>;

    const groupFilterInput = <RS.Row>
        <RS.Input
            id="manage-quizzes-group-name-filter" type="search" className={rowFiltersView ? "mb-4" : "mb-2"}
            value={manageQuizzesGroupNameFilter} onChange={event => setManageQuizzesGroupNameFilter(event.target.value)}
            placeholder="Filter by group" aria-label="Filter by group"
        />
    </RS.Row>;

    const dateFilterTypeSelector = (dateFilterType: string, setDateFilterType: React.Dispatch<React.SetStateAction<string>>) => <RS.UncontrolledDropdown className={classNames("quiz-date-filter-type", rowFiltersView ? "mb-4" : "mb-2")}>
        <RS.DropdownToggle className="p-0 m-1" color="tertiary" caret>{dateFilterType}</RS.DropdownToggle>
        <RS.DropdownMenu>
            <RS.DropdownItem onClick={() => setDateFilterType('after')}>
                after
            </RS.DropdownItem>
            <RS.DropdownItem onClick={() => setDateFilterType('before')}>
                before
            </RS.DropdownItem>
            <RS.DropdownItem onClick={() => setDateFilterType('on')}>
                on
            </RS.DropdownItem>
        </RS.DropdownMenu>
    </RS.UncontrolledDropdown>;

    const setDateFilterInput = <RS.Row className="d-flex align-items-baseline">
        <span className={classNames("p-1 quiz-filter-date-span", rowFiltersView ? "mb-4" : "mb-2")}>Starting</span>
        {dateFilterTypeSelector(quizSetDateFilterType, setQuizSetDateFilterType)}
        <RS.Input
            id="manage-quizzes-set-date-filter" type="date" className={classNames("quiz-filter-date-input p-1", rowFiltersView ? "mb-4" : "mb-2")}
            value={quizStartDate && !isNaN(quizStartDate.valueOf()) ? formatISODateOnly(quizStartDate) : undefined} onChange={event => setQuizStartDate(new Date(event.target.value))}
            placeholder="Filter by set date" aria-label="Filter by set date"
        />
    </RS.Row>;

    const dueDateFilterInput = <RS.Row className="d-flex align-items-baseline">
        <span className={classNames("p-1 quiz-filter-date-span", rowFiltersView ? "mb-4" : "mb-2")}>Due</span>
        {dateFilterTypeSelector(quizDueDateFilterType, setQuizDueDateFilterType)}
        <RS.Input
            id="manage-quizzes-due-date-filter" type="date" className={classNames("quiz-filter-date-input p-1", rowFiltersView ? "mb-4" : "mb-2")}
            value={quizDueDate && !isNaN(quizDueDate.valueOf()) ? formatISODateOnly(quizDueDate) : undefined} onChange={event => setQuizDueDate(new Date(event.target.value))}
            placeholder="Filter by due date" aria-label="Filter by due date"
        />
    </RS.Row>;

    return <RS.Container>
        <TitleAndBreadcrumb currentPageTitle={pageTitle} help={pageHelp} modalId={isPhy ? "set_tests_help" : undefined} />
        <PageFragment fragmentId={"set_tests_help"} ifNotFound={RenderNothing} />
        <Tabs className="my-4 mb-5" tabContentClass="mt-4" activeTabOverride={activeTab}>
            {{
                [siteSpecific("Set Tests", "Available tests")]:
                <ShowLoading until={filteredQuizzes}>
                    {filteredQuizzes && <>
                        <p>The following tests are available to set to your groups.</p>
                        <RS.Input
                            id="available-quizzes-title-filter" type="search" className="mb-4"
                            value={titleFilter} onChange={event => setTitleFilter(event.target.value)}
                            placeholder="Search by title" aria-label="Search by title"
                        />
                        {filteredQuizzes.length === 0 && <p><em>There are no tests you can set which match your search term.</em></p>}
                        <RS.ListGroup className="mb-2 quiz-list">
                            {filteredQuizzes.map(quiz =>  <RS.ListGroupItem className="p-0 bg-transparent" key={quiz.id}>
                                <div className="d-flex flex-grow-1 flex-row align-items-center p-3">
                                    <div className="d-flex flex-column">
                                        <span className="mb-2 mb-sm-0 pr-2">{quiz.title}</span>
                                        {roleVisibilitySummary(quiz)}
                                    </div>
                                    {quiz.summary && <div className="small text-muted d-none d-md-block">{quiz.summary}</div>}
                                    <Spacer />
                                    <RS.Button className={`d-none d-md-block h-4 ${below["md"](deviceSize) ? "btn-sm" : ""}`} style={{minWidth: `${below["md"](deviceSize) ? "90px" : "140px"}`}} onClick={() => dispatch(showQuizSettingModal(quiz, isStaff(user)))}>
                                        {siteSpecific("Set Test", "Set test")}
                                    </RS.Button>
                                </div>
                                <RS.UncontrolledButtonDropdown className="d-flex d-md-none">
                                    <RS.DropdownToggle caret className="text-nowrap" size="sm" color="link">
                                        Actions
                                    </RS.DropdownToggle>
                                    <RS.DropdownMenu>
                                            <RS.DropdownItem onClick={() => dispatch(showQuizSettingModal(quiz, isStaff(user)))} style={{zIndex: '1'}}>
                                                {siteSpecific("Set Test", "Set test")}
                                            </RS.DropdownItem>
                                            <RS.DropdownItem divider />
                                            <Link className="w-100" style={{textDecoration: 'none'}} to={{pathname: `/test/preview/${quiz.id}`}}>
                                                <RS.DropdownItem>
                                                    Preview
                                                </RS.DropdownItem>
                                            </Link>
                                        </RS.DropdownMenu>
                                </RS.UncontrolledButtonDropdown> 
                                <div className="d-none d-md-flex align-items-center">
                                    <Link className="my-3 mr-2 pl-3 pr-4 quiz-list-separator" to={{pathname: `/test/preview/${quiz.id}`}}>
                                        <span>Preview</span>
                                    </Link>
                                </div>
                            </RS.ListGroupItem>)}
                        </RS.ListGroup>
                    </>}
                </ShowLoading>,

                [siteSpecific("Manage Tests", "Previously set tests")]:
                <>
                    <div className="d-flex justify-content-center mb-4">
                        <RS.Button color="tertiary" size="sm" onClick={() => setShowFilters(s => !s)}>
                            {showFilters ? "Hide filters" : "Show filters"}
                        </RS.Button>
                    </div>
                    {showFilters && (rowFiltersView
                        ? <RS.Row>
                            <RS.Col xs={6} className="d-flex flex-column align-items-center">
                                {titleFilterInput}
                                {setDateFilterInput}
                            </RS.Col>
                            <RS.Col xs={6} className="d-flex flex-column align-items-center">
                                {groupFilterInput}
                                {dueDateFilterInput}
                            </RS.Col>
                        </RS.Row>
                        : <RS.Col className="d-flex flex-column align-items-center">
                            {titleFilterInput}
                            {groupFilterInput}
                            {setDateFilterInput}
                            {dueDateFilterInput}
                        </RS.Col>)
                    }
                    <ShowLoadingQuery
                        query={quizAssignmentsQuery}
                        ifError={() => <RS.Alert color="warning">Tests you have assigned have failed to load, please try refreshing the page.</RS.Alert>}
                        thenRender={quizAssignments => {
                            let quizAssignmentsWithGroupNames: AppQuizAssignment[] = quizAssignments.map(assignment => {
                                const groupName = persistence.load(KEY.ANONYMISE_GROUPS) === "YES"
                                ? `Demo Group ${assignment.groupId}`
                                : groupIdToName[assignment.groupId as number] ?? "Unknown Group";
                                return {...assignment, groupName};
                            });
                            if (showFilters) {
                                const filters = [];
                                if (manageQuizzesTitleFilter !== "") {
                                    filters.push((assignment : AppQuizAssignment) => assignment.quizSummary?.title?.toLowerCase().includes(manageQuizzesTitleFilter.toLowerCase()));
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
                                {quizAssignments.length > 0 && <table className="w-100 set-quiz-table">
                                    <colgroup>
                                        <col width={isPhy ? "90px" : isAda ? "120px" : "auto"}/>
                                        <col width={"auto"}/>
                                        <col width={"160px"}/>
                                    </colgroup>
                                    <tbody>
                                        {quizAssignment.map((g, i) => <QuizAssignment key={g.assignedGroups?.[0].assignment.id ?? 0} user={g.user} assignedGroups={g.assignedGroups} index={i} />)}
                                    </tbody>    
                                </table>}
                            </>;
                        }}
                    />
                </>
            }}
        </Tabs>
    </RS.Container>;
};

export const SetQuizzes = withRouter(SetQuizzesPageComponent);
