import React, {useRef} from "react";
import {BooleanNotation, DisplaySettings, ValidationUser} from "../../../../IsaacAppTypes";
import {
    EMPTY_BOOLEAN_NOTATION_RECORD,
    EXAM_BOARD,
    examBoardBooleanNotationMap,
    getFilteredExamBoardOptions,
    getFilteredStageOptions,
    isAda,
    isDefined,
    isPhy,
    isTutorOrAbove,
    siteSpecific,
    STAGE,
    validateUserContexts
} from "../../../services";
import {Button, Col, FormGroup, Label, UncontrolledTooltip} from "reactstrap";
import {UserContext} from "../../../../IsaacApiTypes";
import {v4 as uuid_v4} from "uuid";
import classNames from "classnames";
import {Immutable} from "immer";
import {StyledDropdown} from "./DropdownInput";
import { StyledCheckbox } from "./StyledCheckbox";

interface UserContextRowProps {
    userContext: UserContext;
    setUserContext: (ucs: UserContext) => void;
    showNullStageOption: boolean;
    submissionAttempted: boolean;
    existingUserContexts: UserContext[];
    setBooleanNotation: (bn: BooleanNotation) => void;
    setDisplaySettings: (ds: DisplaySettings | ((oldDs?: DisplaySettings) => DisplaySettings)) => void;
    tutorOrAbove: boolean;
    userContexts: UserContext[];
    setUserContexts: (ucs: UserContext[]) => void;
    index: number;
    required: boolean;
}

function UserContextRow({
    userContext, setUserContext, showNullStageOption, submissionAttempted, existingUserContexts, setBooleanNotation, setDisplaySettings,
    tutorOrAbove, userContexts, setUserContexts, index, required
}: UserContextRowProps) {
    const onlyUCWithThisStage = existingUserContexts.length === 0 || existingUserContexts.filter(uc => uc.stage === userContext.stage).length === 1;

    const onStageUpdate = (e: any) => {
        const stage = e.target.value as STAGE;
        if (!isAda) {
            setUserContext({...userContext, stage});
            return;
        }
        // Set exam board to something sensible (for CS)
        const onlyOneAtThisStage = existingUserContexts.length === 0 || existingUserContexts.filter(uc => uc.stage === e.target.value).length === 1;
        const possibleExamBoards = getFilteredExamBoardOptions(
            {byStages: [stage || STAGE.ALL], byUserContexts: existingUserContexts, includeNullOptions: onlyOneAtThisStage
            }) || [EXAM_BOARD.ALL];
        const examBoard = possibleExamBoards.map(e => e.value).includes(userContext.examBoard as EXAM_BOARD) && userContext.examBoard || possibleExamBoards[0].value;
        setBooleanNotation({...EMPTY_BOOLEAN_NOTATION_RECORD, [examBoardBooleanNotationMap[examBoard]]: true});

        // Set display settings default values
        setDisplaySettings(oldDs => ({...oldDs, HIDE_NON_AUDIENCE_CONTENT: true}));
        setUserContext({...userContext, stage, examBoard});
    };

    const onExamBoardUpdate = (e: any) => {
        setUserContext({...userContext, examBoard: e.target.value as EXAM_BOARD});
        if (e.target.value) {
            setBooleanNotation({...EMPTY_BOOLEAN_NOTATION_RECORD, [examBoardBooleanNotationMap[e.target.value as EXAM_BOARD]]: true});
        }
    };

    return <React.Fragment>
        {/* Stage Selector */}
        <div className="d-flex flex-row justify-content-between">
            <StyledDropdown
                className={classNames("account-dropdown", {"me-1" : isAda})}
                aria-label="Stage"
                invalid={submissionAttempted && !Object.values(STAGE).includes(userContext.stage as STAGE)}
                onChange={onStageUpdate}
                value={userContext.stage}
            >
                <option value=""/>
                {getFilteredStageOptions({
                    byUserContexts: existingUserContexts.filter(uc => !(uc.stage === userContext.stage && uc.examBoard === userContext.examBoard)),
                    includeNullOptions: showNullStageOption, hideFurtherA: true
                }).map(item =>
                    <option key={item.value} value={item.value}>{item.label}</option>
                )}
            </StyledDropdown>

            {/* Exam Board Selector */}
            {isAda && <StyledDropdown
                className="account-dropdown ms-1"
                aria-label="Exam Board"
                invalid={submissionAttempted && !Object.values(EXAM_BOARD).includes(userContext.examBoard as EXAM_BOARD)}
                onChange={onExamBoardUpdate}
                value={userContext.examBoard}
            >
                <option value="" />
                {getFilteredExamBoardOptions({
                    byStages: [userContext.stage as STAGE || STAGE.ALL],
                    includeNullOptions: onlyUCWithThisStage,
                    byUserContexts: existingUserContexts.filter(uc => !(uc.stage === userContext.stage && uc.examBoard === userContext.examBoard))
                }).map(item =>
                    <option key={item.value} value={item.value}>{item.label}</option>
                )}
            </StyledDropdown>}

            <div className="remove-stage-container">
                {tutorOrAbove && userContexts.length > 1 && <Button close
                    className="close float-none bg-white p-2" aria-label="clear stage row"
                    disabled={userContexts.length <= 1}
                    onClick={() => setUserContexts(userContexts.filter((uc, i) => i !== index))}
                />}
            </div>
        </div>
    </React.Fragment>;
}

