import React, {ChangeEvent, useState} from "react";
import {ContentSummaryDTO, IsaacQuizDTO, QuizAssignmentDTO, QuizFeedbackMode} from "../../../../IsaacApiTypes";
import {
    AppDispatch,
    changePage,
    closeActiveModal,
    selectors,
    useAppDispatch,
    useAppSelector,
    useAssignQuizMutation,
    useGetGroupsQuery,
    useGetQuizAssignmentsSetByMeQuery,
} from "../../../state";
import {assignMultipleQuiz, isDefined, Item, selectOnChange, siteSpecific, TODAY} from "../../../services";
import range from "lodash/range";
import {currentYear, DateInput} from "../inputs/DateInput";
import {IsaacSpinner} from "../../handlers/IsaacSpinner";
import {ShowLoadingQuery} from "../../handlers/ShowLoadingQuery";
import {StyledSelect} from "../inputs/StyledSelect";
import {Button, Form, FormFeedback, FormGroup, Label, UncontrolledTooltip} from "reactstrap";
import { AppGroup } from "../../../../IsaacAppTypes";
import classNames from "classnames";


type QuizFeedbackOption = Item<QuizFeedbackMode>;
const feedbackOptions = {
    NONE: "No feedback",
    OVERALL_MARK: "Overall mark",
    SECTION_MARKS: "Mark for each test section",
    DETAILED_FEEDBACK: "Detailed feedback on each question",
};

const feedbackOptionsList: QuizFeedbackOption[] = Object.keys(feedbackOptions).map(key => {
    const mode = key as QuizFeedbackMode;
    return {label: feedbackOptions[mode], value: mode};
});

const feedbackOptionsMap = feedbackOptionsList.reduce((obj, option) => {
    obj[option.value] = option;
    return obj;
}, {} as {[key in QuizFeedbackMode]: QuizFeedbackOption});

interface QuizSettingModalProps {
    allowedToSchedule?: boolean;
    quiz: ContentSummaryDTO | IsaacQuizDTO;
    dueDate?: Date | null;
    scheduledStartDate?: Date | null;
    feedbackMode?: QuizFeedbackMode | null;
}

