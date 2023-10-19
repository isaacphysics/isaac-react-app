import React, { MutableRefObject, useEffect, useState } from "react";
import * as RS from "reactstrap";
import { LevelAttempts } from "../../../../IsaacAppTypes";
import { bb, Chart } from "billboard.js";
import {
  comparatorFromOrderedValues,
  difficultiesOrdered,
  difficultyLabelMap,
  doughnutColours,
  STAGE,
  TAG_ID,
  tags,
} from "../../../services";
import Select, { SingleValue } from "react-select";
import { Difficulty } from "../../../../IsaacApiTypes";

interface QuestionProgressChartsProps {
  subId: string;
  questionsByTag: { [tag: string]: number };
  questionsByLevel: LevelAttempts<number>;
  questionsByStageAndDifficulty: { [stage: string]: { [difficulty: string]: number } };
  flushRef: FlushableRef;
}

export type FlushableRef = MutableRefObject<(() => void) | undefined>;

const OPTIONS = {
  size: { width: 240, height: 330 },
};

const colourPicker = (names: string[]): { [key: string]: string } => {
  const selected = {} as { [key: string]: string };
  let currentIndex = 0;

  for (let i = 0; i < names.length; i++) {
    if (currentIndex < doughnutColours.length) {
      selected[names[i]] = doughnutColours[currentIndex];
      currentIndex += 1;
    }
  }
  return selected;
};

export const QuestionProgressCharts = (props: QuestionProgressChartsProps) => {
  const { subId, questionsByTag, questionsByLevel, questionsByStageAndDifficulty, flushRef } = props;

  const topTagLevel = tags.getTagHierarchy()[0];
  const searchTagLevel = tags.getTagHierarchy()[1];

  const defaultSearchChoiceTag = tags.getSpecifiedTags(searchTagLevel, tags.allTagIds)[0];
  const [searchChoice, setSearchChoice] = useState(defaultSearchChoiceTag.id);
  const stageChoice = STAGE.A_LEVEL;

  const isAllZero = (arr: (string | number)[][]) => arr.filter((elem) => elem[1] > 0).length == 0;
  const categoryColumns = tags
    .getSpecifiedTags(topTagLevel, tags.allTagIds)
    .map((tag) => [tag.title, questionsByTag[tag.id] || 0]);
  const topicColumns = tags.getDescendents(searchChoice).map((tag) => [tag.title, questionsByTag[tag.id] || 0]);
  const difficultyColumns = questionsByStageAndDifficulty[stageChoice]
    ? Object.keys(questionsByStageAndDifficulty[stageChoice])
        .sort(comparatorFromOrderedValues(difficultiesOrdered as string[]))
        .map((key) => [difficultyLabelMap[key as Difficulty], questionsByStageAndDifficulty[stageChoice][key]])
    : [];

  useEffect(() => {
    const charts: Chart[] = [];

    charts.push(
      bb.generate({
        data: {
          columns: topicColumns,
          colors: colourPicker(topicColumns.map((column) => column[0]) as string[]),
          type: "donut",
        },
        donut: {
          title: isAllZero(topicColumns) ? "No Data" : "By Topic",
          label: { format: (value) => `${value}` },
        },
        bindto: `#${subId}-topicChart`,
        ...OPTIONS,
      }),
    );

    flushRef.current = () => {
      charts.forEach((chart) => {
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

  return (
    <RS.Row>
      <RS.Col md={3} />
      <RS.Col xl={6} md={4} className="mt-4 d-flex flex-column">
        <div className="height-40px text-flex-align mb-2">
          <Select
            inputId={`${subId}-subcategory-select`}
            name="subcategory"
            className="d-inline-block text-left pr-2 w-50"
            classNamePrefix="select"
            defaultValue={{ value: defaultSearchChoiceTag.id, label: defaultSearchChoiceTag.title }}
            options={tags.getSpecifiedTags(searchTagLevel, tags.allTagIds).map((tag) => {
              return { value: tag.id, label: tag.title };
            })}
            onChange={(e: SingleValue<{ value: TAG_ID; label: string }>) =>
              setSearchChoice((e as { value: TAG_ID; label: string }).value)
            }
          />
          questions
        </div>
        <div className="d-flex flex-grow-1">
          <div id={`${subId}-topicChart`} className="text-center-width doughnut-binding  align-self-center">
            <strong>{isAllZero(topicColumns) ? "No data" : ""}</strong>
          </div>
        </div>
      </RS.Col>
      <RS.Col md={3} />
    </RS.Row>
  );
};
