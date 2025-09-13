'use server';

/**
 * @fileOverview Personalizes a recipe based on user dietary restrictions.
 *
 * - personalizeRecipe - A function that personalizes a recipe based on dietary restrictions.
 * - PersonalizeRecipeInput - The input type for the personalizeRecipe function.
 * - PersonalizeRecipeOutput - The return type for the personalizeRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizeRecipeInputSchema = z.object({
  recipe: z.string().describe('The recipe to personalize.'),
  dietaryRestrictions: z.string().describe('The dietary restrictions to apply to the recipe.'),
});
export type PersonalizeRecipeInput = z.infer<typeof PersonalizeRecipeInputSchema>;

const PersonalizeRecipeOutputSchema = z.object({
  personalizedRecipe: z.string().describe('The personalized recipe.'),
});
export type PersonalizeRecipeOutput = z.infer<typeof PersonalizeRecipeOutputSchema>;

export async function personalizeRecipe(input: PersonalizeRecipeInput): Promise<PersonalizeRecipeOutput> {
  return personalizeRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizeRecipePrompt',
  input: {schema: PersonalizeRecipeInputSchema},
  output: {schema: PersonalizeRecipeOutputSchema},
  prompt: `You are an AI recipe personalizer. A user will provide you with a recipe and a set of dietary restrictions. You will adjust the recipe so that it adheres to the dietary restrictions. Explain what you changed and why.

Recipe: {{{recipe}}}
Dietary Restrictions: {{{dietaryRestrictions}}}

Personalized Recipe:`,
});

const personalizeRecipeFlow = ai.defineFlow(
  {
    name: 'personalizeRecipeFlow',
    inputSchema: PersonalizeRecipeInputSchema,
    outputSchema: PersonalizeRecipeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
