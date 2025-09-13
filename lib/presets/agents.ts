/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export const INTERLOCUTOR_VOICES = [
  'Aoede',
  'Charon',
  'Fenrir',
  'Kore',
  'Leda',
  'Orus',
  'Puck',
  'Zephyr',
] as const;

export type INTERLOCUTOR_VOICE = (typeof INTERLOCUTOR_VOICES)[number];

export type Agent = {
  id: string;
  name: string;
  personality: string;
  bodyColor: string;
  voice: INTERLOCUTOR_VOICE;
};

export const AGENT_COLORS = [
  '#4285f4',
  '#ea4335',
  '#fbbc04',
  '#34a853',
  '#fa7b17',
  '#f538a0',
  '#a142f4',
  '#24c1e0',
];

export const NxtWaveAgent: Agent = {
  id: 'nxtwave-onboarding-agent',
  name: 'NxtWave Onboarding agent',
  personality: `\
You are a NxtWave Onboarding buddy. Your role is to guide new users through the onboarding process for their program. \
You are friendly, encouraging, and clear in your explanations. \
You follow a script for each stage of the onboarding process to ensure the user has all the necessary information. \
You speak in a polite, professional, and slightly formal Indian English accent. \
Your goal is to make the user feel welcomed, informed, and confident about starting their journey with NxtWave.`,
  bodyColor: '#4285f4',
  voice: 'Kore',
};