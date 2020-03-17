import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {AppState} from "../../state/reducers";
import Select, {ValueType} from "react-select";
import {Link, withRouter} from "react-router-dom";
import tags from '../../services/tags';
import {NOT_FOUND, TAG_ID} from '../../services/constants';
import {Tag} from "../../../IsaacAppTypes";
import {GameboardViewer} from './Gameboard';
import {generateTemporaryGameboard, loadGameboard} from '../../state/actions';
import {ShowLoading} from "../handlers/ShowLoading";

interface Item<T> {
    value: T;
    label: string;
}

const tagToSelectOption = (tag: Tag) => ({value: tag.id, label: tag.title});

function toCSV<T>(items: Item<T>[]) {
    return items.map(item => item.value).join(",");
}

export const PhyGameboardBuilder = withRouter((props: {location: {hash?: string}}) => {
    const dispatch = useDispatch();

    const gameboard = useSelector((state: AppState) => state && state.currentGameboard);

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
        if (gameboard && gameboard !== NOT_FOUND) {
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

    return <RS.Container id="phy-gameboard-builder">
        <TitleAndBreadcrumb currentPageTitle="Gameboard builder" help={pageHelp}/>
        <RS.Row>
            <RS.Col>
                <h5>Choose your questions</h5>
                {levels.map((level, i) => (
                    <><RS.Label for={level.for} className="pt-1 pb-0">{level.name}: </RS.Label><Select name={level.for} onChange={unwrapValue(setSelection(i))} isMulti={true} options={choices[i]} value={selections[i]} /></>
                ))}
            </RS.Col>
            <RS.Col>
                <h5>Levels</h5>
                <img width={180} height={30} className="mb-2" style={{marginLeft: "calc(50% - 90px)"}} alt="1 = Pre-AS, 2 and 3 = AS, 4 and 5 = A2, 6 = Post-A2" src="/assets/phy/difficulty-guide.png" />
                <Select onChange={unwrapValue(setDifficulty)} isMulti={true} value={difficulty} options={difficulties} />
            </RS.Col>
        </RS.Row>
        <RS.Row className="mt-4">
            <RS.Col>
                <h4>{boardName}</h4>
                <div className="gameboard-builder-banner">
                    {boardStack.length > 0 && <RS.Button size="sm" className="gameboard-builder-undo" onClick={previousBoard}>Undo Refresh</RS.Button>}
                    {gameboard && gameboard !== NOT_FOUND && <Link to={`/add_gameboard/${gameboard.id}`}>Save to My Boards</Link>}
                    <RS.Button size="sm" className="gameboard-builder-refresh" onClick={refresh}>Refresh Board</RS.Button>
                </div>
            </RS.Col>
        </RS.Row>
        <div className="mb-4">
            <ShowLoading until={gameboard}>
                {gameboard && gameboard !== NOT_FOUND ? <GameboardViewer gameboard={gameboard} />: <RS.Alert color="warning">No questions found matching the criteria.</RS.Alert>}
            </ShowLoading>
        </div>
    </RS.Container>;
});
