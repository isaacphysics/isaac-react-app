import {TAG_ID, TAG_LEVEL} from "./";
import {BaseTag, Tag} from "../../IsaacAppTypes";
import {ContentDTO, ContentSummaryDTO} from "../../IsaacApiTypes";

export abstract class AbstractBaseTagService {
    abstract getTagHierarchy(): TAG_LEVEL[];
    abstract getBaseTags(): BaseTag[];
    abstract augmentDocWithSubject<T extends ContentDTO | ContentSummaryDTO>(doc: T): T & {subjectId?: string};

    // Augment base allTags
    public allTags: Tag[] = this.getBaseTags().map((baseTag) => {
        let depth = 0;
        const parentId = baseTag.parent;
        if (parentId) {
            let parent = this.getBaseTagById(parentId);
            depth++;
            while (parent.parent) {
                depth++;
                parent = this.getBaseTagById(parent.parent);
            }
        }
        return Object.assign(baseTag, {type: this.getTagHierarchy()[depth], level: depth});
    });
    public allTagIds = this.allTags.map((tag) => tag.id);

    public getBaseTagById(id: TAG_ID) {
        return this.getBaseTags().filter((tag) => tag.id === id)[0];
    }
    public getById(id: TAG_ID) {
        return this.allTags.filter((tag) => tag.id === id)[0];
    }
    private getByIds(ids: TAG_ID[]) {
        return this.allTags.filter((tag) => ids.includes(tag.id));
    }
    public getSpecifiedTag(tagType: TAG_LEVEL, tagArray: TAG_ID[]) {
        // Return the first (as ordered in TAG_ID) TAG_ID an object has of a given type!
        if (tagArray != null) {
            for (const i in tagArray) {
                const tag = this.getById(tagArray[i]);
                if (tag != null && tag.type === tagType) {
                    return tag;
                }
            }
        }
        return null;
    }

    public getCategoryTag = this.getSpecifiedTag.bind(this, TAG_LEVEL.category);
    public getCategoryTags = this.getSpecifiedTags.bind(this, TAG_LEVEL.category);
    public allCategoryTags = this.getCategoryTags(this.allTagIds);

    public getSubjectTag = this.getSpecifiedTag.bind(this, TAG_LEVEL.subject);
    public getSubjectTags = this.getSpecifiedTags.bind(this, TAG_LEVEL.subject);
    public allSubjectTags = this.getSubjectTags(this.allTagIds);

    public getSubcategoryTag = this.getSpecifiedTag.bind(this, TAG_LEVEL.subcategory);
    public getSubcategoryTags = this.getSpecifiedTags.bind(this, TAG_LEVEL.subcategory);
    public allSubcategoryTags = this.getSubcategoryTags(this.allTagIds);

    public getFieldTag = this.getSpecifiedTag.bind(this, TAG_LEVEL.field);
    public getFieldTags = this.getSpecifiedTags.bind(this, TAG_LEVEL.field);
    public allFieldTags = this.getFieldTags(this.allTagIds);

    public getTopicTag = this.getSpecifiedTag.bind(this, TAG_LEVEL.topic);
    public getTopicTags = this.getSpecifiedTags.bind(this, TAG_LEVEL.topic);
    public allTopicTags = this.getTopicTags(this.allTagIds);

    public getChildren(tagId: TAG_ID) {
        const children: Tag[] = [];
        for (const i in this.allTags) {
            if (this.allTags[i].parent == tagId) {
                children.push(this.allTags[i]);
            }
        }
        return children;
    }

    public getRecursiveDescendents(tagId: TAG_ID) {
        let descendents: Tag[] = [];
        for (const i in this.allTags) {
            if (this.allTags[i].parent == tagId) {
                descendents.push(this.allTags[i]);
                descendents = descendents.concat(this.getRecursiveDescendents(this.allTags[i].id));
            }
        }
        return descendents;
    }

    public getSpecifiedTags(tagType: TAG_LEVEL, tagArray: TAG_ID[], getHidden = false) {
        // Return all TAG_ID an object has of a given type!
        if (tagArray == null) return [];
        const tags = [];
        for (const i in tagArray) {
            const tag = this.getById(tagArray[i]);
            if (tag != null && tag.type === tagType && (getHidden || !tag.hidden)) {
                tags.push(tag);
            }
        }
        return tags;
    }

    private getDeepestTagById(tagArray: TAG_ID[]) {
        if (tagArray == null) return null;
        return this.getDeepestTag(this.getByIds(tagArray));
    }

    private getDeepestTag(tagArray: Tag[]): Tag | null {
        let deepestTag = null;
        for (const tag of tagArray) {
            if (tag != null && (deepestTag == null || tag.level > deepestTag.level)) {
                deepestTag = tag;
            }
        }
        return deepestTag;
    }

    public getByIdsAsHierarchy(tagArray: TAG_ID[]) {
        const tags = this.getByIds(tagArray);
        const deepestTag = this.getDeepestTag(tags);
        if (!deepestTag) return [];
        const result = [deepestTag];
        let tagId = deepestTag.parent;
        while (tagId !== null) {
            const tag = tags.find(t => t.id === tagId);
            if (!tag) break;
            result.unshift(tag);
            tagId = tag.parent;
        }
        return result;
    }
}
