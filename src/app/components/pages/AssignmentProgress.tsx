import React, {
    ComponentProps,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState
} from "react";
import {
    loadQuizAssignmentFeedback,
    loadQuizAssignments,
    openActiveModal,
    selectors,
    useAppDispatch,
    useAppSelector,
    useGetAssignmentProgressQuery,
    useGetGroupsQuery,
    useGroupAssignments,
    useGroupAssignmentSummary
} from "../../state";
import {
    Button,
    Container,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    InputGroup,
    Label,
    UncontrolledButtonDropdown
} from "reactstrap"
import orderBy from "lodash/orderBy";
import sortBy from "lodash/sortBy";
import {
    AppAssignmentProgress,
    AppGroup,
    AssignmentOrder,
    AssignmentOrderSpec,
    AssignmentProgressPageSettingsContext,
    EnhancedAssignment,
    EnhancedAssignmentWithProgress
} from "../../../IsaacAppTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    GameboardItem,
    GameboardItemState,
    QuizAssignmentDTO,
    QuizUserFeedbackDTO,
    RegisteredUserDTO
} from "../../../IsaacApiTypes";
import {Link} from "react-router-dom";
import {
    API_PATH,
    getAssignmentCSVDownloadLink,
    getAssignmentStartDate,
    getQuizAssignmentCSVDownloadLink,
    hasAssignmentStarted,
    isAda,
    isDefined,
    isFound,
    isPhy,
    isTeacherOrAbove,
    MARKBOOK_TYPE_TAB,
    PATHS,
    siteSpecific,
    SortOrder,
    useAssignmentProgressAccessibilitySettings
} from "../../services";
import {downloadLinkModal} from "../elements/modals/AssignmentProgressModalCreators";
import {formatDate} from "../elements/DateString";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import {Tabs} from "../elements/Tabs";
import {formatMark, ICON, passMark, ResultsTable} from "../elements/quiz/QuizProgressCommon";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import classNames from "classnames";
import {PageFragment} from "../elements/PageFragment";
import {RenderNothing} from "../elements/RenderNothing";

enum GroupSortOrder {
    Alphabetical = "Alphabetical",
    DateCreated = "Date Created"
}

