import React, {useEffect, useState} from 'react';
import * as RS from "reactstrap";
import {LevelAttempts, Levels} from "../../../../IsaacAppTypes";
import bb from "billboard.js";
import tags from "../../../services/tags";
import Select from "react-select";
import {ValueType} from "react-select/src/types";
import {TAG_ID} from "../../../services/constants";

interface QuestionProgressChartsProps {
    subId: string;
    questionsByTag: { [tag: string]: number };
    questionsByLevel: LevelAttempts<number>;
}

const SIZE = {size: {width: 320, height: 400}};

export const QuestionProgressCharts = (props: QuestionProgressChartsProps) => {
    const {subId, questionsByTag, questionsByLevel} = props;

    const topTagLevel = tags.getTagHierarchy()[0];
    const searchTagLevel = tags.getTagHierarchy()[1];

    const defaultSearchChoiceTag = tags.getSpecifiedTags(searchTagLevel, tags.allTagIds)[0];
    const [searchChoice, setSearchChoice] = useState(defaultSearchChoiceTag.id);

    const isAllZero = (arr: (string | number)[][]) => arr.filter((elem) => elem[1] > 0).length == 0;
    const categoryColumns = tags.getSpecifiedTags(topTagLevel, tags.allTagIds).map((tag) => [tag.title, questionsByTag[tag.id] || 0]);
    const topicColumns = tags.getDescendents(searchChoice).map((tag) => [tag.title, questionsByTag[tag.id] || 0]);
    const levelColumns = [...Array(7)].map((_, i) => [`Level ${i}`, questionsByLevel[i as Levels] || 0]);

    useEffect(() => {
        !isAllZero(categoryColumns) && bb.generate({
            data: {
                columns: categoryColumns,
                type: "donut",
            },
            donut: {
                title: "By " + topTagLevel,
                label: {
                    format: (value, ratio, id) => `${value}`
                }
            },
            bindto: `#${subId}-categoryChart`,
            ...SIZE
        });

        !isAllZero(topicColumns) && bb.generate({
            data: {
                columns: topicColumns,
                type: "donut"
            },
            donut: {
                title: "By topic",
                label: {
                    format: (value, ratio, id) => `${value}`
                }
            },
            bindto: `#${subId}-topicChart`,
            ...SIZE
        });

        !isAllZero(levelColumns) && bb.generate({
            data: {
                columns: levelColumns,
                type: "donut"
            },
            donut: {
                title: "By Level",
                label: {
                    format: (value, ratio, id) => `${value}`
                }
            },
            bindto: `#${subId}-levelChart`,
            ...SIZE
        });
    }, [questionsByTag, questionsByLevel, categoryColumns, topicColumns, levelColumns]);

    return <RS.Row className={"mt-4"}>
        <RS.Col className="col-md-4 d-flex flex-column">
            <RS.Row>
                <div className={"height-40px text-flex-align"}>
                    Questions by {topTagLevel}
                </div>
            </RS.Row>
            <RS.Row className="flex-grow-1">
                <div id={`${subId}-categoryChart`} className="text-center-width doughnut-binding align-self-center">
                    {isAllZero(categoryColumns) ? "No data" : ""}
                </div>
            </RS.Row>
        </RS.Col>
        <RS.Col className="col-md-4 d-flex flex-column">
            <RS.Row>
                <div className="auto-margin">
                    Questions by
                </div>
                <Select
                    inputId={`${subId}-subcategory-select`}
                    className={"w-50"}
                    name="subcategory"
                    classNamePrefix="select"
                    defaultValue={{value: defaultSearchChoiceTag.id, label: defaultSearchChoiceTag.title}}
                    options={tags.getSpecifiedTags(searchTagLevel, tags.allTagIds).map((tag) => {return {value: tag.id, label: tag.title}})}
                    onChange={(e: ValueType<{value: TAG_ID; label: string}>) => setSearchChoice((e as {value: TAG_ID; label: string}).value)}
                />
            </RS.Row>
            <RS.Row className="flex-grow-1">
                <div id={`${subId}-topicChart`} className="text-center-width doughnut-binding  align-self-center">
                    {isAllZero(topicColumns) ? "No data" : ""}
                </div>
            </RS.Row>
        </RS.Col>
        <RS.Col className="col-md-4 d-flex flex-column">
            <RS.Row>
                <div className={"height-40px text-flex-align"}>
                    Questions by level
                </div>
            </RS.Row>
            <RS.Row className="flex-grow-1">
                <div id={`${subId}-levelChart`} className="text-center-width doughnut-binding  align-self-center">
                    {isAllZero(levelColumns) ? "No data" : ""}
                </div>
            </RS.Row>
        </RS.Col>
    </RS.Row>
};
