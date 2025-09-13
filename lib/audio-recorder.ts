/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { audioContext } from './utils';
import AudioRecordingWorklet from './worklets/audio-processing';
import VolMeterWorket from './worklets/vol-meter';

import { createWorketFromSrc } from './audioworklet-registry';
import EventEmitter from 'eventemitter3';

function arrayBufferToBase64(buffer: ArrayBuffer) {
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// FIX: Define event types for AudioRecorder to ensure type safety.
type AudioRecorderEvents = {
  data: (base64: string) => void;
  volume: (volume: number) => void;
};

// FIX: Use composition instead of inheritance for EventEmitter to fix type errors.
export class AudioRecorder {
  private emitter = new EventEmitter<AudioRecorderEvents>();

  public on<T extends keyof AudioRecorderEvents>(
    event: T,
    fn: AudioRecorderEvents[T],
  ): this {
    // FIX: Cast listener to `any` to work around a TypeScript limitation with
    // generic type correlation in wrapper methods for EventEmitter.
    this.emitter.on(event, fn as any);
    return this;
  }

  public off<T extends keyof AudioRecorderEvents>(
    event: T,
    fn: AudioRecorderEvents[T],
  ): this {
    // FIX: Cast listener to `any` to work around a TypeScript limitation with
    // generic type correlation in wrapper methods for EventEmitter.
    this.emitter.off(event, fn as any);
    return this;
  }

  public emit<T extends keyof AudioRecorderEvents>(
    event: T,
    ...args: Parameters<AudioRecorderEvents[T]>
  ) {
    // FIX: Cast arguments to `any` to work around a TypeScript limitation with
    // generic type correlation in wrapper methods for EventEmitter.
    return this.emitter.emit(event, ...(args as any));
  }

  stream: MediaStream | undefined;
  audioContext: AudioContext | undefined;
  source: MediaStreamAudioSourceNode | undefined;
  recording: boolean = false;
  recordingWorklet: AudioWorkletNode | undefined;
  vuWorklet: AudioWorkletNode | undefined;

  private starting: Promise<void> | null = null;

  constructor(public sampleRate = 16000) {}

  async start() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Could not request user media');
    }

    this.starting = new Promise(async (resolve, reject) => {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = await audioContext({ sampleRate: this.sampleRate });
      this.source = this.audioContext.createMediaStreamSource(this.stream);

      const workletName = 'audio-recorder-worklet';
      const src = createWorketFromSrc(workletName, AudioRecordingWorklet);

      await this.audioContext.audioWorklet.addModule(src);
      this.recordingWorklet = new AudioWorkletNode(
        this.audioContext,
        workletName
      );

      this.recordingWorklet.port.onmessage = async (ev: MessageEvent) => {
        // Worklet processes recording floats and messages converted buffer
        const arrayBuffer = ev.data.data.int16arrayBuffer;

        if (arrayBuffer) {
          const arrayBufferString = arrayBufferToBase64(arrayBuffer);
          // FIX: Property 'emit' does not exist on type 'AudioRecorder'.
          this.emit('data', arrayBufferString);
        }
      };
      this.source.connect(this.recordingWorklet);

      // vu meter worklet
      const vuWorkletName = 'vu-meter';
      await this.audioContext.audioWorklet.addModule(
        createWorketFromSrc(vuWorkletName, VolMeterWorket)
      );
      this.vuWorklet = new AudioWorkletNode(this.audioContext, vuWorkletName);
      this.vuWorklet.port.onmessage = (ev: MessageEvent) => {
        // FIX: Property 'emit' does not exist on type 'AudioRecorder'.
        this.emit('volume', ev.data.volume);
      };

      this.source.connect(this.vuWorklet);
      this.recording = true;
      resolve();
      this.starting = null;
    });
  }

  stop() {
    // It is plausible that stop would be called before start completes,
    // such as if the Websocket immediately hangs up
    const handleStop = () => {
      this.source?.disconnect();
      this.stream?.getTracks().forEach(track => track.stop());
      this.stream = undefined;
      this.recordingWorklet = undefined;
      this.vuWorklet = undefined;
    };
    if (this.starting) {
      this.starting.finally(handleStop);
      return;
    }
    handleStop();
  }
}