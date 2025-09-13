'use server';
/**
 * @fileOverview An AI agent that searches for Nigerian dishes using an image.
 *
 * - searchDishesByImage - A function that handles the dish search process.
 * - SearchDishesByImageInput - The input type for the searchDishesByImage function.
 * - SearchDishesByImageOutput - The return type for the searchDishesByImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchDishesByImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a dish, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SearchDishesByImageInput = z.infer<typeof SearchDishesByImageInputSchema>;

const SearchDishesByImageOutputSchema = z.object({
  dishName: z.string().describe('The name of the identified dish.'),
  description: z.string().describe('A description of the identified dish.'),
  imageUrl: z.string().describe('A URL of an image of the identified dish.'),
  recipeSource: z.string().describe('The source of the recipe for the identified dish.'),
});
export type SearchDishesByImageOutput = z.infer<typeof SearchDishesByImageOutputSchema>;

export async function searchDishesByImage(input: SearchDishesByImageInput): Promise<SearchDishesByImageOutput> {
  return searchDishesByImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'searchDishesByImagePrompt',
  input: {schema: SearchDishesByImageInputSchema},
  output: {schema: SearchDishesByImageOutputSchema},
  prompt: `You are an expert in Nigerian cuisine.

You will use this information to identify the dish in the photo.

Based on the image, identify the Nigerian dish. Provide the name, a brief description, a URL to an image of the dish, and the source of a recipe for the dish.

Photo: {{media url=photoDataUri}}`,
});

const searchDishesByImageFlow = ai.defineFlow(
  {
    name: 'searchDishesByImageFlow',
    inputSchema: SearchDishesByImageInputSchema,
    outputSchema: SearchDishesByImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
