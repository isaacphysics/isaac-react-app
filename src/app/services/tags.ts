import {TAG_ID, TAG_LEVEL} from "./constants";
import {SITE, SITE_SUBJECT} from "./siteConstants";
import {BaseTag} from "../../IsaacAppTypes";
import * as csTags from "./tagsCS";
import * as phyTags from "./tagsPhy";
import subject from "./subject";

const baseTags = {[SITE.CS]: csTags.baseTags, [SITE.PHY]: phyTags.baseTags}[SITE_SUBJECT];
const tagHierarchy = {[SITE.CS]: csTags.tagHierarchy, [SITE.PHY]: phyTags.tagHierarchy}[SITE_SUBJECT];

export interface Tag extends BaseTag {
    type: TAG_LEVEL;
    level: number;
}

const getBaseTagById = (id: TAG_ID) => {
    return baseTags.filter((tag) => tag.id === id)[0];
};
// Augment base allTags
export const allTags: Tag[] = baseTags.map((baseTag) => {
    let depth = 0;
    let parentId = baseTag.parent;
    if (parentId) {
        let parent = getBaseTagById(parentId);
        depth++;
        while (parent.parent) {
            depth++;
            parent = getBaseTagById(parent.parent);
        }
    }
    return Object.assign(baseTag, {type: tagHierarchy[depth], level: depth})
});
export const allTagIds = allTags.map((tag) => tag.id);

const getById = (id: TAG_ID) => {
    return allTags.filter((tag) => tag.id === id)[0];
};

export const getSpecifiedTag = function(tagType: TAG_LEVEL, tagArray: TAG_ID[]) {
    // Return the first (as ordered in TAG_ID) TAG_ID an object has of a given type!
    if (tagArray != null) {
        for (let i in tagArray) {
            let tag = getById(tagArray[i]);
            if (tag != null && tag.type === tagType) {
                return tag;
            }
        }
    }
    return null;
};

const getSpecifiedTags = function(tagType: TAG_LEVEL, tagArray: TAG_ID[]) {
    // Return all TAG_ID an object has of a given type!
    if (tagArray == null) return [];
    let tags = [];
    for (let i in tagArray) {
        let tag = getById(tagArray[i]);
        if (tag != null && tag.type === tagType) {
            tags.push(tag);
        }
    }
    return tags;
};

const getPageSubjectTag = function(tagArray: TAG_ID[]) {
    // Extract the subject tag from a tag array,
    // defaulting to the current site subject if no tags
    // and intelligently choosing if more than one subject tag.
    const globalSubjectTagId = subject.id;

    if (tagArray == null || tagArray.length == 0) {
        return getById(globalSubjectTagId as TAG_ID);
    }

    const subjectTags = getSpecifiedTags(TAG_LEVEL.subject, tagArray);
    for (const i in subjectTags) {
        if (subjectTags[i].id == globalSubjectTagId) {
            return subjectTags[i];
        }
    }
    return subjectTags[0];
};

export const getCategoryTag = getSpecifiedTag.bind(null, TAG_LEVEL.category);
export const getCategoryTags = getSpecifiedTags.bind(null, TAG_LEVEL.category);
export const allCategoryTags = getCategoryTags(allTagIds);

export const getSubcategoryTag = getSpecifiedTag.bind(null, TAG_LEVEL.subcategory);
export const getSubcategoryTags = getSpecifiedTags.bind(null, TAG_LEVEL.subcategory);

export const getTopicTag = getSpecifiedTag.bind(null, TAG_LEVEL.topic);
export const getTopicTags = getSpecifiedTags.bind(null, TAG_LEVEL.topic);

const getDeepestTag = function(tagArray: TAG_ID[]) {
    if (tagArray == null) return null;

    let deepestTag = null;
    for (let i in tagArray) {
        let tag = getById(tagArray[i]);
        if (tag != null && (deepestTag == null || tag.level > deepestTag.level)) {
            deepestTag = tag;
        }
    }
    return deepestTag;
};

export const getDescendents = function(tagId: TAG_ID) {
    let descendents: Tag[] = [];
    for (let i in allTags) {
        if (allTags[i].parent == tagId) {
            descendents.push(allTags[i]);
            descendents = descendents.concat(getDescendents(allTags[i].id));
        }
    }
    return descendents;
};
