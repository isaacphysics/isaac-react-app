import React from "react";
import {ValidationUser} from "../../../../IsaacAppTypes";
import {isTeacher} from "../../../services/user";
import * as RS from "reactstrap";
import {CustomInput, Input} from "reactstrap";
import {EXAM_BOARD, STAGE} from "../../../services/constants";
import {getFilteredExamBoardOptions, getFilteredStageOptions} from "../../../services/userContext";
import {Link} from "react-router-dom";
import {SITE, SITE_SUBJECT, TEACHER_REQUEST_ROUTE} from "../../../services/siteConstants";
import {UserContext} from "../../../../IsaacApiTypes";

interface UserContextRowProps {
    userContext: UserContext;
    setUserContext: (ucs: UserContext) => void;
    showNullStageOption: boolean;
    submissionAttempted: boolean;
    existingUserContexts: UserContext[];
}
function UserContextRow({userContext, setUserContext, showNullStageOption, submissionAttempted, existingUserContexts}: UserContextRowProps) {
    const onlyUCWithThisStage = existingUserContexts.filter(uc => uc.stage === userContext.stage).length === 1;
    return <React.Fragment>
        {/* Stage Selector */}
        <Input
            className="form-control w-auto d-inline-block pl-1 pr-0" type="select"
            aria-label="Stage"
            value={userContext.stage || ""}
            invalid={submissionAttempted && !Object.values(STAGE).includes(userContext.stage as STAGE)}
            onChange={e => {
                const stage = e.target.value as STAGE;
                let examBoard;
                if (SITE_SUBJECT === SITE.CS) {
                    const onlyOneAtThisStage = existingUserContexts.filter(uc => uc.stage === e.target.value).length === 1
                    examBoard = getFilteredExamBoardOptions({
                        byStages: [e.target.value as STAGE || STAGE.NONE], byUserContexts: existingUserContexts, includeNullOptions: onlyOneAtThisStage
                    })[0]?.value || EXAM_BOARD.NONE;
                }
                setUserContext({...userContext, stage, examBoard});
            }}
        >
            <option value=""></option>
            {getFilteredStageOptions({
                byUserContexts: existingUserContexts.filter(uc => !(uc.stage === userContext.stage && uc.examBoard === userContext.examBoard)),
                includeNullOptions: showNullStageOption
            }).map(item =>
                <option key={item.value} value={item.value}>{item.label}</option>
            )}
        </Input>

        {/* Exam Board Selector */}
        {SITE_SUBJECT === SITE.CS && <Input
            className="form-control w-auto d-inline-block pl-1 pr-0 ml-2" type="select"
            aria-label="Exam Board"
            value={userContext.examBoard || ""}
            invalid={submissionAttempted && !Object.values(EXAM_BOARD).includes(userContext.examBoard as EXAM_BOARD)}
            onChange={e => setUserContext({...userContext, examBoard: e.target.value as EXAM_BOARD})}
        >
            <option value=""></option>
            {getFilteredExamBoardOptions({
                byStages: [userContext.stage as STAGE || STAGE.NONE],
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
    submissionAttempted: boolean;
}
export function UserContextAccountInput({user, userContexts, setUserContexts, submissionAttempted}: UserContextAccountInputProps) {
    const teacher = isTeacher({...user, loggedIn: true});

    return <div>
        <RS.Label htmlFor="user-context-selector" className="form-required">
            {teacher ? "Highlight content I am teaching" : "Highlight content I am studying"}
        </RS.Label>
        {!teacher && <span className="float-right mt-1"><Link to={TEACHER_REQUEST_ROUTE} target="_blank">I am a teacher</Link></span>}
        <RS.FormGroup id="user-context-selector" className={SITE_SUBJECT === SITE.PHY ? "d-flex flex-wrap" : ""}>
            {userContexts.map((userContext, index) => {
                const showPlusOption = teacher &&
                    index === userContexts.length - 1 &&
                    // at least one exam board for the potential stage
                    getFilteredStageOptions({byUserContexts: userContexts}).length > 0;

                return <RS.FormGroup key={index}>
                    <UserContextRow
                        userContext={userContext} showNullStageOption={userContexts.length <= 1} submissionAttempted={submissionAttempted}
                        setUserContext={newUc => setUserContexts(userContexts.map((uc, i) => i === index ? newUc : uc))}
                        existingUserContexts={userContexts}
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
                        {SITE_SUBJECT === SITE.CS && <span className="ml-1">add stage</span>}
                    </RS.Label>}

                </RS.FormGroup>
            })}
            {SITE_SUBJECT === SITE.CS && <RS.Label>
                <CustomInput type="checkbox" className="d-inline-block"/>{" "}
                Hide all other content (NOTE: Switch needs wiring)
            </RS.Label>}
        </RS.FormGroup>

    </div>
}
