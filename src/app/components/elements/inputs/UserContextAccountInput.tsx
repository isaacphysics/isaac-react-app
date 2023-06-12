import React, {useRef} from "react";
import {BooleanNotation, DisplaySettings} from "../../../../IsaacAppTypes";
import {
    EMPTY_BOOLEAN_NOTATION_RECORD,
    EXAM_BOARD,
    examBoardBooleanNotationMap,
    getFilteredExamBoardOptions,
    getFilteredStageOptions,
    isDefined,
    isTutorOrAbove,
    STAGE
} from "../../../services";
import * as RS from "reactstrap";
import {CustomInput, Input} from "reactstrap";
import {UserContext, UserRole} from "../../../../IsaacApiTypes";
import {v4 as uuid_v4} from "uuid";
import classNames from "classnames";
import { selectors, useAppSelector } from "../../../state";

interface UserContextRowProps {
    isStudent?: boolean;
    userContext: UserContext;
    setUserContext: (ucs: UserContext) => void;
    showNullStageOption: boolean;
    submissionAttempted: boolean;
    existingUserContexts: UserContext[];
    setBooleanNotation: (bn: BooleanNotation) => void;
    setDisplaySettings: (ds: DisplaySettings | ((oldDs?: DisplaySettings) => DisplaySettings)) => void;
}

function UserContextRow({
    isStudent, userContext, setUserContext, showNullStageOption, submissionAttempted, existingUserContexts, setBooleanNotation, setDisplaySettings
}: UserContextRowProps) {
    const onlyUCWithThisStage = existingUserContexts.filter(uc => uc.stage === userContext.stage).length === 1;
    return <React.Fragment>
        {/* Stage Selector */}
        <Input
            className="form-control w-auto d-inline-block pl-1 pr-0 mt-1 mt-sm-0" type="select"
            aria-label="Stage"
            value={userContext.stage || ""}
            invalid={submissionAttempted && !Object.values(STAGE).includes(userContext.stage as STAGE)}
            onChange={e => {
                const stage = e.target.value as STAGE;
                // Set exam board to something sensible (for CS)
                const onlyOneAtThisStage = existingUserContexts.filter(uc => uc.stage === e.target.value).length === 1;
                const examBoard = getFilteredExamBoardOptions(
                    {byStages: [stage || STAGE.ALL], byUserContexts: existingUserContexts, includeNullOptions: onlyOneAtThisStage
                })[0]?.value || EXAM_BOARD.ALL;
                setBooleanNotation({...EMPTY_BOOLEAN_NOTATION_RECORD, [examBoardBooleanNotationMap[examBoard]]: true});

                // Set display settings default values
                setDisplaySettings(oldDs => ({...oldDs, HIDE_NON_AUDIENCE_CONTENT: true}));
                setUserContext({...userContext, stage, examBoard});
            }}
        >
            <option value=""></option>
            {getFilteredStageOptions({
                byUserContexts: existingUserContexts.filter(uc => !(uc.stage === userContext.stage && uc.examBoard === userContext.examBoard)),
                includeNullOptions: showNullStageOption, hideFurtherA: true,
                byRole: isStudent ? true : undefined
            }).map(item =>
                <option key={item.value} value={item.value}>{item.label}</option>
            )}
        </Input>

        {/* Exam Board Selector */}
        <Input
            className="form-control w-auto d-inline-block pl-1 pr-0 ml-sm-2 mt-1 mt-sm-0" type="select"
            aria-label="Exam Board"
            value={userContext.examBoard || ""}
            invalid={submissionAttempted && !Object.values(EXAM_BOARD).includes(userContext.examBoard as EXAM_BOARD)}
            onChange={e => {
                setUserContext({...userContext, examBoard: e.target.value as EXAM_BOARD});
                if (e.target.value) {
                    setBooleanNotation({...EMPTY_BOOLEAN_NOTATION_RECORD, [examBoardBooleanNotationMap[e.target.value as EXAM_BOARD]]: true});
                }
            }}
        >
            <option value=""></option>
            {getFilteredExamBoardOptions({
                byStages: [userContext.stage as STAGE || STAGE.ALL],
                includeNullOptions: onlyUCWithThisStage,
                byUserContexts: existingUserContexts.filter(uc => !(uc.stage === userContext.stage && uc.examBoard === userContext.examBoard))
            })
                .map(item =>
                    <option key={item.value} value={item.value}>{item.label}</option>
                )
            }
        </Input>
    </React.Fragment>
}

