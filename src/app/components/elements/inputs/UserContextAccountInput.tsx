import React, {useRef} from "react";
import {BooleanNotation, DisplaySettings, ValidationUser} from "../../../../IsaacAppTypes";
import {isTeacher} from "../../../services/user";
import * as RS from "reactstrap";
import {CustomInput, Input} from "reactstrap";
import {
    EMPTY_BOOLEAN_NOTATION_RECORD,
    EXAM_BOARD,
    examBoardBooleanNotationMap,
    STAGE
} from "../../../services/constants";
import {getFilteredExamBoardOptions, getFilteredStageOptions} from "../../../services/userContext";
import {isCS, isPhy, siteSpecific, TEACHER_REQUEST_ROUTE} from "../../../services/siteConstants";
import {UserContext} from "../../../../IsaacApiTypes";
import {v4 as uuid_v4} from "uuid";
import {isDefined} from "../../../services/miscUtils";
import {Link} from "react-router-dom";
import classNames from "classnames";

interface UserContextRowProps {
    userContext: UserContext;
    setUserContext: (ucs: UserContext) => void;
    showNullStageOption: boolean;
    submissionAttempted: boolean;
    existingUserContexts: UserContext[];
    setBooleanNotation: (bn: BooleanNotation) => void;
    setDisplaySettings: (ds: DisplaySettings | ((oldDs?: DisplaySettings) => DisplaySettings)) => void;
}

function UserContextRow({
    userContext, setUserContext, showNullStageOption, submissionAttempted, existingUserContexts, setBooleanNotation, setDisplaySettings
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
                let examBoard;
                if (isCS) {
                    // Set exam board to something sensible
                    const onlyOneAtThisStage = existingUserContexts.filter(uc => uc.stage === e.target.value).length === 1;
                    examBoard = getFilteredExamBoardOptions(
                        {byStages: [stage || STAGE.ALL], byUserContexts: existingUserContexts, includeNullOptions: onlyOneAtThisStage
                    })[0]?.value || EXAM_BOARD.ALL;
                    setBooleanNotation({...EMPTY_BOOLEAN_NOTATION_RECORD, [examBoardBooleanNotationMap[examBoard]]: true});

                    // Set display settings default values
                    setDisplaySettings(oldDs => ({...oldDs, HIDE_NON_AUDIENCE_CONTENT: true}));
                }
                setUserContext({...userContext, stage, examBoard});
            }}
        >
            <option value=""></option>
            {getFilteredStageOptions({
                byUserContexts: existingUserContexts.filter(uc => !(uc.stage === userContext.stage && uc.examBoard === userContext.examBoard)),
                includeNullOptions: showNullStageOption, hideFurtherA: true
            }).map(item =>
                <option key={item.value} value={item.value}>{item.label}</option>
            )}
        </Input>

        {/* Exam Board Selector */}
        {isCS && <Input
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
        </Input>}
    </React.Fragment>
}

