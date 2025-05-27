import React from "react";
import {IsaacContentValueOrChildren} from "../content/IsaacContentValueOrChildren";
import {ListView} from "./list-groups/ListView";
import {IsaacBookDetailPageDTO} from "../../../IsaacApiTypes";
import {TeacherNotes} from "./TeacherNotes";

export const BookPage = ({ page }: { page: IsaacBookDetailPageDTO }) => {

    return <div className="book-page">
        <>
            <h3 className="mb-3">{page.title}</h3>

            <TeacherNotes notes={page.teacherNotes} />

            {!!page.gameboards?.length && <>
                <h4 className="mb-3" id="resources">Questions</h4>
                <div className="mt-3 mb-5 list-results-container p-2">
                    <ListView
                        items={page.gameboards.map(g => ({...g, type: "gameboard"}))}
                        fullWidth
                    />
                </div>
            </>}

            <h4 className="mb-3" id="review">Review</h4>
            {!!page.relatedContent?.length && <>
                <div className="my-3 list-results-container p-2">
                    <ListView
                        items={page.relatedContent}
                        fullWidth
                    />
                </div>
            </>}
            <IsaacContentValueOrChildren value={page.value} encoding={page.encoding}>
                {page.children}
            </IsaacContentValueOrChildren>

            {!!page.extensionGameboards?.length && <>
                <h5 className="mt-5 mb-3" id="extension">Extension work</h5>
                <span>Expand your boundaries by having a go at these additional extension questions.</span>
                <div className="mt-3 mb-5 list-results-container p-2">
                    <ListView
                        items={page.extensionGameboards.map(g => ({...g, type: "gameboard"}))}
                        fullWidth
                    />
                </div>
            </>}
        </>
    </div>;
};
