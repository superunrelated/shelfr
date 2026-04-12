import { RiGroupLine } from '@remixicon/react';

interface InvitationCardProps {
  collectionName: string;
  color: string;
  role: 'viewer' | 'editor';
  onAccept: () => void;
  onDecline: () => void;
}

export function InvitationCard({
  collectionName,
  color,
  role,
  onAccept,
  onDecline,
}: InvitationCardProps) {
  return (
    <div className="bg-white rounded shadow-sm border border-neutral-200/80 overflow-hidden">
      <div className="aspect-[4/3] bg-neutral-100 flex items-center justify-center">
        <RiGroupLine size={32} className="text-neutral-200" />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: color }}
          />
          <p className="text-[14px] font-semibold text-[#1c1e2a] font-serif truncate">
            {collectionName}
          </p>
        </div>
        <p className="text-[11px] text-neutral-400 mb-3">Invited as {role}</p>
        <div className="flex gap-2">
          <button
            onClick={onAccept}
            className="flex-1 text-[11px] font-medium py-1.5 rounded bg-[#1c1e2a] text-white hover:bg-[#2a2d3d] transition-colors"
          >
            Accept
          </button>
          <button
            onClick={onDecline}
            className="flex-1 text-[11px] font-medium py-1.5 rounded border border-neutral-200 text-neutral-400 hover:text-neutral-600 hover:border-neutral-300 transition-colors"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
