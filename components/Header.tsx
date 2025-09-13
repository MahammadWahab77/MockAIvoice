/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useAgent, useUI, useUser } from '@/lib/state';

export default function Header() {
  const { showUserConfig, setShowUserConfig, setShowAgentEdit } = useUI();
  const { name } = useUser();
  const { current } = useAgent();

  return (
    <header>
      <div className="roomInfo">
        <div className="roomName">
          <h1>{current.name}</h1>

          <button
            onClick={() => setShowAgentEdit(true)}
            className="button createButton"
          >
            <span className="icon">edit</span> Edit
          </button>
        </div>
      </div>
      <button
        className="userSettingsButton"
        onClick={() => setShowUserConfig(!showUserConfig)}
      >
        <p className="user-name">{name || 'Your name'}</p>
        <span className="icon">tune</span>
      </button>
    </header>
  );
}