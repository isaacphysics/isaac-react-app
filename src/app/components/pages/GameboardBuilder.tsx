import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ContentSummaryDTO, GameboardDTO, GameboardItem, IsaacWildcard} from "../../../IsaacApiTypes";
import {closeActiveModal, createGameboard, getWildcards, logAction, openActiveModal} from "../../state/actions";
import {store} from "../../state/store";
import {QuestionSearchModal} from "../elements/modals/QuestionSearchModal";
import {DragDropContext, Draggable, Droppable, DropResult} from "react-beautiful-dnd";
import {AppState} from "../../state/reducers";
import {GameboardCreatedModal} from "../elements/modals/GameboardCreatedModal";
import {isStaff} from "../../services/user";
import {resourceFound} from "../../services/validation";
import {sample} from 'lodash';
import {
    convertContentSummaryToGameboardItem,
    loadGameboardQuestionOrder,
    loadGameboardSelectedQuestions,
    logEvent
} from "../../services/gameboardBuilder";
import {GameboardBuilderRow} from "../elements/GameboardBuilderRow";
import {IS_CS_PLATFORM} from "../../services/constants";
import {history} from "../../services/history"

interface GameboardBuilderProps {
    location: {
        state?: {
            gameboard?: GameboardDTO;
        };
    };
}

