import React, {ChangeEvent, useEffect, useRef} from "react";
import {BooleanNotation, DisplaySettings, ValidationUser} from "../../../../IsaacAppTypes";
import {
    EMPTY_BOOLEAN_NOTATION_RECORD,
    EXAM_BOARD,
    examBoardBooleanNotationMap,
    getFilteredExamBoardOptions,
    getFilteredStageOptions,
    isAda,
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
import isUndefined from "lodash/isUndefined";
import { WithLinkableSetting } from "../WithLinkableSetting";

interface RegisteredContextRowProps {
    registeredContext: UserContext;
    setRegisteredContext: (ucs: UserContext) => void;
    showNullStageOption: boolean;
    submissionAttempted: boolean;
    existingRegisteredContexts: UserContext[];
    setBooleanNotation: (bn: BooleanNotation) => void;
    setDisplaySettings: (ds: DisplaySettings | ((oldDs?: DisplaySettings) => DisplaySettings)) => void;
    tutorOrAbove: boolean;
    registeredContexts: UserContext[];
    setRegisteredContexts: (ucs: UserContext[]) => void;
    index: number;
    required: boolean;
}

function RegisteredContextRow({
    registeredContext, setRegisteredContext, showNullStageOption, submissionAttempted, existingRegisteredContexts, setBooleanNotation, setDisplaySettings,
    tutorOrAbove, registeredContexts, setRegisteredContexts, index, required: _required
}: RegisteredContextRowProps) {
    const onlyUCWithThisStage = existingRegisteredContexts.length === 0 || existingRegisteredContexts.filter(uc => uc.stage === registeredContext.stage).length === 1;

    const onStageUpdate = (e: ChangeEvent<HTMLInputElement>) => {
        const stage = e.target.value as STAGE;
        if (!isAda) {
            setRegisteredContext({...registeredContext, stage});
            return;
        }
        // Set exam board to something sensible (for CS)
        const onlyOneAtThisStage = existingRegisteredContexts.length === 0 || existingRegisteredContexts.filter(uc => uc.stage === e.target.value).length === 1;
        const possibleExamBoards = getFilteredExamBoardOptions(
            {byStages: [stage || STAGE.ALL], byUserContexts: existingRegisteredContexts, includeNullOptions: onlyOneAtThisStage
            });
        const examBoards = possibleExamBoards.map(e => e.value) || [EXAM_BOARD.ADA];
        const examBoard = examBoards.includes(registeredContext.examBoard as EXAM_BOARD) && registeredContext.examBoard || possibleExamBoards[0].value;
        setBooleanNotation({...EMPTY_BOOLEAN_NOTATION_RECORD, [examBoardBooleanNotationMap[examBoard]]: true});

        setRegisteredContext({...registeredContext, stage, examBoard});
    };

    const onExamBoardUpdate = (e: ChangeEvent<HTMLInputElement>) => {
        const examBoard: EXAM_BOARD = e.target.value as EXAM_BOARD;
        setRegisteredContext({...registeredContext, examBoard: examBoard});
        if (e.target.value) {
            setBooleanNotation({...EMPTY_BOOLEAN_NOTATION_RECORD, [examBoardBooleanNotationMap[examBoard]]: true});
        }
    };

    useEffect(() => {
        // Deliberately set default user context on Ada for users who have no context
        if (isAda && (isUndefined(registeredContext.stage) || isUndefined(registeredContext.examBoard))) {
            const stage = registeredContext.stage ?? STAGE.ALL;
            const examBoard = registeredContext.examBoard ?? EXAM_BOARD.ADA;
            setRegisteredContext({stage, examBoard});
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setRegisteredContext]);

    return <React.Fragment>
        {/* Stage Selector */}
        <div className="d-flex flex-row justify-content-between">
            <StyledDropdown
                className={classNames("account-dropdown", {"me-1" : isAda})}
                aria-label="Stage"
                invalid={submissionAttempted && !Object.values(STAGE).includes(registeredContext.stage as STAGE)}
                onChange={onStageUpdate}
                value={registeredContext.stage}
            >
                {isPhy && <option value="" className="d-none"/>}
                {getFilteredStageOptions({
                    byUserContexts: existingRegisteredContexts.filter(uc => !(uc.stage === registeredContext.stage && uc.examBoard === registeredContext.examBoard)),
                    includeNullOptions: showNullStageOption, hideFurtherA: true
                }).map(item =>
                    <option key={item.value} value={item.value}>{item.label}</option>
                )}
            </StyledDropdown>

            {/* Exam Board Selector */}
            {isAda && <StyledDropdown
                className="account-dropdown ms-1"
                aria-label="Exam Board"
                invalid={submissionAttempted && !Object.values(EXAM_BOARD).includes(registeredContext.examBoard as EXAM_BOARD)}
                onChange={onExamBoardUpdate}
                value={registeredContext.examBoard}
            >
                {getFilteredExamBoardOptions({
                    byStages: [registeredContext.stage as STAGE || STAGE.ALL],
                    includeNullOptions: onlyUCWithThisStage,
                    byUserContexts: existingRegisteredContexts.filter(uc => !(uc.stage === registeredContext.stage && uc.examBoard === registeredContext.examBoard))
                }).map(item =>
                    <option key={item.value} value={item.value}>{item.label}</option>
                )}
            </StyledDropdown>}

            <div className="remove-stage-container">
                {tutorOrAbove && registeredContexts.length > 1 && <Button close
                    className="close float-none bg-white p-2" aria-label="clear stage row"
                    disabled={registeredContexts.length <= 1}
                    onClick={() => setRegisteredContexts(registeredContexts.filter((_uc, i) => i !== index))}
                />}
            </div>
        </div>
    </React.Fragment>;
}

interface RegisteredContextAccountInputProps {
    user: Immutable<ValidationUser>;
    registeredContexts: UserContext[];
    setRegisteredContexts: (ucs: UserContext[]) => void;
    setBooleanNotation: (bn: BooleanNotation) => void;
    displaySettings: Nullable<DisplaySettings>;
    setDisplaySettings: (ds: DisplaySettings | ((oldDs?: DisplaySettings) => DisplaySettings)) => void;
    submissionAttempted: boolean;
    required?: boolean;
    className?: string;
}
export function RegisteredContextAccountInput({
    user, registeredContexts, setRegisteredContexts, displaySettings, setDisplaySettings, setBooleanNotation, submissionAttempted, required=true, className=""
}: RegisteredContextAccountInputProps) {
    const tutorOrAbove = isTutorOrAbove({...user, loggedIn: true});
    const componentId = useRef(uuid_v4().slice(0, 4)).current;
    const noMoreValidStages = !getFilteredStageOptions({byUserContexts: registeredContexts, hideFurtherA: true}).length;
    const isAllStages = registeredContexts.length === 1 && registeredContexts[0].stage === STAGE.ALL || noMoreValidStages;

    return <WithLinkableSetting id={"account-context"} className={className}>
        <div className="mb-2">
            <Label htmlFor="user-context-selector" className={classNames("fw-bold mb-0", (required ? "form-required" : "form-optional"))}>
                {siteSpecific(
                    <span>{tutorOrAbove ? "I am teaching..." : "I am interested in..."}</span>,
                    <span>Show me content for...</span>
                )}
            </Label>
            <i id={`show-me-content-${componentId}`} className={classNames("icon icon-inline icon-info mx-2", siteSpecific("icon-color-grey", "icon-color-black"))} />
            <UncontrolledTooltip placement={"left-start"} target={`show-me-content-${componentId}`}>
                {siteSpecific(<>
                    {"Choose a stage here to pre-select the material that is most relevant to your interests."}<br />
                    {"You will be able to change this preference on relevant pages."}<br />
                    {'If you prefer to see all content by default, select "All stages".'}
                </>, 
                <>
                    {/* This tooltip is very hard to reach */}
                    {tutorOrAbove ?
                        <>Add a stage and examination board for each qualification you are teaching.<br />On content pages, this will allow you to quickly switch between your personalised views of the content, depending on which class you are currently teaching.</> :
                        <>Select a stage and examination board here to filter the content so that you will only see material that is relevant for the qualification you have chosen.</>
                    }
                </>)}
            </UncontrolledTooltip>
        </div>
        
        <div id="user-context-selector" className={classNames({"d-flex flex-wrap": isPhy})}>

            {registeredContexts.length ? registeredContexts.map((registeredContext, index) => {
                return <FormGroup key={index}>
                    <RegisteredContextRow
                        registeredContext={registeredContext} showNullStageOption={registeredContexts.length <= 1} submissionAttempted={submissionAttempted}
                        setRegisteredContext={newUc => setRegisteredContexts(registeredContexts.map((uc, i) => i === index ? newUc : uc))}
                        existingRegisteredContexts={registeredContexts} setBooleanNotation={setBooleanNotation} setDisplaySettings={setDisplaySettings}
                        tutorOrAbove={tutorOrAbove} registeredContexts={registeredContexts} setRegisteredContexts={setRegisteredContexts}
                        index={index} required={required}
                    />
                </FormGroup>;
            }) : <FormGroup>
                <RegisteredContextRow
                    registeredContext={{stage: STAGE.ALL, examBoard: siteSpecific(undefined, EXAM_BOARD.ALL)}} showNullStageOption={true} submissionAttempted={submissionAttempted}
                    // this component is replaced as soon as the user selects a stage, so this alternative setRegisteredContext function is okay here, even if setting multiple
                    setRegisteredContext={newUc => setRegisteredContexts([newUc])} existingRegisteredContexts={registeredContexts} setBooleanNotation={setBooleanNotation}
                    setDisplaySettings={setDisplaySettings} tutorOrAbove={tutorOrAbove} registeredContexts={registeredContexts} setRegisteredContexts={setRegisteredContexts}
                    index={0} required={required}
                />
            </FormGroup>
            }
            {isAda && tutorOrAbove && !isAllStages &&
                <Col lg={6} className="p-0 pe-4 pe-lg-0">
                    <Button color="keyline" className="mb-3 px-2 w-100"
                        onClick={() => {
                            const newStage = getFilteredStageOptions({byUserContexts: registeredContexts})[0]?.value as STAGE;
                            const newExamBoard = getFilteredExamBoardOptions({byStages: [newStage || STAGE.ALL], byUserContexts: registeredContexts})[0]?.value as EXAM_BOARD;
                            setRegisteredContexts([...registeredContexts, {stage: newStage, examBoard: newExamBoard}]);
                        }}
                        disabled={!validateUserContexts(registeredContexts)}>
                        Add more content
                    </Button>
                </Col>}
            {isPhy && tutorOrAbove && validateUserContexts(registeredContexts) && !isAllStages && <div className="mb-3 ms-2 align-content-center remove-stage-container">
                <Button
                    aria-label="Add stage"
                    className={`ms-2 align-middle btn-plus float-none pointer-cursor bg-transparent`}
                    onClick={() => setRegisteredContexts([...registeredContexts, {}])}
                />
            </div>}
        </div>
    </WithLinkableSetting>;
}