interface UserContextAccountInputProps {
    userContexts: UserContext[];
    setUserContexts: (ucs: UserContext[]) => void;
    setBooleanNotation: (bn: BooleanNotation) => void;
    displaySettings: Nullable<DisplaySettings>;
    setDisplaySettings: (ds: DisplaySettings | ((oldDs?: DisplaySettings) => DisplaySettings)) => void;
    submissionAttempted: boolean;
}
export function UserContextAccountInput({
    userContexts, setUserContexts, displaySettings, setDisplaySettings, setBooleanNotation, submissionAttempted,
}: UserContextAccountInputProps) {
    const user = useAppSelector(selectors.user.orNull);
    const tutorOrAbove = isTutorOrAbove({...user, loggedIn: true});
    const studyingOrTeaching = tutorOrAbove ? 'teaching' : 'studying';
    const componentId = useRef(uuid_v4().slice(0, 4)).current;

    return <div className="mx-3">
        <RS.Label htmlFor="user-context-selector">
            <span>I am {studyingOrTeaching}</span>
        </RS.Label>
        <React.Fragment>
                <span id={`show-me-content-${componentId}`} className="icon-help" />
                <RS.UncontrolledTooltip placement={"left-start"} target={`show-me-content-${componentId}`}>
                    {tutorOrAbove ?
                        <>Add a stage and examination board for each qualification you are teaching.<br />On content pages, this will allow you to quickly switch between your personalised views of the content, depending on which class you are currently teaching.</> :
                        <>Select a stage and examination board here to filter the content so that you will only see material that is relevant for the qualification you have chosen.</>
                    }
                </RS.UncontrolledTooltip>
        </React.Fragment>
        <div id="user-context-selector" className={classNames({"d-flex flex-wrap": false})}>
            {userContexts.map((userContext, index) => {
                const showPlusOption = tutorOrAbove &&
                    index === userContexts.length - 1 &&
                    // at least one exam board for the potential stage
                    getFilteredStageOptions({byUserContexts: userContexts, hideFurtherA: true}).length > 0;

                return <RS.FormGroup key={index}>
                    <UserContextRow isStudent={!tutorOrAbove}
                        userContext={userContext} showNullStageOption={userContexts.length <= 1} submissionAttempted={submissionAttempted}
                        setUserContext={newUc => setUserContexts(userContexts.map((uc, i) => i === index ? newUc : uc))}
                        existingUserContexts={userContexts} setBooleanNotation={setBooleanNotation} setDisplaySettings={setDisplaySettings}
                    />

                    {tutorOrAbove && userContexts.length > 1 && <button
                        type="button" className="mx-2 close float-none align-middle" aria-label="clear stage row"
                        onClick={() => setUserContexts(userContexts.filter((uc, i) => i !== index))}
                    >
                        ×
                    </button>}

                    {showPlusOption && <RS.Label>
                        <button
                            type="button" aria-label="Add stage"
                            className={`${userContexts.length <= 1 ? "ml-2" : ""} align-middle close float-none pointer-cursor`}
                            onClick={() => setUserContexts([...userContexts, {}])}
                        >
                            +
                        </button>
                        <span className="ml-1">add stage</span>
                    </RS.Label>}

                    {index === userContexts.length - 1 && (userContexts.findIndex(p => p.stage === STAGE.ALL && p.examBoard === EXAM_BOARD.ALL) === -1) && <RS.Label className="mt-2">
                        <CustomInput
                            type="checkbox" id={`hide-content-check-${componentId}`} className="d-inline-block"
                            checked={isDefined(displaySettings?.HIDE_NON_AUDIENCE_CONTENT) ? !displaySettings?.HIDE_NON_AUDIENCE_CONTENT : true}
                            onChange={e => setDisplaySettings(oldDs => ({...oldDs, HIDE_NON_AUDIENCE_CONTENT: !e.target.checked}))}
                        />{" "}
                        <span>Show other content that is not for my selected qualification(s). <span id={`show-other-content-${componentId}`} className="icon-help ml-1" /></span>
                        <RS.UncontrolledTooltip placement="bottom" target={`show-other-content-${componentId}`}>
                            {tutorOrAbove ?
                                "If you select this box, additional content that is not intended for your chosen stage and examination board will be shown (e.g. you will also see A level content in your GCSE view)." :
                                "If you select this box, additional content that is not intended for your chosen stage and examination board will be shown (e.g. you will also see A level content if you are studying GCSE)."
                            }
                        </RS.UncontrolledTooltip>
                    </RS.Label>}
                </RS.FormGroup>
            })}
        </div>
    </div>
}
