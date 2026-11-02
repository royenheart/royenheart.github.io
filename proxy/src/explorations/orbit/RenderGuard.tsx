import type { RenderMode } from './render-mode';

const labels: Record<RenderMode, { label: string; description: string }> = {
  full: { label: 'FULL', description: '完整渲染' },
  reduced: { label: 'REDUCED', description: '已降低渲染质量' },
  critical: { label: 'CRITICAL', description: '已进入强保护档' },
  stasis: { label: 'STASIS', description: '性能保护已锁存' },
  still: { label: 'STILL', description: '使用静态画面回退' },
};

const modes = Object.keys(labels) as RenderMode[];

export function RenderGuard({ mode }: { mode: RenderMode }) {
  const current = labels[mode];
  return (
    <div
      className="orbit-render-guard"
      data-mode={mode}
      role="status"
      aria-live="polite"
      aria-label={`渲染保护：${current.description}`}
    >
      <span className="orbit-guard-stamp" aria-hidden="true">
        SYS
      </span>
      <span className="orbit-guard-name">RENDER GUARD</span>
      <span className="orbit-guard-marks" aria-hidden="true">
        {modes.map((item) => (
          <i
            key={item}
            className={item === mode ? 'on' : ''}
            data-state={item}
          />
        ))}
      </span>
      <span className="orbit-guard-state" data-state={mode}>
        {current.label}
      </span>
    </div>
  );
}
