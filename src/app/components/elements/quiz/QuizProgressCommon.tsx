import React, {useContext, useLayoutEffect, useMemo, useRef, useState} from "react";
import {Button} from "reactstrap";
import {AuthorisedAssignmentProgress, AssignmentProgressPageSettingsContext} from "../../../../IsaacAppTypes";
import {siteSpecific, TODAY} from "../../../services";
import {Link} from "react-router-dom";
import orderBy from "lodash/orderBy";
import { IsaacSpinner } from "../../handlers/IsaacSpinner";
import { closeActiveModal, openActiveModal, useAppDispatch, useReturnQuizToStudentMutation } from "../../../state";
import { ProgressSortOrder, SortItemHeader } from "../SortableItemHeader";
import { AssignmentProgressDTO } from "../../../../IsaacApiTypes";

export const ICON = siteSpecific(
    {
        correct: <svg style={{width: 30, height: 30}}><use href={`/assets/phy/icons/tick-rp-hex.svg#icon`} xlinkHref={`/assets/phy/icons/tick-rp-hex.svg#icon`}/></svg>,
        incorrect: <svg style={{width: 30, height: 30}}><use href={`/assets/phy/icons/cross-rp-hex.svg#icon`} xlinkHref={`/assets/phy/icons/cross-rp-hex.svg#icon`}/></svg>,
        notAttempted: <svg  style={{width: 30, height: 30}}><use href={`/assets/phy/icons/dash-hex.svg#icon`} xlinkHref={`/assets/phy/icons/dash-hex.svg#icon`}/></svg>,
    },
    {
        correct: <img src="/assets/cs/icons/tick-rp.svg" alt="Correct" style={{width: 30}} />,
        incorrect: <img src="/assets/cs/icons/cross-rp.svg" alt="Incorrect" style={{width: 30}} />,
        notAttempted: <img src="/assets/cs/icons/dash.svg" alt="Not attempted" style={{width: 30}} />,
    }
);

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

export interface QuestionType {
    id?: string | undefined;
    title?: string | undefined;
    questionPartsTotal?: number | undefined;
}

export interface ResultsTableProps<Q extends QuestionType> {
    assignmentId?: number;
    duedate?: Date;
    progress?: AssignmentProgressDTO[];
    questions: Q[];
    header: JSX.Element;
    getQuestionTitle: (question: Q) => JSX.Element;
    assignmentAverages: number[];
    assignmentTotalQuestionParts: number;
    markClasses: (row: AssignmentProgressDTO, assignmentTotalQuestionParts: number) => string;
    markQuestionClasses: (row: AssignmentProgressDTO, questionIndex: number) => string;
    isAssignment?: boolean;
}

