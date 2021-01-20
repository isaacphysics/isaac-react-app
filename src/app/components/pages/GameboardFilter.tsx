import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import Select, {ValueType} from "react-select";
import {Link, withRouter} from "react-router-dom";
import tags from '../../services/tags';
import {NOT_FOUND, TAG_ID} from '../../services/constants';
import {Tag} from "../../../IsaacAppTypes";
import {GameboardViewer} from './Gameboard';
import {generateTemporaryGameboard, loadGameboard} from '../../state/actions';
import {ShowLoading} from "../handlers/ShowLoading";
import {selectors} from "../../state/selectors";
import queryString from "query-string";
import {history} from "../../services/history";

interface Item<T> {
    value: T;
    label: string;
}

const levelOptions = Array.from(Array(6).keys()).map(i => ({label: `${(i + 1)}`, value: i + 1}));

function unwrapValue<T>(f: React.Dispatch<React.SetStateAction<Item<T>[]>>) {
    return (value: ValueType<Item<T>>) => f(Array.isArray(value) ? value : !value ? [] : [value]);
}
function itemiseTag(tag: Tag) {
    return {value: tag.id, label: tag.title}
}
function itemiseLevels(possibleLevels: string[]) {
    return possibleLevels
        .filter(possibleLevels => !isNaN(parseInt(possibleLevels)))
        .map(level => ({label: level, value: parseInt(level)}));
}
function toCSV<T>(items: Item<T>[]) {
    return items.map(item => item.value).join(",");
}

function processQueryString(query: string): {queryLevels: Item<number>[], querySelections: Item<TAG_ID>[][]} {
    const {levels, subjects, fields, topics} = queryString.parse(query);
    const tagHierarchy = tags.getTagHierarchy();

    let levelItems: Item<number>[] = [];
    if (levels) {
        const levelArray = levels instanceof Array ? levels : levels.split(",");
        // Start with an empty list if all levels are selected - nicer for most common usage of specifying 1 or 2 levels
        levelItems = levelArray.length === levelOptions.length && levelArray.every((l, i) => l === levelOptions[i]?.label) ?
            [] :
            itemiseLevels(levelArray);
    }

    const selectionItems: Item<TAG_ID>[][] = [];
    let plausibleParentHierarchy = true;
    [subjects, fields, topics].forEach((tier, index) => {
        if (tier && plausibleParentHierarchy) {
            const validTierTags = tags
                .getSpecifiedTags(tagHierarchy[index], (tier instanceof Array ? tier : tier.split(",")) as TAG_ID[]);
            // Only allow another layer of specificity if only one parent is selected
            plausibleParentHierarchy = validTierTags.length === 1;
            selectionItems.push(validTierTags.map(itemiseTag));
        }
    })

    return {queryLevels: levelItems, querySelections: selectionItems}
}

function generateBoardName(selections: Item<TAG_ID>[][], levels: Item<number>[]) {
    let boardName = "Physics & Maths";
    let selectionIndex = selections.length;
    while(selectionIndex-- > 0) {
        if (selections[selectionIndex].length === 1) {
            boardName = selections[selectionIndex][0].label;
            break;
        }
    }
    if (levels.length === 1) {
        boardName += ", Level " + levels[0].label;
    }
    return boardName;
}

export const GameboardFilter = withRouter(({location}: {location: Location}) => {
    const dispatch = useDispatch();
    const {queryLevels, querySelections} = processQueryString(location.search);
    const gameboardOrNotFound = useSelector(selectors.board.currentGameboardOrNotFound);
    const gameboard = useSelector(selectors.board.currentGameboard);
    const gameboardIdAnchor = location.hash ? location.hash.slice(1) : null;
    if (gameboard && gameboard.id !== gameboardIdAnchor) {
        history.push({search: location.search, hash: gameboard.id});
    } else if (gameboardIdAnchor && gameboardOrNotFound === NOT_FOUND) {
        // A request returning "gameboard not found" should clear the gameboard.id from the url hash anchor
        history.push({search: location.search});
    }

    const [selections, setSelections] = useState<Item<TAG_ID>[][]>(querySelections);

    function setSelection(tierIndex: number) {
        return ((values: Item<TAG_ID>[]) => {
            const newSelections = selections.slice(0, tierIndex);
            newSelections.push(values);
            setSelections(newSelections);
        }) as React.Dispatch<React.SetStateAction<Item<TAG_ID>[]>>;
    }

    const choices = [tags.allSubjectTags.map(itemiseTag)];
    let i;
    for (i = 0; i < selections.length && i < 2; i++) {
        const selection = selections[i];
        if (selection.length !== 1) break;
        choices.push(tags.getChildren(selection[0].value).map(itemiseTag));
    }

    const tiers = [
        {id: "subjects", name: "Subject"},
        {id: "fields", name: "Field"},
        {id: "topics", name: "Topic"},
    ].map(tier => ({...tier, for: "for_" + tier.id})).slice(0, i + 1);

    const [levels, setLevels] = useState<Item<number>[]>(queryLevels);

    const boardName = generateBoardName(selections, levels);

    const [boardStack, setBoardStack] = useState<string[]>([]);

    function loadNewGameboard() {
        // Load a gameboard
        const params: { [key: string]: string } = {
            levels: toCSV(levels.length === 0 ? levelOptions : levels)
        };
        tiers.forEach((tier, i) => {
            if (!selections[i] || selections[i].length === 0) {
                if (i === 0) {
                    params[tier.id] = "physics,maths";
                }
                return;
            }
            params[tier.id] = toCSV(selections[i]);
        });
        dispatch(generateTemporaryGameboard({...params, title: boardName}));
        history.push({search: queryString.stringify(params, {encode: false})});
    }

    useEffect(() => {
        if (gameboardIdAnchor && gameboardIdAnchor !== gameboard?.id) {
            dispatch(loadGameboard(gameboardIdAnchor));
        } else {
            setBoardStack([]);
            loadNewGameboard();
        }
    }, [selections, levels]);

    function refresh() {
        if (gameboard) {
            boardStack.push(gameboard.id as string);
            setBoardStack(boardStack);
            loadNewGameboard();
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
        You can build a gameboard by selecting the areas of interest and levels.
        <br />
        You can select more than one entry in each area.
    </span>;

    return <RS.Container id="gameboard-generator" className="mb-5">
        <TitleAndBreadcrumb currentPageTitle="Choose your Questions" help={pageHelp}/>

        <RS.Row>
            <RS.Col lg={{size: 10, offset: 1}}>
                <div className="pt-3"><strong>Select your question filters</strong></div>
                <RS.Row>
                    <RS.Col lg={6}>
                        {tiers.map((tier, i) => (
                            <React.Fragment key={tier.for}>
                                <RS.Label for={tier.for} className="pt-2 pb-0">{tier.name}: </RS.Label>
                                <Select name={tier.for} onChange={unwrapValue(setSelection(i))} isMulti={true} options={choices[i]} value={selections[i]} />
                            </React.Fragment>
                        ))}
                    </RS.Col>
                    <RS.Col lg={6}>
                        <div className="d-flex justify-content-between mt-0 mt-sm-4 mt-lg-0">
                            <RS.Label className="pt-2 pb-0" for="level-selector">Levels: </RS.Label>
                            <img width={270} height={45} className="mb-2 mt-n3 d-none d-sm-block" alt="1 = Pre-AS, 2 and 3 = AS, 4 and 5 = A2, 6 = Post-A2" src="/assets/phy/level-guide.png" />
                        </div>
                        <Select name="level-selector" onChange={unwrapValue(setLevels)} isMulti={true} value={levels} options={levelOptions} />
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
