/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { create } from 'zustand';
import { Agent, NxtWaveAgent } from './presets/agents';

/**
 * User
 */
export type User = {
  name?: string;
  info?: string;
};

export const useUser = create<
  {
    setName: (name: string) => void;
    setInfo: (info: string) => void;
  } & User
>(set => ({
  name: '',
  info: '',
  setName: name => set({ name }),
  setInfo: info => set({ info }),
}));

/**
 * Agents
 */
function getAgentById(id: string) {
  const { availablePersonal, availablePresets } = useAgent.getState();
  return (
    availablePersonal.find(agent => agent.id === id) ||
    availablePresets.find(agent => agent.id === id)
  );
}

export const useAgent = create<{
  current: Agent;
  availablePresets: Agent[];
  availablePersonal: Agent[];
  setCurrent: (agent: Agent | string) => void;
  addAgent: (agent: Agent) => void;
  update: (agentId: string, adjustments: Partial<Agent>) => void;
}>(set => ({
  current: NxtWaveAgent,
  availablePresets: [NxtWaveAgent],
  availablePersonal: [],

  addAgent: (agent: Agent) => {
    set(state => ({
      availablePersonal: [...state.availablePersonal, agent],
      current: agent,
    }));
  },
  setCurrent: (agent: Agent | string) => {
    const newAgent = typeof agent === 'string' ? getAgentById(agent) : agent;
    if (newAgent) {
      set({ current: newAgent });
    }
  },
  update: (agentId: string, adjustments: Partial<Agent>) => {
    let agent = getAgentById(agentId);
    if (!agent) return;
    const updatedAgent = { ...agent, ...adjustments };
    set(state => ({
      availablePresets: state.availablePresets.map(a =>
        a.id === agentId ? updatedAgent : a
      ),
      availablePersonal: state.availablePersonal.map(a =>
        a.id === agentId ? updatedAgent : a
      ),
      current: state.current.id === agentId ? updatedAgent : state.current,
    }));
  },
}));

/**
 * Progress
 */
export type Stage = {
  id: number;
  title: string;
  status: 'completed' | 'active' | 'locked';
  narrative: string;
};

const initialStages: Stage[] = [
  {
    id: 1,
    title: 'Welcome',
    status: 'active',
    narrative:
      'Hi, Namaste! I’m your NxtWave buddy. I’ll guide you through how you can start your journey with us. Don’t worry, this will be simple and quick. Ready?',
  },
  {
    id: 2,
    title: 'About the Program',
    status: 'locked',
    narrative:
      'You’ve taken a smart step by reserving your seat. Many students attend our sessions, but only a few get selected—so congrats! In most colleges, students just learn theory—like drawing an engine on paper but never driving it. At NxtWave, we focus on real-world skills that companies actually need. Our program is built in 6 growth cycles. Each cycle gives you step-by-step industry skills so that you can aim for better jobs—not just 3–4 LPA, but much higher. This course is your shortcut to a strong career.',
  },
  {
    id: 3,
    title: 'NBFC (Loan & Payment)',
    status: 'locked',
    narrative:
      'To make learning easy for everyone, we give two payment options: One-time payment, or Easy EMI with 0% extra cost. For EMI, we work with trusted finance partners—like Varthana, Bajaj, Feemonk, Shopse, and Gyaandaan. The loan is digital, safe, no collateral, and zero interest. You just pay the course fee in small monthly parts while learning.',
  },
  {
    id: 4,
    title: 'Co-applicant',
    status: 'locked',
    narrative:
      'To start the EMI, we need a Co-applicant. This means someone in your family who earns monthly income and has an active bank account. We’ll need their PAN, Aadhaar, bank proof, and a clear photo. Also, a short 15-second video where they say: ‘My child has joined NxtWave’s program for a digital loan.’ This step is very important—without the right co-applicant and KYC, the process can’t move forward. Once this is done, your seat will be fully confirmed and you’ll be ready to start.',
  },
];

export const useProgress = create<{
  stages: Stage[];
  advanceStage: () => void;
  isLastStage: () => boolean;
}>((set, get) => ({
  stages: initialStages,
  advanceStage: () => {
    set(state => {
      const currentStageIndex = state.stages.findIndex(
        stage => stage.status === 'active'
      );

      if (
        currentStageIndex === -1 ||
        currentStageIndex === state.stages.length - 1
      ) {
        return state; // No active stage or it's the last stage
      }

      // FIX: Add explicit type `Stage[]` to `newStages` to guide TypeScript's
      // type inference and resolve the type error.
      const newStages: Stage[] = state.stages.map((stage, index) => {
        if (index === currentStageIndex) {
          return { ...stage, status: 'completed' };
        }
        if (index === currentStageIndex + 1) {
          return { ...stage, status: 'active' };
        }
        return stage;
      });

      return { stages: newStages };
    });
  },
  isLastStage: () => {
    const { stages } = get();
    const activeStageIndex = stages.findIndex(
      stage => stage.status === 'active'
    );
    return activeStageIndex === stages.length - 1;
  },
}));

/**
 * UI
 */
export const useUI = create<{
  showUserConfig: boolean;
  setShowUserConfig: (show: boolean) => void;
  showAgentEdit: boolean;
  setShowAgentEdit: (show: boolean) => void;
}>(set => ({
  showUserConfig: true,
  setShowUserConfig: (show: boolean) => set({ showUserConfig: show }),
  showAgentEdit: false,
  setShowAgentEdit: (show: boolean) => set({ showAgentEdit: show }),
}));