export const ProgressDetails = ({assignment}: {assignment: EnhancedAssignmentWithProgress}) => {
    const [selectedQuestionNumber, setSelectedQuestion] = useState(0);
    const selectedQuestion: GameboardItem | undefined = assignment.gameboard.contents[selectedQuestionNumber];

    type SortOrder = number | "name" | "totalQuestionPartPercentage" | "totalQuestionPercentage";
    const [sortOrder, setSortOrder] = useState<SortOrder>("name");
    const [reverseOrder, setReverseOrder] = useState(false);
    const [singleQuestionSort, setSingleQuestionSort] = useState(false);

    const pageSettings = useContext(AssignmentProgressPageSettingsContext);

    const questions = assignment.gameboard.contents;
    const progressData = useMemo<[AppAssignmentProgress, boolean][]>(() => assignment.progress.map(p => {
        if (!p.user.authorisedFullAccess) return [p, false];
        const initialState = {
            ...p,
            tickCount: 0,
            correctQuestionPartsCount: 0,
            incorrectQuestionPartsCount: 0,
            notAttemptedPartResults: []
        }
        const ret = p.results.reduce<AppAssignmentProgress>((oldP, results, i) => {
                const tickCount = ["PASSED", "PERFECT"].includes(results) ? oldP.tickCount + 1 : oldP.tickCount;
                const questions = assignment.gameboard.contents;
                return {
                    ...oldP,
                    tickCount,
                    correctQuestionPartsCount: oldP.correctQuestionPartsCount + p.correctPartResults[i],
                    incorrectQuestionPartsCount: oldP.incorrectQuestionPartsCount + p.incorrectPartResults[i],
                    notAttemptedPartResults: [
                        ...oldP.notAttemptedPartResults,
                        (questions[i].questionPartsTotal - p.correctPartResults[i] - p.incorrectPartResults[i])
                    ]
                };
            }, initialState);
        return [ret, questions.length === ret.tickCount];
    }), [assignment]);

    const progress = progressData.map(pd => pd[0]);
    const studentsCorrect = progressData.reduce((sc, pd) => sc + (pd[1] ? 1 : 0), 0);

    // Calculate 'class average', which isn't an average at all, it's the percentage of ticks per question.
    const [assignmentAverages, assignmentTotalQuestionParts] = useMemo<[number[], number]>(() => {
        return questions?.reduce(([aAvg, aTQP], q, i) => {
            const tickCount = progress.reduce((tc, p) => ["PASSED", "PERFECT"].includes(p.results[i]) ? tc + 1 : tc, 0);
            const tickPercent = Math.round(100 * (tickCount / progress.length));
            return [[...aAvg, tickPercent], aTQP + (q.questionPartsTotal ?? 0)];
        }, [[] as number[], 0]) ?? [[], 0];
    }, [questions, assignment, progress]);

    const semiSortedProgress = useMemo(() => orderBy(progress, (item) => {
            return item.user.authorisedFullAccess && item.notAttemptedPartResults.reduce(function(sum, increment) {return sum + increment;}, 0);
        }, [reverseOrder ? "desc" : "asc"])
    , [progress]);

    const sortedProgress = useMemo(() => orderBy((singleQuestionSort ? progress : semiSortedProgress), (item) => {
            switch (sortOrder) {
                case "name":
                    return (item.user.familyName + ", " + item.user.givenName).toLowerCase();
                case "totalQuestionPartPercentage":
                    return -item.correctQuestionPartsCount;
                case "totalQuestionPercentage":
                    return -item.tickCount;
                default:
                    return -item.correctPartResults[sortOrder];
            }
        }, [reverseOrder ? "desc" : "asc"])
    , [singleQuestionSort, progress, semiSortedProgress]);

    function isSelected(q: GameboardItem) {
        return q == selectedQuestion ? "selected" : "";
    }

    function sortClasses(q: SortOrder) {
        if (q == sortOrder) {
            return "sorted" + (reverseOrder ? " reverse" : " forward");
        } else {
            return "";
        }
    }

    function toggleSort(itemOrder: SortOrder) {
        setSortOrder(itemOrder);
        if (typeof itemOrder === "number") {
            setSingleQuestionSort(true)
        } else {
            setSingleQuestionSort(false);
        }
        if (sortOrder == itemOrder) {
            setReverseOrder(!reverseOrder);
        } else {
            setReverseOrder(false);
        }
    }

    function sortItem(props: ComponentProps<"th"> & {itemOrder: SortOrder}) {
        const {itemOrder, ...rest} = props;
        const className = (props.className || "") + " " + sortClasses(itemOrder);
        const clickToSelect = typeof itemOrder === "number" ? (() => setSelectedQuestion(itemOrder)) : undefined;
        const sortArrows = (typeof itemOrder !== "number" || itemOrder === selectedQuestionNumber) ?
            <button className="sort" onClick={() => {toggleSort(itemOrder);}}>
                <span className="up" >▲</span>
                <span className="down">▼</span>
            </button>
            : undefined;
        return <th key={props.key} {...rest} className={className} onClick={clickToSelect}>{props.children}{sortArrows}</th>;
    }

    const tableHeaderFooter = <tr className="progress-table-header-footer">
        {sortItem({key: "name", itemOrder: "name"})}
        {questions.map((q, index) =>
            sortItem({key: q.id, itemOrder: index, className: isSelected(q), children: `${assignmentAverages[index]}%`})
        )}
        {sortItem({key: "totalQuestionPartPercentage", itemOrder: "totalQuestionPartPercentage", className:"total-column left", children: "Total Parts"})}
        {sortItem({key: "totalQuestionPercentage", itemOrder: "totalQuestionPercentage", className:"total-column right", children: "Total Qs"})}
    </tr>;

    function markClassesInternal(studentProgress: AppAssignmentProgress, status: GameboardItemState | null, correctParts: number, incorrectParts: number, totalParts: number) {
        if (!studentProgress.user.authorisedFullAccess) {
            return "revoked";
        } else if (correctParts === totalParts) {
            return "completed";
        } else if (status === "PASSED" || (correctParts / totalParts) >= passMark) {
            return "passed";
        } else if (status === "FAILED" || (incorrectParts / totalParts) > (1 - passMark)) {
            return "failed";
        } else if (correctParts > 0 || incorrectParts > 0) {
            return "in-progress";
        } else {
            return "not-attempted";
        }
    }

    function markClasses(studentProgress: AppAssignmentProgress, totalParts: number) {
        const correctParts = studentProgress.correctQuestionPartsCount;
        const incorrectParts = studentProgress.incorrectQuestionPartsCount;
        const status = null;

        return markClassesInternal(studentProgress, status, correctParts, incorrectParts, totalParts);
    }

    function markQuestionClasses(studentProgress: AppAssignmentProgress, index: number) {
        const question = questions[index];

        const totalParts = question.questionPartsTotal;
        const correctParts = studentProgress.correctPartResults[index];
        const incorrectParts = studentProgress.incorrectPartResults[index];
        const status = studentProgress.results[index];

        return isSelected(question) + " " + markClassesInternal(studentProgress, status, correctParts, incorrectParts, totalParts);
    }

    const tableRef = useRef<HTMLTableElement>(null);

    useLayoutEffect(() => {
        const table = tableRef.current;
        if (table) {
            const parentElement = table.parentElement as HTMLElement;
            const firstRow = (table.firstChild as HTMLTableSectionElement).firstChild as HTMLTableRowElement;
            const questionTH = firstRow.children[selectedQuestionNumber + 1] as HTMLTableHeaderCellElement;

            const offsetLeft = questionTH.offsetLeft;
            const parentScrollLeft = parentElement.scrollLeft;
            const parentLeft = parentScrollLeft + parentElement.offsetLeft + 130;
            const width = questionTH.offsetWidth;

            let newScrollLeft;

            if (offsetLeft < parentLeft) {
                newScrollLeft = parentScrollLeft + offsetLeft - parentLeft - width / 2;
            } else {
                const offsetRight = offsetLeft + width;
                const parentRight = parentLeft + parentElement.offsetWidth - 260;
                if (offsetRight > parentRight) {
                    newScrollLeft = parentScrollLeft + offsetRight - parentRight + width / 2;
                }
            }
            if (newScrollLeft != undefined) {
                parentElement.scrollLeft = newScrollLeft;
            }
        }
    }, [selectedQuestionNumber]);

    return <div className="assignment-progress-progress">
        <div className="progress-header">
            <strong>{studentsCorrect}</strong> of <strong>{progress.length}</strong>{` students have completed the ${siteSpecific("gameboard", "quiz")} `}<Link to={`${PATHS.GAMEBOARD}#${assignment.gameboardId}`}>{assignment.gameboard.title}</Link> correctly.
        </div>
        {progress.length > 0 && <>
            <div className="progress-questions">
                <Button color="tertiary" disabled={selectedQuestionNumber == 0}
                    onClick={() => setSelectedQuestion(selectedQuestionNumber - 1)}>◄</Button>
                <div><Link
                    to={`/questions/${selectedQuestion.id}?board=${assignment.gameboardId}`}><strong>Q<span className="d-none d-md-inline">uestion</span>: </strong>{selectedQuestion.title}
                </Link></div>
                <Button color="tertiary" disabled={selectedQuestionNumber === questions.length - 1}
                    onClick={() => setSelectedQuestion(selectedQuestionNumber + 1)}>►</Button>
            </div>
            <div className="progress-table">
                <table ref={tableRef}>
                    <thead>
                        {tableHeaderFooter}
                    </thead>
                    <tbody>
                        {sortedProgress.map((studentProgress) => {
                            const fullAccess = studentProgress.user.authorisedFullAccess;
                            return <tr key={studentProgress.user.id} className={`${markClasses(studentProgress, assignmentTotalQuestionParts)}${fullAccess ? "" : " not-authorised"}`} title={`${studentProgress.user.givenName + " " + studentProgress.user.familyName}`}>
                                <th className="student-name">
                                    {fullAccess && pageSettings.isTeacher ?
                                        <Link to={`/progress/${studentProgress.user.id}`} target="_blank">
                                            {studentProgress.user.givenName}
                                            <span
                                                className="d-none d-lg-inline"> {studentProgress.user.familyName}</span>
                                        </Link> :
                                        <span>{studentProgress.user.givenName} {studentProgress.user.familyName}</span>
                                    }
                                </th>
                                {questions.map((q, index) =>
                                    <td key={q.id} className={markQuestionClasses(studentProgress, index)} onClick={() => setSelectedQuestion(index)}>
                                        {fullAccess ? formatMark(studentProgress.correctPartResults[index],
                                            questions[index].questionPartsTotal,
                                            pageSettings.formatAsPercentage) : ""}
                                    </td>
                                )}
                                <th className="total-column left" title={fullAccess ? undefined : "Not Sharing"}>
                                    {fullAccess ? formatMark(studentProgress.correctQuestionPartsCount,
                                        assignmentTotalQuestionParts,
                                        pageSettings.formatAsPercentage) : ""}
                                </th>
                                <th className="total-column right" title={fullAccess ? undefined : "Not Sharing"}>
                                    {fullAccess ? formatMark(studentProgress.tickCount,
                                        questions.length,
                                        pageSettings.formatAsPercentage) : ""}
                                </th>
                            </tr>;
                        })}
                    </tbody>
                    <tfoot>
                        {tableHeaderFooter}
                    </tfoot>
                </table>
            </div>
        </>}
    </div>;
};

