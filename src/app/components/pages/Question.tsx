import React, {useEffect} from "react";
import * as RS from "reactstrap";
import {Col, Container, Row} from "reactstrap";
import {withRouter} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import { useMediaQuery } from 'react-responsive';

import {fetchDoc, fetchFasttrackConcepts, goToSupersededByQuestion} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {AppState} from "../../state/reducers";
import {GameboardDTO, GameboardItem, IsaacFastTrackQuestionPageDTO, IsaacQuestionPageDTO} from "../../../IsaacApiTypes";
import {ACCEPTED_QUIZ_IDS, DOCUMENT_TYPE, EDITOR_URL, NOT_FOUND, TAG_ID} from "../../services/constants";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useNavigation} from "../../services/navigation";
import {EditContentButton} from "../elements/EditContentButton";
import {TempExamBoardPicker} from "../elements/inputs/TempExamBoardPicker";
import {WithFigureNumbering} from "../elements/WithFigureNumbering";
import {IsaacContent} from "../content/IsaacContent";
import {NavigationLinks} from "../elements/NavigationLinks";
import {RelatedContent} from "../elements/RelatedContent";
import {isStudent, isTeacher} from "../../services/user";
import {ShareLink} from "../elements/ShareLink";
import {PrintButton} from "../elements/PrintButton";
import {doc as selectDoc} from "../../state/selectors";
import {DocumentSubject} from "../../../IsaacAppTypes";
import {TrustedMarkdown} from "../elements/TrustedMarkdown";
import tags from "../../services/tags";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import queryString from "query-string";

interface QuestionPageProps {
    questionIdOverride?: string;
    match: {params: {questionId: string}};
    location: {search: string};
}

function getTags(docTags?: string[]) {
    if (SITE_SUBJECT !== SITE.PHY) {
        return [];
    }
    if (!docTags) return [];

    return tags.getByIdsAsHeirarchy(docTags as TAG_ID[])
        .map(tag => ({title: tag.title}));
}

function fastTrackConceptEnumerator(questionId: string) {
    // Magic, unfortunately
    return "_abcdefghijk".indexOf(questionId.split('_')[2].slice(-1));
}

function moveTo(x: number, y: number) {
    return 'M' + x + ' ' + y;
}

function line(x: number, y: number) {
    return 'L' + x + ' ' + y;
}

type L = "topTen" | "upper" | "lower";

type Level = 'ft_top_ten' | 'ft_upper' | 'ft_lower';
const fastTrackStates: Level[] = ['ft_top_ten', 'ft_upper', 'ft_lower'];

function getFastTrackLevel(tags?: string[]): Level {
    if (!tags) throw new Error("Unknown level for undefined tags");
    for (let state of fastTrackStates) {
        if (tags.indexOf(state) != -1) {
            return state;
        }
    }
    throw new Error("Unknown level for tags:" + tags.join(","));
}

interface ConceptLevelQuestions {
    upperLevelQuestions: GameboardItem[];
    lowerLevelQuestions: GameboardItem[];
}

type ConceptLevel = "upperLevelQuestions" | "lowerLevelQuestions";
const conceptLevels: ConceptLevel[] = ["upperLevelQuestions", "lowerLevelQuestions"];

function categoriseConceptQuestions(conceptQuestions: GameboardItem[]): ConceptLevelQuestions|null {
    let result = null;
    if (conceptQuestions !== null) {
        result = {
            upperLevelQuestions: conceptQuestions.filter(question => getFastTrackLevel(question.tags) === 'ft_upper'),
            lowerLevelQuestions: conceptQuestions.filter(question => getFastTrackLevel(question.tags) === 'ft_lower'),
        };
    }
    return result;
}

function calculateDashArray<T>(elements: T[] | undefined, evaluator: (t: T) => boolean, perimiterLength: number) {
    if (elements === undefined) {
        return null;
    }
    let sectionLength = perimiterLength / elements.length;
    let recordingDash = true;
    let lengthCollector = 0;
    let dashArray = [];
    for (let element of elements) {
        let shouldRecordDash = evaluator(element);
        if (shouldRecordDash === recordingDash) {
            lengthCollector += sectionLength;
        } else {
            dashArray.push(lengthCollector);
            recordingDash = !recordingDash;
            lengthCollector = sectionLength;
        }
    }
    dashArray.push(lengthCollector);
    return dashArray.join(',');
}

