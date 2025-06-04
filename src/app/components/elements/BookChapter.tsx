import React from "react";
import {closeActiveModal, openActiveModal, useAppDispatch} from "../../state";
import {PageFragment} from "./PageFragment";
import {SUBJECTS} from "../../services";
import { Container } from "reactstrap";

interface ChapterProps {
    chapterId: string;
    chapterTitle: string;
    chapterSubHeading?: string;
    chapterIcon: string;
    chapterSubject?: SUBJECTS;
}

export const BookChapter = ({chapterId, chapterTitle, chapterSubHeading, chapterIcon, chapterSubject}: ChapterProps) => {
    const dispatch = useAppDispatch();

    function bookChapterLoad() {
        dispatch(openActiveModal({
            closeAction: () => {dispatch(closeActiveModal());},
            title: chapterTitle,
            body: <div className={"book-chapter-options" + " " + chapterSubject}>
                <PageFragment fragmentId={chapterId}/>
            </div>
        }));
    }

    return <div className="px-2 px-md-5">
        <button onClick={() => bookChapterLoad()} className="btn book-chapter">
            <span className="icon-stack">
                <svg className="book-contents-icon" viewBox="0 0 11.7 13.5">
                    <polygon points="11.7,10.1 5.8,13.5 0,10.1 0,3.4 5.8,0 11.7,3.4"/>
                    <text x="5.75" y="9.2" fontSize="7">{chapterIcon}</text>
                </svg>
            </span>
            {chapterTitle} <br/><span className="chapter-subheading">{chapterSubHeading}</span>
        </button>
    </div>;
};
