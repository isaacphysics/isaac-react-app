import React, {ComponentProps, useEffect, useLayoutEffect, useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../state/store";
import {
    Button,
    Col,
    Container,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Label,
    Row,
    UncontrolledButtonDropdown
} from "reactstrap"
import {loadAssignmentsOwnedByMe, loadBoard, loadGroups, loadProgress, openActiveModal} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {AppState} from "../../state/reducers";
import {orderBy, sortBy} from "lodash";
import {
    AppAssignmentProgress,
    AppGroup,
    EnhancedGameboard,
    PageSettings,
    SingleProgressDetailsProps
} from "../../../IsaacAppTypes";
import {selectors} from "../../state/selectors";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    AssignmentDTO,
    GameboardDTO,
    GameboardItem,
    GameboardItemState,
    QuizAssignmentDTO,
    QuizUserFeedbackDTO
} from "../../../IsaacApiTypes";
import {Link} from "react-router-dom";
import {API_PATH, MARKBOOK_TYPE_TAB} from "../../services/constants";
import {downloadLinkModal} from "../elements/modals/AssignmentProgressModalCreators";
import {formatDate} from "../elements/DateString";
import {siteSpecific} from "../../services/siteConstants";
import {getAssignmentCSVDownloadLink, hasGameboard} from "../../services/assignments";
import {getQuizAssignmentCSVDownloadLink} from "../../services/quiz";
import {usePageSettings} from "../../services/progress";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import {loadQuizAssignmentFeedback, loadQuizAssignments} from "../../state/actions/quizzes";
import {Tabs} from "../elements/Tabs";
import {isDefined, isFound} from "../../services/miscUtils";
import {formatMark, ICON, passMark, ResultsTable} from "../elements/quiz/QuizProgressCommon";

function selectGroups(state: AppState) {
    if (isDefined(state)) {
        const gameboards: {[id: string]: GameboardDTO} = {};
        if (isDefined(state.boards) && isDefined(state.boards.boards)) {
            for (const board of state.boards.boards.boards) {
                gameboards[board.id as string] = board;
            }
        }

        const assignmentsProgress = selectors.assignments.progress(state);
        const assignments: { [id: number]: EnhancedAssignment[] } = {};
        if (isDefined(state.assignmentsByMe)) {
            for (const assignment of state.assignmentsByMe) {
                const assignmentId = assignment._id as number;
                const enhancedAssignment: EnhancedAssignment = {
                    ...assignment,
                    _id: assignmentId,
                    gameboard: (assignment.gameboard || gameboards[assignment.gameboardId as string]) as EnhancedGameboard,
                    progress: assignmentsProgress && assignmentsProgress[assignmentId] || undefined,
                };
                const groupId = assignment.groupId as number;
                if (groupId in assignments) {
                    assignments[groupId].push(enhancedAssignment);
                } else {
                    assignments[groupId] = [enhancedAssignment];
                }
            }
        }

        const quizAssignments: { [id: number]: QuizAssignmentDTO[] } = {};
        const quizAssignmentsState = selectors.quizzes.assignments(state);
        if (isFound(quizAssignmentsState)) { // assigned by me
            for (const qa of quizAssignmentsState) {
                if (!isDefined(qa.groupId)) {
                    continue;
                }
                if (isDefined(quizAssignments[qa.groupId])) {
                    quizAssignments[qa.groupId].push(qa);
                } else {
                    quizAssignments[qa.groupId] = [qa];
                }
            }
        }

        const activeGroups = selectors.groups.active(state);
        if (activeGroups) {
            const activeGroupsWithAssignments = activeGroups.map(g => {
                return {
                    ...g,
                    assignments: assignments[g.id as number] || [],
                    quizAssignments: quizAssignments[g.id as number] || []
                };
            });
            return {
                groups: activeGroupsWithAssignments
            };
        }
    }
    return {
        groups: null
    };
}

type EnhancedAssignment = AssignmentDTO & {
    gameboard: EnhancedGameboard;
    _id: number;
    progress?: AppAssignmentProgress[];
};

type AppGroupWithAssignments = AppGroup & {assignments: EnhancedAssignment[], quizAssignments: QuizAssignmentDTO[]};

interface AssignmentProgressPageProps {
    groups: AppGroupWithAssignments[] | null;
}

enum SortOrder {
    "Alphabetical" = "Alphabetical",
    "Date Created" = "Date Created"
}

interface AssignmentProgressLegendProps {
    pageSettings: PageSettings;
    showQuestionKey?: boolean;
}

type GroupDetailsProps = AssignmentProgressPageProps & {
    group: AppGroupWithAssignments;
    pageSettings: PageSettings;
};

type AssignmentDetailsProps = GroupDetailsProps & {
    assignment: EnhancedAssignment; // We only show this when we have the gameboard loaded.
};