const ProgressLoader = ({assignment}: {assignment: EnhancedAssignment}) => {
    const assignmentProgressQuery = useGetAssignmentProgressQuery(assignment.id);
    return <ShowLoadingQuery
        query={assignmentProgressQuery}
        defaultErrorTitle={`Error fetching ${siteSpecific("assignment", "quiz")} progress`}
        thenRender={(progress) => {
            const assignmentWithProgress = {...assignment, progress: progress};
            return <ProgressDetails assignment={assignmentWithProgress} />;
        }}
    />;
};

const AssignmentDetails = ({assignment}: {assignment: EnhancedAssignment}) => {
    const dispatch = useAppDispatch();
    const [isExpanded, setIsExpanded] = useState(false);

    function openAssignmentDownloadLink(event: React.MouseEvent<HTMLButtonElement & HTMLAnchorElement>) {
        event.stopPropagation();
        event.preventDefault();
        dispatch(openActiveModal(downloadLinkModal(event.currentTarget.href)));
    }

    function openSingleAssignment(event: React.MouseEvent<HTMLButtonElement & HTMLAnchorElement>) {
        event.stopPropagation();
        event.preventDefault();
        window.open(event.currentTarget.href, '_blank');
    }

    const assignmentHasNotStarted = !hasAssignmentStarted(assignment);

    return <div className="assignment-progress-gameboard" key={assignment.gameboardId}>
        <div className={classNames("gameboard-header", {"text-muted": assignmentHasNotStarted})} onClick={() => setIsExpanded(!isExpanded)}>
            <Button color="link" className="gameboard-title align-items-center" onClick={() => setIsExpanded(!isExpanded)}>
                <span className={classNames({"text-muted": assignmentHasNotStarted})}>
                    {assignment.gameboard?.title}
                    {assignmentHasNotStarted && <span className="gameboard-due-date">
                        (Scheduled:&nbsp;{formatDate(getAssignmentStartDate(assignment))})
                    </span>}
                    {assignmentHasNotStarted && assignment.dueDate && " "}
                    {assignment.dueDate && <span className="gameboard-due-date">
                        (Due:&nbsp;{formatDate(assignment.dueDate)})
                    </span>}
                </span>
            </Button>
            <div className="gameboard-links align-items-center">
                <Button color="link" tag="a" className="mr-md-0">
                    {isExpanded ? "Hide " : "View "} <span className="d-none d-lg-inline">mark sheet</span>
                </Button>
                <span className="d-none d-md-inline">,</span>
                <Button className="d-none d-md-inline" color="link" tag="a" href={getAssignmentCSVDownloadLink(assignment.id as number)} onClick={openAssignmentDownloadLink}>
                    Download CSV
                </Button>
                <span className="d-none d-md-inline mx-1">or</span>
                <Button className="d-none d-md-inline" color="link" tag="a" href={`${PATHS.ASSIGNMENT_PROGRESS}/${assignment.id}`} onClick={openSingleAssignment}>
                    {`View individual ${siteSpecific("assignment", "quiz")}`}
                </Button>
            </div>
        </div>
        {isExpanded && <ProgressLoader assignment={assignment} />}
    </div>
};

