import React, {useState} from "react";
import {
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
    Modal,
    ModalBody,
    ModalHeader,
    Container,
    Label,
    Button
} from "reactstrap";

type ExtendDueDateModalProps = {
    isOpen: boolean;
    toggle: () => void;
    currDueDate: Date;
    numericQuizAssignmentId: number;
}
export const ExtendDueDateModal = (props: ExtendDueDateModalProps) => {
    const {isOpen, toggle, currDueDate, numericQuizAssignmentId} = props;
    const yearRange = range(currentYear, currentYear + 5);
    const [dueDate, setDueDate] = useState<Date>(currDueDate);
    const [updateQuiz, {isLoading: isUpdatingQuiz}] = useUpdateQuizAssignmentMutation();
    const dispatch = useAppDispatch();

    const setValidDueDate = () => {
        console.log(isUpdatingQuiz, numericQuizAssignmentId, !dueDate, currDueDate == dueDate);
        if (isUpdatingQuiz || !numericQuizAssignmentId || !dueDate || currDueDate == dueDate) {
            return;
        }

        if (currDueDate && (dueDate > currDueDate || dueDate > TODAY())) {
            updateQuiz({quizAssignmentId: numericQuizAssignmentId, update: {dueDate: dueDate}})
                .then((result) => {
                    if (mutationSucceeded(result)) {
                        dispatch(showSuccessToast(
                            "Due date extended successfully", `This test is now due by ${dueDate.toLocaleDateString()}.`
                        ));
                        toggle();
                    }
                });
        }
    };

    return <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader role={"heading"} className={"text-break"} close={
            <button className={"text-nowrap close"} onClick={toggle}>
                Close
            </button>
        }>
            Extend due date?
        </ModalHeader>
        <ModalBody>
            <p className="px-1">{`Are you sure you want to change the due date? This will extend the due date for all users this test is assigned to.`}</p>
            <hr className="text-center"/>
            <Container className="py-2">
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
            </Container>
        </ModalBody>
    </Modal>;
};