type ProgressDetailsProps = AssignmentDetailsProps & {
    progress: AppAssignmentProgress[];
};

export const ProgressDetails = (props: ProgressDetailsProps | SingleProgressDetailsProps) => {
    const {assignment, progress, pageSettings} = props;

    const [selectedQuestionNumber, setSelectedQuestion] = useState(0);
    const selectedQuestion = assignment.gameboard.contents[selectedQuestionNumber];

    type SortOrder = number | "name" | "totalQuestionPartPercentage" | "totalQuestionPercentage";
    const [sortOrder, setSortOrder] = useState<SortOrder>("name");
    const [reverseOrder, setReverseOrder] = useState(false);
    const [singleQuestionSort, setSingleQuestionSort] = useState(false);

    // Calculate 'class average', which isn't an average at all, it's the percentage of ticks per question.
    const questions = assignment.gameboard.contents;
    const assignmentAverages: number[] = [];
    let assignmentTotalQuestionParts = 0;

    for (const i in questions) {
        const q = questions[i];
        let tickCount = 0;

        for (let j = 0; j < progress.length; j++) {
            const studentResults = progress[j].results;

            if (studentResults[i] === "PASSED" || studentResults[i] === "PERFECT") {
                tickCount++;
            }
        }

        const tickPercent = Math.round(100 * (tickCount / progress.length));
        assignmentAverages.push(tickPercent);
        assignmentTotalQuestionParts += q.questionPartsTotal;
    }

    // Calculate student totals and gameboard totals
    let studentsCorrect = 0;
    for (let j = 0; j < progress.length; j++) {

        const studentProgress = progress[j];

        if (progress[j].user.authorisedFullAccess) {

            studentProgress.tickCount = 0;
            studentProgress.correctQuestionPartsCount = 0;
            studentProgress.incorrectQuestionPartsCount = 0;
            studentProgress.notAttemptedPartResults = [];

            for (const i in studentProgress.results) {
                if (studentProgress.results[i] === "PASSED" || studentProgress.results[i] === "PERFECT") {
                    studentProgress.tickCount++;
                }
                studentProgress.correctQuestionPartsCount += studentProgress.correctPartResults[i];
                studentProgress.incorrectQuestionPartsCount += studentProgress.incorrectPartResults[i];
                studentProgress.notAttemptedPartResults.push(questions[i].questionPartsTotal - studentProgress.correctPartResults[i] - studentProgress.incorrectPartResults[i]);
            }

            if (studentProgress.tickCount == questions.length) {
                studentsCorrect++;
            }
        }
    }

    const semiSortedProgress = orderBy(progress, (item) => {
        return item.user.authorisedFullAccess && item.notAttemptedPartResults.reduce(function(sum, increment) {return sum + increment;}, 0);
    }, [reverseOrder ? "desc" : "asc"]);

    const sortedProgress = orderBy((singleQuestionSort ? progress : semiSortedProgress), (item) => {
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
    }, [reverseOrder ? "desc" : "asc"]);

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
            <strong>{studentsCorrect}</strong> of <strong>{progress.length}</strong> students have completed the gameboard <Link to={`/gameboards#${assignment.gameboardId}`}>{assignment.gameboard.title}</Link> correctly.
        </div>
        {progress.length > 0 && <>
            <div className="progress-questions">
                <Button color="tertiary" disabled={selectedQuestionNumber == 0}
                    onClick={() => setSelectedQuestion(selectedQuestionNumber - 1)}>◄</Button>
                <div><Link
                    to={`/questions/${selectedQuestion.id}?board=${assignment.gameboardId}`}><strong>Q<span className="d-none d-md-inline">uestion</span>: </strong>{selectedQuestion.title}
                </Link></div>
                <Button color="tertiary" disabled={selectedQuestionNumber == assignment.gameboard.contents.length - 1}
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
                                    {fullAccess ?
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

const ProgressLoader = (props: AssignmentDetailsProps) => {
    const dispatch = useAppDispatch();
    const {assignment} = props;

    useEffect( () => {
        dispatch(loadProgress(assignment));
    }, [dispatch, assignment._id]);

    const progress = assignment.progress;

    return progress ? <ProgressDetails {...props} progress={progress} />
        : <div className="p-4 text-center"><IsaacSpinner size="md" /></div>;
};

const AssignmentDetails = (props: AssignmentDetailsProps) => {
    const {assignment} = props;
    const dispatch = useAppDispatch();
    const [isExpanded, setIsExpanded] = useState(false);

    const assignmentPath = siteSpecific("assignment_progress", "my_markbook");

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

    return <div className="assignment-progress-gameboard" key={assignment.gameboardId}>
        <div className="gameboard-header" onClick={() => setIsExpanded(!isExpanded)}>
            <Button color="link" className="gameboard-title align-items-center" onClick={() => setIsExpanded(!isExpanded)}>
                <span>{assignment.gameboard.title}{assignment.dueDate && <span className="gameboard-due-date">(Due:&nbsp;{formatDate(assignment.dueDate)})</span>}</span>
            </Button>
            <div className="gameboard-links align-items-center">
                <Button color="link" className="mr-md-0">{isExpanded ? "Hide " : "View "} <span className="d-none d-lg-inline">mark sheet</span></Button>
                <span className="d-none d-md-inline">,</span>
                <Button className="d-none d-md-inline" color="link" tag="a" href={getAssignmentCSVDownloadLink(assignment._id)} onClick={openAssignmentDownloadLink}>Download CSV</Button>
                <span className="d-none d-md-inline">or</span>
                <Button className="d-none d-md-inline" color="link" tag="a" href={`/${assignmentPath}/${assignment._id}`} onClick={openSingleAssignment}>View individual assignment</Button>
            </div>
        </div>
        {isExpanded && <ProgressLoader {...props} />}
    </div>
};

export const AssignmentProgressLegend = (props: AssignmentProgressLegendProps) => {
    const {pageSettings, showQuestionKey} = props;
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

const QuizProgressLoader = (props: { quizAssignment: QuizAssignmentDTO }) => {
    const dispatch = useAppDispatch();
    const { quizAssignment } = props;
    const quizAssignmentId = isDefined(quizAssignment.id) ? quizAssignment.id : null;
    const quizAssignments = useAppSelector(selectors.quizzes.assignments);

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
        ? <QuizProgressDetails {...props} userFeedback={userFeedback} />
        : <div className="p-4 text-center"><IsaacSpinner size="md" /></div>;
};

const QuizProgressDetails = (props: { quizAssignment: QuizAssignmentDTO, userFeedback: QuizUserFeedbackDTO[] }) => {
    const pageSettings = usePageSettings();
    const { quizAssignment } = props;

    return <div className={`assignment-progress-details bg-transparent ${pageSettings.colourBlind ? " colour-blind" : ""}`}>
        <ResultsTable assignment={quizAssignment} pageSettings={pageSettings} />
    </div>
}

const QuizDetails = (props: { quizAssignment: QuizAssignmentDTO }) => {
    const { quizAssignment } = props;
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
        {(isExpanded) && <QuizProgressLoader {...props} />}
    </div> : null;
};

const GroupDetails = (props: GroupDetailsProps) => {
    const dispatch = useAppDispatch();
    const {group, pageSettings} = props;
    const [activeTab, setActiveTab] = useState(MARKBOOK_TYPE_TAB.assignments);

    const gameboardIs = group.assignments.map(assignment => assignment.gameboardId as string);
    const joinedGameboardIds = gameboardIs.join(",");
    useEffect( () => {
        gameboardIs.forEach(gameboardId => dispatch(loadBoard(gameboardId)));
    }, [joinedGameboardIds]);

    function activeTabChanged(tabIndex: number) {
        setActiveTab(tabIndex);
    }

    const gameboardsLoaded = group.assignments.every(assignment => assignment.gameboard != null);

    let groupAssignments: JSX.Element | JSX.Element[] = <div className="p-4 text-center"><IsaacSpinner size="md" /></div>;
    if (gameboardsLoaded) {
        if (group.assignments.length > 0) {
            groupAssignments = group.assignments.map(assignment => hasGameboard(assignment) && <AssignmentDetails key={assignment.gameboardId} {...props} assignment={assignment}/>).filter(e => e) as JSX.Element[];
        } else {
            groupAssignments = <div className="p-4 text-center">There are no assignments for this group.</div>
        }
    }
    let groupTests: JSX.Element | JSX.Element[];
    if (isDefined(group.quizAssignments) && Array.isArray(group.quizAssignments) && group.quizAssignments.length > 0) {
        groupTests = group.quizAssignments.map(quizAssignment => <QuizDetails key={quizAssignment.id} /*{...props}*/ quizAssignment={quizAssignment} />);
    } else {
        groupTests = <div className="p-4 text-center">There are no tests assigned to this group.</div>
    }

    return <div className={"assignment-progress-details" + (pageSettings.colourBlind ? " colour-blind" : "")}>
        <AssignmentProgressLegend pageSettings={pageSettings} showQuestionKey={activeTab === MARKBOOK_TYPE_TAB.tests} />
        <Tabs className="my-4 mb-5" tabContentClass="mt-4" activeTabOverride={activeTab} onActiveTabChange={activeTabChanged}>{{
            [`Assignments (${(Array.isArray(groupAssignments) && groupAssignments.length) || 0})`]: groupAssignments,
            [`Tests (${(Array.isArray(groupTests) && groupTests.length) || 0})`]: groupTests
        }}</Tabs>
    </div>;
};

function getGroupProgressCSVDownloadLink(groupId: number) {
    return API_PATH + "/assignments/assign/group/" + groupId + "/progress/download";
}

function getGroupQuizProgressCSVDownloadLink(groupId: number) {
    return API_PATH + "/quiz/group/" + groupId + "/download";
}

const GroupAssignmentProgress = (props: GroupDetailsProps) => {
    const dispatch = useAppDispatch();
    const {group} = props;
    const [isExpanded, setExpanded] = useState(false);

    const assignmentCount = group.assignments.length;

    function openGroupDownloadLink(event: React.MouseEvent<HTMLAnchorElement>) {
        event.stopPropagation();
        event.preventDefault();
        dispatch(openActiveModal(downloadLinkModal(event.currentTarget.href)));
    }

    function openGroupQuizDownloadLink(event: React.MouseEvent<HTMLAnchorElement>) {
        event.stopPropagation();
        event.preventDefault();
        dispatch(openActiveModal(downloadLinkModal(event.currentTarget.href)));
    }

    return <>
        <div onClick={() => setExpanded(!isExpanded)} className={isExpanded ? "assignment-progress-group active align-items-center" : "assignment-progress-group align-items-center"}>
            <div className="group-name"><span className="icon-group"/><span>{group.groupName}</span></div>
            <div className="flex-grow-1" />
            <div className="py-2"><strong>{assignmentCount}</strong> Assignment{assignmentCount != 1 && "s"}<span className="d-none d-md-inline"> set</span></div>
            <div className="d-none d-md-inline-block"><a href={getGroupProgressCSVDownloadLink(group.id as number)} target="_blank" rel="noopener" onClick={openGroupDownloadLink}>(Download Group Assignments CSV)</a></div>
            <div className="d-none d-md-inline-block"><a href={getGroupQuizProgressCSVDownloadLink(group.id as number)} target="_blank" rel="noopener" onClick={openGroupQuizDownloadLink}>(Download Group Test CSV)</a></div>
            <Button color="link" className="px-2" tabIndex={0} onClick={() => setExpanded(!isExpanded)}>
                <img src="/assets/icon-expand-arrow.png" alt="" className="accordion-arrow" />
                <span className="sr-only">{isExpanded ? "Hide" : "Show"}{` ${group.groupName} assignments`}</span>
            </Button>
        </div>
        {isExpanded && <GroupDetails {...props} />}
    </>;
};

export function AssignmentProgress(props: AssignmentProgressPageProps) {
    const dispatch = useAppDispatch();
    const {groups} = useAppSelector(selectGroups);
    const pageSettings = usePageSettings();

    const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.Alphabetical);

    let data = groups;
    if (data) {
        switch(sortOrder) {
            case SortOrder.Alphabetical:
                data = sortBy(data, g => g.groupName && g.groupName.toLowerCase());
                break;
            case SortOrder["Date Created"]:
                data = sortBy(data, g => g.created).reverse();
                break;
        }
    }

    useEffect(() => {
        dispatch(loadGroups(false));
        dispatch(loadAssignmentsOwnedByMe());
        dispatch(loadQuizAssignments());
    }, [dispatch]);

    const pageHelp = <span>
        Click on your groups to see the assignments you have set. View your students' progress by question.
    </span>;

    return <>
        <Container>
            <TitleAndBreadcrumb
                currentPageTitle={siteSpecific("Assignment Progress", "My markbook")}
                subTitle="Track your group performance by question"
                help={pageHelp}
                modalId="assignment_progress_help"
            />
            <Row className="align-items-center d-none d-md-flex">
                <Col className="text-right">
                    <Label className="pr-2">Sort groups:</Label>
                    <UncontrolledButtonDropdown size="sm">
                        <DropdownToggle color="tertiary" className="border" caret>
                            {sortOrder}
                        </DropdownToggle>
                        <DropdownMenu>
                            {Object.values(SortOrder).map(item =>
                                <DropdownItem key={item} onClick={() => setSortOrder(item)}>{item}</DropdownItem>
                            )}
                        </DropdownMenu>
                    </UncontrolledButtonDropdown>
                </Col>
            </Row>
        </Container>
        <div className="assignment-progress-container mb-5">
            <ShowLoading until={data}>
                {data && data.map(group => <GroupAssignmentProgress key={group.id} {...props} group={group} pageSettings={pageSettings} />)}
                {data && data.length == 0 && <Container className="py-5">
                    <h3 className="text-center">
                        You&apos;ll need to create a group using <Link to="/groups">Manage groups</Link> to set an assignment.
                    </h3>
                </Container>}
            </ShowLoading>
        </div>
    </>;
}
