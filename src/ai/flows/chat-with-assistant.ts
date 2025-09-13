'use server';

/**
 * @fileOverview This file defines a Genkit flow for a conversational AI assistant for Nigerian cuisine.
 *
 * The flow takes user input and conversation history and returns a response from the AI.
 * The file exports:
 *   - chatWithAssistant: An async function that triggers the chat flow.
 *   - ChatWithAssistantInput: The TypeScript type definition for the input to the flow.
 *   - ChatWithAssistantOutput: The TypeScript type definition for the output of the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatWithAssistantInputSchema = z.object({
  history: z
    .array(z.any())
    .describe('The chat history between the user and the assistant.'),
  message: z.string().describe("The user's message."),
});
export type ChatWithAssistantInput = z.infer<
  typeof ChatWithAssistantInputSchema
>;

const ChatWithAssistantOutputSchema = z.object({
  response: z.string().describe("The AI assistant's response."),
});
export type ChatWithAssistantOutput = z.infer<
  typeof ChatWithAssistantOutputSchema
>;

export async function chatWithAssistant(
  input: ChatWithAssistantInput
): Promise<ChatWithAssistantOutput> {
  return chatWithAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatWithAssistantPrompt',
  input: {schema: ChatWithAssistantInputSchema},
  output: {schema: ChatWithAssistantOutputSchema},
  prompt: `You are an AI assistant named 'Crave' specializing in Nigerian cuisine. Your role is to answer user questions, provide cooking tips, explain ingredients, and discuss the culture behind Nigerian food. Keep your responses concise, friendly, and informative.

You are having a conversation with a user.

{{#if history}}
This is the history of the conversation so far:
{{#each history}}
  {{#if user}}
    User: {{{user}}}
  {{/if}}
  {{#if model}}
    Crave: {{{model}}}
  {{/if}}
{{/each}}
{{/if}}

Now, here is the user's latest message:
User: {{{message}}}

Your response should be just the text of what you would say next.

Crave:`,
});


const chatWithAssistantFlow = ai.defineFlow(
  {
    name: 'chatWithAssistantFlow',
    inputSchema: ChatWithAssistantInputSchema,
    outputSchema: ChatWithAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
