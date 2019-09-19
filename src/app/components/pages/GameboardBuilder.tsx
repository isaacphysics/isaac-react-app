import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import * as RS from "reactstrap";
import {Tooltip} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ContentSummaryDTO, GameboardDTO, GameboardItem, IsaacWildcard} from "../../../IsaacApiTypes";
import {closeActiveModal, createGameboard, getWildcards, openActiveModal} from "../../state/actions";
import {store} from "../../state/store";
import {QuestionSearchModal} from "../elements/QuestionSearchModal";
import classnames from "classnames";
import {DragDropContext, Draggable, Droppable, DropResult} from "react-beautiful-dnd";
import {AppState} from "../../state/reducers";
import {GameboardCreatedModal} from "../elements/GameboardCreatedModal";
import {isStaff} from "../../services/user";
import {resourceFound} from "../../services/validation";
import {sample} from 'lodash';
import {
    convertContentSummaryToGameboardItem,
    loadGameboardQuestionOrder,
    loadGameboardSelectedQuestions
} from "../../services/gameboardBuilder";
import {GameboardBuilderRow} from "../elements/GameboardBuilderRow";
import {IS_CS_PLATFORM} from "../../services/constants";

interface GameboardBuilderProps {
    location: {
        state?: {
            gameboard?: GameboardDTO;
        }
    }
};

