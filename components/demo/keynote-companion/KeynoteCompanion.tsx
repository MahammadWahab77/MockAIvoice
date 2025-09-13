/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect, useRef } from 'react';
import { Modality } from '@google/genai';

import BasicFace from '../basic-face/BasicFace';
import { useLiveAPIContext } from '../../../contexts/LiveAPIContext';
import { createSystemInstructions } from '@/lib/prompts';
import { useAgent, useProgress, useUser } from '@/lib/state';

export default function KeynoteCompanion() {
  const { client, connected, setConfig } = useLiveAPIContext();
  const faceCanvasRef = useRef<HTMLCanvasElement>(null);
  const user = useUser();
  const { current } = useAgent();

  // Select only the active stage to prevent unnecessary re-renders.
  const activeStage = useProgress(state =>
    state.stages.find(stage => stage.status === 'active')
  );
  const prevActiveStageId = useRef<number | null>(null);

  // Set the configuration for the Live API
  useEffect(() => {
    setConfig({
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: current.voice },
        },
      },
      systemInstruction: {
        parts: [
          {
            text: createSystemInstructions(current, user),
          },
        ],
      },
    });
  }, [setConfig, user, current]);

  // When the active stage changes, send the narrative for that stage to the agent.
  useEffect(() => {
    // If we are disconnected, reset the prev stage ref. This allows the narrative
    // for the current stage to be re-spoken upon reconnection.
    if (!connected) {
      prevActiveStageId.current = null;
      return;
    }

    // Do nothing if there's no active stage.
    if (!activeStage) {
      return;
    }

    // If the active stage has changed since the last time we spoke,
    // send the new narrative.
    if (activeStage.id !== prevActiveStageId.current) {
      client.send(
        {
          text: activeStage.narrative,
        },
        true // end of turn
      );
      // Remember the ID of the stage we just announced.
      prevActiveStageId.current = activeStage.id;
    }
  }, [client, connected, activeStage]);

  return (
    <div className="keynote-companion">
      <BasicFace canvasRef={faceCanvasRef} color={current.bodyColor} />
    </div>
  );
}