function calculateProgressBarHeight(questionLevel: Level, hexagonQuarterHeight: number, hexagonPadding: number, progressBarPadding: number) {
    let numberOfHexagonRows = {"ft_top_ten": 1, "ft_upper": 2, "ft_lower": 3}[questionLevel];
    return 2 * progressBarPadding + 4 * hexagonQuarterHeight + (numberOfHexagonRows - 1) * (6 * hexagonQuarterHeight + 2 * hexagonPadding);
}

function generateHexagonPoints(halfWidth: number, quarterHeight: number) {
    return '' + 1 * halfWidth + ' ' + 0 * quarterHeight +
        ', ' + 2 * halfWidth + ' ' + 1 * quarterHeight +
        ', ' + 2 * halfWidth + ' ' + 3 * quarterHeight +
        ', ' + 1 * halfWidth + ' ' + 4 * quarterHeight +
        ', ' + 0 * halfWidth + ' ' + 3 * quarterHeight +
        ', ' + 0 * halfWidth + ' ' + 1 * quarterHeight;
}

interface AugmentedQuestion {
    id: string;
    title: string;
    fastTrackLevel: Level;
    isConcept: boolean;
    isCurrentQuestion: boolean;
    isCompleted: boolean;
    href: string;
    hexagonTitle: string;
    currentlyWorkingOn: boolean;
    questionPartStates?: string[];
}

