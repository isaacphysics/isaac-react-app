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
    tutorOrAbove, userContexts, setUserContexts, index, required: _required
}: UserContextRowProps) {
    const onlyUCWithThisStage = existingUserContexts.length === 0 || existingUserContexts.filter(uc => uc.stage === userContext.stage).length === 1;

    const onStageUpdate = (e: ChangeEvent<HTMLInputElement>) => {
        const stage = e.target.value as STAGE;
        if (!isAda) {
            setUserContext({...userContext, stage});
            return;
        }
        // Set exam board to something sensible (for CS)
        const onlyOneAtThisStage = existingUserContexts.length === 0 || existingUserContexts.filter(uc => uc.stage === e.target.value).length === 1;
        const possibleExamBoards = getFilteredExamBoardOptions(
            {byStages: [stage || STAGE.ALL], byUserContexts: existingUserContexts, includeNullOptions: onlyOneAtThisStage
            });
        const examBoards = possibleExamBoards.map(e => e.value) || [EXAM_BOARD.ADA];
        const examBoard = examBoards.includes(userContext.examBoard as EXAM_BOARD) && userContext.examBoard || possibleExamBoards[0].value;
        setBooleanNotation({...EMPTY_BOOLEAN_NOTATION_RECORD, [examBoardBooleanNotationMap[examBoard]]: true});

        setUserContext({...userContext, stage, examBoard});
    };

    const onExamBoardUpdate = (e: ChangeEvent<HTMLInputElement>) => {
        const examBoard: EXAM_BOARD = e.target.value as EXAM_BOARD;
        setUserContext({...userContext, examBoard: examBoard});
        if (e.target.value) {
            setBooleanNotation({...EMPTY_BOOLEAN_NOTATION_RECORD, [examBoardBooleanNotationMap[examBoard]]: true});
        }
    };

    useEffect(() => {
        // Deliberately set default user context on Ada for users who have no context
        if (isAda && (isUndefined(userContext.stage) || isUndefined(userContext.examBoard))) {
            const stage = userContext.stage ?? STAGE.ALL;
            const examBoard = userContext.examBoard ?? EXAM_BOARD.ADA;
            setUserContext({stage, examBoard});
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setUserContext]);

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
                {isPhy && <option value="" className="d-none"/>}
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
                    onClick={() => setUserContexts(userContexts.filter((_uc, i) => i !== index))}
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
    const isAllContexts = userContexts.some(uc => uc.stage === STAGE.ALL && (isPhy || uc.examBoard === EXAM_BOARD.ALL)) ||
        !getFilteredStageOptions({byUserContexts: userContexts}).length;

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

            {userContexts.length ? userContexts.map((userContext, index) => {
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
            {isAda && tutorOrAbove && !isAllContexts &&
                <Col lg={6} className="p-0 pe-4 pe-lg-0">
                    <Button color="keyline" className="mb-3 px-2 w-100"
                        onClick={() => {
                            const newStage = getFilteredStageOptions({byUserContexts: userContexts})[0]?.value as STAGE;
                            const newExamBoard = getFilteredExamBoardOptions({byStages: [newStage || STAGE.ALL], byUserContexts: userContexts})[0]?.value as EXAM_BOARD;
                            setUserContexts([...userContexts, {stage: newStage, examBoard: newExamBoard}]);
                        }}
                        disabled={!validateUserContexts(userContexts)}>
                        Add more content
                    </Button>
                </Col>}
            {isPhy && tutorOrAbove && validateUserContexts(userContexts) && !isAllContexts && <div className="mb-3 ms-2 align-content-center remove-stage-container">
                <Button
                    aria-label="Add stage"
                    className={`ms-2 align-middle btn-plus float-none pointer-cursor bg-transparent`}
                    onClick={() => setUserContexts([...userContexts, {}])}
                />
            </div>}
        </div>
    </WithLinkableSetting>;
}