export const GameboardBuilder = (props: GameboardBuilderProps) => {
    const dispatch = useDispatch();
    const loadedGameboard = props.location.state && props.location.state.gameboard;

    const user = useSelector((state: AppState) => state && state.user);
    const wildcards = useSelector((state: AppState) => state && state.wildcards);

    const [gameboardTitle, setGameboardTitle] = useState(loadedGameboard ? `${loadedGameboard.title}-copy`: "");
    const [gameboardTag, setGameboardTag] = useState(loadedGameboard && isStaff(user) && loadedGameboard.tags ? loadedGameboard.tags[0] : "null");
    const [gameboardURL, setGameboardURL] = useState(loadedGameboard && isStaff(user) ? `${loadedGameboard.id}-copy` : "");
    const [questionOrder, setQuestionOrder] = useState<string[]>((loadedGameboard && loadGameboardQuestionOrder(loadedGameboard)) || []);
    const [selectedQuestions, setSelectedQuestions] = useState((loadedGameboard && loadGameboardSelectedQuestions(loadedGameboard)) || new Map<string, ContentSummaryDTO>());
    const [wildcardId, setWildcardId] = useState(loadedGameboard && loadedGameboard.wildCard && loadedGameboard.wildCard.id ? loadedGameboard.wildCard.id : "random");
    const eventLog = useRef<any[]>([]).current; // Use ref to persist state across renders but not rerender on mutation

    const canSubmit = (selectedQuestions.size > 0 && selectedQuestions.size <= 10) && gameboardTitle != "";

    const reorder = (result: DropResult) => {
        if (result.destination) {
            const [removed] = questionOrder.splice(result.source.index, 1);
            questionOrder.splice(result.destination.index, 0, removed);
        }
    };

    useEffect(() => {
        return history.block(() => {
            logEvent(eventLog, "LEAVE_GAMEBOARD_BUILDER", {});
            dispatch(logAction({type: "LEAVE_GAMEBOARD_BUILDER", events: eventLog}));
        });
    });

    useEffect(() => {
        if (!wildcards) {
            dispatch(getWildcards());
        }
    }, [user]);

    return <RS.Container id="gameboard-builder">
        <TitleAndBreadcrumb currentPageTitle="Gameboard builder"/>

        <RS.Card className="p-3 mt-4 mb-5">
            <RS.CardBody>
                <RS.Row>
                    <RS.Col>
                        <RS.Label htmlFor="gameboard-builder-name">Gameboard title:</RS.Label>
                        <RS.Input id="gameboard-builder-name"
                            type="text"
                            placeholder="e.g. Year 12 Network components"
                            defaultValue={gameboardTitle}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setGameboardTitle(e.target.value);
                            }}
                        />
                    </RS.Col>
                </RS.Row>

                {isStaff(user) && <RS.Row className="mt-2">
                    <RS.Col>
                        <RS.Label htmlFor="gameboard-builder-tag-as">Tag as</RS.Label>
                        <RS.Input id="gameboard-builder-tag-as"
                            type="select" defaultValue={gameboardTag}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {setGameboardTag(e.target.value);}}
                        >
                            <option value="null">None</option>
                            <option value="ISAAC_BOARD">Created by Isaac</option>
                        </RS.Input>
                    </RS.Col>
                    <RS.Col>
                        <RS.Label htmlFor="gameboard-builder-url">Gameboard URL</RS.Label>
                        <RS.Input id="gameboard-builder-url"
                            type="text"
                            placeholder="Optional"
                            defaultValue={gameboardURL}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setGameboardURL(e.target.value);
                            }}
                        />
                    </RS.Col>
                    <RS.Col>
                        <RS.Label htmlFor="gameboard-builder-wildcard">Wildcard</RS.Label>
                        <RS.Input id="gameboard-builder-wildcard"
                            type="select" defaultValue={wildcardId}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {setWildcardId(e.target.value);}}
                        >
                            <option value="random">Random wildcard</option>
                            {resourceFound(wildcards) && wildcards.map((wildcard) => {
                                return <option key={wildcard.id} value={wildcard.id}>{wildcard.title}</option>
                            })}
                        </RS.Input>
                    </RS.Col>
                </RS.Row>}

                <div className="mt-4 responsive">
                    <DragDropContext onDragEnd={reorder}>
                        <RS.Table bordered>
                            <thead>
                                <tr>
                                    <th className="w-5" />
                                    <th className="w-40">Question title</th>
                                    <th className="w-25">Topic</th>
                                    {!IS_CS_PLATFORM && <th className="w-15">Level</th>}
                                    <th className="w-15">Exam board</th>
                                </tr>
                            </thead>
                            <Droppable droppableId="droppable">
                                {(provided) => {
                                    return (
                                        <tbody ref={provided.innerRef}>
                                            {questionOrder.map((questionId, index: number) => {
                                                const question = selectedQuestions.get(questionId);
                                                return question && question.id && <Draggable key={question.id} draggableId={question.id} index={index}>
                                                    {(provided) => (
                                                        <GameboardBuilderRow
                                                            provided={provided} key={`gameboard-builder-row-${question.id}`}
                                                            question={question} selectedQuestions={selectedQuestions}
                                                            setSelectedQuestions={setSelectedQuestions} questionOrder={questionOrder}
                                                            setQuestionOrder={setQuestionOrder}
                                                        />)}
                                                </Draggable>
                                            })}
                                            {provided.placeholder}
                                            <tr>
                                                <td colSpan={5}>
                                                    <div className="img-center">
                                                        <input
                                                            type="image" src="/assets/add_circle_outline.svg" className="centre img-fluid"
                                                            alt="Add questions" title="Add questions"
                                                            onClick={() => {
                                                                logEvent(eventLog, "OPEN_SEARCH_MODAL", {});
                                                                dispatch(openActiveModal({
                                                                    closeAction: () => {store.dispatch(closeActiveModal())},
                                                                    size: "xl",
                                                                    title: "Search questions",
                                                                    body: <QuestionSearchModal
                                                                        originalSelectedQuestions={selectedQuestions}
                                                                        setOriginalSelectedQuestions={setSelectedQuestions}
                                                                        originalQuestionOrder={questionOrder}
                                                                        setOriginalQuestionOrder={setQuestionOrder}
                                                                        eventLog={eventLog}
                                                                    />
                                                                }))
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    )}}
                            </Droppable>
                        </RS.Table>
                    </DragDropContext>
                </div>

                <RS.Input
                    id="gameboard-save-button" type="button" value="Save gameboard" disabled={!canSubmit}
                    className={"btn btn-block btn-secondary border-0 mt-2"} aria-describedby="gameboard-help"
                    onClick={() => {
                        let wildcard: IsaacWildcard = {description: "", url: ""};
                        if (resourceFound(wildcards) && wildcards.length > 0) {
                            if (wildcardId == "random") {
                                wildcard = sample(wildcards) || wildcard;
                            } else {
                                wildcard = wildcards.filter((wildcard) => wildcard.id == wildcardId)[0];
                            }
                        }

                        dispatch(createGameboard({
                            id: gameboardURL == "" ? undefined : gameboardURL,
                            title: gameboardTitle,
                            questions: questionOrder.map((questionId) => {
                                const question = selectedQuestions.get(questionId);
                                return question && convertContentSummaryToGameboardItem(question);
                            }).filter((question) => question !== undefined) as GameboardItem[],
                            wildCard: wildcard,
                            wildCardPosition: 0,
                            gameFilter: {subjects: ["computer_science"]},
                            tags: gameboardTag == "ISAAC_BOARD" ? ["ISAAC_BOARD"] : []
                        }));

                        dispatch(openActiveModal({
                            closeAction: () => {store.dispatch(closeActiveModal())},
                            title: "Gameboard submitted",
                            body: <GameboardCreatedModal/>
                        }));

                        logEvent(eventLog, "SAVE_GAMEBOARD", {});
                        dispatch(logAction({type: "SAVE_GAMEBOARD", events: eventLog}));
                    }}
                />

                {!canSubmit && <div
                    id="gameboard-help" color="light"
                    className={`text-center mb-0 pt-3 pb-0 ${selectedQuestions.size <= 10 ? "text-muted" : "text-danger"}`}
                >
                    Gameboards require both a title and between 1 and 10 questions.
                </div>}

            </RS.CardBody>
        </RS.Card>
    </RS.Container>
};