function FastTrackProgress({doc, search}: {doc: IsaacFastTrackQuestionPageDTO; search: string}) {
    const {questionHistory: qhs}: {questionHistory?: string} = queryString.parse(search);
    const questionHistory = qhs ? qhs.split(",") : [];

    const dispatch = useDispatch();
    const gameboardMaybeNullOrMissing = useSelector((appState: AppState) => appState && appState.currentGameboard);
    const fasttrackConcepts = useSelector((appState: AppState) => appState && appState.fasttrackConcepts);

    const smallDevice = useMediaQuery({query: '(max-device-width: 640px)'});
    const largeDevice = useMediaQuery({query: '(min-device-width: 1024px)'});
    const deviceSize = smallDevice ? 'small' : !largeDevice ? 'medium' : 'large';
    const hexagonUnitLength = {large: 28, medium: 22, small: 12.5}[deviceSize];
    const hexagonPadding = {large: 4, medium: 4, small: 2}[deviceSize];
    const hexagonHalfWidth = hexagonUnitLength;
    const hexagonQuarterHeight = hexagonUnitLength / Math.sqrt(3);
    const progressBarPadding = deviceSize !== 'small' ? 5 : 1;

    const conceptQuestions = gameboardMaybeNullOrMissing && gameboardMaybeNullOrMissing !== NOT_FOUND && fasttrackConcepts && fasttrackConcepts.gameboardId === gameboardMaybeNullOrMissing.id && fasttrackConcepts.concept === doc.title ?
        fasttrackConcepts.items
        : null;

    useEffect(() => {
        if (conceptQuestions === null && gameboardMaybeNullOrMissing && gameboardMaybeNullOrMissing !== NOT_FOUND) {
            console.log("Effect", gameboardMaybeNullOrMissing, doc, conceptQuestions, fasttrackConcepts);
            // FIXME: Why is this running twice
            const uppers = questionHistory.filter(e => /upper/i.test(e));
            const upper = uppers.pop() || "";
            dispatch(fetchFasttrackConcepts(gameboardMaybeNullOrMissing.id as string, doc.title as string, upper));
        }
    }, [gameboardMaybeNullOrMissing, doc, conceptQuestions]);

    if (!gameboardMaybeNullOrMissing || gameboardMaybeNullOrMissing === NOT_FOUND) return null;
    // @ts-ignore I don't care.
    const gameboard: GameboardDTO & {id: string; title: string; questions: GameboardItem[]} = gameboardMaybeNullOrMissing;

    function getCurrentlyWorkingOn(): AugmentedQuestion {
        return {
            hexagonTitle: "", href: "", isCompleted: false, isCurrentQuestion: false,
            currentlyWorkingOn: false, // TODO: How is this set?
            id: doc.id as string,
            title: doc.title as string,
            fastTrackLevel: getFastTrackLevel(doc.tags),
            isConcept: getFastTrackLevel(doc.tags) != 'ft_top_ten'
        };
    }

    const currentlyWorkingOn = getCurrentlyWorkingOn();

    if (!currentlyWorkingOn.isConcept || conceptQuestions === null || currentlyWorkingOn.fastTrackLevel === undefined) {
        return null;
    }

    const progressBarHeight = calculateProgressBarHeight(currentlyWorkingOn.fastTrackLevel, hexagonQuarterHeight, hexagonPadding, progressBarPadding);

    const hexagon = {
        padding: hexagonPadding,
        halfWidth: hexagonHalfWidth,
        quarterHeight: hexagonQuarterHeight,
        x: {
            left: (Math.sqrt(3) * hexagonQuarterHeight) / 2,
            center: hexagonHalfWidth,
            right: (hexagonHalfWidth * 2) - (Math.sqrt(3) * hexagonQuarterHeight) / 2,
        },
        y: {
            top: hexagonQuarterHeight / 2,
            center: 2 * hexagonQuarterHeight,
            bottom: 7 * hexagonQuarterHeight / 2,
        },
        base: {
            stroke: {
                width: {large: 3, medium: 3, small: 2}[deviceSize],
                colour: '#ddd'
            },
            fill: {
                selectedColour: 'none',
                deselectedColour: '#f0f0f0',
                completedColour: 'none',
                deselectedCompletedColour: '#f0f0f0',
            },
        },
        questionPartProgress: {
            stroke: {
                width: {large: 3, medium: 3, small: 2}[deviceSize],
                colour: '#009acd'
            },
            fill: {colour: 'none'},
        },
    };

    const conceptConnection = {
        fill: 'none',
        stroke: {
            colour: '#fea100',
            width: {large: 3, medium: 3, small: 2}[deviceSize],
            dashArray: 4
        },
    };

    function augmentQuestion(question: any, gameboardId: string, questionHistory: string[], index: number): AugmentedQuestion {
        const fastTrackLevel = getFastTrackLevel(question.tags);
        let href = "/questions/" + question.id + '?board=' + gameboardId;
        if (questionHistory) {
            let newQuestionHistory = null;
            if (fastTrackLevel == 'ft_top_ten') {
                // Do nothing
            } else if (fastTrackLevel === currentlyWorkingOn.fastTrackLevel) {
                // Maintain history if moving to another question on the same level
                newQuestionHistory = questionHistory;
            } else {
                // Step back in question history if possible
                newQuestionHistory = questionHistory.slice(0, questionHistory.lastIndexOf(question.id));
            }
            if (newQuestionHistory && newQuestionHistory.length) {
                href += "&questionHistory=" + newQuestionHistory.join(',');
            }
        }
        return {
            isConcept: false,
            currentlyWorkingOn: false, // TODO: How is this set?
            fastTrackLevel,
            isCurrentQuestion: question.id == currentlyWorkingOn.id,
            isCompleted: question.state === 'PERFECT',
            hexagonTitle: "" + (index + 1),
            href,
            ...question
        };
    }

    function getMostRecentQuestion(questionHistory: string[], conceptLevel: Level) {
        const reversedQuestionHistory = questionHistory.slice().reverse();
        const questionLevelMatcheFunctions = {
            "ft_top_ten": (questionId: string) => questionId.indexOf('fasttrack') != -1,
            "ft_upper": (questionId: string) => questionId.indexOf('upper') != -1,
            "ft_lower": () => false,
        };
        let result = null;
        for (let questionId of reversedQuestionHistory) {
            if (questionLevelMatcheFunctions[conceptLevel](questionId)) {
                result = questionId;
            }
        }
        return result;
    }

    function orderConceptQuestionsById(unorderedConceptQuestions: ConceptLevelQuestions) {
        if (unorderedConceptQuestions === null) {
            throw new Error("No unoderedConceptQuestions");
        }
        let result: ConceptLevelQuestions = {upperLevelQuestions: [], lowerLevelQuestions: []};
        for (let conceptLevelName of conceptLevels) {
            result[conceptLevelName] = unorderedConceptQuestions[conceptLevelName].slice().sort((a: {id?: string}, b: {id?: string}) => a.id === b.id ? 0 : (a.id === undefined || (b.id !== undefined && a.id > b.id)) ? 1 : -1);
        }
        return result;
    }

    interface Connection {
        sourceIndex: number;
        targetIndex: number;
        isMostRecent: boolean;
        message: string;
    }

    interface Progress {
        title: string;
        conceptTitle: string;
        questions: { [key in L]: AugmentedQuestion[] };
        connections: {
            topTenToUpper: Connection[];
            upperToLower: Connection[];
        };
    }

    function evaluateProgress(unorderedConceptQuestions: ConceptLevelQuestions, questionHistory: string[]): Progress {
        const progress: Progress = {title: '', conceptTitle: '', questions: {topTen: [], upper: [], lower: []}, connections: {topTenToUpper: [], upperToLower: []}};

        // Store title information for local storage retrieval
        progress.title = gameboard.title;
        progress.conceptTitle = currentlyWorkingOn.isConcept ? currentlyWorkingOn.title : '';

        const conceptQuestions = orderConceptQuestionsById(unorderedConceptQuestions);

        // Evaluate top ten progress
        for (let i = 0; i < gameboard.questions.length; i++) {
            const question = gameboard.questions[i];
            progress.questions.topTen.push(augmentQuestion(question, gameboard.id, questionHistory, i));
        }

        // Evalueate concept question progress
        if (currentlyWorkingOn.isConcept) {
            let upperAndLowerConceptQuestions: Map<L, GameboardItem[]> = new Map([['upper', conceptQuestions.upperLevelQuestions], ['lower', conceptQuestions.lowerLevelQuestions]]);
            upperAndLowerConceptQuestions.forEach((conceptQuestionsOfType, conceptQuestionType) => {
                for (let i = 0; i < conceptQuestionsOfType.length; i++) {
                    let question = conceptQuestionsOfType[i];
                    progress.questions[conceptQuestionType].push( augmentQuestion(question, gameboard.id, questionHistory, i))
                }
            });
        }

        // Evaluate concept connections
        if (currentlyWorkingOn.isConcept) {
            let mostRecentTopTenQuestionId = getMostRecentQuestion(questionHistory, 'ft_top_ten') || undefined;
            let mostRecenetTopTenIndex = gameboard.questions.map((question: GameboardItem) => question.id).indexOf(mostRecentTopTenQuestionId);

            let upperQuestionId = currentlyWorkingOn.fastTrackLevel === 'ft_upper' ? currentlyWorkingOn.id : getMostRecentQuestion(questionHistory, 'ft_upper');
            let upperIndex = conceptQuestions.upperLevelQuestions.map(question => question.id).indexOf(upperQuestionId as string);

            // Top Ten to Upper connection
            progress.connections.topTenToUpper.push({
                sourceIndex: mostRecenetTopTenIndex,
                targetIndex: upperIndex,
                isMostRecent: true,
                message: "Practise the concept before returning to complete the board"
            });

            // Upper to Lower connections
            if (currentlyWorkingOn.fastTrackLevel === 'ft_lower') {
                let lowerIndex = conceptQuestions.lowerLevelQuestions.map(question => question.id).indexOf(currentlyWorkingOn.id);
                progress.connections.upperToLower.push({
                    sourceIndex: upperIndex,
                    targetIndex: lowerIndex,
                    isMostRecent: true,
                    message: "Practise the concept with easier quesitons before returning to complete the board"
                });
            }
        }
        return progress;
    }

    function generateHexagon<T>(states: T[] | undefined, selector: (t: T) => boolean, properties: {stroke: {colour: string; width: number}}, fillColour: string, clickable: boolean) {
        let polygonAttributes: { strokeWidth: number; fill: string; stroke: string; points: string; strokeDasharray?: string; pointerEvents?: string } = {
            points: generateHexagonPoints(hexagon.halfWidth, hexagon.quarterHeight),
            stroke: properties.stroke.colour,
            strokeWidth: properties.stroke.width,
            fill: fillColour,
        };
        const perimiter = 6 * 2 * (hexagon.quarterHeight);
        const dashArray = calculateDashArray(states, selector, perimiter);
        if (dashArray) {
            polygonAttributes.strokeDasharray = dashArray;
        }
        if (clickable) {
            polygonAttributes.pointerEvents = 'visible';
        }
        return <polygon {...polygonAttributes} />;
    }

    function generateHexagonTitle(title: string, isCurrentQuestion: boolean) {
        let isTwoCharLength = ("" + title).length > 1;
        let xSingleCharPosition = hexagon.halfWidth - {large: 8, medium: 8, small: 5}[deviceSize];
        let xTwoCharPosition = hexagon.halfWidth - {large: 14, medium: 14, small: 10}[deviceSize];
        let yPosition = hexagon.quarterHeight * 2 + {large: 9, medium: 9, small: 6}[deviceSize];
        return <text
            fontFamily="Exo 2"
            fontSize={{large: 26, medium: 26, small: 18}[deviceSize]}
            fontStyle="italic"
            fontWeight={deviceSize === 'small' ? 500 : 600}
            fill={ isCurrentQuestion ? '#333' : '#ccc'}
            stroke="none"
            strokeWidth={1}
            strokeLinejoin="round"
            strokeLinecap="round"
            x={isTwoCharLength ? xTwoCharPosition : xSingleCharPosition}
            y={yPosition}
        >{title}</text>;
    }

    function generateCompletionTick(isCurrentQuestion: boolean) {
        return <image
            href="/assets/tick-bg.png"
            height={{large: 36, medium: 28, small: 18}[deviceSize]}
            width={{large: 36, medium: 28, small: 18}[deviceSize]}
            x={hexagon.halfWidth - {large: 18, medium: 14, small: 9}[deviceSize]}
            y={hexagon.quarterHeight - {large: 2, medium: 1, small: 2}[deviceSize]}
            opacity={isCurrentQuestion ? 1 : 0.3}
        />;
    }

    function calculateConnectionLine(sourceIndex: number, targetIndex: number) {
        let result = '';

        let hexagonWidth = 2 * (hexagon.halfWidth + hexagon.padding);

        let sourceHexagonX = (sourceIndex <= targetIndex ? sourceIndex * hexagonWidth : Math.max(sourceIndex - 1, 0) * hexagonWidth);
        let targetHexagonX = (targetIndex <= sourceIndex ? targetIndex * hexagonWidth : Math.max(targetIndex - 1, 0) * hexagonWidth);

        // First stroke
        if (sourceIndex <= targetIndex) {
            result += moveTo(sourceHexagonX + hexagon.x.left, hexagon.y.top);
        } else {
            result += moveTo(sourceHexagonX + hexagon.x.right, hexagon.y.top);
        }
        result += line(sourceHexagonX + hexagon.x.center, hexagon.y.center);

        // Horrizontal connection
        if (Math.abs(sourceIndex - targetIndex) > 1) {
            result += line(targetHexagonX + hexagon.x.center, hexagon.y.center);
        }

        // Last stroke
        if (targetIndex <= sourceIndex) {
            result += line(targetHexagonX + hexagon.x.left, hexagon.y.bottom);
        } else {
            result += line(targetHexagonX + hexagon.x.right, hexagon.y.bottom);
        }

        return result;
    }

    function createQuestionHexagon(question: AugmentedQuestion) {
        let fillColour = 'none';
        if (question.isCompleted) {
            fillColour = question.isCurrentQuestion ? hexagon.base.fill.completedColour : hexagon.base.fill.deselectedCompletedColour;
        } else {
            fillColour = question.isCurrentQuestion ? hexagon.base.fill.selectedColour : hexagon.base.fill.deselectedColour;
        }

        return <a href={question.href}>
            <title>{question.title + (question.currentlyWorkingOn ? ' (Current)' : '')}</title>
            {generateHexagon([true], allVisible => allVisible === true, hexagon.base, fillColour, true)}

            {generateHexagon(
                question.questionPartStates,
                state => state === 'CORRECT',
                hexagon.questionPartProgress,
                'none',
                false)}

            {question.isCompleted ? generateCompletionTick(question.isCurrentQuestion)
                : generateHexagonTitle(question.hexagonTitle, question.isCurrentQuestion)}
        </a>;
    }

    function createConnection(sourceIndex: number, targetIndex: number) {
        return <path
            d={calculateConnectionLine(sourceIndex, targetIndex)}
            fill={conceptConnection.fill}
            stroke={conceptConnection.stroke.colour}
            strokeWidth={conceptConnection.stroke.width}
            strokeDasharray={conceptConnection.stroke.dashArray}
        />;
    }

    function createQuestionRow(conceptQuestions: AugmentedQuestion[], fastTrackLevel: string, conceptRowIndex: number) {
        return <g key={fastTrackLevel + '-question-hexagons'}
            transform={'translate(0,' + conceptRowIndex * (6 * hexagon.quarterHeight + 2 * hexagon.padding) + ')'}>
            {conceptQuestions.map((question, columnIndex) => (
                <g key={question.id} className={fastTrackLevel + '-question-hexagon'}
                    transform={'translate(' + columnIndex * 2 * (hexagon.halfWidth + hexagon.padding) + ', 0)'}>
                    {createQuestionHexagon(question)}
                </g>
            ))}
        </g>;
    }

    function createConceptConnectionRow(conceptConnections: Connection[], connectionName: string, connectionRowIndex: number) {
        return <g key={connectionName + '-concept-connections'}
            transform={'translate(' +
                (hexagon.halfWidth + hexagon.padding) + ',' +
                (3 * hexagon.quarterHeight + hexagon.padding + connectionRowIndex * (6 * hexagon.quarterHeight + 2 * hexagon.padding)) + ')'}>
            {conceptConnections.map(conceptConnection => (<React.Fragment key={JSON.stringify(conceptConnection)}>
                <title>{conceptConnection.message}</title>
                {createConnection(conceptConnection.sourceIndex, conceptConnection.targetIndex)}
            </React.Fragment>))}
        </g>;
    }

    function renderProgress(progress: Progress) {
        return <div>
            <h4>{gameboard.title}</h4>
            {currentlyWorkingOn.isConcept && <h4>{currentlyWorkingOn.title} Practice</h4>}
            <svg id="ft-progress" width="100%" height={progressBarHeight}>
                <g id="progress-bar-padding" transform={`translate(${progressBarPadding}, ${progressBarPadding})`}>
                    <g id="concept-connections">
                        {progress.connections.topTenToUpper.length > 0 &&
                            createConceptConnectionRow(progress.connections.topTenToUpper, 'top-ten-to-upper', 0)
                        }
                        {progress.connections.upperToLower.length > 0 &&
                            createConceptConnectionRow(progress.connections.upperToLower, 'upper-to-lower', 1)
                        }

                    </g>
                    <g id="question-hexagons">
                        {createQuestionRow(progress.questions.topTen, 'top_ten', 0)}
                        {progress.questions.upper.length > 0 &&
                            createQuestionRow(progress.questions.upper, 'upper', 1)
                        }
                        {progress.questions.lower.length > 0 &&
                            createQuestionRow(progress.questions.lower, 'lower', 2)
                        }
                    </g>
                </g>
            </svg>
        </div>;
    }

    const categorisedConceptQuestions = categoriseConceptQuestions(conceptQuestions);
    if (!categorisedConceptQuestions) return null;
    const progress = evaluateProgress(categorisedConceptQuestions, questionHistory);
    return renderProgress(progress);
}

