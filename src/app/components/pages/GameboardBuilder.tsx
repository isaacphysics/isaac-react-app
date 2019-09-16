import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import * as RS from "reactstrap";
import {Tooltip} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ContentSummaryDTO, IsaacWildcard} from "../../../IsaacApiTypes";
import {closeActiveModal, createGameboard, getWildcards, openActiveModal} from "../../state/actions";
import {store} from "../../state/store";
import {QuestionSearchModal} from "../elements/QuestionSearchModal";
import classnames from "classnames";
import {DragDropContext, Draggable, Droppable, DropResult} from "react-beautiful-dnd";
import {AppState} from "../../state/reducers";
import {GameboardCreatedModal} from "../elements/GameboardCreatedModal";
import {isStaff} from "../../services/user";
import {examBoardTagMap, tagExamboardMap} from "../../services/constants";
import {resourceFound} from "../../services/validation";
import {sample} from 'lodash';
import {convertContentSummaryToGameboardItem} from "../../services/gameboardBuilder";

export const GameboardBuilder = () => {
    const dispatch = useDispatch();
    const [gameboardName, setGameboardName] = useState("");
    const [gameboardTag, setGameboardTag] = useState("null");
    const [gameboardURL, setGameboardURL] = useState("");
    const [questionOrder, setQuestionOrder] = useState([] as string[]);
    const [selectedQuestions, setSelectedQuestions] = useState(new Map<string, ContentSummaryDTO>());
    const [tooltipShow, setTooltipShow] = useState(false);
    const [wildcardId, setWildcardId] = useState("random");

    const user = useSelector((state: AppState) => state && state.user);
    const wildcards = useSelector((state: AppState) => state && state.wildcards);

    const canSubmit = () => (selectedQuestions.size > 0 && selectedQuestions.size <= 10) && gameboardName != "";

    const reorder = (result: DropResult) => {
        if (result.destination) {
            const [removed] = questionOrder.splice(result.source.index, 1);
            questionOrder.splice(result.destination.index, 0, removed);
        }
    };

    const tagIcons = (tag: string) => {
        return <span key={tag} className="badge badge-pill badge-warning mx-1">{tag}</span>
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
                            placeholder="Year 12 Geology"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setGameboardName(e.target.value);
                            }}
                        />
                    </RS.Col>
                </RS.Row>
                {isStaff(user) && <div className="d-flex flex-wrap">
                    <div className="flex-fill mt-2 col-lg-4">
                        <RS.Label htmlFor="tag-as">Tag as</RS.Label>
                        <RS.Input type="select" defaultValue={gameboardTag}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                      setGameboardTag(e.target.value);
                                  }}>
                            <option value="null">None</option>
                            <option value="CREATED_BY_ISAAC">Created by Isaac</option>
                        </RS.Input>
                    </div>
                    <div className="flex-fill mt-2 col-lg-4">
                        <RS.Label htmlFor="gameboard-url">Gameboard URL</RS.Label>
                        <RS.Input
                            type="text"
                            placeholder="Optional"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setGameboardURL(e.target.value);
                            }}
                        />
                    </div>
                    <div className="flex-fill mt-2 col-lg-4">
                        <RS.Label htmlFor="wildcard">Wildcard</RS.Label>
                        <RS.Input type="select" defaultValue="random"
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                      setWildcardId(e.target.value);
                                  }}>
                            <option value="random">Random wildcard</option>
                            {resourceFound(wildcards) && wildcards.map((wildcard) => {
                                return <option value={wildcard.id}>{wildcard.title}</option>
                            })}
                        </RS.Input>
                    </div>
                </div>}
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
                                  questions: Array.from(selectedQuestions.values()).map(convertContentSummaryToGameboardItem),
                                  wildCard: wildcard,
                                  wildCardPosition: 0,
                                  gameFilter: {
                                      subjects: ["computer_science"],
                                  },
                                  tags: gameboardTag == "CREATED_BY_ISAAC" ? ["ISAAC_BOARD"] : []
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

        <RS.Card className="p-3 my-3">
            <RS.CardTitle tag="h2">Selected Questions</RS.CardTitle>
            <RS.CardBody>
                <div className="responsive">
                    <DragDropContext onDragEnd={reorder}>
                        <RS.Table bordered>
                            <thead>
                                <tr>
                                    <th className={"col-md-1"}></th>
                                    <th className={"col-md-5"}>Title</th>
                                    <th className={"col-md-3"}>Tags</th>
                                    <th className={"col-md-1"}>Level</th>
                                    <th className="col-md-2">Exam board</th>
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
                                                    <tr key={question.id} ref={provided.innerRef}
                                                        className={classnames({disabled: index >= 10, selected: true})}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}>
                                                        <td>
                                                            <RS.CustomInput
                                                                type="checkbox"
                                                                id={`gameboard-builder-remove-${question.id}`}
                                                                color="secondary"
                                                                checked={question.id == undefined || selectedQuestions.has(question.id)}
                                                                onChange={() => {
                                                                    if (question.id) {
                                                                        const newSelectedQuestions = new Map(selectedQuestions);
                                                                        const newQuestionOrder = [...questionOrder];
                                                                        newSelectedQuestions.delete(question.id);
                                                                        setSelectedQuestions(newSelectedQuestions);
                                                                        newQuestionOrder.splice(newQuestionOrder.indexOf(question.id), 1);
                                                                        setQuestionOrder(newQuestionOrder)
                                                                    }
                                                                }}/>
                                                        </td>
                                                        <td>
                                                            <a href={question.url} target="_blank">{question.title}</a>
                                                        </td>
                                                        <td>
                                                            {question.tags && question.tags.map((tag) => tagIcons(tag))}
                                                        </td>
                                                        <td>
                                                            {question.level}
                                                        </td>
                                                        <td>
                                                            {question.tags && question.tags.filter((tag) => Object.values(examBoardTagMap).includes(tag)).map((tag) => tagExamboardMap[tag]).join(", ")}
                                                        </td>
                                                    </tr>)}
                                                </Draggable>
                                            })

                                        }
                                        {provided.placeholder}
                                        </tbody>
                                        )}}
                            </Droppable>
                        </RS.Table>
                    </DragDropContext>
                </div>
                <RS.Input type="button" value="Add questions"
                          className={"btn btn-block btn-secondary border-0"}
                          onClick={() => {
                              dispatch(openActiveModal({
                                  closeAction: () => {store.dispatch(closeActiveModal())},
                                  size: "xl",
                                  title: "Search questions",

                                  body: <QuestionSearchModal originalSelectedQuestions={selectedQuestions}
                                                             setOriginalSelectedQuestions={setSelectedQuestions}
                                                             originalQuestionOrder={questionOrder}
                                                             setOriginalQuestionOrder={setQuestionOrder}/>
                          }))}}
                />
            </RS.CardBody>
        </RS.Card>
    </RS.Container>
};
