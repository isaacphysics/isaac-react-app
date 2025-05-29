import React from "react";
import { IsaacContentValueOrChildren } from "../content/IsaacContentValueOrChildren";
import { convertToALVIGameboards, ListView } from "./list-groups/ListView";
import { IsaacBookDetailPageDTO } from "../../../IsaacApiTypes";
import { TeacherNotes } from "./TeacherNotes";
import { EditContentButton } from "./EditContentButton";

export const BookPage = ({ page }: { page: IsaacBookDetailPageDTO }) => {

    return <div className="book-page">
        <>
            <h3 className="mb-3">
                {page.subtitle && <span className="me-2 text-theme">{page.subtitle} </span>}
                {page.title}
            </h3>

            <EditContentButton doc={page}/>

            <TeacherNotes notes={page.teacherNotes} />

            {!!page.gameboards?.length && <>
                <h4 className="mb-3" id="resources">Questions</h4>
                <div className="mt-3 mb-5 list-results-container p-2">
                    <ListView 
                        type="gameboard"
                        items={convertToALVIGameboards(page.gameboards)}
                    />
                </div>
            </>}

            <h4 className="mb-3" id="review">Review</h4>
            {!!page.relatedContent?.length && <>
                <div className="my-3 list-results-container p-2">
                    <ListView
                        type="item"
                        items={page.relatedContent}
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
                        type="gameboard"
                        items={convertToALVIGameboards(page.extensionGameboards)}
                    />
                </div>
            </>}
        </>
    </div>;
};
