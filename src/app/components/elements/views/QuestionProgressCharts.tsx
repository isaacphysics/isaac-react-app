import React, {MutableRefObject, useEffect, useState} from 'react';
import * as RS from "reactstrap";
import {LevelAttempts, Levels} from "../../../../IsaacAppTypes";
import bb, {Chart} from "billboard.js";
import tags from "../../../services/tags";
import Select from "react-select";
import {ValueType} from "react-select/src/types";
import {difficultyLabelMap, doughnutColours, specificDoughnutColours, STAGE, TAG_ID} from "../../../services/constants";
import {SITE, SITE_SUBJECT} from "../../../services/siteConstants";
import {getFilteredStageOptions} from "../../../services/userContext";
import {Difficulty} from "../../../../IsaacApiTypes";

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
}

export const QuestionProgressCharts = (props: QuestionProgressChartsProps) => {
    const {subId, questionsByTag, questionsByLevel, questionsByStageAndDifficulty, flushRef} = props;

    const topTagLevel = tags.getTagHierarchy()[0];
    const searchTagLevel = tags.getTagHierarchy()[1];

    const defaultSearchChoiceTag = tags.getSpecifiedTags(searchTagLevel, tags.allTagIds)[0];
    const [searchChoice, setSearchChoice] = useState(defaultSearchChoiceTag.id);
    const [stageChoice, setStageChoice] = useState<{value: STAGE; label: string}>({value: STAGE.A_LEVEL, label: "A Level"});

    const isAllZero = (arr: (string | number)[][]) => arr.filter((elem) => elem[1] > 0).length == 0;
    const categoryColumns = tags.getSpecifiedTags(topTagLevel, tags.allTagIds).map((tag) => [tag.title, questionsByTag[tag.id] || 0]);
    const topicColumns = tags.getDescendents(searchChoice).map((tag) => [tag.title, questionsByTag[tag.id] || 0]);
    const levelColumns = [...Array(7)].map((_, i) => [`Level ${i}`, questionsByLevel[i as Levels] || 0]);
    const difficultyColumns = stageChoice && questionsByStageAndDifficulty[stageChoice.value] ?
        Object.keys(questionsByStageAndDifficulty[stageChoice.value])
        .sort(function(a, b){
            return Object.keys(difficultyLabelMap).indexOf(a) - Object.keys(difficultyLabelMap).indexOf(b);
        }).map((key) => [difficultyLabelMap[key as Difficulty], questionsByStageAndDifficulty[stageChoice.value][key]]) : [];

    useEffect(() => {
        const charts: Chart[] = [];
        if (SITE_SUBJECT === SITE.PHY && !isAllZero(categoryColumns)) {
            charts.push(bb.generate({
                data: {
                    columns: categoryColumns,
                    colors: colourPicker(categoryColumns.map((column) => column[0]) as string[]),
                    type: "donut",
                },
                donut: {
                    title: "By " + topTagLevel,
                    label: {format: (value, ratio, id) => `${value}`}
                },
                bindto: `#${subId}-categoryChart`,
                ...OPTIONS
            }));
        }

        if (!isAllZero(topicColumns)) {
            charts.push(bb.generate({
                data: {
                    columns: topicColumns,
                    colors: colourPicker(topicColumns.map((column) => column[0]) as string[]),
                    type: "donut"
                },
                donut: {
                    title: "By Topic",
                    label: {format: (value, ratio, id) => `${value}`}
                },
                bindto: `#${subId}-topicChart`,
                ...OPTIONS
            }));
        }

        if (SITE_SUBJECT === SITE.PHY && !isAllZero(difficultyColumns || [])) {
            charts.push(bb.generate({
                data: {
                    columns: difficultyColumns,
                    colors: colourPicker(difficultyColumns?.map((column) => column[0]) as string[]),
                    type: "donut",
                    order: null
                },
                donut: {
                    title: "By Difficulty",
                    label: {format: (value, ratio, id) => `${value}`}
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
        }
    }, [questionsByTag, questionsByLevel, categoryColumns, topicColumns, levelColumns]);

    const noCharts = {[SITE.CS]: 2, [SITE.PHY]: 3}[SITE_SUBJECT];

    return <RS.Row>
        {SITE_SUBJECT === SITE.PHY && <RS.Col xl={12/noCharts} md={4} className="mt-4 d-flex flex-column">
            <div className="height-40px text-flex-align mb-2">
                Questions by {topTagLevel}
            </div>
            <div className="d-flex flex-grow-1">
                <div id={`${subId}-categoryChart`} className="text-center-width doughnut-binding align-self-center">
                    <strong>{isAllZero(categoryColumns) ? "No data" : ""}</strong>
                </div>
            </div>
        </RS.Col>}
        {SITE_SUBJECT === SITE.CS && <RS.Col md={3}/>}
        <RS.Col xl={12/noCharts} md={4} className="mt-4 d-flex flex-column">
            <div className="height-40px text-flex-align mb-2">
                <Select
                    inputId={`${subId}-subcategory-select`}
                    name="subcategory"
                    className="d-inline-block text-left pr-2 w-50"
                    classNamePrefix="select"
                    defaultValue={{value: defaultSearchChoiceTag.id, label: defaultSearchChoiceTag.title}}
                    options={tags.getSpecifiedTags(searchTagLevel, tags.allTagIds).map((tag) => {return {value: tag.id, label: tag.title}})}
                    onChange={(e: ValueType<{value: TAG_ID; label: string}>) => setSearchChoice((e as {value: TAG_ID; label: string}).value)}
                />
                questions
            </div>
            <div className="d-flex flex-grow-1">
                <div id={`${subId}-topicChart`} className="text-center-width doughnut-binding  align-self-center">
                    <strong>{isAllZero(topicColumns) ? "No data" : ""}</strong>
                </div>
            </div>
        </RS.Col>
        {SITE_SUBJECT === SITE.CS && <RS.Col md={3}/>}
        {SITE_SUBJECT === SITE.PHY && <RS.Col xl={12/noCharts} md={4} className="mt-4 d-flex flex-column">
            <div className="height-40px text-flex-align mb-2">
                <Select
                    inputId={`${subId}-stage-select`}
                    name="stage"
                    className="d-inline-block text-left pr-2 w-50"
                    classNamePrefix="select"
                    defaultValue={{value: STAGE.A_LEVEL, label: "A Level"}}
                    options={getFilteredStageOptions()}
                    onChange={(e: ValueType<{value: STAGE; label: string}>) => setStageChoice((e as {value: STAGE; label: string}))}
                />
                questions
            </div>
            <div className="d-flex flex-grow-1">
                <div id={`${subId}-stageChart`} className="text-center-width doughnut-binding  align-self-center">
                    <strong>{isAllZero(difficultyColumns || []) ? "No data" : ""}</strong>
                </div>
            </div>
        </RS.Col>}
        {SITE_SUBJECT === SITE.PHY && <RS.Col xl={4} className="mt-4 d-flex flex-column">
            <div className="d-flex flex-grow-1">
                <div id={`${subId}-levelChart`} className="text-center-width doughnut-binding  align-self-center">
                    <strong>{isAllZero(levelColumns) ? "No data" : ""}</strong>
                </div>
            </div>
        </RS.Col>}
    </RS.Row>;
};
