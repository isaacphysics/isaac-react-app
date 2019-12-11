import React, {useEffect, useRef, useState} from 'react';
import * as RS from "reactstrap";
import {LevelAttempts} from "../../../IsaacAppTypes";
import bb from "billboard.js";
import {allTagIds, getCategoryTags, getDescendents, getSubcategoryTags, getTopicTags, Tag} from "../../services/tags";
import Select from "react-select";
import {ValueType} from "react-select/src/types";
import {TAG_ID} from "../../services/constants";

interface QuestionProgressGraphsProps {
    subId: string;
    questionsByTag: { [tag: string]: number };
    questionsByLevel: LevelAttempts<number>;
}

export const QuestionProgressGraphs = (props: QuestionProgressGraphsProps) => {
    const {subId, questionsByTag, questionsByLevel} = props;
    const [subcategoryChoice, setSubcategoryChoice] = useState(getSubcategoryTags(allTagIds)[0].id);

    const isAllZero = (arr: (string | number)[][]) => arr.filter((elem) => elem[1] > 0).length == 0;
    const categoryColumns = getCategoryTags(allTagIds).map((tag) => [tag.title, questionsByTag[tag.id] || 0]);
    const topicColumns = getDescendents(subcategoryChoice).map((tag) => [tag.title, questionsByTag[tag.id] || 0]);
    const levelColumns = [["Level 0", questionsByLevel["0"] || 0],
        ["Level 1", questionsByLevel["1"] || 0],
        ["Level 2", questionsByLevel["2"] || 0],
        ["Level 3", questionsByLevel["3"] || 0],
        ["Level 4", questionsByLevel["4"] || 0],
        ["Level 5", questionsByLevel["5"] || 0],
        ["Level 6", questionsByLevel["6"] || 0],
    ]; // TODO automatically to this

    useEffect(() => {
        !isAllZero(categoryColumns) && bb.generate({
            data: {
                columns: categoryColumns,
                type: "donut",
            },
            donut: {
                title: "By Category",
                label: {
                    format: (value, ratio, id) => `${value}`
                }
            },
            bindto: `#${subId}-categoryChart`,
            size: {
                width: 320,
                height: 320
            }
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
            size: {
                width: 320,
                height: 320
            }
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
            size: {
                width: 320,
                height: 320
            }
        });
    }, [questionsByTag, questionsByLevel, categoryColumns, topicColumns, levelColumns]);

    return <RS.Row className={"mt-4"}>
        <RS.Col className={"col-md-4"}>
            <RS.Row>
                <div className={"text-center-width"}>
                    Questions by category
                </div>
            </RS.Row>
            <RS.Row>
                <div id={`${subId}-categoryChart`} className="text-center-width doughnut-binding">
                    {isAllZero(categoryColumns) ? "No data" : ""}
                </div>
            </RS.Row>
        </RS.Col>
        <RS.Col className={"col-md-4"}>
            <RS.Row>
                <div className="auto-margin">
                    Questions by
                </div>
                <Select
                    inputId={`${subId}-subcategory-select`}
                    className={"small-select w-50"}
                    name="colors"
                    classNamePrefix="select"
                    placeholder="Any"
                    options={getSubcategoryTags(allTagIds).map((tag) => {return {value: tag.id, label: tag.title}})}
                    onChange={(e: ValueType<{value: TAG_ID; label: string}>) => setSubcategoryChoice((e as {value: TAG_ID; label: string}).value)}
                />
            </RS.Row>
            <RS.Row>
                <div id={`${subId}-topicChart`} className="text-center-width doughnut-binding">
                    {isAllZero(topicColumns) ? "No data" : ""}
                </div>
            </RS.Row>
        </RS.Col>
        <RS.Col className={"col-md-4"}>
            <RS.Row>
                <div className={"text-center-width"}>
                    Questions by level
                </div>
            </RS.Row>
            {<RS.Row>
                <div id={`${subId}-levelChart`} className="text-center-width doughnut-binding">
                    {isAllZero(levelColumns) ? "No data" : ""}
                </div>
            </RS.Row>}
        </RS.Col>
    </RS.Row>
};
