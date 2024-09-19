import React, {
    useCallback,
    useContext,
    useMemo,
    useState
} from "react";
import {
    openActiveModal,
    useAppDispatch,
    useGetAssignmentProgressQuery,
    useGetGroupsQuery,
    useGetQuizAssignmentWithFeedbackQuery,
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
} from "reactstrap";
import sortBy from "lodash/sortBy";
import {
    AuthorisedAssignmentProgress,
    AppGroup,
    AssignmentOrder,
    AssignmentOrderSpec,
    AssignmentProgressPageSettingsContext,
    EnhancedAssignment,
    EnhancedAssignmentWithProgress
} from "../../../IsaacAppTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    AssignmentProgressDTO,
    GameboardItem,
    GameboardItemState,
    QuizAssignmentDTO,
    RegisteredUserDTO
} from "../../../IsaacApiTypes";
import {Link} from "react-router-dom";
import {
    API_PATH,
    below,
    getAssignmentCSVDownloadLink,
    getAssignmentStartDate,
    getQuizAssignmentCSVDownloadLink,
    hasAssignmentStarted,
    isAuthorisedFullAccess,
    isDefined,
    isPhy,
    MARKBOOK_TYPE_TAB,
    PATHS,
    siteSpecific,
    SortOrder,
    useAssignmentProgressAccessibilitySettings,
    useDeviceSize
} from "../../services";
import {downloadLinkModal} from "../elements/modals/AssignmentProgressModalCreators";
import {formatDate} from "../elements/DateString";
import {Tabs} from "../elements/Tabs";
import {ICON, passMark, ResultsTable} from "../elements/quiz/QuizProgressCommon";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import classNames from "classnames";
import {PageFragment} from "../elements/PageFragment";
import {RenderNothing} from "../elements/RenderNothing";
import { QuizProgressDetails } from "./quizzes/QuizTeacherFeedback";

enum GroupSortOrder {
    Alphabetical = "Alphabetical",
    DateCreated = "Date Created"
}

