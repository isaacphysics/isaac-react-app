import React, { useEffect, useState } from "react";
import bb, { donut } from "billboard.js";
import { doughnutColours, TAG_ID, tags } from "../../../services";
import Select, { SingleValue } from "react-select";

interface QuestionProgressChartsProps {
  subId: string;
  questionsByTag: { [tag: string]: number };
}

const OPTIONS = {
  size: { width: 240, height: 330 },
};
const colourPicker = (names: string[]): { [key: string]: string } => {
  const selected = {} as { [key: string]: string };
  let currentIndex = 0;

  for (const element of names) {
    if (currentIndex < doughnutColours.length) {
      selected[element] = doughnutColours[currentIndex];
      currentIndex += 1;
    }
  }
  return selected;
};

export const QuestionProgressCharts = (props: QuestionProgressChartsProps) => {
  const { subId, questionsByTag } = props;
  const topTagLevel = tags.getTagHierarchy()[0];
  const searchTagLevel = tags.getTagHierarchy()[1];

  const defaultSearchChoiceTag = tags.getSpecifiedTags(searchTagLevel, tags.allTagIds)[0];
  const [searchChoice, setSearchChoice] = useState(defaultSearchChoiceTag.id);

  const isAllZero = (arr: (string | number)[][]) => arr.filter((elem) => Number(elem[1]) > 0).length == 0;
  const categoryColumns = tags
    .getSpecifiedTags(topTagLevel, tags.allTagIds)
    .map((tag) => [tag.title, questionsByTag[tag.id] || 0]);
  const topicColumns = tags.getDescendents(searchChoice).map((tag) => [tag.title, questionsByTag[tag.id] || 0]);

  useEffect(() => {
    bb.generate({
      data: {
        columns: topicColumns,
        colors: colourPicker(topicColumns.map((column) => column[0]) as string[]),
        type: donut(),
      },
      donut: {
        title: isAllZero(topicColumns) ? "No Data" : "By Topic",
        label: { format: (value) => `${value}` },
      },
      bindto: `#${subId}-topicChart`,
      ...OPTIONS,
    });
  }, [subId, categoryColumns, topicColumns]);

  return (
    <div className="mt-4">
      <div className="height-40px text-flex-align mb-2">
        <Select
          inputId={`${subId}-subcategory-select`}
          name="subcategory"
          className="d-inline-block text-left pr-2 w-auto"
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
      <div className="d-flex flex-grow-1 justify-content-center">
        <div id={`${subId}-topicChart`} className="text-center-width w-auto">
          <strong>{isAllZero(topicColumns) ? "No data" : ""}</strong>
        </div>
      </div>
    </div>
  );
};
