import React, {lazy, useCallback, useEffect, useRef, useState} from 'react';
import {
    closeActiveModal,
    logAction,
    mutationSucceeded,
    openActiveModal,
    useAppDispatch,
    useCreateGameboardMutation,
    useGenerateTemporaryGameboardMutation,
    useGetGameboardByIdQuery,
    useGetWildcardsQuery,
} from "../../state";
import {Button, Card, CardBody, Col, Container, Input, Label, Row, Spinner, Table} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {GameboardDTO, GameboardItem, RegisteredUserDTO} from "../../../IsaacApiTypes";
import {QuestionSearchModal} from "../elements/modals/QuestionSearchModal";
import {DragDropContext, Draggable, Droppable, DropResult} from "react-beautiful-dnd";
import {GameboardCreatedModal} from "../elements/modals/GameboardCreatedModal";
import {
    convertContentSummaryToGameboardItem,
    EXAM_BOARD,
    getValue,
    history,
    isAda,
    isDefined,
    isStaff,
    isValidGameboardId,
    Item,
    loadGameboardQuestionOrder,
    loadGameboardSelectedQuestions,
    logEvent,
    selectOnChange,
    siteSpecific,
    STAGE,
    TAG_ID,
    useUserContext
} from "../../services";
import {useLocation} from "react-router-dom";
import queryString from "query-string";
import {ShowLoading} from "../handlers/ShowLoading";
import intersection from "lodash/intersection";
import {ContentSummary} from "../../../IsaacAppTypes";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import {skipToken} from "@reduxjs/toolkit/query";
import classNames from "classnames";
import {StyledSelect} from "../elements/inputs/StyledSelect";

const GameboardBuilderRow = lazy(() => import("../elements/GameboardBuilderRow"));

