import React from "react";
import { IsaacContentValueOrChildren } from "../content/IsaacContentValueOrChildren";
import { convertToALVIGameboards, ListView } from "./list-groups/ListView";
import { IsaacBookDetailPageDTO } from "../../../IsaacApiTypes";
import { TeacherNotes } from "./TeacherNotes";
import { Markup } from "./markup";
import { EditContentButton } from "./EditContentButton";

export const BookPage = ({ page }: { page: IsaacBookDetailPageDTO }) => {
    
    return <div className="book-page">
        <>
            <EditContentButton doc={page}/>

            <TeacherNotes notes={page.teacherNotes} />

            <h3 className="mb-3"><Markup encoding="latex">{page.title}</Markup></h3>

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
                        type="item"
                        items={page.extensionGameboards.map(g => ({...g, type: "gameboard"}))}
                    />
                </div>
            </>}
        </>
    </div>;
};