export function ResultsTable<Q extends QuestionType>({assignmentId,
                                                     duedate,
                                                     progress,
                                                     questions,
                                                     header,
                                                     getQuestionTitle,
                                                     assignmentAverages,
                                                     assignmentTotalQuestionParts,
                                                     markClasses,
                                                     markQuestionClasses,
                                                     isAssignment} : ResultsTableProps<Q>) {

    const [selectedQuestionNumber, setSelectedQuestionNumber] = useState(0);
    const selectedQuestion: Q = questions[selectedQuestionNumber];

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
                <Button key={1} color="primary" outline target="_blank" onClick={() => dispatch(closeActiveModal())}>
                    Cancel
                </Button>,
                <Button key={0} color="primary" target="_blank" onClick={confirm}>
                    Confirm
                </Button>,
        ]
        }));
    };

    const [sortOrder, setSortOrder] = useState<ProgressSortOrder>("name");
    const [reverseOrder, setReverseOrder] = useState(false);

    function isSelected(q: Q) {
        return q == selectedQuestion ? "selected" : "";
    }

    function toggleSort(itemOrder: ProgressSortOrder) {
        setSortOrder(itemOrder);
        if (sortOrder === itemOrder) {
            setReverseOrder(!reverseOrder);
        } else {
            setReverseOrder(false);
        }
    }

    const semiSortedProgress = useMemo(() => orderBy(progress, (item) => {
        return item.user.authorisedFullAccess && -(item as AuthorisedAssignmentProgress).notAttemptedPartResults.reduce(function(sum, increment) {return sum + increment;}, 0);
    }, [reverseOrder ? "desc" : "asc"]), [progress, reverseOrder]);

    const sortedProgress = useMemo(() => orderBy((semiSortedProgress), (item) => {
        if (!item.user.authorisedFullAccess) return -1;
        const authorisedItem = item as AuthorisedAssignmentProgress;
            switch (sortOrder) {
                case "name":
                    return (authorisedItem.user.familyName + ", " + authorisedItem.user.givenName).toLowerCase();
                case "totalQuestionPartPercentage":
                    return -authorisedItem.correctQuestionPartsCount;
                case "totalQuestionPercentage":
                    return -authorisedItem.tickCount;
                default:
                    return -authorisedItem.correctPartResults[sortOrder];
            }
        }, [reverseOrder ? "desc" : "asc"])
    , [semiSortedProgress, reverseOrder, sortOrder]);

    const tableHeaderFooter = <tr className="progress-table-header-footer">
        <SortItemHeader defaultOrder={"name"} reverseOrder={"name"} currentOrder={sortOrder} setOrder={toggleSort} reversed={reverseOrder}/>
        {questions.map((q, index) =>
            <SortItemHeader
                key={q.id} className={`${isSelected(q)}`}
                defaultOrder={index} reverseOrder={index} currentOrder={sortOrder}
                setOrder={toggleSort}
                clickToSelect={() => setSelectedQuestionNumber(index)}
                hideIcons={index !== selectedQuestionNumber} reversed={reverseOrder}
                alignment="center"
            >
               {assignmentAverages[index]}%
            </SortItemHeader>
        )}
        {isAssignment ? <>
            <SortItemHeader
                defaultOrder={"totalQuestionPartPercentage"}
                reverseOrder={"totalQuestionPartPercentage"}
                currentOrder={sortOrder} setOrder={toggleSort} reversed={reverseOrder}>
                Total Parts
            </SortItemHeader>
            <SortItemHeader
                defaultOrder={"totalQuestionPercentage"}
                reverseOrder={"totalQuestionPercentage"}
                currentOrder={sortOrder} setOrder={toggleSort} reversed={reverseOrder}>
                Total Qs
            </SortItemHeader>
        </> :
        <SortItemHeader
            defaultOrder={"totalQuestionPartPercentage"}
            reverseOrder={"totalQuestionPartPercentage"}
            currentOrder={sortOrder} setOrder={toggleSort} reversed={reverseOrder}
            className="total-column"
        >
            Overall
        </SortItemHeader>
    }
    </tr>;

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
        {header}
        {progress && progress.length > 0 && <>
            <div className="progress-questions">
                <Button color="tertiary" disabled={selectedQuestionNumber == 0}
                    onClick={() => setSelectedQuestionNumber(selectedQuestionNumber - 1)}>◄</Button>
                <div>
                    {getQuestionTitle(selectedQuestion)}
                </div>
                <Button color="tertiary" disabled={selectedQuestionNumber === questions.length - 1}
                    onClick={() => setSelectedQuestionNumber(selectedQuestionNumber + 1)}>►</Button>
            </div>
            <div className="assignment-progress-table-wrapper">
                <table ref={tableRef} className="progress-table w-100 border">
                    <thead>
                        {tableHeaderFooter}
                    </thead>
                    <tbody>
                        {sortedProgress.map((studentProgress, index) => {
                            const fullAccess = studentProgress.user.authorisedFullAccess;
                            return <tr key={studentProgress.user.id} className={`${markClasses(studentProgress, assignmentTotalQuestionParts)}${fullAccess ? "" : " not-authorised"}`} title={`${studentProgress.user.givenName + " " + studentProgress.user.familyName}`}>
                                <th className="student-name">
                                    {fullAccess && pageSettings.isTeacher ?
                                        (
                                            isAssignment ?
                                            <Link to={`/progress/${studentProgress.user.id}`} target="_blank">
                                                {studentProgress.user.givenName}
                                                <span className="d-none d-lg-inline"> {studentProgress.user.familyName}</span>
                                            </Link>
                                            : <>
                                                <Button className="quiz-student-menu" color="link" onClick={() => toggle(index)} disabled={returningQuizToStudent}>
                                                    <div
                                                        className="quiz-student-name"
                                                    >
                                                        {studentProgress.user.givenName}
                                                        <span className="d-none d-lg-inline"> {studentProgress.user.familyName}</span>
                                                    </div>
                                                    <div className="quiz-student-menu-icon">
                                                        {returningQuizToStudent ? <IsaacSpinner size="sm" /> : <img src="/assets/common/icons/menu.svg" alt="Menu" />}
                                                    </div>
                                                </Button>
                                                {!returningQuizToStudent && dropdownOpen?.[index] && <>
                                                    {(!duedate || duedate.valueOf() > TODAY().valueOf()) &&
                                                        ((studentProgress as AuthorisedAssignmentProgress).completed) &&
                                                        <div className="py-2 px-3">
                                                            <Button size="sm" onClick={() => returnToStudent(studentProgress.user.id)}>Allow another attempt</Button>
                                                        </div>}
                                                    <div className="py-2 px-3">
                                                        <Button size="sm" tag={Link} to={`/test/attempt/feedback/${assignmentId}/${studentProgress.user.id}`}>View answers</Button>
                                                    </div>
                                                </>}
                                            </>
                                        ) :
                                        <span>{studentProgress.user.givenName} {studentProgress.user.familyName}</span>
                                    }
                                </th>
                                {questions.map((q, index) =>
                                    <td key={q.id} className={isSelected(questions[index]) + " " + markQuestionClasses(studentProgress, index)} onClick={() => setSelectedQuestionNumber(index)}>
                                        {isAssignment ? (fullAccess ? formatMark(studentProgress.correctPartResults[index],
                                            questions[index].questionPartsTotal as number,
                                            pageSettings.formatAsPercentage) : ""
                                        ) : 
                                        studentProgress.correctPartResults[index] === 1 ? ICON.correct :
                                            studentProgress.incorrectPartResults[index] === 1 ? ICON.incorrect :
                                            /* default */ ICON.notAttempted
                                        }
                                    </td> 
                                )}
                                {isAssignment ? <>
                                    <th className="total-column left" title={fullAccess ? undefined : "Not Sharing"}>
                                        {fullAccess ? formatMark((studentProgress as AuthorisedAssignmentProgress).correctQuestionPartsCount,
                                            assignmentTotalQuestionParts,
                                            pageSettings.formatAsPercentage) : ""}
                                    </th>
                                    <th className="total-column right" title={fullAccess ? undefined : "Not Sharing"}>
                                        {fullAccess ? formatMark((studentProgress as AuthorisedAssignmentProgress).tickCount,
                                            questions.length,
                                            pageSettings.formatAsPercentage) : ""}
                                    </th>
                                </> : 
                                    <th className="total-column" title={fullAccess ? undefined : "Not Sharing"}>
                                        {fullAccess ? formatMark((studentProgress as AuthorisedAssignmentProgress).correctQuestionPartsCount,
                                            assignmentTotalQuestionParts,
                                            pageSettings.formatAsPercentage) : ""}
                                    </th>
                                }
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
}
