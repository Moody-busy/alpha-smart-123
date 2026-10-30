import { Play, User as UserIcon } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function VideoCard({ video, onPlay }) {
  return (
    <button
      onClick={onPlay}
      className="group text-left rounded-2xl overflow-hidden bg-card border border-border/50 transition-all duration-300 hover:gold-glow hover:-translate-y-1"
    >
      <div className="relative aspect-video overflow-hidden bg-secondary">
        {video.thumbnail_url ? (
          <Image
            src={video.thumbnail_url}
            alt={video.title}
            className="w-full h-full transition-transform duration-500 group-hover:scale-110"
            fittingType="fill"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-10 h-10 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full gold-glow-strong bg-primary/90 flex items-center justify-center backdrop-blur-sm">
            <Play className="w-6 h-6 text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-medium frosted border border-border/40 text-primary">
          {video.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-sm leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {video.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{video.description}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-6 h-6 rounded-full border border-primary/40 bg-secondary flex items-center justify-center">
            <UserIcon className="w-3 h-3" />
          </div>
          <span className="truncate">{video.uploader_name}</span>
          <span className="ml-auto px-2 py-0.5 rounded-md bg-secondary border border-border/40 text-[10px] uppercase tracking-wide">
            {video.uploader_role}
          </span>
        </div>
      </div>
    </button>
  );
}