export const ProgressDetails = ({assignment}: {assignment: EnhancedAssignmentWithProgress}) => {

    const questions = assignment.gameboard.contents;

    const progressData = useMemo<[AssignmentProgressDTO, boolean][]>(() => assignment.progress.map(p => {
        if (!isAuthorisedFullAccess(p)) return [p, false];

        const initialState = {
            ...p,
            tickCount: 0,
            correctQuestionPartsCount: 0,
            incorrectQuestionPartsCount: 0,
            notAttemptedPartResults: []
        };

        const ret = (p.results || []).reduce<AuthorisedAssignmentProgress>((oldP, results, i) => {
                const tickCount = ["PASSED", "PERFECT"].includes(results) ? oldP.tickCount + 1 : oldP.tickCount;
                const questions = assignment.gameboard.contents;
                return {
                    ...oldP,
                    tickCount,
                    correctQuestionPartsCount: oldP.correctQuestionPartsCount + (p.correctPartResults || [])[i],
                    incorrectQuestionPartsCount: oldP.incorrectQuestionPartsCount + (p.incorrectPartResults || [])[i],
                    notAttemptedPartResults: [
                        ...oldP.notAttemptedPartResults,
                        (questions[i].questionPartsTotal - (p.correctPartResults || [])[i] - (p.incorrectPartResults || [])[i])
                    ]
                };
            }, initialState);
        return [ret, questions.length === ret.tickCount];
    }), [assignment.gameboard.contents, assignment.progress, questions.length]);

    const progress = progressData.map(pd => pd[0]);
    const noStudentsAttemptedAll = progress.reduce((sa, p) => sa + (isAuthorisedFullAccess(p) && p.notAttemptedPartResults.every(v => v === 0) ? 1 : 0), 0);
    
    // Calculate 'class average', which isn't an average at all, it's the percentage of ticks per question.
    const [assignmentAverages, assignmentTotalQuestionParts] = useMemo<[number[], number]>(() => {
        return questions?.reduce(([aAvg, aTQP], q, i) => {
            const tickCount = progress.reduce((tc, p) => ["PASSED", "PERFECT"].includes((p.results || [])[i]) ? tc + 1 : tc, 0);
            const tickPercent = Math.round(100 * (tickCount / progress.length));
            return [[...aAvg, tickPercent], aTQP + (q.questionPartsTotal ?? 0)];
        }, [[] as number[], 0]) ?? [[], 0];
    }, [questions, progress]);

    function markClassesInternal(studentProgress: AssignmentProgressDTO, status: GameboardItemState | null, correctParts: number, incorrectParts: number, totalParts: number) {
        if (!isAuthorisedFullAccess(studentProgress)) {
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

    function markClasses(studentProgress: AssignmentProgressDTO, totalParts: number) {
        if (!isAuthorisedFullAccess(studentProgress)) {
            return "revoked";
        }

        const correctParts = studentProgress.correctQuestionPartsCount;
        const incorrectParts = studentProgress.incorrectQuestionPartsCount;
        const status = null;

        return markClassesInternal(studentProgress, status, correctParts, incorrectParts, totalParts);
    }

    function markQuestionClasses(studentProgress: AssignmentProgressDTO, index: number) {
        if (!isAuthorisedFullAccess(studentProgress)) {
            return "revoked";
        }


        const question = questions[index];

        const totalParts = question.questionPartsTotal;
        const correctParts = (studentProgress.correctPartResults || [])[index];
        const incorrectParts = (studentProgress.incorrectPartResults || [])[index];
        const status = (studentProgress.results || [])[index];

        return markClassesInternal(studentProgress, status, correctParts, incorrectParts, totalParts);
    }

    const tableHeader = <div className="progress-header">
        <strong>{noStudentsAttemptedAll}</strong> of <strong>{progress.length}</strong>
        {` students attempted all questions in `}
        <Link to={`${PATHS.GAMEBOARD}#${assignment.gameboardId}`}>{assignment.gameboard.title}</Link>.
    </div>;
        
    const getQuestionTitle = (question: GameboardItem) => {
        return <Link to={`/questions/${question.id}?board=${assignment.gameboardId}`}>
            <strong>Q<span className="d-none d-md-inline">uestion</span>: </strong>{question.title}
        </Link>;
    };

    return <ResultsTable<GameboardItem> assignmentId={assignment.id} progress={progress} questions={questions} header={tableHeader} getQuestionTitle={getQuestionTitle} 
    assignmentAverages={assignmentAverages} assignmentTotalQuestionParts={assignmentTotalQuestionParts} markClasses={markClasses} markQuestionClasses={markQuestionClasses}
    isAssignment={true}/>;
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
            <Button color="link" className="gameboard-title align-items-center" onClick={() => setIsExpanded(!isExpanded)} alt={`Expand assignment ${assignment.gameboard?.title}`}>
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
                <Button className="d-none d-md-inline me-0" color="link" tag="a" href={getAssignmentCSVDownloadLink(assignment.id as number)} onClick={openAssignmentDownloadLink}>
                    Download CSV
                </Button>
                <span className="d-none d-md-inline mx-1">&middot;</span>
                <Button className="d-none d-md-inline" color="link" tag="a" href={`${PATHS.ASSIGNMENT_PROGRESS}/${assignment.id}`} onClick={openSingleAssignment}>
                    View individual assignment
                </Button>
                <img src={"/assets/common/icons/chevron-up.svg"} alt="" className={classNames("accordion-arrow", {"active" : isExpanded})}/>
            </div>
        </div>
        {isExpanded && <ProgressLoader assignment={assignment} />}
    </div>;
};

const QuestionKey = ({icon, description}: {icon: React.JSX.Element, description?: string}) => {
    return <li className="d-flex flex-column flex-md-row flex-wrap px-1 align-items-center justify-content-center">
        <div className="key-cell me-0 me-md-2">{icon}</div>
        {description && <div className="key-description">{description}</div>}
    </li>;
};

const LegendKey = ({cellClass, description}: {cellClass: string, description?: string}) => {
    return <li className="d-flex flex-row flex-md-column flex-lg-row flex-wrap px-1 py-1 py-md-2 justify-content-start justify-content-md-center align-items-center">
        <div className="key-cell d-flex me-2 me-md-0 me-lg-2"><span className={cellClass}/></div>
        {description && <div className="key-description">{description}</div>}
    </li>;
};

export const AssignmentProgressLegend = ({showQuestionKey}: {showQuestionKey?: boolean}) => {
    const pageSettings = useContext(AssignmentProgressPageSettingsContext);
    return <div className="p-4"><div className="assignment-progress-legend">
        {showQuestionKey && <>
            <Label htmlFor="question-key">Question key:</Label>
            <ul id="question-key" className="block-grid-xs-3">
                <QuestionKey icon={ICON.correct} description="Correct"/>
                <QuestionKey icon={ICON.notAttempted} description="Not&nbsp;attempted"/>
                <QuestionKey icon={ICON.incorrect} description="Incorrect"/>
            </ul>
        </>}
        {showQuestionKey && <Label htmlFor="key" className="mt-2">Section key:</Label>}
        <div className="d-flex flex-row flex-sm-column justify-content-between">
            <ul id="key" className="block-grid-xs-1 block-grid-sm-2 block-grid-md-5 flex-grow-1 pe-2 ps-0 ps-sm-2 m-0">
                <LegendKey cellClass="completed" description={`100% correct`}/>
                <LegendKey cellClass="passed" description={`≥${passMark * 100}% correct`}/>
                <LegendKey cellClass="in-progress" description={`<${passMark * 100}% correct`}/>
                <LegendKey cellClass="" description={`Not attempted`}/>
                <LegendKey cellClass="failed" description={`>${100 - (passMark * 100)}% incorrect`}/>
            </ul>
            <div className="d-flex flex-column flex-sm-row assignment-progress-options justify-content-end">
                <label>Colour-blind&nbsp;<input type="checkbox" checked={pageSettings.colourBlind} onChange={e => pageSettings.setColourBlind(e.target.checked)}/></label>
                <label>Percent view&nbsp;<input type="checkbox" checked={pageSettings.formatAsPercentage} onChange={e => pageSettings.setFormatAsPercentage(e.target.checked)}/></label>
            </div>
        </div>
    </div></div>;
};

const QuizProgressLoader = ({quizAssignmentId}: { quizAssignmentId: number }) => {
    const quizAssignmentFeedbackQuery = useGetQuizAssignmentWithFeedbackQuery(quizAssignmentId);
    const pageSettings = useContext(AssignmentProgressPageSettingsContext);
    return <ShowLoadingQuery
        query={quizAssignmentFeedbackQuery}
        defaultErrorTitle={"Error loading test assignment feedback"}
        thenRender={quizAssignmentWithFeedback => 
            <div className={`assignment-progress-details bg-transparent ${pageSettings.colourBlind ? " colour-blind" : ""}`}>
                <QuizProgressDetails assignment={quizAssignmentWithFeedback} />
            </div>
        }
    />;
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

    const quizAssignmentHasNotStarted = quizAssignment.scheduledStartDate && quizAssignment.scheduledStartDate.valueOf() > Date.now();

    return isDefined(quizAssignment.id) && quizAssignment.id > 0 ? <div className="assignment-progress-gameboard" key={quizAssignment.id}>
        <div className={classNames("gameboard-header", {"text-muted": quizAssignmentHasNotStarted})} onClick={() => setIsExpanded(!isExpanded)}>
            <Button color="link" className="gameboard-title align-items-center" onClick={() => setIsExpanded(!isExpanded)}>
                <span className={classNames({"text-muted": quizAssignmentHasNotStarted})}>
                    {quizAssignment.quizSummary?.title || "This test has no title"}
                    {quizAssignmentHasNotStarted && <span className="gameboard-due-date">
                        (Scheduled:&nbsp;{formatDate(quizAssignment.scheduledStartDate)})
                    </span>}
                    {isDefined(quizAssignment.dueDate) && <span className="gameboard-due-date">
                        (Due:&nbsp;{formatDate(quizAssignment.dueDate)})
                    </span>}
                </span>
            </Button>
            <div className="gameboard-links align-items-center">
                <Button className="d-none d-md-inline me-0" color="link" tag="a" href={getQuizAssignmentCSVDownloadLink(quizAssignment.id)} onClick={openAssignmentDownloadLink}>
                    Download CSV
                </Button>
                <span className="d-none d-md-inline mx-1">&middot;</span>
                <Button className="d-none d-md-inline" color="link" tag="a" href={`/test/assignment/${quizAssignment.id}/feedback`} onClick={openSingleAssignment}>View individual test</Button>
                <img src={"/assets/common/icons/chevron-up.svg"} alt="" className={classNames("accordion-arrow", {"active" : isExpanded})}/>
            </div>
        </div>
        {isExpanded && <QuizProgressLoader key={quizAssignment.quizId} quizAssignmentId={quizAssignment.id} />}
    </div> : null;
};

const GroupDetails = ({group, user}: {group: AppGroup, user: RegisteredUserDTO}) => {
    const [activeTab, setActiveTab] = useState(MARKBOOK_TYPE_TAB.assignments);
    const pageSettings = useContext(AssignmentProgressPageSettingsContext);

    const {groupBoardAssignments, groupQuizAssignments} = useGroupAssignments(user, group.id, pageSettings.assignmentOrder);
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
        {/* Only full teachers can see the tests tab */}
        {pageSettings.isTeacher
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

export const GroupAssignmentProgress = ({group, user}: {group: AppGroup, user: RegisteredUserDTO}) => {
    const dispatch = useAppDispatch();
    const [isExpanded, setExpanded] = useState(false);

    const openDownloadLink = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
        event.stopPropagation();
        event.preventDefault();
        dispatch(openActiveModal(downloadLinkModal(event.currentTarget.href)));
    }, [dispatch]);

    const pageSettings = useContext(AssignmentProgressPageSettingsContext);
    const {assignmentCount} = useGroupAssignmentSummary(user, group.id);

    const deviceSize = useDeviceSize();

    return <>
        <div  onClick={() => setExpanded(!isExpanded)} className={isExpanded ? "assignment-progress-group active align-items-center" : "assignment-progress-group align-items-center"}>
            <div className={classNames("group-name ps-2 ps-md-3 justify-content-between", {"flex-grow-1" : below['xs'](deviceSize)})}>
                <div className="d-flex align-items-center">
                    <span className="icon-group"/>
                    <span data-testid={"group-name"}>{group.groupName}</span>
                </div>
                <div className="flex-grow-1 flex-grow-sm-0"/>
                <div className="d-block d-sm-none justify-self-end ms-2 assignment-count-pill">{assignmentCount}</div>
            </div>

            <div className="flex-sm-grow-1"/>

            <div className="d-none d-sm-block py-2"><strong>{assignmentCount}</strong> assignment{assignmentCount != 1 && "s"} or test{assignmentCount != 1 && "s"}<span className="d-none d-md-inline"> set</span></div>

            <div className="d-none d-lg-inline-block">
                <a className={"download-csv-link"} href={getGroupProgressCSVDownloadLink(group.id as number)} target="_blank" rel="noreferrer noopener" onClick={openDownloadLink}>
                    (Download group assignments CSV)
                </a>
                {pageSettings.isTeacher && <a className={"download-csv-link ms-2"} href={getGroupQuizProgressCSVDownloadLink(group.id as number)} target="_blank" rel="noreferrer noopener" onClick={openDownloadLink}>
                    (Download group tests CSV)
                </a>}
                <Button color="link" className="px-2" tabIndex={0} onClick={() => setExpanded(!isExpanded)}>
                    <img src={siteSpecific("/assets/common/icons/icon-expand-arrow.png", "/assets/common/icons/chevron-up.svg")} alt="" className="accordion-arrow" />
                    <span className="visually-hidden">{isExpanded ? "Hide" : "Show"}{` ${group.groupName} assignments`}</span>
                </Button>
            </div>
            <UncontrolledButtonDropdown className="d-flex d-lg-none p-0">
                <DropdownToggle caret className="text-nowrap" size="sm" color="link" onClick={e => e.stopPropagation()}>
                    Downloads
                </DropdownToggle>
                <DropdownMenu>
                    <a className={"download-csv-link mx-3 w-max-content"} href={getGroupProgressCSVDownloadLink(group.id as number)} target="_blank" rel="noreferrer noopener" onClick={openDownloadLink}>
                        Group assignments CSV
                    </a>
                    <DropdownItem divider />
                    {pageSettings.isTeacher && <a className={"download-csv-link mx-3 w-max-content"} href={getGroupQuizProgressCSVDownloadLink(group.id as number)} target="_blank" rel="noreferrer noopener" onClick={openDownloadLink}>
                        Group tests CSV
                    </a>}
                </DropdownMenu>
            </UncontrolledButtonDropdown>
        </div>
        {isExpanded && <GroupDetails group={group} user={user} />}
    </>;
};

export function AssignmentProgress({user}: {user: RegisteredUserDTO}) {
    const groupsQuery = useGetGroupsQuery(false);
    const accessibilitySettings = useAssignmentProgressAccessibilitySettings({user});

    const [groupSortOrder, setGroupSortOrder] = useState<GroupSortOrder>(GroupSortOrder.Alphabetical);
    const [assignmentOrder, setAssignmentOrder] = useState<AssignmentOrderSpec>(AssignmentOrder.startDateDescending);

    const pageSettings = useMemo(() => ({
        ...accessibilitySettings,
        assignmentOrder,
    }), [assignmentOrder, accessibilitySettings]);

    const pageHelp = <span>
        Click on your groups to see the assignments you have set. View your students&apos; progress by question.
    </span>;

    return <>
        <Container>
            <TitleAndBreadcrumb
                currentPageTitle={siteSpecific("Assignment Progress", "My markbook")}
                subTitle={"Track your group performance" + (isPhy ? " by question" : "")}
                help={pageHelp}
                modalId="help_modal_assignment_progress"
            />
            <PageFragment fragmentId={siteSpecific("help_toptext_assignment_progress", "markbook_help")} ifNotFound={RenderNothing} />
            <div className="w-100 text-end">
                <div className="d-inline text-nowrap">
                    <Label className="pe-2 mt-1">Sort assignments and tests:</Label>
                    <UncontrolledButtonDropdown size="sm">
                        <DropdownToggle color={siteSpecific("tertiary", "secondary")} caret size={siteSpecific("lg", "sm")}>
                            {assignmentOrder.type} ({assignmentOrder.order === SortOrder.ASC ? "ascending" : "descending"})
                        </DropdownToggle>
                        <DropdownMenu>
                            {Object.values(AssignmentOrder).map(item =>
                                <DropdownItem key={item.type + item.order} onClick={() => setAssignmentOrder(item)}>{item.type} ({item.order === SortOrder.ASC ? "ascending" : "descending"})</DropdownItem>
                            )}
                        </DropdownMenu>
                    </UncontrolledButtonDropdown>
                </div>
                <div className="d-inline text-nowrap ms-4">
                    <Label className="pe-2 mt-1">Sort groups:</Label>
                    <UncontrolledButtonDropdown size="sm">
                        <DropdownToggle color={siteSpecific("tertiary", "secondary")} caret size={siteSpecific("lg", "sm")}>
                            {groupSortOrder}
                        </DropdownToggle>
                        <DropdownMenu>
                            {Object.values(GroupSortOrder).map(item =>
                                <DropdownItem key={item} onClick={() => setGroupSortOrder(item)}>{item}</DropdownItem>
                            )}
                        </DropdownMenu>
                    </UncontrolledButtonDropdown>
                </div>
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
                        {sortedGroups.map(group => <GroupAssignmentProgress key={group.id} group={group} user={user} />)}
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
