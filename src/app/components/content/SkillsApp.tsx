import React from 'react';
import { AnvilApp } from './AnvilApp';
import { SkillsAppDTO } from '../../../IsaacApiTypes';

export const SkillsApp = ({ doc }: { doc: SkillsAppDTO }) => 
    doc.anvilApp && doc.anvilApp.type === 'anvilApp' ?
        <AnvilApp doc={doc.anvilApp} skillId={doc.id}></AnvilApp> : <></>;