export const AssignmentProgressLegend = ({showQuestionKey}: {showQuestionKey?: boolean}) => {
    const pageSettings = useContext(AssignmentProgressPageSettingsContext);
    return <div className="p-4"><div className="assignment-progress-legend">
        {showQuestionKey && <>
            <Label htmlFor="question-key">Question key:</Label>
            <ul id="question-key" className="block-grid-xs-3">
                <li className="d-flex flex-wrap align-items-center justify-content-center">
                    <div className="key-cell">{ICON.correct}</div>
                    <div className="key-description">Correct</div>
                </li>
                <li className="d-flex flex-wrap align-items-center justify-content-center">
                    <div className="key-cell">{ICON.notAttempted}</div>
                    <div className="key-description">Not attempted</div>
                </li>
                <li className="d-flex flex-wrap align-items-center justify-content-center">
                    <div className="key-cell">{ICON.incorrect}</div>
                    <div className="key-description">Incorrect</div>
                </li>
            </ul>
        </>}
        {showQuestionKey && <Label htmlFor="key" className="mt-2">Section key:</Label>}
        <ul id="key" className="block-grid-xs-5">
            <li className="d-flex flex-wrap px-2">
                <div className="key-cell">
                    <span className="completed" />
                </div>
                <div className="key-description">100% correct</div>
            </li>
            <li className="d-flex flex-wrap px-2">
                <div className="key-cell"><span className="passed">&nbsp;</span>
                </div>
                <div className="key-description">&ge;{passMark * 100}% correct
                    {/*<span className="d-none d-xl-inline"> (or Mastery)</span>*/}
                </div>
            </li>
            <li className="d-flex flex-wrap px-2">
                <div className="key-cell"><span className="in-progress">&nbsp;</span>
                </div>
                <div className="key-description">&lt;{passMark * 100}% correct</div>
            </li>
            <li className="d-flex flex-wrap px-2">
                <div className="key-cell"><span>&nbsp;</span>
                </div>
                <div className="key-description"><span className="d-none d-md-inline">Not attempted</span><span
                    className="d-inline d-md-none">No attempt</span></div>
            </li>
            <li className="d-flex flex-wrap px-2">
                <div className="key-cell"><span className="failed">&nbsp;</span>
                </div>
                <div className="key-description">&gt;{100 -(passMark * 100)}% incorrect</div>
            </li>
        </ul>
        <div className="assignment-progress-options">
            <label>Colour-blind&nbsp;<input type="checkbox" checked={pageSettings.colourBlind} onChange={e => pageSettings.setColourBlind(e.target.checked)}/></label>
            <label>Percent view&nbsp;<input type="checkbox" checked={pageSettings.formatAsPercentage} onChange={e => pageSettings.setFormatAsPercentage(e.target.checked)}/></label>
        </div>
    </div></div>
};