interface UserContextAccountInputProps {
    user: ValidationUser;
    userContexts: UserContext[];
    setUserContexts: (ucs: UserContext[]) => void;
    setBooleanNotation: (bn: BooleanNotation) => void;
    displaySettings: DisplaySettings;
    setDisplaySettings: (ds: DisplaySettings | ((oldDs?: DisplaySettings) => DisplaySettings)) => void;
    submissionAttempted: boolean;
}
export function UserContextAccountInput({
    user, userContexts, setUserContexts, displaySettings, setDisplaySettings, setBooleanNotation, submissionAttempted,
}: UserContextAccountInputProps) {
    const teacher = isTeacher({...user, loggedIn: true});
    const componentId = useRef(uuid_v4().slice(0, 4)).current;

    return <div>
        <RS.Label htmlFor="user-context-selector" className="form-required">
            {siteSpecific(
                <span>{teacher ? "I am teaching..." : "I am interested in..."}</span>,
                <span>Show me content for:</span>
            )}
        </RS.Label>
        {siteSpecific(
            // Physics
            <React.Fragment>
                <span id={`show-me-content-${componentId}`} className="icon-help" />
                <RS.UncontrolledTooltip placement={"left-start"} target={`show-me-content-${componentId}`}>
                    {"Choose a stage here to pre-select the material that is most relevant to your interests."}<br />
                    {"You will be able to change this preference on relevant pages."}<br />
                    {'If you prefer to see all content by default, select "All stages".'}
                </RS.UncontrolledTooltip>
            </React.Fragment>,
            // Computer science
            <React.Fragment>
                <span id={`show-me-content-${componentId}`} className="icon-help" />
                <RS.UncontrolledTooltip placement={"left-start"} target={`show-me-content-${componentId}`}>
                    {teacher ?
                        <>Add a stage and examination board for each qualification you are teaching.<br />On content pages, this will allow you to quickly switch between your personalised views of the content, depending on which class you are currently teaching.</> :
                        <>Select a stage and examination board here to filter the content so that you will only see material that is relevant for the qualification you have chosen.</>
                    }
                </RS.UncontrolledTooltip>
            </React.Fragment>
        )}
        <div id="user-context-selector" className={classNames({"d-flex flex-wrap": isPhy})}>
            {userContexts.map((userContext, index) => {
                const showPlusOption = teacher &&
                    index === userContexts.length - 1 &&
                    // at least one exam board for the potential stage
                    getFilteredStageOptions({byUserContexts: userContexts, hideFurtherA: true}).length > 0;

                return <RS.FormGroup key={index}>
                    <UserContextRow
                        userContext={userContext} showNullStageOption={userContexts.length <= 1} submissionAttempted={submissionAttempted}
                        setUserContext={newUc => setUserContexts(userContexts.map((uc, i) => i === index ? newUc : uc))}
                        existingUserContexts={userContexts} setBooleanNotation={setBooleanNotation} setDisplaySettings={setDisplaySettings}
                    />

                    {teacher && userContexts.length > 1 && <button
                        type="button" className="mx-2 close float-none align-middle" aria-label="clear stage row"
                        onClick={() => setUserContexts(userContexts.filter((uc, i) => i !== index))}
                    >
                        ×
                    </button>}

                    {showPlusOption && <RS.Label inline>
                        <button
                            type="button" aria-label="Add stage"
                            className={`${userContexts.length <= 1 ? "ml-2" : ""} align-middle close float-none pointer-cursor`}
                            onClick={() => setUserContexts([...userContexts, {}])}
                        >
                            +
                        </button>
                        {isCS && <span className="ml-1">add stage</span>}
                    </RS.Label>}

                    {isCS && index === userContexts.length - 1 && (userContexts.findIndex(p => p.stage === STAGE.ALL && p.examBoard === EXAM_BOARD.ALL) === -1) && <RS.Label className="mt-2">
                        <CustomInput
                            type="checkbox" id={`hide-content-check-${componentId}`} className="d-inline-block"
                            checked={isDefined(displaySettings.HIDE_NON_AUDIENCE_CONTENT) ? !displaySettings.HIDE_NON_AUDIENCE_CONTENT : true}
                            onChange={e => setDisplaySettings(oldDs => ({...oldDs, HIDE_NON_AUDIENCE_CONTENT: !e.target.checked}))}
                        />{" "}
                        <span>Show other content that is not for my selected qualification(s). <span id={`show-other-content-${componentId}`} className="icon-help ml-1" /></span>
                        <RS.UncontrolledTooltip placement="bottom" target={`show-other-content-${componentId}`}>
                            {teacher ?
                                "If you select this box, additional content that is not intended for your chosen stage and examination board will be shown (e.g. you will also see A level content in your GCSE view)." :
                                "If you select this box, additional content that is not intended for your chosen stage and examination board will be shown (e.g. you will also see A level content if you are studying GCSE)."
                            }
                        </RS.UncontrolledTooltip>
                    </RS.Label>}

                    {!teacher && <><br/>
                        <small>
                            If you are a teacher, <Link to={TEACHER_REQUEST_ROUTE} target="_blank">upgrade your account</Link> to choose more than one {isCS && "exam board and "}stage.
                        </small>
                    </>}
                </RS.FormGroup>
            })}
        </div>
    </div>
}