interface UserContextAccountInputProps {
    user: Immutable<ValidationUser>;
    userContexts: UserContext[];
    setUserContexts: (ucs: UserContext[]) => void;
    setBooleanNotation: (bn: BooleanNotation) => void;
    displaySettings: Nullable<DisplaySettings>;
    setDisplaySettings: (ds: DisplaySettings | ((oldDs?: DisplaySettings) => DisplaySettings)) => void;
    submissionAttempted: boolean;
    required?: boolean;
    className?: string;
}
export function UserContextAccountInput({
    user, userContexts, setUserContexts, displaySettings, setDisplaySettings, setBooleanNotation, submissionAttempted, required=true, className=""
}: UserContextAccountInputProps) {
    const tutorOrAbove = isTutorOrAbove({...user, loggedIn: true});
    const componentId = useRef(uuid_v4().slice(0, 4)).current;

    return <div className={className}>
        <Label htmlFor="user-context-selector" className={classNames("fw-bold", (required ? "form-required" : "form-optional"))}>
            {siteSpecific(
                <span>{tutorOrAbove ? "I am teaching..." : "I am interested in..."}</span>,
                <span>Show me content for...</span>
            )}
        </Label>
        {siteSpecific(
            // Physics
            <React.Fragment>
                <span id={`show-me-content-${componentId}`} className="icon-help" />
                <UncontrolledTooltip placement={"left-start"} target={`show-me-content-${componentId}`}>
                    {"Choose a stage here to pre-select the material that is most relevant to your interests."}<br />
                    {"You will be able to change this preference on relevant pages."}<br />
                    {'If you prefer to see all content by default, select "All stages".'}
                </UncontrolledTooltip>
            </React.Fragment>,
            // Computer science
            <React.Fragment>
                <span id={`show-me-content-${componentId}`} className="icon-help" />
                <UncontrolledTooltip placement={"left-start"} target={`show-me-content-${componentId}`}>
                    {/* This tooltip is very hard to reach */}
                    {tutorOrAbove ?
                        <>Add a stage and examination board for each qualification you are teaching.<br />On content pages, this will allow you to quickly switch between your personalised views of the content, depending on which class you are currently teaching.</> :
                        <>Select a stage and examination board here to filter the content so that you will only see material that is relevant for the qualification you have chosen.</>
                    }
                </UncontrolledTooltip>
            </React.Fragment>
        )}
        <div id="user-context-selector" className={classNames({"d-flex flex-wrap": isPhy})}>

            {userContexts.length ? userContexts.map((userContext, index) => {
                const showPlusOption = tutorOrAbove &&
                    index === userContexts.length - 1 &&
                    // at least one exam board for the potential stage
                    getFilteredStageOptions({byUserContexts: userContexts, hideFurtherA: true}).length > 0;

                return <FormGroup key={index}>
                    <UserContextRow
                        userContext={userContext} showNullStageOption={userContexts.length <= 1} submissionAttempted={submissionAttempted}
                        setUserContext={newUc => setUserContexts(userContexts.map((uc, i) => i === index ? newUc : uc))}
                        existingUserContexts={userContexts} setBooleanNotation={setBooleanNotation} setDisplaySettings={setDisplaySettings}
                        tutorOrAbove={tutorOrAbove} userContexts={userContexts} setUserContexts={setUserContexts}
                        index={index} required={required}
                        />
                </FormGroup>;
            }) : <FormGroup>
                    <UserContextRow
                        userContext={{stage: STAGE.ALL, examBoard: siteSpecific(undefined, EXAM_BOARD.ALL)}} showNullStageOption={true} submissionAttempted={submissionAttempted}
                        // this component is replaced as soon as the user selects a stage, so this alternative setUserContext function is okay here, even if setting multiple
                        setUserContext={newUc => setUserContexts([newUc])} existingUserContexts={userContexts} setBooleanNotation={setBooleanNotation}
                        setDisplaySettings={setDisplaySettings} tutorOrAbove={tutorOrAbove} userContexts={userContexts} setUserContexts={setUserContexts}
                        index={0} required={required}
                    />
                </FormGroup>
            }
            {isAda && <>
                {tutorOrAbove &&
                    <Col lg={6} className="p-0 pe-4 pe-lg-0">
                        <Button color="primary" outline className="mb-3 px-2 w-100"
                                onClick={() => setUserContexts([...userContexts, {}])}
                                disabled={!validateUserContexts(userContexts)}>
                            Add more content
                        </Button>
                    </Col>}
                {(userContexts.findIndex(p => p.stage === STAGE.ALL && p.examBoard === EXAM_BOARD.ALL) === -1) && <Label>
                    <StyledCheckbox
                        id={`hide-content-check-${componentId}`}
                        checked={isDefined(displaySettings?.HIDE_NON_AUDIENCE_CONTENT) ? !displaySettings?.HIDE_NON_AUDIENCE_CONTENT : true}
                        onChange={e => setDisplaySettings(oldDs => ({...oldDs, HIDE_NON_AUDIENCE_CONTENT: !e.target.checked}))}
                        label={<span>Show content that is not for my selected qualification(s)</span>}
                    />
                </Label>}
            </>}
            {!isAda && validateUserContexts(userContexts) && <div className="mb-3 ms-2 align-content-center remove-stage-container">
                <Button
                    aria-label="Add stage"
                    className={`ms-2 align-middle btn-plus float-none pointer-cursor bg-white`}
                    onClick={() => setUserContexts([...userContexts, {}])}
                />
            </div>}
        </div>
    </div>;
}