import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import {Button} from "reactstrap";
import {AssignmentProgressPageSettingsContext, ProgressSortOrder} from "../../../../IsaacAppTypes";
import {isAda, isAuthorisedFullAccess, isPhy, scrollVerticallyIntoView, siteSpecific, TODAY} from "../../../services";
import {Link, useLocation, useNavigate} from "react-router-dom";
import orderBy from "lodash/orderBy";
import { IsaacSpinner } from "../../handlers/IsaacSpinner";
import { closeActiveModal, openActiveModal, useAppDispatch, useReturnQuizToStudentMutation } from "../../../state";
import { SortItemHeader } from "../SortableItemHeader";
import { AssignmentProgressDTO, CompletionState, QuestionPartState } from "../../../../IsaacApiTypes";
import classNames from "classnames";
import { Markup } from "../markup";

export const ICON = {
    correct: <i className={classNames("icon-md", siteSpecific("icon-correct", "icon-correctness-correct"))}/>,
    incorrect: <i className={classNames("icon-md", siteSpecific("icon-incorrect", "icon-correctness-incorrect"))}/>,
    notAttempted: <i className={classNames("icon-md", siteSpecific("icon-not-attempted", "icon-correctness-not-attempted"))}/>,
    partial: <i className={classNames("icon-md", siteSpecific("icon-in-progress", "icon-correctness-partial"))}/>,
};

export const passMark = 0.75;

export function formatMark(numerator: number, denominator: number, formatAsPercentage: boolean) {
    let result;
    if (formatAsPercentage) {
        result = denominator !== 0 ? Math.round(100 * numerator / denominator) + "%" : "100%";
    } else {
        result = numerator + "/" + denominator;
    }
    return result;
}

export const generateCorrectnessIcon = (correct: number, incorrect: number, notAttempted: number, totalParts: number) => {
    if (correct === totalParts) {
        return ICON.correct;
    } else if (notAttempted === totalParts) {
        return ICON.notAttempted;
    } else if (correct === 0) {
        return ICON.incorrect;
    } else {
        return ICON.partial;
    }
};

const getAssignmentQuestionCorrectnessIcon = (state: CompletionState, attemptedOrCorrect: "ATTEMPTED" | "CORRECT") => {
    if (attemptedOrCorrect === "CORRECT") {
        switch (state) {
            case CompletionState.ALL_CORRECT:
                return ICON.correct;
            case CompletionState.ALL_INCORRECT:
                return ICON.incorrect;
            case CompletionState.ALL_ATTEMPTED:
            case CompletionState.IN_PROGRESS:
                return ICON.partial;
            case CompletionState.NOT_ATTEMPTED:
                return ICON.notAttempted;
        }
    } else {
        switch (state) {
            case CompletionState.ALL_CORRECT:
            case CompletionState.ALL_ATTEMPTED:
            case CompletionState.ALL_INCORRECT:
                return ICON.correct;
            case CompletionState.IN_PROGRESS:
                return ICON.partial;
            case CompletionState.NOT_ATTEMPTED:
                return ICON.notAttempted;
        }
    }

};

const getQuizQuestionCorrectnessIcon = (attemptedOrCorrect: "ATTEMPTED" | "CORRECT", studentProgress: AssignmentProgressDTO, questionIndex: number) => {
    if (attemptedOrCorrect === "CORRECT") {
        if ((studentProgress.correctPartResults || [])[questionIndex] === 1) {
            return ICON.correct;
        }
        else if ((studentProgress.incorrectPartResults || [])[questionIndex] === 1) {
            return ICON.incorrect;
        }
        return ICON.notAttempted;
    } else {
        if ((studentProgress.correctPartResults || [])[questionIndex] === 1 || (studentProgress.incorrectPartResults || [])[questionIndex] === 1) {
            return ICON.correct;
        }
        return ICON.notAttempted;
    }
};

