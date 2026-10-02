import React, {ChangeEvent, useState} from "react";
import {
    Button,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    Label,
    UncontrolledTooltip
} from "reactstrap";
import {
    assignGameboard,
    selectors,
    useAppDispatch,
    useAppSelector,
} from "../../../state";
import range from "lodash/range";
import sortBy from "lodash/sortBy";
import {currentYear, DateInput} from "../../elements/inputs/DateInput";
import {
    isDefined,
    isEventLeaderOrStaff,
    Item,
    itemise,
    nthHourOf,
    selectOnChange,
    siteSpecific,
    TODAY,
    UTC_MIDNIGHT_IN_SIX_DAYS,
    addDays,
    nthUtcHourOf,
    isPhy,
} from "../../../services";
import {Loading} from "../../handlers/IsaacSpinner";
import {GameboardDTO, UserGroupDTO} from "../../../../IsaacApiTypes";
import {BoardAssignee, ActiveModalProps} from "../../../../IsaacAppTypes";
import {StyledSelect} from "../../elements/inputs/StyledSelect";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import i18next from "i18next";


interface AssignGroupProps {
    groups: UserGroupDTO[];
    currentAssignees: BoardAssignee[];
    board: GameboardDTO | undefined;
    closeModal: () => void;
}

const AssignGroup = ({groups, currentAssignees, board, closeModal}: AssignGroupProps) => {
    const { t } = useTranslation();
    const [selectedGroups, setSelectedGroups] = useState<Item<number>[]>([]);
    const [dueDate, setDueDate] = useState<Date | undefined>(UTC_MIDNIGHT_IN_SIX_DAYS);
    const [userSelectedDueDate, setUserSelectedDueDate] = useState<boolean>(false);
    const [scheduledStartDate, setScheduledStartDate] = useState<Date | undefined>(TODAY);
    const [assignmentNotes, setAssignmentNotes] = useState<string>();
    const [validationAttempted, setValidationAttempted] = useState<boolean>(false);
    const user = useAppSelector(selectors.user.loggedInOrNull);
    const dispatch = useAppDispatch();

    if (!board) return <Loading/>;

    function attemptAssign() {
        setValidationAttempted(true);
        if (groupInvalid || dueDateInvalid || !dueDate || startDateInvalid || notesInvalid) {
            return;
        }
        assign();
    }

    function assign() {
        void dispatch(assignGameboard({
            boardId: board?.id as string,
            groups: selectedGroups,
            dueDate,
            scheduledStartDate,
            notes: assignmentNotes,
            userId: user?.id
        })).then(success => {
            if (success) {
                setSelectedGroups([]);
                setDueDate(UTC_MIDNIGHT_IN_SIX_DAYS);
                setUserSelectedDueDate(false);
                setScheduledStartDate(undefined);
                setAssignmentNotes('');
                setValidationAttempted(false);
                closeModal();
            }
        });
    }

    function setScheduledStartDateAtSevenAM(e: ChangeEvent<HTMLInputElement>) {
        const utcDate = e.target.valueAsDate;
        if (utcDate) {
            const scheduledDate = new Date(utcDate.getFullYear(), utcDate.getMonth(), utcDate.getDate(), 7);
            // Sets the scheduled date to 7AM in the timezone of the browser.
            setScheduledStartDate(scheduledDate);

            if (!userSelectedDueDate) {
                // Sets the due date to 6 days after the scheduled start date at UTC midnight (if the user hasn't already selected a due date).
                setDueDate(addDays(6, nthUtcHourOf(0, scheduledDate)));
            }
        } else {
            setScheduledStartDate(undefined);
        }
    }

    const yearRange = range(currentYear, currentYear + 5);
    const dueDateInvalid = isDefined(dueDate) && ((scheduledStartDate ? (nthHourOf(0, scheduledStartDate).valueOf() > dueDate.valueOf()) : false) || TODAY().valueOf() > dueDate.valueOf());
    const startDateInvalid = scheduledStartDate ? TODAY().valueOf() > scheduledStartDate.valueOf() : false;
    const groupInvalid = selectedGroups.length === 0 || selectedGroups.some(g => currentAssignees.some(a => a.groupId === g.value));
    const notesInvalid = isDefined(assignmentNotes) && assignmentNotes.length > 500;

    return <Form onSubmit={e => {e.preventDefault(); attemptAssign();}} className="py-2">
        <FormGroup>
            <Label data-testid="modal-groups-selector" className="w-100 pb-2">
                <span className="form-required">{t("common:assignments.setModal.groupsLabel")}</span>
                <div className={classNames({"is-invalid": validationAttempted && groupInvalid})}>
                    <StyledSelect inputId="groups-to-assign" isMulti placeholder={t("common:assignments.setModal.groupsPlaceholder")}
                        value={selectedGroups}
                        closeMenuOnSelect={false}
                        onChange={selectOnChange(setSelectedGroups, false)}
                        options={sortBy(groups, group => group.groupName && group.groupName.toLowerCase()).map(g => itemise(g.id as number, g.groupName))}
                    />
                </div>
                {(selectedGroups.length === 0 
                    ? <FormFeedback>{t("common:assignments.setModal.groupsRequired")}</FormFeedback> 
                    : <FormFeedback>
                        {`${siteSpecific(
                            `You cannot reassign a question deck to ${selectedGroups.length === 1 ? "this group" : "the following groups"} until the due date has passed:`,
                            `This quiz has already been assigned to ${selectedGroups.length === 1 ? "this group" : "the following groups"}:`)}
                        ${selectedGroups.filter(g => currentAssignees.some(a => a.groupId === g.value)).map(g => g.label).join(", ")}`}
                    </FormFeedback>
                )}
            </Label>
        </FormGroup>
        <FormGroup>
            <Label data-testid="modal-start-date-selector" className="w-100 pb-2">
                <span className="form-optional">{t("common:assignments.setModal.startDateLabel")}</span>
                <DateInput value={scheduledStartDate} placeholder={t("common:assignments.setModal.startDatePlaceholder")}
                    yearRange={yearRange} invalid={validationAttempted && startDateInvalid}
                    onChange={setScheduledStartDateAtSevenAM}/>
                <FormFeedback>{startDateInvalid && t("common:assignments.setModal.startDateFuture")}</FormFeedback>
            </Label>
        </FormGroup>
        <FormGroup>
            <Label data-testid="modal-due-date-selector" className="w-100 pb-2">
                <span className="form-required">{t("common:assignments.setModal.dueDateLabel")}</span>
                <DateInput value={dueDate} placeholder={t("common:assignments.setModal.dueDatePlaceholder")} yearRange={yearRange} invalid={validationAttempted && (dueDateInvalid || !dueDate)}
                    onChange={e => {setUserSelectedDueDate(true); setDueDate(e.target.valueAsDate ?? undefined);}}/>
                <FormFeedback>{!dueDate && t("common:assignments.setModal.dueDateRequired")}</FormFeedback>
                <FormFeedback>{dueDateInvalid && t("common:assignments.setModal.dueDateAfterStart")}</FormFeedback>
            </Label>
        </FormGroup>
        <FormGroup>
            {isEventLeaderOrStaff(user) && <Label data-testid="modal-notes" className="w-100 pb-2">
                <span>{t("common:assignments.setModal.notesLabel")}</span>
                <Input type="textarea" spellCheck={true} rows={3} value={assignmentNotes}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAssignmentNotes(e.target.value)}/>
                <p className="mt-1 mb-0"><small>{t("common:assignments.setModal.notesCharacterCount", { characterCount: (assignmentNotes || '').length })}</small></p>
                <FormFeedback>{notesInvalid && t("common:assignments.setModal.notesMaxLength")}</FormFeedback>
            </Label>}
        </FormGroup>
        
        <Button className="my-2" block color="solid" type="submit">
            Assign to group{selectedGroups.length > 1 && "s"}
        </Button>
    </Form>;
};

