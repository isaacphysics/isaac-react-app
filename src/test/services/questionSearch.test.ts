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
                    ...physics(TAG_ID.skills, TAG_ID.mechanics, TAG_ID.electricity, TAG_ID.wavesParticles, TAG_ID.fields,
                        TAG_ID.thermal),
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
        // The interface on context-specific finders is pretty bad.
        // - the topicSelections argument needlessly contains empty array, such as in `returns just the fields when no
        //   selections are made`
        // - the result duplicates the fields, but from the behavior on the A-level maths finder we learn that only the 
        //   second element is actually used.
        //
        // These tests are not meant to endorse this behavior. They're written this way to reflect how the component
        // currently uses the service.

        const pageContext: PageContextState = {subject: TAG_ID.physics, stage: [STAGE.GCSE]};
        
        it('returns just the fields when no selections are made', () => {
            const choices = updateTopicChoices([subject(TAG_ID.physics), physics()], pageContext);
            expect(choices).toEqual([
                physics(TAG_ID.skills, TAG_ID.mechanics, TAG_ID.electricity, TAG_ID.wavesParticles, TAG_ID.fields,
                    TAG_ID.thermal),
                physics(TAG_ID.skills, TAG_ID.mechanics, TAG_ID.electricity, TAG_ID.wavesParticles, TAG_ID.fields,
                    TAG_ID.thermal),
                {}
            ]);
        });

        it('shows the topics when field is selected', () => {
            const choices = updateTopicChoices([subject(TAG_ID.physics), physics(TAG_ID.thermal)], pageContext);
            expect(choices).toEqual([
                physics(TAG_ID.skills, TAG_ID.mechanics, TAG_ID.electricity, TAG_ID.wavesParticles, TAG_ID.fields,
                    TAG_ID.thermal),
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
                physics(TAG_ID.skills, TAG_ID.mechanics, TAG_ID.electricity, TAG_ID.wavesParticles, TAG_ID.fields,
                    TAG_ID.thermal),
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
                physics(TAG_ID.skills, TAG_ID.mechanics, TAG_ID.electricity, TAG_ID.wavesParticles, TAG_ID.fields,
                    TAG_ID.thermal),
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

            it('also shows the mechanics field, which is normally a physics topic', () => {
                const choices = updateTopicChoices([subject(TAG_ID.maths), maths()], pageContext);
                expect(choices).toEqual([
                    maths(TAG_ID.number, TAG_ID.algebra, TAG_ID.geometry, TAG_ID.functions, TAG_ID.calculus,
                        TAG_ID.statistics),
                    maths(TAG_ID.number, TAG_ID.algebra, TAG_ID.geometry, TAG_ID.functions, TAG_ID.calculus,
                        TAG_ID.statistics, TAG_ID.mechanics),
                    {}
                ]);
            });

            it('shows mechanics topics when mechanics field is selected', () => {
                const choices = updateTopicChoices([subject(TAG_ID.maths), maths(TAG_ID.mechanics), mechanics()], pageContext);
                expect(choices).toEqual([
                    maths(TAG_ID.number, TAG_ID.algebra, TAG_ID.geometry, TAG_ID.functions, TAG_ID.calculus,
                        TAG_ID.statistics),
                    maths(TAG_ID.number, TAG_ID.algebra, TAG_ID.geometry, TAG_ID.functions, TAG_ID.calculus,
                        TAG_ID.statistics, TAG_ID.mechanics),
                    mechanics(TAG_ID.statics, TAG_ID.kinematics, TAG_ID.dynamics, TAG_ID.circularMotion,
                        TAG_ID.oscillations, TAG_ID.materials)
                ]);
            });
        });
    });
});

const subject = (...choices: TAG_ID[]): ChoiceTree => ({ subject: choices.map(choice) });

const physics = (...choices: TAG_ID[]): ChoiceTree => ({ physics: choices.map(choice) });
const thermal = (...choices: TAG_ID[]): ChoiceTree => ({ thermal: choices.map(choice) });
const fields = (...choices: TAG_ID[]): ChoiceTree => ({ fields: choices.map(choice) });
const mechanics = (...choices: TAG_ID[]): ChoiceTree => ({ mechanics: choices.map(choice) });

const maths = (...choices: TAG_ID[]): ChoiceTree => ({ maths: choices.map(choice) });
const calculus = (...choices: TAG_ID[]): ChoiceTree => ({ calculus: choices.map(choice) });

const choice = (tagId: TAG_ID) => ({label: tags.getById(tagId).title, value: tagId}); 