const QuizProgressLoader = ({quizAssignment}: { quizAssignment: QuizAssignmentDTO }) => {
    const dispatch = useAppDispatch();
    const quizAssignmentId = isDefined(quizAssignment.id) ? quizAssignment.id : null;
    const quizAssignments = useAppSelector(selectors.quizzes.assignments);
    const pageSettings = useContext(AssignmentProgressPageSettingsContext);

    useEffect(() => {
        if (isDefined(quizAssignmentId)) {
            dispatch(loadQuizAssignmentFeedback(quizAssignmentId));
        }
    }, [quizAssignmentId]);

    let userFeedback: Nullable<QuizUserFeedbackDTO[]> = [];
    useEffect(() => {
        if (isFound(quizAssignments)) {
            userFeedback = quizAssignments.find(qa => qa.id === quizAssignmentId)?.userFeedback;
        }
    }, [quizAssignments])

    return isDefined(userFeedback)
        ? <div className={`assignment-progress-details bg-transparent ${pageSettings.colourBlind ? " colour-blind" : ""}`}>
            <ResultsTable assignment={quizAssignment} />
        </div>
        : <div className="p-4 text-center">
            <IsaacSpinner size="md" />
        </div>;
};

const QuizDetails = ({quizAssignment}: { quizAssignment: QuizAssignmentDTO }) => {
    const dispatch = useAppDispatch();
    const [isExpanded, setIsExpanded] = useState(false);

    function openAssignmentDownloadLink(event: React.MouseEvent<HTMLAnchorElement & HTMLButtonElement>) {
        event.stopPropagation();
        event.preventDefault();
        dispatch(openActiveModal(downloadLinkModal(event.currentTarget.href)));
    }

    function openSingleAssignment(event: React.MouseEvent<HTMLAnchorElement & HTMLButtonElement>) {
        event.stopPropagation();
        event.preventDefault();
        window.open(event.currentTarget.href, '_blank');
    }

    return isDefined(quizAssignment.id) && quizAssignment.id > 0 ? <div className="assignment-progress-gameboard" key={quizAssignment.id}>
        <div className="gameboard-header" onClick={() => setIsExpanded(!isExpanded)}>
            <Button color="link" className="gameboard-title align-items-center" onClick={() => setIsExpanded(!isExpanded)}>
                <span>{quizAssignment.quizSummary?.title || "This test has no title"}{isDefined(quizAssignment.dueDate) && <span className="gameboard-due-date">(Due:&nbsp;{formatDate(quizAssignment.dueDate)})</span>}</span>
            </Button>
            <div className="gameboard-links align-items-center">
                <Button color="link" className="mr-md-0">{isExpanded ? "Hide " : "View "} <span className="d-none d-lg-inline">mark sheet</span></Button>
                <span className="d-none d-md-inline">,</span>
                <Button className="d-none d-md-inline" color="link" tag="a" href={getQuizAssignmentCSVDownloadLink(quizAssignment.id)} onClick={openAssignmentDownloadLink}>Download CSV</Button>
                <span className="d-none d-md-inline">or</span>
                <Button className="d-none d-md-inline" color="link" tag="a" href={`/test/assignment/${quizAssignment.id}/feedback`} onClick={openSingleAssignment}>View individual assignment</Button>
            </div>
        </div>
        {isExpanded && <QuizProgressLoader key={quizAssignment.quizId} quizAssignment={quizAssignment} />}
    </div> : null;
};

