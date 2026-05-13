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
import { useTranslation } from 'react-i18next';
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
    currDueDate: Date | number;
    numericQuizAssignmentId: number;
}
export const ExtendDueDateModal = (props: ExtendDueDateModalProps) => {
    const { t } = useTranslation()
    const {isOpen, toggle, currDueDate, numericQuizAssignmentId} = props;
    const yearRange = range(currentYear, currentYear + 5);
    const [dueDate, setDueDate] = useState<Date>(new Date(currDueDate));
    const [updateQuiz, {isLoading: isUpdatingQuiz}] = useUpdateQuizAssignmentMutation();
    const dispatch = useAppDispatch();

    const setValidDueDate = () => {
        if (isUpdatingQuiz || !numericQuizAssignmentId || !dueDate || currDueDate == dueDate) {
            return;
        }

        if (currDueDate && (dueDate > currDueDate || dueDate > TODAY())) {
            updateQuiz({quizAssignmentId: numericQuizAssignmentId, update: {dueDate: dueDate}})
                .then((result) => {
                    if (mutationSucceeded(result)) {
                        dispatch(showSuccessToast(
                            t('dueDateExtendedSuccessfully', 'Due date extended successfully. '), t('thisTestIsNowDueByVal', 'This test is now due by') + ' ' + dueDate.toLocaleDateString()
                        ));
                        toggle();
                    }
                });
        }
    };

    return <Modal isOpen={isOpen} toggle={toggle} data-bs-theme="neutral">
        <ModalHeader role={"heading"} className={"text-break d-flex justify-content-between"} close={
            <button className={"text-nowrap close"} onClick={toggle}>
                {t('close', 'Close')}
            </button>
        }>
            {t('extendDueDate2', 'Extend due date?')}
        </ModalHeader>
        <ModalBody>
            <p className="px-1">{t('areYouSureYouWantToChangeTheDueDateThisWillExtendTheDueDateForAllUsersThisTestIsAssignedTo', 'Are you sure you want to change the due date? This will extend the due date for all users this test is assigned to.')}</p>
            <hr className="text-center"/>
            <div className="p-2">
                <Label for="dueDate" className="pe-1">{t('extendTheDueDate', 'Extend the due date:')}
                    <DateInput id="dueDate" value={dueDate} invalid={dueDate && ((dueDate < currDueDate) || dueDate <= TODAY())}
                        yearRange={yearRange} noClear disabled={isUpdatingQuiz} className="text-center"
                        onChange={(e) => e.target.valueAsDate && setDueDate(e.target.valueAsDate)}
                    />
                </Label>
                {dueDate && (dueDate < currDueDate || dueDate <= TODAY()) && 
                <p className={"text-danger"}>
                    {t('youCannotSetTheDueDateToBeEarlierThanTheCurrentDueDateOrToday', 'You cannot set the due date to be earlier than the current due date or today.')}
                </p>}
                <Button
                    className="mt-2 mb-2"
                    block color="secondary"
                    onClick={setValidDueDate}
                    role={"button"}
                    disabled={isUpdatingQuiz && dueDate && (dueDate < currDueDate)}>
                    {t('extendDueDate3', 'Extend due date')}
                </Button>
            </div>
        </ModalBody>
    </Modal>;
};

