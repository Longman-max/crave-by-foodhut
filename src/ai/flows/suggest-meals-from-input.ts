'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting Nigerian meals based on user input.
 *
 * The flow takes user input (e.g., ingredients, cravings) and returns a list of suggested Nigerian meals.
 * The file exports:
 *   - suggestMealsFromInput: An async function that triggers the meal suggestion flow.
 *   - SuggestMealsInput: The TypeScript type definition for the input to the flow.
 *   - SuggestMealsOutput: The TypeScript type definition for the output of the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMealsInputSchema = z.object({
  userInput: z
    .string()
    .describe(
      'User input describing desired meal, ingredients available, or cravings.'
    ),
});
export type SuggestMealsInput = z.infer<typeof SuggestMealsInputSchema>;

const SuggestMealsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of suggested Nigerian meals based on the user input.'),
});
export type SuggestMealsOutput = z.infer<typeof SuggestMealsOutputSchema>;

export async function suggestMealsFromInput(input: SuggestMealsInput): Promise<SuggestMealsOutput> {
  return suggestMealsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMealsPrompt',
  input: {schema: SuggestMealsInputSchema},
  output: {schema: SuggestMealsOutputSchema},
  prompt: `You are a Nigerian cuisine expert. A user will provide some input describing what kind of meal they want, what ingredients they have, or what they are craving.  Suggest Nigerian meals that satisfy the user's request.  Return a JSON array of suggestions.

User Input: {{{userInput}}}`,
});

const suggestMealsFlow = ai.defineFlow(
  {
    name: 'suggestMealsFlow',
    inputSchema: SuggestMealsInputSchema,
    outputSchema: SuggestMealsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
