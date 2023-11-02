import React, {MutableRefObject, useEffect, useState} from 'react';
import * as RS from "reactstrap";
import {LevelAttempts} from "../../../../IsaacAppTypes";
import {bb, Chart} from "billboard.js";
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

interface QuestionProgressChartsProps {
    subId: string;
    questionsByTag: { [tag: string]: number };
    questionsByLevel: LevelAttempts<number>;
    questionsByStageAndDifficulty: { [stage: string]: {[difficulty: string]: number} };
    flushRef: FlushableRef;
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
    const {subId, questionsByTag, questionsByLevel, questionsByStageAndDifficulty, flushRef} = props;

    const topTagLevel = tags.getTagHierarchy()[0];
    const searchTagLevel = tags.getTagHierarchy()[1];

    const defaultSearchChoiceTag = tags.getSpecifiedTags(searchTagLevel, tags.allTagIds)[0];
    const [searchChoice, setSearchChoice] = useState(defaultSearchChoiceTag.id);
    const [stageChoices, setStageChoices] = useState<Item<STAGE>[]>([{value: STAGE.A_LEVEL, label: stageLabelMap[STAGE.A_LEVEL]}]);

    const isAllZero = (arr: (string | number)[][]) => arr.filter((elem) => elem[1] > 0).length == 0;
    const categoryColumns = tags.getSpecifiedTags(topTagLevel, tags.allTagIds).map((tag) => [tag.title, questionsByTag[tag.id] || 0]);
    const topicColumns = tags.getDescendents(searchChoice).map((tag) => [tag.title, questionsByTag[tag.id] || 0]);
    const difficultyColumns = stageChoices && questionsByStageAndDifficulty[stageChoices[0].value] ?
        Object.keys(questionsByStageAndDifficulty[stageChoices[0].value])
        .sort(comparatorFromOrderedValues(difficultiesOrdered as string[]))
        .map((key) => [difficultyLabelMap[key as Difficulty], questionsByStageAndDifficulty[stageChoices[0].value][key]]) : [];

    console.log(categoryColumns, topicColumns, difficultyColumns);

    useEffect(() => {
        const charts: Chart[] = [];
        if (isPhy && !isAllZero(categoryColumns)) {
            charts.push(bb.generate({
                data: {
                    columns: categoryColumns,
                    colors: colourPicker(categoryColumns.map((column) => column[0]) as string[]),
                    type: "donut",
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
                type: "donut"
            },
            donut: {
                title: isAllZero(topicColumns) ? "No Data" : "By Topic",
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
                    type: "donut",
                    order: null
                },
                donut: {
                    title: isAllZero(difficultyColumns) ? "No data" : "By Difficulty",
                    label: {format: (value) => `${value}`}
                },
                bindto: `#${subId}-stageChart`,
                ...OPTIONS
            }));
        }

        flushRef.current = () => {
            charts.forEach(chart => {
                // N.B. This no-op actually clears the text size cache, which makes this flush actually work.
                // (The relevant line in BB is this.internal.clearLegendItemTextBoxCache() )
                chart.data.names();
                // N.B. Of course, under the text size cache, is a more general cache, which also needs
                // clearing, and is not exposed.
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (chart as any).internal.resetCache();
                chart.flush();
            });
        };
        return () => {
            flushRef.current = undefined;
        };
    }, [questionsByTag, questionsByLevel, categoryColumns, topicColumns, difficultyColumns]);

    const numberOfCharts = siteSpecific(3, 2);

    return <RS.Row>
        {isPhy && <RS.Col xl={12/numberOfCharts} md={12/numberOfCharts} className="mt-4 d-flex flex-column">
            <div className="height-40px text-flex-align mb-2">
                Questions by {topTagLevel}
            </div>
            <div className="d-flex flex-grow-1">
                <div aria-hidden={"true"} id={`${subId}-categoryChart`} className="text-center-width doughnut-binding align-self-center">
                    <strong>{isAllZero(categoryColumns) ? "No data" : ""}</strong>
                </div>
                {isAllZero(categoryColumns) ?
                    <span className={"sr-only"}>
                        No data
                    </span> :
                    <table className={"sr-only"}>
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
        </RS.Col>}
        {isAda && <RS.Col md={3}/>}
        <RS.Col xl={12/numberOfCharts} md={4} className="mt-4 d-flex flex-column">
            <div className="height-40px text-flex-align mb-2">
                <StyledSelect
                    inputId={`${subId}-subcategory-select`}
                    name="subcategory"
                    className="d-inline-block text-left pr-2 w-50"
                    classNamePrefix="select"
                    defaultValue={{value: defaultSearchChoiceTag.id, label: defaultSearchChoiceTag.title}}
                    options={tags.getSpecifiedTags(searchTagLevel, tags.allTagIds).map((tag) => {return {value: tag.id, label: tag.title};})}
                    onChange={(e: SingleValue<{ value: TAG_ID; label: string; }>) => setSearchChoice((e as {value: TAG_ID; label: string}).value)}
                />
                <span className={siteSpecific("", "d-inline-block ml-2")}>questions</span>
            </div>
            <div className="d-flex flex-grow-1">
                <div aria-hidden={"true"} id={`${subId}-topicChart`} className="text-center-width doughnut-binding  align-self-center">
                    <strong>{isAllZero(topicColumns) ? "No data" : ""}</strong>
                </div>
                {isAllZero(topicColumns) ?
                    <span className={"sr-only"}>
                        No data
                    </span> :
                    <table className={"sr-only"}>
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
        </RS.Col>
        {isAda && <RS.Col md={3}/>}
        {isPhy && <RS.Col xl={12/numberOfCharts} md={12/numberOfCharts} className="mt-4 d-flex flex-column">
            <div className="height-40px text-flex-align mb-2">
                <StyledSelect
                    inputId={`${subId}-stage-select`}
                    name="stage"
                    className="d-inline-block text-left pr-2 w-50"
                    classNamePrefix="select"
                    defaultValue={{value: STAGE.A_LEVEL, label: stageLabelMap[STAGE.A_LEVEL]}}
                    options={getFilteredStageOptions()}
                    onChange={selectOnChange(setStageChoices, false)}
                />
                questions
            </div>
            <div className="d-flex flex-grow-1">
                <div aria-hidden={"true"} id={`${subId}-stageChart`} className="text-center-width doughnut-binding  align-self-center">
                    <strong>{isAllZero(difficultyColumns) ? "No data" : ""}</strong>
                </div>
                {isAllZero(difficultyColumns) ?
                    <span className={"sr-only"}>
                        No data
                    </span> :
                    <table className={"sr-only"}>
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
        </RS.Col>}
    </RS.Row>;
};
