/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useProgress } from '@/lib/state';
import c from 'classnames';

export default function Sidebar() {
  const stages = useProgress(state => state.stages);

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          {stages.map((stage, index) => (
            <li key={stage.id} className={c('stage-item', stage.status)}>
              <div className="stage-marker">
                {stage.status === 'completed' ? (
                  <span className="icon">check</span>
                ) : (
                  <span className="stage-number">{index + 1}</span>
                )}
              </div>
              <p className="stage-title">{stage.title}</p>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}