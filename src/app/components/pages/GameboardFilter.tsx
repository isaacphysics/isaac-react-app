import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import Select, {ValueType} from "react-select";
import {Link, withRouter} from "react-router-dom";
import tags from '../../services/tags';
import {TAG_ID} from '../../services/constants';
import {Tag} from "../../../IsaacAppTypes";
import {GameboardViewer} from './Gameboard';
import {generateTemporaryGameboard, loadGameboard} from '../../state/actions';
import {ShowLoading} from "../handlers/ShowLoading";
import {selectors} from "../../state/selectors";
import {GameboardDTO} from "../../../IsaacApiTypes";

interface Item<T> {
    value: T;
    label: string;
}

const tagToSelectOption = (tag: Tag) => ({value: tag.id, label: tag.title});

function toCSV<T>(items: Item<T>[]) {
    return items.map(item => item.value).join(",");
}

export const GameboardFilter = withRouter((props: {location: {hash?: string}}) => {
    const dispatch = useDispatch();
    const gameboardOrNotFound = useSelector(selectors.board.currentGameboardOrNotFound);
    const gameboard = useSelector(selectors.board.currentGameboard);

    const [selections, setSelections] = useState<Item<TAG_ID>[][]>([]);

    function setSelection(level: number) {
        return ((values: Item<TAG_ID>[]) => {
            const newSelections = selections.slice(0, level);
            newSelections.push(values);
            setSelections(newSelections);
        }) as React.Dispatch<React.SetStateAction<Item<TAG_ID>[]>>;
    }

    const choices = [tags.allSubjectTags.map(tagToSelectOption)];
    for (var i = 0; i < selections.length && i < 2; i++) {
        const selection = selections[i];
        if (selection.length !== 1) break;
        choices.push(tags.getChildren(selection[0].value).map(tagToSelectOption));
    }

    const levels = [
        {id: "subjects", name: "Subject"},
        {id: "fields", name: "Field"},
        {id: "topics", name: "Topic"},
    ].map(level => ({...level, for: "for_" + level.id})).slice(0, i + 1);

    const [difficulty, setDifficulty] = useState<Item<number>[]>([]);

    const difficulties = Array.from(Array(6).keys()).map(i => ({label: "" + (i + 1), value: i + 1}));

    let boardName = "Physics & Maths";
    let selectionIndex = selections.length;
    while(selectionIndex-- > 0) {
        if (selections[selectionIndex].length === 1) {
            boardName = selections[selectionIndex][0].label;
            break;
        }
    }
    if (difficulty.length === 1) {
        boardName += ", Level " + difficulty[0].label;
    }

    const [boardStack, setBoardStack] = useState<string[]>([]);

    function loadNewBoard() {
        // Load a gameboard
        const params: { [key: string]: string } = {
            title: boardName,
            levels: toCSV(difficulty.length === 0 ? difficulties : difficulty)
        };
        levels.forEach((level, i) => {
            if (!selections[i] || selections[i].length === 0) {
                if (i === 0) {
                    params[level.id] = "physics,maths";
                }
                return;
            }
            params[level.id] = toCSV(selections[i]);
        });
        dispatch(generateTemporaryGameboard(params));
    }

    useEffect(() => {
        setBoardStack([]);
        loadNewBoard();
    }, [selections, difficulty]);

    function refresh() {
        if (gameboard) {
            boardStack.push(gameboard.id as string);
            setBoardStack(boardStack);
            loadNewBoard();
        }
    }

    function previousBoard() {
        if (boardStack.length > 0) {
            const oldBoardId = boardStack.pop() as string;
            setBoardStack(boardStack);
            dispatch(loadGameboard(oldBoardId));
        }
    }

    const pageHelp = <span>
        You can build a gameboard by selecting the areas of interest and difficulty levels.
        <br />
        You can select more than one entry in each area.
    </span>;

    function unwrapValue<T>(f: React.Dispatch<React.SetStateAction<Item<T>[]>>) {
        return (value: ValueType<Item<T>>) => f(Array.isArray(value) ? value : !value ? [] : [value]);
    }

    return <RS.Container id="gameboard-generator" className="mb-5">
        <TitleAndBreadcrumb currentPageTitle="Choose your Questions" help={pageHelp}/>

        <RS.Row>
            <RS.Col lg={{size: 10, offset: 1}}>
                <div className="pt-3"><strong>Select your questions filters</strong></div>
                <RS.Row>
                    <RS.Col lg={6}>
                        {levels.map((level, i) => (
                            <React.Fragment key={level.for}>
                                <RS.Label for={level.for} className="pt-2 pb-0">{level.name}: </RS.Label>
                                <Select name={level.for} onChange={unwrapValue(setSelection(i))} isMulti={true} options={choices[i]} value={selections[i]} />
                            </React.Fragment>
                        ))}
                    </RS.Col>
                    <RS.Col lg={6}>
                        <div className="d-flex justify-content-between mt-0 mt-sm-4 mt-lg-0">
                            <RS.Label className="pt-2 pb-0" for="level-selector">Levels: </RS.Label>
                            <img width={270} height={45} className="mb-2 mt-n3 d-none d-sm-block" alt="1 = Pre-AS, 2 and 3 = AS, 4 and 5 = A2, 6 = Post-A2" src="/assets/phy/difficulty-guide.png" />
                        </div>
                        <Select name="level-selector" onChange={unwrapValue(setDifficulty)} isMulti={true} value={difficulty} options={difficulties} />
                    </RS.Col>
                </RS.Row>

                <RS.Row className="mt-4">
                    <RS.Col>
                        {boardStack.length > 0 && <RS.Button size="sm" color="primary" outline onClick={previousBoard}>
                            <span className="d-md-inline d-none">Undo Shuffle</span> &#9100;
                        </RS.Button>}
                    </RS.Col>
                    <RS.Col className="text-right">
                        <RS.Button size="sm" color="primary" outline onClick={refresh}>
                            <span className="d-md-inline d-none">Shuffle Questions</span> ⟳
                        </RS.Button>
                    </RS.Col>
                </RS.Row>

                <RS.Row className="mt-4 mt-md-5 mb-3">
                    <RS.Col>
                        <h3>{boardName}</h3>
                    </RS.Col>
                    <RS.Col className="text-right">
                        {gameboard && <RS.Button tag={Link} color="secondary" to={`/add_gameboard/${gameboard.id}`}>
                            Save to My&nbsp;Gameboards
                        </RS.Button>}
                    </RS.Col>
                </RS.Row>
            </RS.Col>
        </RS.Row>

        <div className="pb-4">
            <ShowLoading
                until={gameboardOrNotFound}
                thenRender={gameboard  => (<GameboardViewer gameboard={gameboard}/>)}
                ifNotFound={<RS.Alert color="warning">No questions found matching the criteria.</RS.Alert>}
            />
        </div>
    </RS.Container>;
});