export function QuizSettingModal({quiz, dueDate: initialDueDate, scheduledStartDate: initialScheduledStartDate, feedbackMode: initialFeedbackMode}: QuizSettingModalProps) {
    const dispatch: AppDispatch = useAppDispatch();
    const groupsQuery = useGetGroupsQuery(false);
    const user = useAppSelector(selectors.user.loggedInOrNull);

    const [_assignQuiz, {isLoading: isAssigning}] = useAssignQuizMutation();

    const [validationAttempted, setValidationAttempted] = useState(false);
    const [selectedGroups, setSelectedGroups] = useState<Item<number>[]>([]);
    const [dueDate, setDueDate] = useState<Date | null>(initialDueDate ?? null);
    const [scheduledStartDate, setScheduledStartDate] = useState<Date | null>(initialScheduledStartDate ?? null);
    const [feedbackMode, setFeedbackMode] = useState<QuizFeedbackMode | null>(initialFeedbackMode ?? null);
    const {data: quizAssignments} = useGetQuizAssignmentsSetByMeQuery();

    const yearRange = range(currentYear, currentYear + 5);

    function attemptAssign() {
        setValidationAttempted(true);
        if (groupInvalid || feedbackModeInvalid || dueDateInvalid || scheduledStartDateInvalid) {
            return;
        }
        assign();
    }

    function assign() {
        dispatch(assignMultipleQuiz({
            quizId: quiz?.id as string,
            groups: selectedGroups,
            dueDate: dueDate ?? undefined,
            scheduledStartDate: scheduledStartDate ?? undefined,
            quizFeedbackMode: feedbackMode ?? undefined,
            userId: user?.id
        })).then(success => {
            if (success) {
                setSelectedGroups([]);
                setDueDate(null);
                setScheduledStartDate(null);
                setFeedbackMode(null);
                dispatch(closeActiveModal());
                changePage("/set_tests#manage");
            }
        });
    }

    const isAssignmentSetToThisGroup = (group: Item<number>, assignment?: QuizAssignmentDTO) => assignment ? (assignment.quizId === quiz.id && assignment.groupId === group.value && (assignment.dueDate ? assignment.dueDate.valueOf() > Date.now() : true)) : false;
    const alreadyAssignedToAGroup = selectedGroups.some(group => quizAssignments?.some(assignment => isAssignmentSetToThisGroup(group, assignment)));

    const groupInvalid = selectedGroups.length === 0 || alreadyAssignedToAGroup;
    const feedbackModeInvalid = feedbackMode === null;
    const dueDateInvalid = !isDefined(dueDate) || (scheduledStartDate ? scheduledStartDate.valueOf() > dueDate.valueOf() : false) || dueDate.valueOf() < Date.now();
    const scheduledStartDateInvalid = isDefined(scheduledStartDate) && scheduledStartDate.valueOf() < TODAY().valueOf(); // optional, so undefined is valid

    const scheduledQuizHelpTooltipId = "scheduled-quiz-help-tooltip";

    return <Form 
        className={classNames("mb-4")} 
        onSubmit={(e) => {e.preventDefault(); attemptAssign();}}>
        <FormGroup>
            <Label className="w-100">
                <span className="form-required">Set test to the following group(s):</span>
                <ShowLoadingQuery
                    query={groupsQuery}
                    defaultErrorTitle={"Error fetching groups"}
                    thenRender={groups => {
                        const groupOptions = groups
                            .map((g: AppGroup) => {return {label: g.groupName as string, value: g.id as number}; })
                            .sort((a, b) => a.label.localeCompare(b.label));

                        return <div className={classNames({"is-invalid": validationAttempted && groupInvalid})}>
                            <StyledSelect isMulti placeholder="Select groups"
                                closeMenuOnSelect={false}
                                options={groupOptions}
                                onChange={(s) => {
                                    selectOnChange(setSelectedGroups, false)(s);
                                }}
                                value={selectedGroups}
                                isSearchable
                                menuPortalTarget={document.body}
                                styles={{
                                    control: (styles) => ({...styles, ...(validationAttempted && groupInvalid ? {borderColor: '#dc3545'} : {})}),
                                    menuPortal: base => ({...base, zIndex: 9999}),
                                }}
                            />
                        </div>;
                    }}
                />
                {(selectedGroups.length === 0 
                    ? <FormFeedback>You must select a group</FormFeedback> 
                    : <FormFeedback>{siteSpecific("You cannot reassign a test to this group(s) until the due date has passed.", 
                        "This test has already been assigned to this group.")}</FormFeedback>
                )}
            </Label>
        </FormGroup>

        <FormGroup>
            <Label className="w-100">
                <span className="form-required">What level of feedback should students get:</span>
                <div className={classNames({"is-invalid": validationAttempted && feedbackModeInvalid})}>
                    <StyledSelect
                        value={feedbackMode ? feedbackOptionsMap[feedbackMode] : null}
                        onChange={(s) => {
                            if (s && (s as QuizFeedbackOption).value) {
                                const item = s as QuizFeedbackOption;
                                setFeedbackMode(item.value);
                            }
                        }}
                        options={feedbackOptionsList}
                        menuPortalTarget={document.body}
                        styles={{
                            control: (styles) => ({...styles, ...(validationAttempted && feedbackModeInvalid ? {borderColor: '#dc3545'} : {})}),
                            menuPortal: base => ({...base, zIndex: 9999}),
                        }}
                    />
                </div>
                <FormFeedback>You must select a feedback mode</FormFeedback>
            </Label>
        </FormGroup>

        <FormGroup>
            <Label className="w-100">
                <div className={siteSpecific("d-flex align-items-center", "")}>
                    <span className="form-optional">Start date:</span>
                    <i id={scheduledQuizHelpTooltipId} className={classNames("icon icon-info icon-inline ms-2", siteSpecific("icon-color-grey", "icon-color-black"))} />
                </div>
                <DateInput 
                    value={scheduledStartDate ?? undefined} 
                    invalid={scheduledStartDateInvalid || undefined}
                    yearRange={yearRange}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setScheduledStartDate(e.target.valueAsDate)}
                />
                <UncontrolledTooltip placement="top" autohide={false} target={scheduledQuizHelpTooltipId}>
                    You can schedule a test to appear in the future by setting a start date.
                    The test will be visible to students from this date onwards.<br/>
                    If you do not set a start date, the test will be visible immediately.
                </UncontrolledTooltip>
                <FormFeedback>Start date must be today or in the future.</FormFeedback>
            </Label>
        </FormGroup>

        <FormGroup>
            <Label className="w-100">
                <span className="form-required">Set a due date:</span>
                <DateInput 
                    invalid={validationAttempted && dueDateInvalid} 
                    value={dueDate ?? undefined} 
                    yearRange={yearRange}
                    onChange={(e) => setDueDate(e.target.valueAsDate)}
                />
                <FormFeedback>
                    {!isDefined(dueDate) 
                        ? "Select a due date for the assignment."
                        : dueDate.valueOf() > TODAY().valueOf() 
                            ? "Due date must be on or after the start date." 
                            : "Due date must be after today."}
                </FormFeedback>
            </Label>
        </FormGroup>

        <div className="d-flex justify-content-between gap-4 mb-4 w-100">
            <Button
                className={"float-start w-100 w-sm-auto"}
                color="keyline"
                disabled={isAssigning}
                onClick={() => dispatch(closeActiveModal())}
            >
                Close
            </Button>
            <Button
                className={"float-end w-100 w-sm-auto"}
                color="solid"
                disabled={isAssigning}
            >
                {isAssigning ? <IsaacSpinner size={"sm"} /> : "Set test"}
            </Button>
        </div>
    </Form>;
}