export const getQuizQuestionPartCorrectnessIcon = (state: QuestionPartState) => {
    switch (state) {
        case "CORRECT":
            return ICON.correct;
        case "INCORRECT":
            return ICON.incorrect;
        case "NOT_ATTEMPTED":
            return ICON.notAttempted;
    }
};

function questionPartResultToNumber(partResult: QuestionPartState | undefined): number {
    switch (partResult) {
        case "CORRECT":
            return 1;
        case "INCORRECT":
            return 0;
        default:
            return -1;
    }
}

const sortByName = ((item: AssignmentProgressDTO): string => {
    return (item.user?.familyName + ", " + item.user?.givenName).toLowerCase();
});

const sortByNotAttemptedParts = ((questionIndex: number, item: AssignmentProgressDTO): number => {
    if (!isAuthorisedFullAccess(item)) return -Infinity;
    return item.notAttemptedPartResults[questionIndex];
});

export interface QuestionType {
    id?: string | undefined;
    title?: string | undefined;
    questionPartsTotal?: number | undefined;
}

export interface ResultsTableProps<Q extends QuestionType> {
    assignmentId?: number;
    duedate?: Date | number;
    progress?: AssignmentProgressDTO[];
    questions: Q[];
    assignmentTotalQuestionParts: number;
    markClasses: (row: AssignmentProgressDTO, assignmentTotalQuestionParts: number) => string;
    markQuestionClasses: (row: AssignmentProgressDTO, questionIndex: number) => string;
    isAssignment?: boolean;
    boardId?: string;
}