const GroupDetails = ({group}: {group: AppGroup}) => {
    const [activeTab, setActiveTab] = useState(MARKBOOK_TYPE_TAB.assignments);
    const pageSettings = useContext(AssignmentProgressPageSettingsContext);

    const {groupBoardAssignments, groupQuizAssignments} = useGroupAssignments(group.id, pageSettings.assignmentOrder);
    const assignments = groupBoardAssignments ?? [];
    const quizAssignments = groupQuizAssignments ?? [];

    const assignmentTabComponents = assignments.length > 0
        ? assignments.map(assignment => <AssignmentDetails key={assignment.gameboardId} assignment={assignment}/>)
        : <div className="p-4 text-center">There are no assignments for this group.</div>;
    const quizTabComponents = quizAssignments.length > 0
        ? quizAssignments.map(quizAssignment => <QuizDetails key={quizAssignment.id} quizAssignment={quizAssignment} />)
        : <div className="p-4 text-center">There are no tests assigned to this group.</div>;

    return <div className={"assignment-progress-details" + (pageSettings.colourBlind ? " colour-blind" : "")}>
        <AssignmentProgressLegend showQuestionKey={activeTab === MARKBOOK_TYPE_TAB.tests} />
        {/* Only full teachers on Isaac Physics can see the tests tab */}
        {pageSettings.isTeacher && isPhy
            ? <Tabs className="my-4 mb-5" tabContentClass="mt-4" activeTabOverride={activeTab} onActiveTabChange={setActiveTab}>
                {{
                    [`Assignments (${assignments.length || 0})`]: assignmentTabComponents,
                    [`Tests (${quizAssignments.length || 0})`]: quizTabComponents
                }}
            </Tabs>
            : assignmentTabComponents
        }
    </div>;
};

