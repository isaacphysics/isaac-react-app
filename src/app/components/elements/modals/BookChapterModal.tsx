import {buildActiveModal} from "./ActiveModal";
import {PageFragment} from "../PageFragment";
import React from "react";

export const BookChapterModal = buildActiveModal(
    "book-chapter",
    "BookChapterModal",
    ({chapterTitle, chapterId, chapterSubject}) => ({
        title: chapterTitle,
        body: <div className={"book-chapter-options" + " " + chapterSubject}>
            {chapterId && <PageFragment fragmentId={chapterId}/>}
        </div>
    })
);