const GameboardBuilder = ({user}: {user: RegisteredUserDTO}) => {
    const {search} = useLocation();
    const queryParams = search && queryString.parse(search);
    const baseGameboardId = queryParams && queryParams.base as string;
    const concepts = queryParams && queryParams.concepts as string;

    const dispatch = useAppDispatch();
    const userContext = useUserContext();
    const {data: wildcards} = useGetWildcardsQuery();
    const {data: baseGameboard} = useGetGameboardByIdQuery(baseGameboardId || skipToken);
    const [generateTemporaryGameboard] = useGenerateTemporaryGameboardMutation();
    const [createGameboard, {isLoading: isWaitingForCreateGameboard}] = useCreateGameboardMutation();

    const [gameboardTitle, setGameboardTitle] = useState("");
    const [gameboardTags, setGameboardTags] = useState<Item<string>[]>([]);
    const [gameboardURL, setGameboardURL] = useState<string>();
    const [questionOrder, setQuestionOrder] = useState<string[]>([]);
    const [previousQuestionOrderStack, setPreviousQuestionOrderStack] = useState<string[][]>([]);
    const [selectedQuestions, setSelectedQuestions] = useState(new Map<string, ContentSummary>());
    const [previousSelectedQuestionsStack, setPreviousSelectedQuestionsStack] = useState(new Array<Map<string, ContentSummary>>());
    const [wildcardId, setWildcardId] = useState<string | undefined>(undefined);
    const eventLog = useRef<object[]>([]).current; // Use ref to persist state across renders but not rerender on mutation

    const cloneGameboard = useCallback((gameboard: GameboardDTO) => {
        setGameboardTitle(gameboard.title ? `${gameboard.title} (Copy)` : "");
        setQuestionOrder(loadGameboardQuestionOrder(gameboard) || []);
        setSelectedQuestions(loadGameboardSelectedQuestions(gameboard) || new Map<string, ContentSummary>());
        setWildcardId(isStaff(user) && gameboard.wildCard && gameboard.wildCard.id || undefined);
        if (concepts && (!baseGameboardId)) {
            logEvent(eventLog, "GAMEBOARD_FROM_CONCEPT", {concepts: concepts});
        } else {
            logEvent(eventLog, "CLONE_GAMEBOARD", {gameboardId: gameboard.id});
        }
    }, [setGameboardTitle, setQuestionOrder, setSelectedQuestions, setWildcardId, baseGameboardId, concepts, eventLog, user]);

    const initialise = () => {
        setGameboardURL(undefined);
        setGameboardTitle("");
        setGameboardTags([]);
        setQuestionOrder([]);
        setGameboardURL(undefined);
        setSelectedQuestions(new Map<string, ContentSummary>());
        setWildcardId(undefined);
    };

    useEffect(() => {
        if (baseGameboard) {
            cloneGameboard(baseGameboard);
        }
    }, [baseGameboard]);

    const canSubmit = (selectedQuestions.size > 0 && selectedQuestions.size <= 10) && gameboardTitle != "" && isValidGameboardId(gameboardURL);

    const reorder = (result: DropResult) => {
        if (result.destination) {
            const [removed] = questionOrder.splice(result.source.index, 1);
            questionOrder.splice(result.destination.index, 0, removed);
        }
    };

    useEffect(() => {
        if (concepts && (!baseGameboardId)) {
            const params: { [key: string]: string } = {};
            params.concepts = concepts;
            if (userContext.stage !== STAGE.ALL) {
                params.stages = userContext.stage;
            }
            if (userContext.examBoard !== EXAM_BOARD.ALL) {
                params.examBoards = userContext.examBoard;
            }
            generateTemporaryGameboard(params).then((gameboardResponse) => {
                if (mutationSucceeded(gameboardResponse)) {
                    cloneGameboard(gameboardResponse.data);
                } else {
                    console.error(`Failed to create ${siteSpecific("gameboard", "quiz")} from concepts.`);
                }
            });
        }
    }, [dispatch, concepts, baseGameboardId, cloneGameboard, generateTemporaryGameboard, userContext.examBoard, userContext.stage]);
    useEffect(() => {
        return history.block(() => {
            logEvent(eventLog, "LEAVE_GAMEBOARD_BUILDER", {});
            dispatch(logAction({type: "LEAVE_GAMEBOARD_BUILDER", events: eventLog}));
        });
    }, []);

    const pageHelp = <span>
        You can create custom question sets to assign to your groups. Search by question title or topic and add up to
        ten questions to a {siteSpecific("gameboard", "quiz")}.
        <br/>
        You cannot modify a {siteSpecific("gameboard", "quiz")} after it has been created. You&apos;ll find a
        link underneath any existing {siteSpecific("gameboard", "quiz")} to duplicate and edit it.
    </span>;

    const sentinel = useRef<HTMLDivElement>(null);

    const resetBuilder = () => {
        if (baseGameboard) {
            cloneGameboard(baseGameboard);
        } else {
            initialise();
        }
        setTimeout(() => sentinel.current?.scrollIntoView(), 50);
    };

    return <Container id="gameboard-builder" fluid={siteSpecific(false, true)} className={classNames({"px-lg-5 px-xl-6": isAda})}>
        <div ref={sentinel}/>
        <TitleAndBreadcrumb currentPageTitle={`${siteSpecific("Gameboard", "Quiz")} builder`} help={pageHelp} modalId="gameboard_builder_help"/>

        <Card className="p-3 mt-4 mb-5">
            <CardBody>
                <Row>
                    <Col>
                        <Label htmlFor="gameboard-builder-name">{siteSpecific("Gameboard", "Quiz")} title:</Label>
                        <Input id="gameboard-builder-name"
                               type="text"
                               placeholder={siteSpecific("e.g. Year 12 Dynamics", "e.g. Year 12 Network components")}
                               value={gameboardTitle}
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                   setGameboardTitle(e.target.value);
                               }}
                        />
                    </Col>
                </Row>

                {isStaff(user) && <Row className="mt-2">
                    <Col>
                        <Label htmlFor="gameboard-builder-tag-as">Tag as</Label>
                        <StyledSelect inputId="question-search-level"
                                isMulti
                                options={siteSpecific([
                                    {value: 'ISAAC_BOARD', label: 'Created by Isaac'},
                                ], [
                                    {value: 'ISAAC_BOARD', label: 'Created by Ada'},
                                    {value: 'CONFIDENCE_RESEARCH_BOARD', label: 'Confidence research board'}
                                ])}
                                name="colors"
                                value={gameboardTags}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                placeholder="None"
                                onChange={selectOnChange(setGameboardTags, false)}
                        />
                    </Col>
                    <Col>
                        <Label htmlFor="gameboard-builder-url">{siteSpecific("Gameboard", "Quiz")} ID</Label>
                        <Input id="gameboard-builder-url"
                               type="text"
                               placeholder="Optional"
                               value={gameboardURL ?? ""}
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                   setGameboardURL(e.target.value);
                               }}
                               invalid={!isValidGameboardId(gameboardURL)}
                        />
                    </Col>
                    <Col>
                        <Label htmlFor="gameboard-builder-wildcard">Wildcard</Label>
                        <Input id="gameboard-builder-wildcard"
                               type="select" value={wildcardId}
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                   setWildcardId(e.target.value);
                               }}
                        >
                            <option value="random">Random wildcard</option>
                            {isDefined(wildcards) && wildcards.map((wildcard) => {
                                return <option key={wildcard.id} value={wildcard.id}>{wildcard.title}</option>
                            })}
                        </Input>
                    </Col>
                </Row>}

                <div className="mt-4 responsive">
                    <DragDropContext onDragEnd={reorder}>
                        <Table bordered>
                            <thead>
                            <tr>
                                <th className="w-5"/>
                                <th className={siteSpecific("w-40", "w-30")}>Question title</th>
                                <th className={siteSpecific("w-25", "w-20")}>Topic</th>
                                <th className="w-15">Stage</th>
                                <th className="w-15">Difficulty</th>
                                {isAda && <th className="w-15">Exam boards</th>}
                            </tr>
                            </thead>
                            <Droppable droppableId="droppable">
                                {(provided) => {
                                    return (
                                        <tbody ref={provided.innerRef}>
                                        {questionOrder.map((questionId, index: number) => {
                                            const question = selectedQuestions.get(questionId);
                                            return question && question.id &&
                                                <Draggable key={question.id} draggableId={question.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <GameboardBuilderRow
                                                            provided={provided}
                                                            snapshot={snapshot}
                                                            key={`gameboard-builder-row-${question.id}`}
                                                            question={question} selectedQuestions={selectedQuestions}
                                                            setSelectedQuestions={setSelectedQuestions}
                                                            previousSelectedQuestionsStack={previousSelectedQuestionsStack}
                                                            setPreviousSelectedQuestionsStack={setPreviousSelectedQuestionsStack}
                                                            questionOrder={questionOrder}
                                                            setQuestionOrder={setQuestionOrder}
                                                            previousQuestionOrderStack={previousQuestionOrderStack}
                                                            setPreviousQuestionOrderStack={setPreviousQuestionOrderStack}
                                                            creationContext={question.creationContext}
                                                        />)}
                                                </Draggable>
                                        })}
                                        {provided.placeholder}
                                        <tr>
                                            <td colSpan={20}>
                                                <div className="img-center">
                                                    <div className="row w-100">
                                                        <div className="col-md-3 d-flex justify-content-center justify-content-md-start">
                                                            {previousQuestionOrderStack.length > 0 && <Button
                                                                className="mb-1 mb-md-0"
                                                                color="primary" outline
                                                                onClick={() => {
                                                                    setQuestionOrder(previousQuestionOrderStack.pop() || []);
                                                                    setSelectedQuestions(previousSelectedQuestionsStack.pop() || new Map<string, ContentSummary>());
                                                                }}
                                                            >
                                                                Undo
                                                            </Button>}
                                                        </div>
                                                        <div className="col-md-6 d-flex justify-content-center">
                                                            <ShowLoading
                                                                placeholder={<div className="text-center"><IsaacSpinner/></div>}
                                                                until={!baseGameboardId || baseGameboard}
                                                            >
                                                                <Button
                                                                    className="plus-button"
                                                                    color="primary" outline
                                                                    onClick={() => {
                                                                        logEvent(eventLog, "OPEN_SEARCH_MODAL", {});
                                                                        dispatch(openActiveModal({
                                                                            closeAction: () => {
                                                                                dispatch(closeActiveModal())
                                                                            },
                                                                            closeLabelOverride: "Cancel",
                                                                            size: "xl",
                                                                            title: "Search questions",
                                                                            body: <QuestionSearchModal
                                                                                originalSelectedQuestions={selectedQuestions}
                                                                                setOriginalSelectedQuestions={setSelectedQuestions}
                                                                                originalQuestionOrder={questionOrder}
                                                                                setOriginalQuestionOrder={setQuestionOrder}
                                                                                previousQuestionOrder={previousQuestionOrderStack}
                                                                                setPreviousQuestionOrder={setPreviousQuestionOrderStack}
                                                                                previousSelectedQuestions={previousSelectedQuestionsStack}
                                                                                setPreviousSelectedQuestions={setPreviousSelectedQuestionsStack}
                                                                                eventLog={eventLog}
                                                                            />
                                                                        }))
                                                                    }}
                                                                >
                                                                    {siteSpecific("Add Questions", "Add questions")}
                                                                    {isAda && <img className={"plus-icon"} src={"/assets/cs/icons/add-circle-outline-pink.svg"}/>}
                                                                </Button>
                                                            </ShowLoading>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        </tbody>
                                    )
                                }}
                            </Droppable>
                        </Table>
                    </DragDropContext>
                </div>

                <div className="text-center">
                    <Button
                        id="gameboard-save-button" disabled={!canSubmit} color="secondary"
                        className="mt-2" aria-describedby="gameboard-help"
                        onClick={() => {
                            // TODO - refactor this onCLick into a named method; and use Tags service, not hardcoded subject tag list.
                            let wildcard = undefined;
                            if (wildcardId && isDefined(wildcards) && wildcards.length > 0) {
                                wildcard = wildcards.filter((wildcard) => wildcard.id == wildcardId)[0];
                            }

                            let subjects = [];

                            if (isAda) {
                                subjects.push("computer_science");
                            } else {
                                const definedSubjects = [TAG_ID.physics, TAG_ID.maths, TAG_ID.chemistry, TAG_ID.biology];
                                selectedQuestions?.forEach((item) => {
                                    const tags = intersection(definedSubjects, item.tags || []);
                                    tags.forEach((tag: string) => subjects.push(tag));
                                });
                                // If none of the questions have a subject tag, default to physics
                                if (subjects.length === 0) {
                                    subjects.push(TAG_ID.physics);
                                }
                                subjects = Array.from(new Set(subjects));
                            }

                            createGameboard({
                                gameboard: {
                                    id: gameboardURL,
                                    title: gameboardTitle,
                                    contents: questionOrder.map((questionId) => {
                                        const question = selectedQuestions.get(questionId);
                                        return question && convertContentSummaryToGameboardItem(question);
                                    }).filter((question) => question !== undefined) as GameboardItem[],
                                    wildCard: wildcard,
                                    wildCardPosition: 0,
                                    gameFilter: {subjects: subjects},
                                    tags: gameboardTags.map(getValue)
                                },
                                previousId: baseGameboardId
                            }).then(gameboardOrError => {
                                const error = 'error' in gameboardOrError ? gameboardOrError.error : undefined;
                                const gameboardId = 'data' in gameboardOrError ? gameboardOrError.data.id : undefined;
                                dispatch(openActiveModal({
                                    closeAction: () => dispatch(closeActiveModal()),
                                    title: `${siteSpecific("Gameboard", "Quiz")} ${gameboardId ? "created" : "creation failed"}`,
                                    body: <GameboardCreatedModal resetBuilder={resetBuilder} gameboardId={gameboardId} error={error}/>,
                                }));
                            });

                            logEvent(eventLog, "SAVE_GAMEBOARD", {});
                            dispatch(logAction({type: "SAVE_GAMEBOARD", events: eventLog}));
                        }}
                    >
                        {isWaitingForCreateGameboard ?
                            <Spinner size={"md"}/> : siteSpecific("Save Gameboard", "Save quiz")}
                    </Button>
                </div>

                {!canSubmit && <div
                    id="gameboard-help" color="light"
                    className={`text-center mb-0 pt-3 pb-0 ${selectedQuestions.size > 10 ? "text-danger" : ""}`}
                >
                    {siteSpecific("Gameboards", "Quizzes")} require both a title and between 1 and 10 questions.
                    {!isValidGameboardId(gameboardURL) && <div className="text-danger">
                        The {siteSpecific("gameboard", "quiz")} ID should contain numbers, lowercase letters, underscores and hyphens only.<br/>
                        It should not be the full URL.
                    </div>}
                </div>}
            </CardBody>
        </Card>
    </Container>;
};
export default GameboardBuilder;
