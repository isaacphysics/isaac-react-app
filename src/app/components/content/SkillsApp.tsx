import React from 'react';
import { AnvilApp } from './AnvilApp';
import { SkillsAppDTO } from '../../../IsaacApiTypes';

export const SkillsApp = ({ doc }: { doc: SkillsAppDTO }) => 
    doc.children?.length && doc.children?.length > 0 && doc.children[0].type == 'anvilApp' ?
        <AnvilApp doc={doc.children[0]} skillId={doc.id}></AnvilApp> : <></>;