function getGroupProgressCSVDownloadLink(groupId: number) {
    return API_PATH + "/assignments/assign/group/" + groupId + "/progress/download";
}

function getGroupQuizProgressCSVDownloadLink(groupId: number) {
    return API_PATH + "/quiz/group/" + groupId + "/download";
}

export const GroupAssignmentProgress = ({group}: {group: AppGroup}) => {
    const dispatch = useAppDispatch();
    const [isExpanded, setExpanded] = useState(false);

    const openDownloadLink = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
        event.stopPropagation();
        event.preventDefault();
        dispatch(openActiveModal(downloadLinkModal(event.currentTarget.href)));
    }, [dispatch]);

    const pageSettings = useContext(AssignmentProgressPageSettingsContext);
    const {assignmentCount} = useGroupAssignmentSummary(group.id);

    return <>
        <div  onClick={() => setExpanded(!isExpanded)} className={isExpanded ? "assignment-progress-group active align-items-center" : "assignment-progress-group align-items-center"}>
            <div className="group-name"><span className="icon-group"/><span data-testid={"group-name"}>{group.groupName}</span></div>
            <div className="flex-grow-1" />
            <div className="py-2"><strong>{assignmentCount}</strong> {siteSpecific("Assignment", "Quiz")}{assignmentCount != 1 && siteSpecific("s", "zes")}<span className="d-none d-md-inline"> set</span></div>
            <div className="d-none d-md-inline-block"><a className={"download-csv-link"} href={getGroupProgressCSVDownloadLink(group.id as number)} target="_blank" rel="noopener" onClick={openDownloadLink}>
                (Download Group {siteSpecific("Assignments", "Quizzes")} CSV)
            </a></div>
            {pageSettings.isTeacher && isPhy && <div className="d-none d-md-inline-block"><a href={getGroupQuizProgressCSVDownloadLink(group.id as number)} target="_blank" rel="noopener" onClick={openDownloadLink}>(Download Group Test CSV)</a></div>}
            <Button color="link" className="px-2" tabIndex={0} onClick={() => setExpanded(!isExpanded)}>
                <img src={siteSpecific("/assets/icon-expand-arrow.png", "/assets/chevron-up.svg")} alt="" className="accordion-arrow" />
                <span className="sr-only">{isExpanded ? "Hide" : "Show"}{` ${group.groupName} assignments`}</span>
            </Button>
        </div>
        {isExpanded && <GroupDetails group={group} />}
    </>;
};