export const Question = withRouter(({questionIdOverride, match, location}: QuestionPageProps) => {
    const questionId = questionIdOverride || match.params.questionId;
    const doc = useSelector(selectDoc.ifNotAQuizId(questionId));
    const user = useSelector((state: AppState) => state && state.user);
    const segueEnvironment = useSelector((state: AppState) =>
        (state && state.constants && state.constants.segueEnvironment) || "unknown"
    );
    const navigation = useNavigation(doc);

    const dispatch = useDispatch();
    useEffect(() => {
        if (!ACCEPTED_QUIZ_IDS.includes(questionId)) {
            dispatch(fetchDoc(DOCUMENT_TYPE.QUESTION, questionId));
        }
    }, [questionId, dispatch]);

    return <ShowLoading until={doc} thenRender={supertypedDoc => {
        const doc = supertypedDoc as IsaacQuestionPageDTO & DocumentSubject;

        let title = doc.title as string;

        if (doc.tags && (doc.tags.indexOf('ft_upper') != -1 || doc.tags.indexOf('ft_lower') != -1)) {
            title += " " + fastTrackConceptEnumerator(questionId);
            if (doc.tags.indexOf('ft_lower') != -1) {
                title += " (Easier)";
            }
        }

        const isFastTrack = doc && doc.type === "isaacFastTrackQuestionPage";

        return <div className={`pattern-01 ${doc.subjectId || ""}`}>
            <Container>
                {isFastTrack && <FastTrackProgress doc={doc} search={location.search} />}
                {/*Print options*/}
                {/*High contrast option*/}
                <TitleAndBreadcrumb
                    currentPageTitle={title}
                    intermediateCrumbs={[
                        ...navigation.breadcrumbHistory,
                        ...getTags(doc.tags)
                    ]}
                    collectionType={navigation.collectionType}
                    level={doc.level}
                />
                <RS.Row className="no-print">
                    {segueEnvironment === "DEV" && doc.canonicalSourceFile &&
                        <EditContentButton canonicalSourceFile={EDITOR_URL + doc.canonicalSourceFile} />
                    }
                    <div className="question-actions question-actions-leftmost mt-3">
                        <ShareLink linkUrl={`/questions/${questionId}`}/>
                    </div>
                    <div className="question-actions mt-3 not_mobile">
                        <PrintButton questionPage={true}/>
                    </div>
                </RS.Row>
                <Row className="question-content-container">
                    <Col md={{size: 8, offset: 2}} className="py-4 question-panel">
                        <TempExamBoardPicker className="no-print text-right"/>

                        {doc.supersededBy && !isStudent(user) && <div className="alert alert-warning">
                            {isTeacher(user) && <React.Fragment>
                                <strong>
                                    <span id="superseded-help" className="icon-help" />
                                    Teacher Note: {" "}
                                </strong>
                                <RS.UncontrolledTooltip placement="bottom" target="superseded-help">
                                    <div  className="text-left">
                                        We periodically update questions into new formats.<br />
                                        If this question appears on one of your gameboards, you may want to update the gameboard.<br />
                                        You can find help for this at Help and support &gt; Teacher Support &gt; Assigning Work.<br /><br />
                                        Students will not see this message, but will see a smaller note at the bottom of the page.
                                    </div>
                                </RS.UncontrolledTooltip>
                            </React.Fragment>}
                            This question has been replaced by {" "}
                            <RS.Button role="link" color="link" className="align-baseline" onClick={() => dispatch(goToSupersededByQuestion(doc))}>
                                this question
                            </RS.Button>.
                        </div>}

                        <WithFigureNumbering doc={doc}>
                            <IsaacContent doc={doc}/>
                        </WithFigureNumbering>

                        {doc.supersededBy && isStudent(user) && <div className="alert alert-warning">
                            This question {" "}
                            <RS.Button color="link" className="align-baseline" onClick={() => dispatch(goToSupersededByQuestion(doc))}>
                                has been replaced
                            </RS.Button>.<br />
                            However, if you were assigned this version, you should complete it.
                        </div>}

                        {doc.attribution && <p className="text-muted"><TrustedMarkdown markdown={doc.attribution}/></p>}

                        <NavigationLinks navigation={navigation}/>

                        {doc.relatedContent && <RelatedContent content={doc.relatedContent} parentPage={doc} />}
                    </Col>
                </Row>
            </Container>
        </div>}
    }/>;
});
