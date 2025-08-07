import React, {useCallback, useContext, useMemo, useRef, useState} from "react";
import {Button} from "reactstrap";
import {AssignmentProgressPageSettingsContext, ProgressSortOrder} from "../../../../IsaacAppTypes";
import {isAuthorisedFullAccess, isPhy, siteSpecific, TODAY} from "../../../services";
import {Link} from "react-router-dom";
import orderBy from "lodash/orderBy";
import { IsaacSpinner } from "../../handlers/IsaacSpinner";
import { closeActiveModal, openActiveModal, useAppDispatch, useReturnQuizToStudentMutation } from "../../../state";
import { SortItemHeader } from "../SortableItemHeader";
import { AssignmentProgressDTO, CompletionState, QuestionPartState } from "../../../../IsaacApiTypes";
import classNames from "classnames";
import { Markup } from "../markup";
import { HorizontalScroller } from "../inputs/HorizontalScroller";

export const ICON = {
    correct: <i className="icon-md icon-correct"/>,
    incorrect: <i className="icon-md icon-incorrect"/>,
    notAttempted: <i className="icon-md icon-not-attempted"/>,
    partial: <i className={classNames("icon-md", siteSpecific("icon-in-progress", "icon-partial"))}/>,
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

    const [dropdownOpen, setDropdownOpen] = useState(progress?.map(() => false));
    const toggle = (index: number) => setDropdownOpen(dropdownOpen?.map((value, i) => i === index ? !value : value));

    const [returnQuizToStudent, {isLoading: returningQuizToStudent}] = useReturnQuizToStudentMutation();
    const returnToStudent = (userId?: number) => {
        const confirm = () => {
            returnQuizToStudent({quizAssignmentId: assignmentId as number, userId: userId as number})
                .then(() => dispatch(closeActiveModal()));
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
            case "totalQuestionPartPercentage":
                return -item.correctQuestionPartsCount;
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


    const tableHeaderFooter = <tr className="progress-table-header-footer fw-bold">
        <SortItemHeader<ProgressSortOrder>
            className="student-name pointer-cursor ps-3 py-3"
            defaultOrder={"name"}
            reverseOrder={"name"}
            currentOrder={sortOrder} setOrder={toggleSort} reversed={reverseOrder}
            onClick={() => setSelectedQuestionIndex(undefined)}
            label={"Name"}
        >
            Name
        </SortItemHeader>
        {pageSettings?.attemptedOrCorrect === "CORRECT"
            ? <SortItemHeader<ProgressSortOrder>
                className="pointer-cursor ps-3 wf-10"
                defaultOrder={"totalQuestionPercentage"}
                reverseOrder={"totalQuestionPercentage"}
                currentOrder={sortOrder} setOrder={toggleSort} reversed={reverseOrder}
                onClick={() => setSelectedQuestionIndex(undefined)}
                label={"Total correct"}
            >
                Correct
            </SortItemHeader>
            : <SortItemHeader<ProgressSortOrder>
                className="pointer-cursor ps-3 wf-10"
                defaultOrder={"totalAttemptedQuestionPercentage"}
                reverseOrder={"totalAttemptedQuestionPercentage"}
                currentOrder={sortOrder} setOrder={toggleSort} reversed={reverseOrder}
                onClick={() => setSelectedQuestionIndex(undefined)}
                label={"Total attempted"}
            >
                Attempted
            </SortItemHeader>
        }
        {questions.map((_, index) =>
            <SortItemHeader<ProgressSortOrder>
                defaultOrder={index}
                reverseOrder={index}
                currentOrder={sortOrder}
                setOrder={toggleSort}
                reversed={reverseOrder}
                alignment="center"
                onClick={() => setSelectedQuestionIndex(index)}
                className={classNames("pointer-cursor", {"selected": index === selectedQuestionIndex})}
                label={`Question ${index + 1}`}
                key={index}
            >
                <span>{index + 1}</span>
            </SortItemHeader>
        )}
    </tr>;

    const tableRef = useRef<HTMLTableElement>(null);

    return <div className="assignment-progress-progress">
        {progress && progress.length > 0 && <>
            <HorizontalScroller enabled={sortedProgress.length > 20} className="assignment-progress-table-wrapper">
                <table ref={tableRef} className="progress-table w-100 border">
                    <thead>
                        {tableHeaderFooter}
                        {isPhy && selectedQuestionIndex !== undefined && <tr>
                            <th className="py-2" colSpan={2 + questions.length}>
                                <div className="progress-table-question-link">
                                    {isAssignment
                                        ? <a href={`/questions/${questions[selectedQuestionIndex]?.id}` + (boardId ? `?board=${boardId}` : "")} target="_blank">
                                            <Markup encoding="latex">
                                                {`Q${selectedQuestionIndex + 1}: ${questions[selectedQuestionIndex]?.title}`}
                                            </Markup>
                                        </a>
                                        : <Markup encoding="latex">
                                            {`Q${selectedQuestionIndex + 1}: ${questions[selectedQuestionIndex]?.title}`}
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
                            return <tr key={studentProgress.user?.id} className={`${markClasses(studentProgress, assignmentTotalQuestionParts)}${fullAccess ? "" : " not-authorised"}`} title={`${studentProgress.user?.givenName + " " + studentProgress.user?.familyName}`}>
                                <th className={`student-name ${internalCellSpacing} fw-bold`}>
                                    {fullAccess && pageSettings?.isTeacher ?
                                        (
                                            isAssignment ?
                                                <Link className="d-flex justify-content-center align-items-center gap-2" to={`/progress/${studentProgress.user?.id}`} target="_blank">
                                                    <i className="icon icon-person icon-md" color="tertiary"/>
                                                    <span className="pe-3">
                                                        {studentProgress.user?.givenName}
                                                        <span className="d-none d-lg-inline"> {studentProgress.user?.familyName}</span>
                                                    </span>
                                                </Link>
                                                : <>
                                                    <Button className="quiz-student-menu" color="link" onClick={() => toggle(index)} disabled={returningQuizToStudent}>
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
                                <th title={fullAccess ? undefined : "Not Sharing"}>
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
                </table>
            </HorizontalScroller>
        </>}
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
            case "totalQuestionPartPercentage":
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

    return !!sortedProgress?.length && 
    <HorizontalScroller enabled={sortedProgress.length > 20}>
        <table {...rest} className={classNames("progress-table border assignment-progress-progress w-100", rest.className)}>
            <thead className="progress-table-header-footer">
                <SortItemHeader<ProgressSortOrder>
                    className="student-name ps-3 py-3"
                    defaultOrder={"name"}
                    reverseOrder={"name"}
                    currentOrder={sortOrder} setOrder={toggleSort} reversed={reverseOrder}
                >
                    Name
                </SortItemHeader>
                {sortedProgress[0].questionPartResults?.[questionIndex]?.map((_, i) =>
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
            </thead>
            <tbody>
                {sortedProgress.map((studentProgress, studentIndex) => (
                    <tr key={studentIndex}>
                        <th className="student-name py-3 fw-bold">
                            <Link className="d-flex justify-content-center align-items-center gap-2" to={`/progress/${studentProgress.user?.id}`} target="_blank">
                                <i className="icon icon-person icon-md" color="tertiary"/>
                                <span className="pe-3">
                                    {studentProgress.user?.givenName}
                                    <span className="d-none d-lg-inline"> {studentProgress.user?.familyName}</span>
                                </span>
                            </Link>
                        </th>
                        {studentProgress.questionPartResults &&
                            studentProgress.questionPartResults[questionIndex].map((questionPartResult, questionPartIndex) => (
                                <td key={questionPartIndex}>{getQuizQuestionPartCorrectnessIcon(questionPartResult)}</td>
                            ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </HorizontalScroller>;
}