export const GameboardBuilder = (props: GameboardBuilderProps) => {
    const dispatch = useDispatch();
    const loadedGameboard = props.location.state && props.location.state.gameboard;

    const user = useSelector((state: AppState) => state && state.user);
    const wildcards = useSelector((state: AppState) => state && state.wildcards);

    const [gameboardName, setGameboardName] = useState(loadedGameboard ? `${loadedGameboard.title}-copy`: "");
    const [gameboardTag, setGameboardTag] = useState(loadedGameboard && isStaff(user) && loadedGameboard.tags ? loadedGameboard.tags[0] : "null");
    const [gameboardURL, setGameboardURL] = useState(loadedGameboard && isStaff(user) ? `${loadedGameboard.id}-copy` : "");
    const [questionOrder, setQuestionOrder] = useState<string[]>((loadedGameboard && loadGameboardQuestionOrder(loadedGameboard)) || []);
    const [selectedQuestions, setSelectedQuestions] = useState((loadedGameboard && loadGameboardSelectedQuestions(loadedGameboard)) || new Map<string, ContentSummaryDTO>());
    const [tooltipShow, setTooltipShow] = useState(false);
    const [wildcardId, setWildcardId] = useState(loadedGameboard && loadedGameboard.wildCard && loadedGameboard.wildCard.id ? loadedGameboard.wildCard.id : "random");

    const canSubmit = () => (selectedQuestions.size > 0 && selectedQuestions.size <= 10) && gameboardName != "";

    const reorder = (result: DropResult) => {
        if (result.destination) {
            const [removed] = questionOrder.splice(result.source.index, 1);
            questionOrder.splice(result.destination.index, 0, removed);
        }
    };

    useEffect(() => {
       if (!wildcards) {
           dispatch(getWildcards());
       }
    }, [user]);

    return <RS.Container id="gameboard-builder">
        <TitleAndBreadcrumb currentPageTitle="Gameboard builder"/>

        <RS.Card className="p-3 my-3">
            <RS.CardTitle tag="h2">Gameboard details</RS.CardTitle>
            <RS.CardBody>
                <RS.Row>
                    <RS.Col>
                        <RS.Label htmlFor="gameboard-name">Gameboard name:</RS.Label>
                        <RS.Input
                            type="text"
                            placeholder="Year 12 Network components"
                            defaultValue={gameboardName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setGameboardName(e.target.value);
                            }}
                        />
                    </RS.Col>
                </RS.Row>

                {isStaff(user) && <RS.Row className="mt-2">
                    <RS.Col>
                        <RS.Label htmlFor="tag-as">Tag as</RS.Label>
                        <RS.Input type="select" defaultValue={gameboardTag}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                      setGameboardTag(e.target.value);
                                  }}>
                            <option value="null">None</option>
                            <option value="ISAAC_BOARD">Created by Isaac</option>
                        </RS.Input>
                    </RS.Col>
                    <RS.Col>
                        <RS.Label htmlFor="gameboard-url">Gameboard URL</RS.Label>
                        <RS.Input
                            type="text"
                            placeholder="Optional"
                            defaultValue={gameboardURL}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setGameboardURL(e.target.value);
                            }}
                        />
                    </RS.Col>
                    <RS.Col>
                        <RS.Label htmlFor="wildcard">Wildcard</RS.Label>
                        <RS.Input type="select" defaultValue={wildcardId}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                      setWildcardId(e.target.value);
                                  }}>
                            <option value="random">Random wildcard</option>
                            {resourceFound(wildcards) && wildcards.map((wildcard) => {
                                return <option key={wildcard.id} value={wildcard.id}>{wildcard.title}</option>
                            })}
                        </RS.Input>
                    </RS.Col>
                </RS.Row>}

                <RS.CardSubtitle tag="h3" className="mt-3">Selected Questions</RS.CardSubtitle>
                <div className="responsive">
                    <DragDropContext onDragEnd={reorder}>
                        <RS.Table bordered>
                            <thead>
                                <tr>
                                    <th className="w-5"></th>
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
                                        {
                                            questionOrder.map((question_id, index: number) => {
                                                const question = selectedQuestions.get(question_id);
                                                return question && question.id && <Draggable key={question.id} draggableId={question.id} index={index}>
                                                    {(provided) => (
                                                        <GameboardBuilderRow provided={provided}
                                                                             key={`gameboard-builder-row-${question.id}`}
                                                                             question={question}
                                                                             selectedQuestions={selectedQuestions}
                                                                             setSelectedQuestions={setSelectedQuestions}
                                                                             questionOrder={questionOrder}
                                                                             setQuestionOrder={setQuestionOrder}/>)}
                                                </Draggable>
                                            })

                                        }
                                        {provided.placeholder}
                                        <tr>
                                            <td colSpan={5}
                                                onClick={() => {
                                                    dispatch(openActiveModal({
                                                        closeAction: () => {store.dispatch(closeActiveModal())},
                                                        size: "xl",
                                                        title: "Search questions",
                                                        body: <QuestionSearchModal originalSelectedQuestions={selectedQuestions}
                                                                                   setOriginalSelectedQuestions={setSelectedQuestions}
                                                                                   originalQuestionOrder={questionOrder}
                                                                                   setOriginalQuestionOrder={setQuestionOrder}/>
                                                    }))}}>
                                                <div className="img-center">
                                                    <img src="/assets/add_circle_outline.svg" className="centre img-fluid" alt="Add questions" />
                                                </div>
                                            </td>
                                        </tr>
                                        </tbody>
                                        )}}
                            </Droppable>
                        </RS.Table>
                    </DragDropContext>
                </div>
                <RS.Input id="gameboard-save-button" type="button" value="Save gameboard"
                          className={"btn btn-block btn-secondary border-0 mt-4 " + classnames({disabled: !canSubmit()})}
                          disabled={!canSubmit()}
                          onClick={() => {
                              let wildcard = {
                                  description: "",
                                  url: ""
                              } as IsaacWildcard;

                              if (resourceFound(wildcards) && wildcards.length > 0) {
                                  if (wildcardId == "random") {
                                      wildcard = sample(wildcards) || wildcard;
                                  } else {
                                      wildcard = wildcards.filter((wildcard) => wildcard.id == wildcardId)[0];
                                  }
                              }

                              dispatch(createGameboard({
                                  id: gameboardURL == "" ? undefined : gameboardURL,
                                  title: gameboardName,
                                  questions: questionOrder.map((questionId) => {
                                      const question = selectedQuestions.get(questionId);
                                      return question && convertContentSummaryToGameboardItem(question);
                                  }).filter((question) => question !== undefined) as GameboardItem[],
                                  wildCard: wildcard,
                                  wildCardPosition: 0,
                                  gameFilter: {
                                      subjects: ["computer_science"],
                                  },
                                  tags: gameboardTag == "ISAAC_BOARD" ? ["ISAAC_BOARD"] : []
                              }));

                              dispatch(openActiveModal({
                                  closeAction: () => {store.dispatch(closeActiveModal())},
                                  title: "Gameboard submitted",
                                  body: <GameboardCreatedModal/>
                              }))
                          }}
                />
                {!canSubmit() && <Tooltip target="gameboard-save-button" className="failed" isOpen={tooltipShow} toggle={() => setTooltipShow(!tooltipShow)}>
                    Gameboards require a title and 1 to 10 questions
                </Tooltip>}
            </RS.CardBody>
        </RS.Card>
    </RS.Container>
};