export function AssignmentProgress({user}: {user: RegisteredUserDTO}) {
    const dispatch = useAppDispatch();
    const groupsQuery = useGetGroupsQuery(false);
    const accessibilitySettings = useAssignmentProgressAccessibilitySettings({user});

    const [groupSortOrder, setGroupSortOrder] = useState<GroupSortOrder>(GroupSortOrder.Alphabetical);
    const [assignmentOrder, setAssignmentOrder] = useState<AssignmentOrderSpec>(AssignmentOrder.startDateDescending);

    const pageSettings = useMemo(() => ({
        ...accessibilitySettings,
        assignmentOrder,
    }), [assignmentOrder, accessibilitySettings]);

    useEffect(() => {
        // Don't attempt to load tests for tutors, they cannot manage them
        if (isTeacherOrAbove(user)) {
            dispatch(loadQuizAssignments());
        }
    }, [dispatch]);

    const pageHelp = <span>
        Click on your groups to see the {siteSpecific("assignments", "quizzes")} you have set. View your students&apos; progress by question.
    </span>;

    return <>
        <Container>
            <TitleAndBreadcrumb
                currentPageTitle={siteSpecific("Assignment Progress", "My markbook")}
                subTitle={"Track your group performance" + (isPhy ? " by question" : "")}
                help={pageHelp}
                modalId="assignment_progress_help"
            />
            {isAda && <PageFragment fragmentId={"markbook_help"} ifNotFound={RenderNothing} />}
            <div className="w-100 text-right">
                <InputGroup className="d-inline text-nowrap">
                    <Label className="pr-2 mt-1">Sort {siteSpecific("assignments", "quizzes")}:</Label>
                    <UncontrolledButtonDropdown size="sm">
                        <DropdownToggle color={siteSpecific("tertiary", "secondary")} className="border" caret size={siteSpecific("lg", "sm")}>
                            {assignmentOrder.type} ({assignmentOrder.order === SortOrder.ASC ? "ascending" : "descending"})
                        </DropdownToggle>
                        <DropdownMenu>
                            {Object.values(AssignmentOrder).map(item =>
                                <DropdownItem key={item.type + item.order} onClick={() => setAssignmentOrder(item)}>{item.type} ({item.order === SortOrder.ASC ? "ascending" : "descending"})</DropdownItem>
                            )}
                        </DropdownMenu>
                    </UncontrolledButtonDropdown>
                </InputGroup>
                <InputGroup className="d-inline text-nowrap ml-4">
                    <Label className="pr-2 mt-1">Sort groups:</Label>
                    <UncontrolledButtonDropdown size="sm">
                        <DropdownToggle color={siteSpecific("tertiary", "secondary")} className="border" caret size={siteSpecific("lg", "sm")}>
                            {groupSortOrder}
                        </DropdownToggle>
                        <DropdownMenu>
                            {Object.values(GroupSortOrder).map(item =>
                                <DropdownItem key={item} onClick={() => setGroupSortOrder(item)}>{item}</DropdownItem>
                            )}
                        </DropdownMenu>
                    </UncontrolledButtonDropdown>
                </InputGroup>
            </div>
        </Container>
        <ShowLoadingQuery
            query={groupsQuery}
            defaultErrorTitle={"Error fetching groups"}
            thenRender={(groups) => {
                const sortedGroups = groupSortOrder === GroupSortOrder.Alphabetical
                    ? sortBy(groups, g => g.groupName && g.groupName.toLowerCase())
                    : sortBy(groups, g => g.created).reverse();
                return <div className="assignment-progress-container mb-5">
                    <AssignmentProgressPageSettingsContext.Provider value={pageSettings}>
                        {sortedGroups.map(group => <GroupAssignmentProgress key={group.id} group={group}/>)}
                    </AssignmentProgressPageSettingsContext.Provider>
                    {sortedGroups.length === 0 && <Container className="py-5">
                        <h3 className="text-center">
                            You&apos;ll need to create a group using <Link to="/groups">Manage groups</Link> to set an assignment.
                        </h3>
                    </Container>}
                </div>;
            }}
        />
    </>;
}
