import React, {MutableRefObject, useEffect, useMemo, useState} from 'react';
import {bb, Chart, donut} from "billboard.js";
import {
    comparatorFromOrderedValues,
    difficultiesOrdered,
    difficultyLabelMap,
    doughnutColours,
    getFilteredStageOptions,
    isAda,
    isPhy,
    Item,
    selectOnChange,
    siteSpecific,
    specificDoughnutColours,
    STAGE,
    stageLabelMap,
    TAG_ID,
    tags
} from "../../../services";
import {SingleValue} from "react-select";
import {Difficulty} from "../../../../IsaacApiTypes";
import {StyledSelect} from "../inputs/StyledSelect";
import { Row, Col } from 'reactstrap';
import { MyProgressState } from '../../../state';

interface QuestionProgressChartsProps {
    subId: string;
    flushRef: FlushableRef;
    userProgress?: MyProgressState;
}

export type FlushableRef = MutableRefObject<(() => void) | undefined>;

const OPTIONS = {
    size: { width: 240, height: 330 }
};

const colourPicker = (names: string[]): { [key: string]: string } => {
    const selected = {} as { [key: string]: string };
    let currentIndex = 0;

    for (let i = 0; i < names.length; i++) {
        if (names[i] in specificDoughnutColours) {
            selected[names[i]] = specificDoughnutColours[names[i]];
        } else if (currentIndex < doughnutColours.length) {
            selected[names[i]] = doughnutColours[currentIndex];
            currentIndex += 1;
        }
    }
    return selected;
};

