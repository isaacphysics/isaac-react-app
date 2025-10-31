import { ChoiceTree } from "../../app/components/elements/panels/QuestionFinderFilterPanel";
import { isAda, STAGE, TAG_ID, tags, updateTopicChoices } from "../../app/services";
import { PageContextState } from "../../IsaacAppTypes";

describe('updateTopicChoices', () => {
    if (isAda) {
        return it('is not tested for Ada', () => {});
    }

    describe('on the main question finder', () => {
        const pageContext = {subject: undefined, stage: []};

        it('returns just the subjects when no selections were made', () => {
            const choices = updateTopicChoices([{}, {}, {}], pageContext); 
            expect(choices).toEqual([subject(TAG_ID.physics, TAG_ID.maths, TAG_ID.chemistry, TAG_ID.biology)]);
        });

        it('shows the fields when subject is selected', () => {
            const choices = updateTopicChoices([subject(TAG_ID.physics), {}, {}], pageContext); 
            expect(choices).toEqual([
                subject(TAG_ID.physics, TAG_ID.maths, TAG_ID.chemistry, TAG_ID.biology),
                physics(TAG_ID.skills, TAG_ID.mechanics, TAG_ID.electricity, TAG_ID.wavesParticles, TAG_ID.fields,
                    TAG_ID.thermal)
            ]);
        });

        it('shows the topics when field is selected', () => {
            const choices = updateTopicChoices([subject(TAG_ID.physics), physics(TAG_ID.thermal), {}], pageContext); 
            expect(choices).toEqual([
                subject(TAG_ID.physics, TAG_ID.maths, TAG_ID.chemistry, TAG_ID.biology),
                physics(TAG_ID.skills, TAG_ID.mechanics, TAG_ID.electricity, TAG_ID.wavesParticles, TAG_ID.fields,
                    TAG_ID.thermal),
                thermal(TAG_ID.heatCapacity, TAG_ID.gases, TAG_ID.thermalRadiation)
            ]);
        });

        it('does not modify selections when topics are selected', () => {
            const choices = updateTopicChoices(
                [subject(TAG_ID.physics), physics(TAG_ID.thermal), thermal(TAG_ID.heatCapacity)], pageContext
            ); 
            expect(choices).toEqual([
                subject(TAG_ID.physics, TAG_ID.maths, TAG_ID.chemistry, TAG_ID.biology),
                physics(TAG_ID.skills, TAG_ID.mechanics, TAG_ID.electricity, TAG_ID.wavesParticles, TAG_ID.fields,
                    TAG_ID.thermal),
                thermal(TAG_ID.heatCapacity, TAG_ID.gases, TAG_ID.thermalRadiation)
            ]);
        });

        it('handles multiple topic, field selections', () => {
            const choices = updateTopicChoices([
                subject(TAG_ID.physics, TAG_ID.maths),
                {...physics(TAG_ID.thermal), ...maths(TAG_ID.calculus)},
                {...thermal(TAG_ID.heatCapacity), ...calculus(TAG_ID.differentiation)}
            ], pageContext);
            expect(choices).toEqual([
                subject(TAG_ID.physics, TAG_ID.maths, TAG_ID.chemistry, TAG_ID.biology),
                {
                    ...physics(TAG_ID.skills, TAG_ID.mechanics, TAG_ID.electricity, TAG_ID.wavesParticles,
                        TAG_ID.fields, TAG_ID.thermal),
                    ...maths(TAG_ID.number, TAG_ID.algebra, TAG_ID.geometry, TAG_ID.functions, TAG_ID.calculus,
                        TAG_ID.statistics)
                },
                {
                    ...thermal(TAG_ID.heatCapacity, TAG_ID.gases, TAG_ID.thermalRadiation),
                    ...calculus(TAG_ID.differentiation, TAG_ID.integration, TAG_ID.differentialEq)
                }
            ]);
        });
    });

    describe('on a context-specific question finder', () => {
        // These would also work if we didn't pass empty arrays in the `topicSelections` argument, but this is what the 
        // component currently does. I wanted the tests to reflect the actual usage.

        const pageContext: PageContextState = {subject: TAG_ID.physics, stage: [STAGE.GCSE]};
        
        it('returns just the fields when no selections are made', () => {
            const choices = updateTopicChoices([subject(TAG_ID.physics), physics()], pageContext);
            expect(choices).toEqual([
                subject(TAG_ID.physics),
                physics(TAG_ID.skills, TAG_ID.mechanics, TAG_ID.electricity, TAG_ID.wavesParticles, TAG_ID.fields,
                    TAG_ID.thermal),
                {}
            ]);
        });

        it('shows the topics when field is selected', () => {
            const choices = updateTopicChoices([subject(TAG_ID.physics), physics(TAG_ID.thermal)], pageContext);
            expect(choices).toEqual([
                subject(TAG_ID.physics),
                physics(TAG_ID.skills, TAG_ID.mechanics, TAG_ID.electricity, TAG_ID.wavesParticles, TAG_ID.fields,
                    TAG_ID.thermal),
                thermal(TAG_ID.heatCapacity, TAG_ID.gases, TAG_ID.thermalRadiation)
            ]);
        });

        it('does not modify selections when topics are selected', () => {
            const choices = updateTopicChoices([
                subject(TAG_ID.physics), physics(TAG_ID.thermal), thermal(TAG_ID.heatCapacity)
            ], pageContext);
            expect(choices).toEqual([
                subject(TAG_ID.physics),
                physics(TAG_ID.skills, TAG_ID.mechanics, TAG_ID.electricity, TAG_ID.wavesParticles, TAG_ID.fields,
                    TAG_ID.thermal),
                thermal(TAG_ID.heatCapacity, TAG_ID.gases, TAG_ID.thermalRadiation)
            ]);
        });

        it('handles multiple topic, field selections', () => {
            const choices = updateTopicChoices([
                subject(TAG_ID.physics), physics(TAG_ID.fields, TAG_ID.thermal), thermal(TAG_ID.heatCapacity)
            ], pageContext);

            expect(choices).toEqual([
                subject(TAG_ID.physics),
                physics(TAG_ID.skills, TAG_ID.mechanics, TAG_ID.electricity, TAG_ID.wavesParticles, TAG_ID.fields,
                    TAG_ID.thermal),
                {
                    ...fields(TAG_ID.gravitational, TAG_ID.electric, TAG_ID.magnetic, TAG_ID.combined),
                    ...thermal(TAG_ID.heatCapacity, TAG_ID.gases, TAG_ID.thermalRadiation)
                }
            ]);
        });

        describe('on the A-level maths question finder', () => {
            const pageContext: PageContextState = {subject: TAG_ID.maths, stage: [STAGE.A_LEVEL]};

            it('also shows the mechanics field, which is normally shown on physics', () => {
                const choices = updateTopicChoices([subject(TAG_ID.maths), maths()], pageContext);
                expect(choices).toEqual([
                    subject(TAG_ID.maths),
                    maths(TAG_ID.number, TAG_ID.algebra, TAG_ID.geometry, TAG_ID.functions, TAG_ID.calculus,
                        TAG_ID.statistics, TAG_ID.mechanics),
                    {}
                ]);
            });

            it('shows mechanics topics when mechanics field is selected', () => {
                const choices = updateTopicChoices([subject(TAG_ID.maths), maths(TAG_ID.mechanics), mechanics()], pageContext);
                expect(choices).toEqual([
                    subject(TAG_ID.maths),
                    maths(TAG_ID.number, TAG_ID.algebra, TAG_ID.geometry, TAG_ID.functions, TAG_ID.calculus,
                        TAG_ID.statistics, TAG_ID.mechanics),
                    mechanics(TAG_ID.statics, TAG_ID.kinematics, TAG_ID.dynamics, TAG_ID.circularMotion,
                        TAG_ID.oscillations, TAG_ID.materials)
                ]);
            });
        });
    });

    describe('when a list of allowed tags is given', () => {
        const pageContext = { subject: undefined, stage: [] };

        it('filters the subjects', () => {
            const allowedTags = [TAG_ID.physics, TAG_ID.chemistry, TAG_ID.bonding];
            const choices = updateTopicChoices([{}, {}, {}], pageContext, allowedTags); 
            expect(choices).toEqual([subject(TAG_ID.physics, TAG_ID.chemistry)]);
        });

        it('filters the fields', () => {
            const allowedTags = [TAG_ID.physics, TAG_ID.chemistry, TAG_ID.thermal];
            const choices = updateTopicChoices([subject(TAG_ID.physics), {}, {}], pageContext, allowedTags); 
            expect(choices).toEqual([subject(TAG_ID.physics, TAG_ID.chemistry), physics(TAG_ID.thermal)]);
        });

        it('filters the topics', () => {
            const allowedTags = [TAG_ID.physics, TAG_ID.chemistry, TAG_ID.thermal, TAG_ID.thermalRadiation];
            const choices = updateTopicChoices([
                subject(TAG_ID.physics), physics(TAG_ID.thermal), {}
            ], pageContext, allowedTags); 
            expect(choices).toEqual([
                subject(TAG_ID.physics, TAG_ID.chemistry), physics(TAG_ID.thermal), thermal(TAG_ID.thermalRadiation)
            ]);
        });
    });
});

const choice = (tagId: TAG_ID) => ({label: tags.getById(tagId).title, value: tagId}); 
const makeChoiceTree = (key: string) => (...choices: TAG_ID[]): ChoiceTree => ({[key]: choices.map(choice)});

const subject = makeChoiceTree("subject");

const physics = makeChoiceTree("physics");
const thermal = makeChoiceTree("thermal");
const fields = makeChoiceTree("fields");
const mechanics = makeChoiceTree("mechanics");

const maths = makeChoiceTree("maths");
const calculus = makeChoiceTree("calculus");

