import { X } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function VideoPlayerModal({ video, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl rounded-2xl bg-card border border-border/60 gold-glow overflow-hidden msg-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold truncate">{video.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              by {video.uploader_name} · <span className="text-primary">{video.uploader_role}</span>
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors shrink-0">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
        <div className="aspect-video bg-black">
          <video
            src={video.video_url}
            poster={video.thumbnail_url}
            controls
            autoPlay
            className="w-full h-full"
          >
            Your browser does not support video playback.
          </video>
        </div>
        {video.description && (
          <div className="px-5 py-4">
            <p className="text-sm text-muted-foreground leading-relaxed">{video.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}