export function ResultsTable<Q extends QuestionType>({
    assignmentId,
    duedate,
    progress,
    questions,
    assignmentTotalQuestionParts,
    markClasses,
    markQuestionClasses,
    isAssignment,
    boardId,
} : ResultsTableProps<Q>) {

    const pageSettings = useContext(AssignmentProgressPageSettingsContext);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const [dropdownOpen, setDropdownOpen] = useState(progress?.map(() => false));
    const toggle = (index: number) => setDropdownOpen(dropdownOpen?.map((value, i) => i === index ? !value : value));

    const [returnQuizToStudent, {isLoading: returningQuizToStudent}] = useReturnQuizToStudentMutation();
    const returnToStudent = (userId?: number) => {
        const confirm = () => {
            void returnQuizToStudent({quizAssignmentId: assignmentId as number, userId: userId as number})
                .then(() => dispatch(closeActiveModal()));
            void navigate({...location, hash: `${userId}`});
        };
        dispatch(openActiveModal({
            closeAction: () => dispatch(closeActiveModal()),
            title: "Allow another attempt?",
            body: "This will allow the student to attempt the test again.",
            buttons: [
                <Button key={1} color="keyline" target="_blank" onClick={() => dispatch(closeActiveModal())}>
                    Cancel
                </Button>,
                <Button key={0} color="solid" target="_blank" onClick={confirm}>
                    Confirm
                </Button>,
            ]
        }));
    };

    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | undefined>(undefined);

    const [sortOrder, setSortOrder] = useState<ProgressSortOrder>("name");
    const [reverseOrder, setReverseOrder] = useState(false);

    useEffect(() => {
        // scroll to the student inside the table when the table reloads
        const resetStudent = location.hash ? document.getElementById(location.hash.substring(1)) : null;
        if (resetStudent && scrollContainerRef.current && resetStudent?.offsetTop !== undefined) {
            scrollContainerRef.current.scrollTop = resetStudent.offsetTop - 64; // seems to scroll slightly too far; 64px offset to account
            scrollVerticallyIntoView(scrollContainerRef.current);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(progress)]);

    function toggleSort(itemOrder: ProgressSortOrder) {
        setSortOrder(itemOrder);
        if (sortOrder === itemOrder) {
            setReverseOrder(!reverseOrder);
        } else {
            setReverseOrder(false);
        }
    }

    const sortBySelectedSortOrder = useCallback((item: AssignmentProgressDTO): string | number => {
        if (!isAuthorisedFullAccess(item)) return reverseOrder ? -Infinity : Infinity;
        switch (sortOrder) {
            case "name":
                return sortByName(item);
            case "totalPartPercentage":
                return -item.correctQuestionPartsCount;
            case "totalAttemptedPartPercentage":
                return -(item.correctQuestionPartsCount + item.incorrectQuestionPartsCount);
            case "totalQuestionPercentage":
                return -item.correctQuestionPagesCount;
            case "totalAttemptedQuestionPercentage":
                // note that this one is reversed – there is no negative as we want the ones with the fewest not attempted (i.e. most attempted) to be at the top
                return item.notAttemptedPartResults?.reduce((acc, curr) => acc + curr, 0) || 0;
            default:
                if (pageSettings?.attemptedOrCorrect === "CORRECT") {
                    return -(item.correctPartResults || [])[sortOrder];
                } else {
                    return (item.notAttemptedPartResults || [])[sortOrder];
                }
        }
    }, [pageSettings?.attemptedOrCorrect, reverseOrder, sortOrder]);

    const sortedProgress = useMemo(() => orderBy(progress,
        typeof sortOrder === "number"
            ? [sortBySelectedSortOrder, sortByNotAttemptedParts.bind(null, sortOrder), sortByName]
            : [sortBySelectedSortOrder, sortByName],
        typeof sortOrder === "number"
            ? [(reverseOrder ? "desc" : "asc"), (reverseOrder ? "desc" : "asc"), "asc"]
            : [(reverseOrder ? "desc" : "asc"), "asc"]
    ), [progress, reverseOrder, sortBySelectedSortOrder, sortOrder]);


    const tableHeaderFooter = <tr className="fw-bold">
        <SortItemHeader<ProgressSortOrder>
            className="student-name sticky-left ps-3 py-3"
            defaultOrder={"name"}
            reverseOrder={"name"}
            currentOrder={sortOrder} setOrder={toggleSort} reversed={reverseOrder}
            onClick={() => setSelectedQuestionIndex(undefined)}
            label={"Name"}
            alignment={"start"}
        >
            Name
        </SortItemHeader>
        {pageSettings?.attemptedOrCorrect === "CORRECT"
            ? <SortItemHeader<ProgressSortOrder>
                className={classNames("correct-attempted-header", {"sticky-ca-col": isPhy, "narrow-header": isAssignment || isAda})}
                defaultOrder={"totalQuestionPercentage"}
                reverseOrder={"totalQuestionPercentage"}
                currentOrder={sortOrder} setOrder={toggleSort} reversed={reverseOrder}
                onClick={() => setSelectedQuestionIndex(undefined)}
                label={"Total correct questions"}
            >
                {siteSpecific(
                    <div className="d-flex flex-column ps-3">
                        <span>Questions</span>
                        <small className="mt-n1 text-muted fw-normal">(total)</small>
                    </div>,
                    "Correct"
                )}
            </SortItemHeader>
            : <SortItemHeader<ProgressSortOrder>
                className={classNames("correct-attempted-header", {"sticky-ca-col": isPhy, "narrow-header": isAssignment || isAda})}
                defaultOrder={"totalAttemptedQuestionPercentage"}
                reverseOrder={"totalAttemptedQuestionPercentage"}
                currentOrder={sortOrder} setOrder={toggleSort} reversed={reverseOrder}
                onClick={() => setSelectedQuestionIndex(undefined)}
                label={"Total attempted questions"}
            >
                {siteSpecific(
                    <div className="d-flex flex-column ps-3">
                        <span>Questions</span>
                        <small className="mt-n1 text-muted fw-normal">(total)</small>
                    </div>,
                    "Attempted"
                )}
            </SortItemHeader>
        }
        {isPhy && isAssignment && (
            pageSettings?.attemptedOrCorrect === "CORRECT"
                ? <SortItemHeader<ProgressSortOrder>
                    className={classNames("correct-attempted-header narrow-header", {"sticky-ca-col": isPhy})}
                    defaultOrder={"totalPartPercentage"}
                    reverseOrder={"totalPartPercentage"}
                    currentOrder={sortOrder} setOrder={toggleSort} reversed={reverseOrder}
                    onClick={() => setSelectedQuestionIndex(undefined)}
                    label={"Total correct parts"}
                >
                    {siteSpecific(
                        <div className="d-flex flex-column ps-3">
                            <span>Parts</span>
                            <small className="mt-n1 text-muted fw-normal">(total)</small>
                        </div>,
                        "Correct"
                    )}
                </SortItemHeader>
                : <SortItemHeader<ProgressSortOrder>
                    className={classNames("correct-attempted-header narrow-header", {"sticky-ca-col": isPhy})}
                    defaultOrder={"totalAttemptedPartPercentage"}
                    reverseOrder={"totalAttemptedPartPercentage"}
                    currentOrder={sortOrder} setOrder={toggleSort} reversed={reverseOrder}
                    onClick={() => setSelectedQuestionIndex(undefined)}
                    label={"Total attempted parts"}
                >
                    {siteSpecific(
                        <div className="d-flex flex-column ps-3">
                            <span>Parts</span>
                            <small className="mt-n1 text-muted fw-normal">(total)</small>
                        </div>,
                        "Attempted"
                    )}
                </SortItemHeader>
        )}
        {questions.map((_, index) =>
            <SortItemHeader<ProgressSortOrder>
                defaultOrder={index}
                reverseOrder={index}
                currentOrder={sortOrder}
                setOrder={toggleSort}
                reversed={reverseOrder}
                onClick={() => setSelectedQuestionIndex(index)}
                className={classNames({"selected": index === selectedQuestionIndex})}
                label={`Question ${index + 1}`}
                key={index}
            >
                <span>{index + 1}</span>
            </SortItemHeader>
        )}
    </tr>;

    const tableRef = useRef<HTMLTableElement>(null);
    const questionTitle = selectedQuestionIndex !== undefined ? questions[selectedQuestionIndex]?.title : undefined;

    const classAverages: [number, number][] | undefined = progress ? questions.map((_, index) => {
        // classAverages returns a pair of (numerator, denominator) to be passed into formatMark() for each question.

        if (isAssignment) {
            // this gives (number of students who got everything correct) / (number of students). this therefore ignores partially correct attempts.
            if (pageSettings?.attemptedOrCorrect === "ATTEMPTED") {
                const studentsWithAllAttempted = progress.reduce((acc, p) => acc + (p.questionPartResults?.[index].every(part => part !== "NOT_ATTEMPTED") ? 1 : 0), 0);
                return [studentsWithAllAttempted, progress.length];
            } else {
                const studentsWithAllCorrect = progress.reduce((acc, p) => acc + (p.questionPartResults?.[index].every(part => part === "CORRECT") ? 1 : 0), 0);
                return [studentsWithAllCorrect, progress.length];
            }
        } else {
            if (pageSettings?.attemptedOrCorrect === "ATTEMPTED") {
                const studentsWithAllAttempted = progress.reduce((acc, p) => acc + (isAuthorisedFullAccess(p) && !p.notAttemptedPartResults?.[index] ? 1 : 0), 0);
                return [studentsWithAllAttempted, progress.length];
            } else {
                const studentsWithAllCorrect = progress.reduce((acc, p) => acc + (p.correctPartResults?.[index] ? 1 : 0), 0);
                return [studentsWithAllCorrect, progress.length];
            }
        }
    }) : [];

    return <div className="assignment-progress-progress">
        {progress && progress.length > 0 ? <>
            <div className={classNames("assignment-progress-table-wrapper border", {"rounded-3": isAda})} ref={scrollContainerRef}>
                <table ref={tableRef} className="progress-table w-100">
                    <thead className="progress-table-header-footer sticky-top">
                        {tableHeaderFooter}
                        {isPhy && selectedQuestionIndex !== undefined && <tr className="progress-table-question-header">
                            <th className="py-2" colSpan={3 + questions.length}>
                                <div className="progress-table-question-link">
                                    {isAssignment
                                        ? <a href={`/questions/${questions[selectedQuestionIndex]?.id}` + (boardId ? `?board=${boardId}` : "")} target="_blank">
                                            <Markup encoding="latex">
                                                {`Q${selectedQuestionIndex + 1}${questionTitle ? ` : ${questionTitle}` : ""}`}
                                            </Markup>
                                        </a>
                                        : <Markup encoding="latex">
                                            {`Q${selectedQuestionIndex + 1}${questionTitle ? ` : ${questionTitle}` : ""}`}
                                        </Markup>
                                    }
                                </div>
                                &nbsp;
                            </th>
                        </tr>}
                    </thead>
                    <tbody>
                        {sortedProgress.map((studentProgress, index) => {
                            const fullAccess = isAuthorisedFullAccess(studentProgress);
                            const internalCellSpacing = isPhy && isAssignment ? "py-1" : "py-3";
                            return <tr key={studentProgress.user?.id} id={`${studentProgress.user?.id}`} className={`${markClasses(studentProgress, assignmentTotalQuestionParts)}${fullAccess ? "" : " not-authorised"}`} title={`${studentProgress.user?.givenName + " " + studentProgress.user?.familyName}`}>
                                <th className={`student-name sticky-left ps-2 ${internalCellSpacing} fw-bold`}>
                                    {fullAccess && pageSettings?.isTeacher ?
                                        (
                                            isAssignment ?
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="icon icon-person icon-md" color="tertiary"/>
                                                    <Link className="w-100 text-start gap-2 pe-3" to={`/progress/${studentProgress.user?.id}`} target="_blank">
                                                        {studentProgress.user?.givenName}
                                                        <span className="d-none d-lg-inline"> {studentProgress.user?.familyName}</span>
                                                    </Link>
                                                </div>
                                                : <>
                                                    <Button className="quiz-student-menu text-start" color="link" onClick={() => toggle(index)} disabled={returningQuizToStudent}>
                                                        <div
                                                            className="quiz-student-name"
                                                        >
                                                            {studentProgress.user?.givenName}
                                                            <span className="d-none d-lg-inline"> {studentProgress.user?.familyName}</span>
                                                        </div>
                                                        <div className="quiz-student-menu-icon">
                                                            {returningQuizToStudent ? <IsaacSpinner size="sm" /> : <img src="/assets/common/icons/menu.svg" alt="Menu" />}
                                                        </div>
                                                    </Button>
                                                    {!returningQuizToStudent && dropdownOpen?.[index] && <>
                                                        {(!duedate || duedate.valueOf() > TODAY().valueOf()) &&
                                                        studentProgress.completed &&
                                                        <div className="py-2 px-3">
                                                            <Button size="sm" onClick={() => returnToStudent(studentProgress.user?.id)}>Allow another attempt</Button>
                                                        </div>}
                                                        <div className="py-2 px-3">
                                                            <Button size="sm" tag={Link} to={`/test/attempt/feedback/${assignmentId}/${studentProgress.user?.id}`}>View answers</Button>
                                                        </div>
                                                    </>}
                                                </>
                                        ) :
                                        <span>{studentProgress.user?.givenName} {studentProgress.user?.familyName}</span>
                                    }
                                </th>
                                {/* total questions */}
                                <th title={fullAccess ? undefined : "Not Sharing"} className={classNames({"sticky-ca-col": isPhy})}>
                                    {fullAccess
                                        ? formatMark(
                                            isAssignment
                                                ? pageSettings?.attemptedOrCorrect === "CORRECT"
                                                    ? studentProgress.correctQuestionPagesCount
                                                    : studentProgress.questionResults?.filter(r => r !== CompletionState.NOT_ATTEMPTED).length ?? 0
                                                : pageSettings?.attemptedOrCorrect === "CORRECT"
                                                    ? studentProgress.correctQuestionPartsCount
                                                    : studentProgress.correctQuestionPartsCount + studentProgress.incorrectQuestionPartsCount,
                                            questions.length,
                                            !!pageSettings?.formatAsPercentage
                                        )
                                        : ""
                                    }
                                </th>
                                {/* total parts */}
                                {isPhy && isAssignment && <th title={fullAccess ? undefined : "Not Sharing"} className={classNames({"sticky-ca-col": isPhy})}>
                                    {fullAccess
                                        ? formatMark(
                                            pageSettings?.attemptedOrCorrect === "CORRECT"
                                                ? studentProgress.correctQuestionPartsCount
                                                : studentProgress.correctQuestionPartsCount + studentProgress.incorrectQuestionPartsCount,
                                            assignmentTotalQuestionParts,
                                            !!pageSettings?.formatAsPercentage
                                        )
                                        : ""
                                    }
                                </th>}
                                {questions.map((q, index) =>
                                    <td key={q.id} className={classNames(
                                        {[markQuestionClasses(studentProgress, index)]: isPhy},
                                        {"selected": index === selectedQuestionIndex},
                                    )}>
                                        {isAssignment
                                            ? (fullAccess
                                                ? isPhy
                                                    ? formatMark(
                                                        pageSettings?.attemptedOrCorrect === "CORRECT"
                                                            ? (studentProgress.correctPartResults || [])[index]
                                                            : (studentProgress.correctPartResults || [])[index] + (studentProgress.incorrectPartResults || [])[index],
                                                        questions[index].questionPartsTotal as number,
                                                        !!pageSettings?.formatAsPercentage
                                                    )
                                                    : getAssignmentQuestionCorrectnessIcon((studentProgress.questionResults || [])[index], pageSettings?.attemptedOrCorrect || "CORRECT")
                                                : ""
                                            )
                                            : getQuizQuestionCorrectnessIcon(pageSettings?.attemptedOrCorrect || "CORRECT", studentProgress, index)
                                        }
                                    </td>
                                )}
                            </tr>;
                        })}
                    </tbody>
                    <tfoot className="sticky-bottom">
                        <tr>
                            <th className="sticky-left text-start p-3 fw-bold">
                                {siteSpecific(
                                    `${pageSettings?.formatAsPercentage ? "%" : "No."} of students fully ${pageSettings?.attemptedOrCorrect === "CORRECT" ? "correct" : "attempted"}`,
                                    `Total fully ${pageSettings?.attemptedOrCorrect === "CORRECT" ? "correct" : "attempted"}`
                                )}
                            </th>
                            <th className={classNames({"sticky-ca-col": isPhy})} />{/* questions column */}
                            {isPhy && isAssignment && <th className={classNames({"sticky-ca-col": isPhy})} />}{/* parts column */}
                            {classAverages.map(([numerator, denominator], index) => (
                                <td key={index} className={classNames({"selected": index === selectedQuestionIndex})}>
                                    {formatMark(numerator, denominator, !!pageSettings?.formatAsPercentage)}
                                </td>
                            ))}
                        </tr>
                    </tfoot>
                </table>
            </div>
        </> : <div className="w-100 text-center p-3">
            This group is empty, so has no progress data available. You can invite users through the <Link to="/groups">Manage groups</Link> page.
        </div>}
    </div>;
}

interface ResultsTablePartBreakdownProps extends React.HTMLAttributes<HTMLTableElement> {
    progress?: AssignmentProgressDTO[];
    questionIndex: number;
}

export function ResultsTablePartBreakdown({
    progress,
    questionIndex,
    ...rest
}: ResultsTablePartBreakdownProps) {

    const pageSettings = useContext(AssignmentProgressPageSettingsContext);

    // TODO: the sorting is somewhat duplicated from above, could be slightly refactored
    const [sortOrder, setSortOrder] = useState<ProgressSortOrder>("name");
    const [reverseOrder, setReverseOrder] = useState(false);

    function toggleSort(itemOrder: ProgressSortOrder) {
        setSortOrder(itemOrder);
        if (sortOrder === itemOrder) {
            setReverseOrder(!reverseOrder);
        } else {
            setReverseOrder(false);
        }
    }

    const sortBySelectedSortOrder = useCallback((item: AssignmentProgressDTO) => {
        if (!isAuthorisedFullAccess(item)) return reverseOrder ? -Infinity : Infinity;
        switch (sortOrder) {
            case "name":
                return (item.user?.familyName + ", " + item.user?.givenName).toLowerCase();
            case "totalPartPercentage":
            case "totalAttemptedPartPercentage":
            case "totalQuestionPercentage":
            case "totalAttemptedQuestionPercentage":
                return 0; // These sorts are not applicable for part breakdown
            default:
                return -questionPartResultToNumber(item.questionPartResults?.[questionIndex][sortOrder]);
        }
    }, [questionIndex, reverseOrder, sortOrder]);

    const sortedProgress = useMemo(() => orderBy(progress,
        [sortBySelectedSortOrder, sortByName],
        [(reverseOrder ? "desc" : "asc"), "asc"]
    ), [progress, reverseOrder, sortBySelectedSortOrder]);

    const classAverages = sortedProgress.find(p => !!p.questionPartResults)?.questionPartResults?.[questionIndex]?.map((_, i) => {
        if (pageSettings?.attemptedOrCorrect === "ATTEMPTED") {
            const totalAttempted = sortedProgress.reduce((acc, p) => acc + (p.questionPartResults?.[questionIndex][i] !== "NOT_ATTEMPTED" ? 1 : 0), 0);
            return [totalAttempted, sortedProgress.length];
        } else {
            const totalCorrect = sortedProgress.reduce((acc, p) => acc + (p.questionPartResults?.[questionIndex][i] === "CORRECT" ? 1 : 0), 0);
            return [totalCorrect, sortedProgress.length];
        }
    }) ?? [];

    return sortedProgress?.length
        ? <div className={classNames("assignment-progress-table-wrapper border", {"rounded-3": isAda})}>
            <table {...rest} className={classNames("progress-table assignment-progress-progress w-100", rest.className)}>
                <thead className="progress-table-header-footer sticky-top fw-bold">
                    <tr>
                        <SortItemHeader<ProgressSortOrder>
                            className="student-name sticky-left ps-3 py-3"
                            defaultOrder={"name"}
                            reverseOrder={"name"}
                            currentOrder={sortOrder} setOrder={toggleSort} reversed={reverseOrder}
                            alignment={"start"}
                        >
                            Name
                        </SortItemHeader>
                        {isPhy && (pageSettings?.attemptedOrCorrect === "CORRECT"
                            ? <SortItemHeader<ProgressSortOrder>
                                className={classNames("correct-attempted-header narrow-header", {"sticky-ca-col": isPhy})}
                                defaultOrder={"totalQuestionPercentage"}
                                reverseOrder={"totalQuestionPercentage"}
                                currentOrder={sortOrder} setOrder={toggleSort} reversed={reverseOrder}
                                label={"Total correct"}
                            >
                                {siteSpecific(
                                    <div className="d-flex flex-column ps-3">
                                        <span>Parts</span>
                                        <small className="mt-n1 text-muted fw-normal">(total)</small>
                                    </div>,
                                    "Correct"
                                )}
                            </SortItemHeader>
                            : <SortItemHeader<ProgressSortOrder>
                                className={classNames("correct-attempted-header narrow-header", {"sticky-ca-col": isPhy})}
                                defaultOrder={"totalAttemptedQuestionPercentage"}
                                reverseOrder={"totalAttemptedQuestionPercentage"}
                                currentOrder={sortOrder} setOrder={toggleSort} reversed={reverseOrder}
                                label={"Total attempted"}
                            >
                                {siteSpecific(
                                    <div className="d-flex flex-column ps-3">
                                        <span>Parts</span>
                                        <small className="mt-n1 text-muted fw-normal">(total)</small>
                                    </div>,
                                    "Attempted"
                                )}
                            </SortItemHeader>
                        )}
                        {sortedProgress.find(p => !!p.questionPartResults)?.questionPartResults?.[questionIndex]?.map((_, i) =>
                            // <th key={i} className="text-center">
                            <SortItemHeader<ProgressSortOrder>
                                defaultOrder={i}
                                reverseOrder={i}
                                currentOrder={sortOrder}
                                setOrder={toggleSort}
                                reversed={reverseOrder}
                                key={i}
                            >
                                Part {i + 1}
                            </SortItemHeader>
                            // </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {sortedProgress.map((studentProgress, studentIndex) => (
                        <tr key={studentIndex}>
                            {/* student name */}
                            <th className="student-name sticky-left ps-2 py-3 fw-bold">
                                <div className="d-flex align-items-center gap-2">
                                    <i className="icon icon-person icon-md" color="tertiary"/>
                                    <Link className="w-100 text-start gap-2 pe-3" to={`/progress/${studentProgress.user?.id}`} target="_blank">
                                        {studentProgress.user?.givenName}
                                        <span className="d-none d-lg-inline"> {studentProgress.user?.familyName}</span>
                                    </Link>
                                </div>
                            </th>

                            {/* total correct/attempted */}
                            {isPhy && studentProgress.questionPartResults && 
                                <th className={classNames({"sticky-ca-col": isPhy})}>
                                    {formatMark(
                                        studentProgress.questionPartResults[questionIndex].reduce((acc, questionPartResult) => {
                                            if (pageSettings?.attemptedOrCorrect === "CORRECT") {
                                                return acc + (questionPartResult === "CORRECT" ? 1 : 0);
                                            } else {
                                                return acc + (questionPartResult !== "NOT_ATTEMPTED" ? 1 : 0);
                                            }
                                        }, 0),
                                        studentProgress.questionPartResults[questionIndex].length,
                                        !!pageSettings?.formatAsPercentage
                                    )}
                                </th>
                            }

                            {/* main data */}
                            {studentProgress.questionPartResults &&
                                studentProgress.questionPartResults[questionIndex].map((questionPartResult, questionPartIndex) => (
                                    <td key={questionPartIndex}>{getQuizQuestionPartCorrectnessIcon(questionPartResult)}</td>
                                ))
                            }
                        </tr>
                    ))}
                </tbody>
                <tfoot className="sticky-bottom">
                    <tr>
                        <th className="sticky-left text-start p-3 fw-bold">
                            {siteSpecific(
                                `No. of students fully ${pageSettings?.attemptedOrCorrect === "CORRECT" ? "correct" : "attempted"}`,
                                `Total fully ${pageSettings?.attemptedOrCorrect === "CORRECT" ? "correct" : "attempted"}`
                            )}
                        </th>
                        {isPhy && <th className={classNames({"sticky-ca-col": isPhy})}/> /* correct column */}
                        {classAverages.map(([numerator, denominator], index) => (
                            <td key={index}>{formatMark(numerator, denominator, !!pageSettings?.formatAsPercentage)}</td>
                        ))}
                    </tr>
                </tfoot>
            </table>
        </div>
        : <div className="w-100 text-center p-3">
            This group is empty, so has no progress data available. You can invite users through the <Link to="/groups">Manage groups</Link> page.
        </div>;
}
