import React from "react";
import { IsaacContentValueOrChildren } from "../content/IsaacContentValueOrChildren";
import { convertToALVIGameboards, ListView } from "./list-groups/ListView";
import { IsaacBookDetailPageDTO } from "../../../IsaacApiTypes";
import { TeacherNotes } from "./TeacherNotes";
import { EditContentButton } from "./EditContentButton";
import { MetadataContainer, MetadataContainerLink } from "./panels/MetadataContainer";
import { Markup } from "./markup";

export const BookPage = ({ page }: { page: IsaacBookDetailPageDTO }) => {

    return <div className="book-page">
        <h3 className="mb-3">
            {page.subtitle && <span className="me-3 text-theme">{page.subtitle} </span>}
            <Markup encoding="latex">{page.title}</Markup>
        </h3>

        <EditContentButton doc={page}/>

        <TeacherNotes notes={page.teacherNotes} />

        <MetadataContainer>
            {!!page.gameboards?.length && <MetadataContainerLink id="questions" title="Questions" />}
            <MetadataContainerLink id="resources" title="Resources" />
            {!!page.extensionGameboards?.length && <MetadataContainerLink id="extension" title="Extension work" />}
        </MetadataContainer>

        {!!page.gameboards?.length && <>
            <h4 className="mb-3" id="questions">Questions</h4>
            <div className="mt-3 mb-7 list-results-container p-2">
                <ListView
                    type="gameboard"
                    items={convertToALVIGameboards(page.gameboards)}
                />
            </div>
        </>}

        <h4 className="mb-3" id="resources">Resources</h4>
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
            <h4 className="mt-4 mb-3" id="extension">Extension work</h4>
            <span>Expand your boundaries by having a go at these additional extension questions.</span>
            <div className="mt-3 mb-7 list-results-container p-2">
                <ListView
                    type="gameboard"
                    items={convertToALVIGameboards(page.extensionGameboards)}
                />
            </div>
        </>}
    </div>;
};
