// AI reframing: raw business problem -> research-shaped brief.
// The output is a DRAFT: the poster confirms it, and a human check gates
// it before going live. Never publish an unreviewed AI brief.
import { Brief } from '../types';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

const SYSTEM = `You convert raw business problems into rigorous, research-shaped briefs
for an African research marketplace. Respond ONLY with minified JSON, no markdown,
no preamble, matching exactly:
{"researchQuestion": string, "background": string,
 "methodologySuggestions": string[], "dataRequirements": string[],
 "literatureEntryPoints": string[],
 "suggestedMilestones": [{"title": string, "description": string, "percent": number}]}
Milestone percents must sum to 100. Methodologies must be feasible in
low-connectivity, data-scarce environments where relevant.`;

export interface ReframeInput {
  title: string;
  sector: string;
  rawDescription: string;
  dataAccess: string;
}

export type ReframeOutput = Omit<Brief, 'id' | 'problemId' | 'confirmedByPoster' | 'humanChecked' | 'createdAt'>;

export async function reframeProblem(input: ReframeInput): Promise<ReframeOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return fallbackBrief(input); // dev mode: deterministic stub

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: `Sector: ${input.sector}\nTitle: ${input.title}\nData available: ${input.dataAccess}\nProblem as stated by the organisation:\n${input.rawDescription}`,
      }],
    }),
  });
  if (!res.ok) throw new Error(`AI service unavailable (${res.status})`);
  const data = (await res.json()) as { content: { type: string; text?: string }[] };
  const text = data.content.map(c => c.text ?? '').join('').replace(/```json|```/g, '').trim();
  return JSON.parse(text) as ReframeOutput;
}

function fallbackBrief(input: ReframeInput): ReframeOutput {
  return {
    researchQuestion: `What factors drive "${input.title}" in the ${input.sector} sector, and which interventions measurably improve outcomes?`,
    background: input.rawDescription,
    methodologySuggestions: [
      'Mixed-methods design: structured survey plus key-informant interviews',
      'Offline-first mobile data collection for low-connectivity settings',
      'Quasi-experimental comparison across affected and unaffected sites',
    ],
    dataRequirements: [
      'Organisation-held operational data (de-identified before transfer)',
      'Primary survey data from affected population',
    ],
    literatureEntryPoints: [
      `Recent systematic reviews on ${input.sector} interventions in low-resource settings`,
    ],
    suggestedMilestones: [
      { title: 'Research design & instrument', description: 'Finalised protocol, sampling frame and instruments approved by the organisation.', percent: 20 },
      { title: 'Data collection', description: 'Fieldwork complete; cleaned dataset with codebook delivered.', percent: 40 },
      { title: 'Analysis & draft findings', description: 'Analysis complete; draft report shared for review.', percent: 25 },
      { title: 'Final report & deposit', description: 'Final deliverables accepted; outputs deposited per agreed publication terms.', percent: 15 },
    ],
  };
}
