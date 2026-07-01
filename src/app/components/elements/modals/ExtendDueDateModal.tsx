import React, {useState} from "react";
import {
    closeActiveModal,
    mutationSucceeded,
    showSuccessToast,
    useAppDispatch,
    useUpdateQuizAssignmentMutation
} from "../../../state";
import {
    TODAY
} from "../../../services";
import {currentYear, DateInput} from "../../elements/inputs/DateInput";
import range from "lodash/range";
import {
    Label,
    Button
} from "reactstrap";
import { ActiveModalProps } from "../../../../IsaacAppTypes";

type ExtendDueDateModalProps = {
    currDueDate: Date | number;
    numericQuizAssignmentId: number;
}

const ExtendDueDateModalBody = ({currDueDate, numericQuizAssignmentId}: ExtendDueDateModalProps) => {
    const yearRange = range(currentYear, currentYear + 5);
    const [dueDate, setDueDate] = useState<Date>(new Date(currDueDate));
    const [updateQuiz, {isLoading: isUpdatingQuiz}] = useUpdateQuizAssignmentMutation();
    const dispatch = useAppDispatch();

    const setValidDueDate = () => {
        if (isUpdatingQuiz || !numericQuizAssignmentId || !dueDate || currDueDate == dueDate) {
            return;
        }

        if (currDueDate && (dueDate > currDueDate || dueDate > TODAY())) {
            void updateQuiz({quizAssignmentId: numericQuizAssignmentId, update: {dueDate: dueDate}})
                .then((result) => {
                    if (mutationSucceeded(result)) {
                        dispatch(showSuccessToast(
                            "Due date extended successfully", `This test is now due by ${dueDate.toLocaleDateString()}.`
                        ));
                        dispatch(closeActiveModal());
                    }
                });
        }
    };

    return <>
        <p className="px-1">{`Are you sure you want to change the due date? This will extend the due date for all users this test is assigned to.`}</p>
        <hr className="text-center"/>
        <div className="p-2">
            <Label for="dueDate" className="pe-1">Extend the due date:
                <DateInput id="dueDate" value={dueDate} invalid={dueDate && ((dueDate < currDueDate) || dueDate <= TODAY())}
                    yearRange={yearRange} noClear disabled={isUpdatingQuiz} className="text-center"
                    onChange={(e) => e.target.valueAsDate && setDueDate(e.target.valueAsDate)}
                />
            </Label>
            {dueDate && (dueDate < currDueDate || dueDate <= TODAY()) && 
            <p className={"text-danger"}>
                You cannot set the due date to be earlier than the current due date or today.
            </p>}
            <Button
                className="mt-2 mb-2"
                block color="secondary"
                onClick={setValidDueDate}
                role={"button"}
                disabled={isUpdatingQuiz && dueDate && (dueDate < currDueDate)}>
                {`Extend due date`}
            </Button>
        </div>
    </>;
};

export const extendDueDateModal = (props: ExtendDueDateModalProps) : ActiveModalProps => {
    return {
        title: "Extend due date",
        body: <ExtendDueDateModalBody {...props} />
    };
};

