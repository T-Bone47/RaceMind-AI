import { Video, StickyNote } from 'lucide-react';
import type { SetupValues } from '../../data/setups';
import { Panel } from '../ui/Panel';

interface Props {
  values: SetupValues;
}

export function SetupNotes({ values }: Props) {
  if (!values.trackGuideVideoUrl && !values.raceStrategyNotes) {
    return null;
  }

  return (
    <Panel
      title="Track Guide & Strategy"
      subtitle="Additional resources"
      accent="#FFC531"
      className="mt-3"
      bodyClassName="p-4 space-y-4"
    >
      {values.trackGuideVideoUrl && (
        <div className="rounded-lg border border-white/[0.07] bg-black/30 p-3">
          <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">
            <Video className="h-3 w-3" /> Track Guide Video
          </p>
          <a
            href={values.trackGuideVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block truncate text-[11.5px] font-mono text-f1-cyan hover:underline"
          >
            {values.trackGuideVideoUrl}
          </a>
        </div>
      )}

      {values.raceStrategyNotes && (
        <div className="rounded-lg border border-white/[0.07] bg-black/30 p-3">
          <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/55">
            <StickyNote className="h-3 w-3" /> Race Strategy Notes
          </p>
          <p className="mt-2 text-[11.5px] leading-relaxed text-silver-light whitespace-pre-wrap">
            {values.raceStrategyNotes}
          </p>
        </div>
      )}
    </Panel>
  );
}