interface AssignmentDisplayProps {
    board: GameboardDTO | undefined;
    currentAssignees: BoardAssignee[];
    setCurrentAssignees: (assignees: BoardAssignee[]) => void;
    unassignBoard: (props: { boardId: string, groupId: number }) => void;
}

const AssignmentDisplay = ({board, currentAssignees, setCurrentAssignees, unassignBoard}: AssignmentDisplayProps) => {
    const { t } = useTranslation();
    const hasStarted = (a: { startDate?: Date | number }) => !a.startDate || (Date.now() > a.startDate.valueOf());

    const startedAssignees = currentAssignees.filter(hasStarted);
    const scheduledAssignees = currentAssignees.filter(a => !hasStarted(a));

    function confirmUnassignBoard(groupId: number, groupName?: string) {
        if (board?.id && confirm(`Are you sure you want to unassign this ${siteSpecific("question deck", "quiz")} from ${groupName ? `group ${groupName}` : "this group"}?`)) {
            unassignBoard({boardId: board?.id, groupId});
            setCurrentAssignees(currentAssignees.filter(a => a.groupId !== groupId));
        }
    }

    return <> 
        <div className="py-2 border-bottom d-flex flex-column" data-testid="currently-assigned-to">
            <span>{t("site:assignments.display.currentlyAssigned")}</span>
            {startedAssignees.length > 0
                ? <ul className="p-2 mb-3">{startedAssignees.map(assignee =>
                    <li data-testid="current-assignment" key={assignee.groupId}
                        className="my-1 px-1 d-flex justify-content-between">
                        <span className="flex-grow-1">{assignee.groupName}</span>
                        <button className="close bg-transparent invert-underline" aria-label={t("common:assignments.setModal.unassignGroup")} 
                            onClick={() => confirmUnassignBoard(assignee.groupId, assignee.groupName)}>
                            {t("common:assignments.setModal.unassignButton")}
                        </button>
                    </li>
                )}</ul>
                : <p className="p-2">{t("common:assignments.setModal.noGroups")}</p>}
        </div>
        <div className="py-2 d-flex flex-column">
            <span className={classNames("mb-2", {"d-flex align-items-center": isPhy})}>
                {t("site:assignments.display.pendingTitle")}
                <i className={classNames("icon icon-info icon-inline ms-2", siteSpecific("icon-color-grey", "icon-color-black"))}
                    id={`pending-assignments-help-${board?.id}`}/>
            </span>
            <UncontrolledTooltip placement="left" autohide={false} target={`pending-assignments-help-${board?.id}`}>
                {t("site:assignments.display.pendingDescription")}
            </UncontrolledTooltip>
            {scheduledAssignees.length > 0
                ? <ul className="p-2 mb-3">{scheduledAssignees.map(assignee =>
                    <li data-testid="pending-assignment" key={assignee.groupId} className="my-1 px-1 d-flex justify-content-between">
                        <span className="flex-grow-1">{assignee.groupName}</span>
                        {assignee.startDate && <>
                            <span id={`start-date-${assignee.groupId}`}
                                className="ms-auto me-2">🕑 {(typeof assignee.startDate === "number"
                                    ? new Date(assignee.startDate)
                                    : assignee.startDate).toDateString()}
                            </span>
                        </>}
                        <button className={classNames("close bg-transparent", {"mt-n1": isPhy})} aria-label={t("common:assignments.setModal.unassignGroup")} onClick={() => confirmUnassignBoard(assignee.groupId, assignee.groupName)}>
                            ×
                        </button>
                    </li>
                )}</ul>
                : <p className="p-2">{t("common:assignments.setModal.noGroups")}</p>}
        </div>
    </>;
};