export const QuestionProgressCharts = (props: QuestionProgressChartsProps) => {
    const {subId, flushRef, userProgress} = props;
    const questionsByTag = useMemo(() => (subId === "correct" ? userProgress?.correctByTag : userProgress?.attemptsByTag) || {}, 
        [subId, userProgress?.attemptsByTag, userProgress?.correctByTag]);
    const questionsByStageAndDifficulty = useMemo(() => (subId === "correct" ? userProgress?.correctByStageAndDifficulty : userProgress?.attemptsByStageAndDifficulty) || {},
        [subId, userProgress?.attemptsByStageAndDifficulty, userProgress?.correctByStageAndDifficulty]);
        
    const topTagLevel = tags.getTagHierarchy()[0];
    const searchTagLevel = tags.getTagHierarchy()[1];

    const defaultSearchChoiceTag = tags.getSpecifiedTags(searchTagLevel, tags.allTagIds)[0];
    const [searchChoice, setSearchChoice] = useState(defaultSearchChoiceTag.id);
    const [stageChoices, setStageChoices] = useState<Item<STAGE>[]>([{value: STAGE.A_LEVEL, label: stageLabelMap[STAGE.A_LEVEL]}]);

    const isAllZero = (arr: (string | number)[][]) =>
        arr.filter((elem) =>
            typeof(elem[1]) === "number" ? elem[1] : parseInt(elem[1]) > 0
        ).length == 0;
    const categoryColumns = tags.getSpecifiedTags(topTagLevel, tags.allTagIds).map((tag) => [tag.title, questionsByTag[tag.id] || 0]);
    const topicColumns = tags.getRecursiveDescendents(searchChoice).map((tag) => [tag.title, questionsByTag[tag.id] || 0]);
    const difficultyColumns = useMemo(() => (
        stageChoices && questionsByStageAndDifficulty[stageChoices[0].value] ?
            Object.keys(questionsByStageAndDifficulty[stageChoices[0].value])
                .sort(comparatorFromOrderedValues(difficultiesOrdered as string[]))
                .map((key) => [difficultyLabelMap[key as Difficulty], questionsByStageAndDifficulty[stageChoices[0].value][key]]) : []
    ), [stageChoices, questionsByStageAndDifficulty]);

    useEffect(() => {
        const charts: Chart[] = [];
        if (isPhy && !isAllZero(categoryColumns)) {
            charts.push(bb.generate({
                data: {
                    columns: categoryColumns,
                    colors: colourPicker(categoryColumns.map((column) => column[0]) as string[]),
                    type: donut(),
                },
                donut: {
                    title: "By " + topTagLevel,
                    label: {format: (value) => `${value}`}
                },
                bindto: `#${subId}-categoryChart`,
                ...OPTIONS
            }));
        }


        charts.push(bb.generate({
            data: {
                columns: topicColumns,
                colors: colourPicker(topicColumns.map((column) => column[0]) as string[]),
                type: donut()
            },
            donut: {
                title: isAllZero(topicColumns) ? "No data" : "By topic",
                label: {format: (value) => `${value}`}
            },
            bindto: `#${subId}-topicChart`,
            ...OPTIONS
        }));

        if (isPhy) {
            charts.push(bb.generate({
                data: {
                    columns: difficultyColumns,
                    colors: colourPicker(difficultyColumns?.map((column) => column[0]) as string[]),
                    type: donut(),
                    order: null
                },
                donut: {
                    title: isAllZero(difficultyColumns) ? "No data" : "By difficulty",
                    label: {format: (value) => `${value}`}
                },
                bindto: `#${subId}-stageChart`,
                ...OPTIONS
            }));
        }

        flushRef.current = () => {
            charts.forEach(chart => {
                chart.flush();
            });
        };
        return () => {
            flushRef.current = undefined;
        };
    }, [questionsByTag, categoryColumns, topicColumns, difficultyColumns, subId, flushRef, topTagLevel]);

    const numberOfCharts = siteSpecific(3, 2);

    const questionTags = tags.getSpecifiedTags(searchTagLevel, tags.allTagIds).map((tag) => {return {value: tag.id, label: tag.title};});
    const labelledQuestionTags = siteSpecific([TAG_ID.physics, TAG_ID.maths, TAG_ID.chemistry, TAG_ID.biology].map(p => {
        return {
            label: p.charAt(0).toUpperCase() + p.slice(1),
            options: questionTags.filter(t => tags.getChildren(p).map(t2 => t2.id).includes(t.value))
        };
    }), questionTags);

    return <Row>
        {isPhy && <Col xl={12/numberOfCharts} md={12/numberOfCharts} className="mt-4 d-flex flex-column">
            <div className="height-40px text-flex-align mb-2">
                Questions by {topTagLevel}
            </div>
            <div className="d-flex flex-grow-1">
                <div aria-hidden={"true"} id={`${subId}-categoryChart`} className="text-center-width doughnut-binding align-self-center">
                    <strong>{isAllZero(categoryColumns) ? "No data" : ""}</strong>
                </div>
                {isAllZero(categoryColumns) ?
                    <span className={"visually-hidden"}>
                        No data
                    </span> :
                    <table className={"visually-hidden"}>
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>{subId}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categoryColumns.map((val, key) => {
                                return (
                                    <tr key={key}>
                                        <td>{val[0]}</td>
                                        <td>{val[1]}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>}
            </div>
        </Col>}
        {isAda && <Col md={3}/>}
        <Col xl={12/numberOfCharts} md={4} className="mt-4 d-flex flex-column">
            <div className="height-40px text-flex-align mb-2">
                <div className="d-inline-block text-start pe-2 w-50">
                    <StyledSelect
                        inputId={`${subId}-subcategory-select`}
                        name="subcategory"
                        defaultValue={{value: defaultSearchChoiceTag.id, label: defaultSearchChoiceTag.title}}
                        options={labelledQuestionTags}
                        onChange={(e: SingleValue<{ value: TAG_ID; label: string; }>) => setSearchChoice((e as {value: TAG_ID; label: string}).value)}
                    />
                </div>
                <span className={siteSpecific("ms-2", "d-inline-block ms-2")}>questions</span>
            </div>
            <div className="d-flex flex-grow-1">
                <div aria-hidden={"true"} id={`${subId}-topicChart`} className="text-center-width doughnut-binding  align-self-center">
                    <strong>{isAllZero(topicColumns) ? "No data" : ""}</strong>
                </div>
                {isAllZero(topicColumns) ?
                    <span className={"visually-hidden"}>
                        No data
                    </span> :
                    <table className={"visually-hidden"}>
                        <thead>
                            <tr>
                                <th>Topic</th>
                                <th>{subId}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topicColumns.map((val, key) => {
                                return (
                                    <tr key={key}>
                                        <td>{val[0]}</td>
                                        <td>{val[1]}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>}
            </div>
        </Col>
        {isAda && <Col md={3}/>}
        {isPhy && <Col xl={12/numberOfCharts} md={12/numberOfCharts} className="mt-4 d-flex flex-column">
            <div className="height-40px text-flex-align mb-2">
                <div className="d-inline-block text-start pe-2 w-50">
                    <StyledSelect
                        inputId={`${subId}-stage-select`}
                        name="stage"
                        defaultValue={{value: STAGE.A_LEVEL, label: stageLabelMap[STAGE.A_LEVEL]}}
                        options={getFilteredStageOptions()}
                        onChange={selectOnChange(setStageChoices, false)}
                    />  
                </div>
                <span className="ms-2">questions</span>
            </div>
            <div className="d-flex flex-grow-1">
                <div aria-hidden={"true"} id={`${subId}-stageChart`} className="text-center-width doughnut-binding  align-self-center">
                    <strong>{isAllZero(difficultyColumns) ? "No data" : ""}</strong>
                </div>
                {isAllZero(difficultyColumns) ?
                    <span className={"visually-hidden"}>
                        No data
                    </span> :
                    <table className={"visually-hidden"}>
                        <thead>
                            <tr>
                                <th>Stage</th>
                                <th>{subId}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {difficultyColumns.map((val, key) => {
                                return (
                                    <tr key={key}>
                                        <td>{val[0]}</td>
                                        <td>{val[1]}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>}
            </div>
        </Col>}
    </Row>;
};
