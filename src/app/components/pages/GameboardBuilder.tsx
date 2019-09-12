import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {GameboardDTO, GameboardItem} from "../../../IsaacApiTypes";
import {closeActiveModal, createGameboard, openActiveModal} from "../../state/actions";
import {store} from "../../state/store";
import {QuestionSearchModal} from "../elements/QuestionSearchModal";
import classnames from "classnames";
import {DragDropContext, Draggable, Droppable, DropResult} from "react-beautiful-dnd";
import {Tooltip} from "reactstrap";
import {AppState} from "../../state/reducers";
import {GameboardCreatedModal} from "../elements/GameboardCreatedModal";

export const GameboardBuilder = () => {
    const dispatch = useDispatch();
    const [gameboardName, setGameboardName] = useState("");
    const [gameboardTag, setGameboardTag] = useState("null");
    const [gameboardURL, setGameboardURL] = useState("");
    const [questionOrder, setQuestionOrder] = useState([] as string[]);
    const [selectedQuestions, setSelectedQuestions] = useState(new Map<string, GameboardItem>());
    const [tooltipShow, setTooltipShow] = useState(false);

    const canSubmit = () => (selectedQuestions.size > 0 && selectedQuestions.size <= 10) && gameboardName != "";

    const reorder = (result: DropResult) => {
        if (result.destination) {
            const [removed] = questionOrder.splice(result.source.index, 1);
            questionOrder.splice(result.destination.index, 0, removed);
        }
    };

    const tagIcons = (tag: string) => {
        return <span key={tag} className="badge badge-pill badge-warning mx-1">{tag.replace(/[\s,_]+/, " ")}</span>
    };

    return <RS.Container id="gameboard-builder">
        <TitleAndBreadcrumb currentPageTitle="Gameboard builder"/>

        <RS.Card className="p-3 my-3">
            <RS.CardTitle tag="h2">Gameboard details</RS.CardTitle>
            <RS.CardBody>
                <RS.Row>
                    <RS.Col>
                        <RS.Label>Gameboard name:</RS.Label>
                        <RS.Input
                            type="text"
                            placeholder="Year 12 Geology"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setGameboardName(e.target.value);
                            }}
                        />
                    </RS.Col>
                </RS.Row>
                <RS.Row className={"mt-2"}>
                    <RS.Col>
                        <RS.Label>Tag as:</RS.Label>
                    </RS.Col>
                    <RS.Col>
                        <RS.Label>Gameboard URL (must be unique and not contain spaces):</RS.Label>
                    </RS.Col>
                </RS.Row>
                <RS.Row>
                    <RS.Col>
                        <RS.Input type="select" defaultValue={gameboardTag}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                      setGameboardTag(e.target.value);
                                  }}>
                            <option value="null">None</option>
                            <option value="CREATED_BY_ISAAC">Created by Isaac</option>
                        </RS.Input>
                    </RS.Col>
                    <RS.Col>
                        <RS.Input
                            type="text"
                            placeholder="Optional"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setGameboardURL(e.target.value);
                            }}
                        />
                    </RS.Col>
                </RS.Row>
                <RS.Input id="gameboard-save-button" type="button" value="Save gameboard"
                          className={"btn btn-block btn-secondary border-0 mt-4 " + classnames({disabled: !canSubmit()})}
                          disabled={!canSubmit()}
                          onClick={() => {
                              dispatch(createGameboard({
                                  title: gameboardName,
                                  questions: Array.from(selectedQuestions.values()).map((question) => {
                                      delete question.type;
                                      delete question.url;
                                      return question;
                                  }),
                                  // TODO THIS NEEDS TO BE FILLED OUT
                                  wildCard: {
                                      description: "",
                                      url: "",
                                  },
                                  wildCardPosition: 0,
                                  gameFilter: {
                                      subjects: ["computer_science"],
                                  }
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
                                {(provided, droppableSnapshot) => {
                                    return (
                                        <tbody ref={provided.innerRef}>
                                        {
                                            questionOrder.map((question_id, index: number) => {
                                                const question = selectedQuestions.get(question_id);
                                                return question && question.id && <Draggable key={question.id} draggableId={question.id} index={index}>
                                                    {(provided, snapshot) => (
                                                    <tr key={question.id} ref={provided.innerRef}
                                                        className={classnames({disabled: index >= 10})}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}>
                                                        <td>
                                                            <RS.CustomInput
                                                                type="checkbox"
                                                                id={`gameboard-builder-remove-${question.id}`}
                                                                color="secondary"
                                                                checked={question.id == undefined || selectedQuestions.has(question.id)}
                                                                onClick={() => {
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
                                                            Not yet implemented
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