type SetAssignmentsModalProps = {
    board: GameboardDTO | undefined;
    assignees: BoardAssignee[];
    groups: UserGroupDTO[];
    toggle: () => void;
    unassignBoard: (props: { boardId: string, groupId: number }) => void;
};

const SetAssignmentsModalContent = (props: SetAssignmentsModalProps) => {
    const { t } = useTranslation();
    const {assignees, toggle} = props;
    const [currentAssignees, setCurrentAssignees] = useState<BoardAssignee[]>(assignees);
    
    return <div>
        <p className="px-1"> 
            {t("common:assignments.setModal.schedulingInfo")}
        </p>
        <hr className="text-center"/>
        <AssignGroup {...props} closeModal={toggle} currentAssignees={currentAssignees}/>
        <hr className="text-center"/>
        <AssignmentDisplay {...props} currentAssignees={currentAssignees} setCurrentAssignees={setCurrentAssignees}/>
    </div>;
};

export const SetAssignmentsModal = (props: SetAssignmentsModalProps): ActiveModalProps => {
    const {board, toggle} = props;

    return {
        closeAction: toggle,
        size: "md",
        title: i18next.t("common:assignments.setModal.title", { boardTitle: board?.title }),
        body: <SetAssignmentsModalContent {...props} />,
        buttons: [<Button key={0} aria-label={i18next.t("common:assignments.setModal.closeAriaLabel")} color="keyline" className="w-100" onClick={toggle}>{i18next.t("common:assignments.setModal.closeButton")}</Button>]
    };
};
