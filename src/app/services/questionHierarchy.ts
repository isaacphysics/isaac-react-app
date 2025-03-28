import { PageContextState } from "../../IsaacAppTypes";
import { ChoiceTree } from "../components/elements/panels/QuestionFinderFilterPanel";
import { TAG_ID, TAG_LEVEL } from "./constants";
import { AbstractBaseTagService } from "./tagsAbstract";
import { itemiseTag } from "./filter";

export function processTagHierarchy(tags: AbstractBaseTagService, subjects: string[], fields: string[], topics: string[]): ChoiceTree[] {
    const tagHierarchy = tags.getTagHierarchy();
    const selectionItems: ChoiceTree[] = [];

    [subjects, fields, topics].forEach((tier, index) => {
        if (tier.length > 0) {
            const validTierTags = tags.getSpecifiedTags(
                tagHierarchy[index], tier as TAG_ID[]
            );

            if (index === 0)
                selectionItems.push({[TAG_LEVEL.subject]: validTierTags.map(itemiseTag)} as ChoiceTree);
            else {
                const parents = selectionItems[index-1] ? Object.values(selectionItems[index-1]).flat() : [];
                const validChildren = parents.map(p => tags.getChildren(p.value).filter(c => tier.includes(c.id)).map(itemiseTag));

                const currentLayer: ChoiceTree = {};
                parents.forEach((p, i) => {
                    currentLayer[p.value] = validChildren[i];
                });
                selectionItems.push(currentLayer);
            }
        }
    });

    return selectionItems;
}

export function pruneTreeNode(tree: ChoiceTree[], filter: string, recursive?: boolean, pageContext?: PageContextState): ChoiceTree[] {
    let newTree = [...tree];
    newTree.forEach((tier, i) => {
        if (tier[filter as TAG_ID]) { // removing children of node
            Object.values(tier[filter as TAG_ID] || {}).forEach(v => pruneTreeNode(newTree, v.value, recursive, pageContext));
            delete newTree[i][filter as TAG_ID];
        } else { // removing node itself
            const parents = Object.keys(tier);
            parents.forEach(parent => {
                if (newTree[i][parent as TAG_ID]?.some(c => c.value === filter)) {
                    newTree[i][parent as TAG_ID] = newTree[i][parent as TAG_ID]?.filter(c => c.value !== filter);
                    if (recursive && newTree[i][parent as TAG_ID]?.length === 0 && parent !== pageContext?.subject) {
                        newTree = pruneTreeNode(newTree, parent, true, pageContext);
                    }
                }
            });
        }
    });

    return newTree;
}
