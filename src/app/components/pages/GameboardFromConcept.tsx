import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Link, withRouter} from "react-router-dom";
import {GameboardViewer} from './Gameboard';
import {fetchConcepts, generateTemporaryGameboard} from '../../state/actions';
import {ShowLoading} from "../handlers/ShowLoading";
import {selectors} from "../../state/selectors";
import queryString from "query-string";
import {history} from "../../services/history";
import {Item} from "../../services/select";
import {AppState} from "../../state/reducers";

function itemiseConcepts(concepts: string[] | string) {
    const conceptsList = Array.isArray(concepts) ? concepts : [concepts]
    return conceptsList
        .filter(concept => concept !== "")
        .map(concept => ({label: concept, value: concept}));
}

function toCSV<T>(items: Item<T>[]) {
    return items.map(item => item.value).join(",");
}

interface QueryStringResponse {
    queryConcepts: Item<string>[];
}
function processQueryString(query: string): QueryStringResponse {
    const {concepts} = queryString.parse(query);
    const conceptItems = concepts ? itemiseConcepts(concepts) : []

    return {
        queryConcepts: conceptItems
    }
}

export const GameboardFromConcept = withRouter(({location}: {location: Location}) => {
    const dispatch = useDispatch();
    const {queryConcepts} = processQueryString(location.search);
    const conceptList = useSelector((state: AppState) => state?.concepts?.results || null);
    const gameboardOrNotFound = useSelector(selectors.board.currentGameboardOrNotFound);
    const gameboard = useSelector(selectors.board.currentGameboard);

    const gameboardRef = useRef<HTMLDivElement>(null);

    const [concepts, ] = useState<Item<string>[]>(queryConcepts);

    function loadNewGameboard() {
        // Load a gameboard
        const params: { [key: string]: string } = {};
        if (concepts.length) params.concepts = toCSV(concepts);
        dispatch(generateTemporaryGameboard({...params, title: boardName}));
        history.push({search: queryString.stringify(params, {encode: false})});
    }

    useEffect(() => {
        loadNewGameboard();
    }, [concepts]);

    useEffect(() => {dispatch(fetchConcepts(concepts[0].label));}, [dispatch]);

    const conceptTitle = conceptList?.[0].title;
    const boardName = conceptTitle + " gameboard" || "New gameboard"

    const pageHelp = <span>
        This gameboard was generated using question related to the concept: {conceptTitle}
    </span>

    return <RS.Container id="gameboard-generator" className="mb-5">
        <TitleAndBreadcrumb currentPageTitle="Concept Gameboard" help={pageHelp}/>

        <div ref={gameboardRef} className="row mt-4 mb-3">
            <RS.Col>
                <h3>{boardName}</h3>
            </RS.Col>
            <RS.Col className="text-right">
                {gameboard && <RS.Button tag={Link} color="secondary" to={`/add_gameboard/${gameboard.id}`}>
                    Save to My&nbsp;Gameboards
                </RS.Button>}
            </RS.Col>
        </div>

        <div className="pb-4">
            <ShowLoading
                until={gameboardOrNotFound}
                thenRender={gameboard  => (<GameboardViewer gameboard={gameboard}/>)}
                ifNotFound={<RS.Alert color="warning">No questions found matching the criteria.</RS.Alert>}
            />
        </div>
    </RS.Container>;
});
