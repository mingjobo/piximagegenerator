import Image from "next/image";

export interface Work {
  id: number;
  uuid: string;
  user_uuid: string;
  emoji: string;
  image_url: string;
  created_at: Date;
}

interface WorkCardProps {
  work: Work;
}

export default function WorkCard({ work }: WorkCardProps) {
  return (
    <div className="group relative bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden">
      {/* Main Image Area */}
      <div className="relative aspect-square bg-gray-50/50">
        <Image
          src={work.image_url}
          alt={`Pixelated ${work.emoji}`}
          fill
          className="object-contain p-6"
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />

        {/* Original Emoji Badge - 左上角小图标 */}
        <div className="absolute top-3 left-3 w-8 h-8 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm flex items-center justify-center border border-gray-200/50">
          <span className="text-sm leading-none">{work.emoji}</span>
        </div>
      </div>

      {/* Hover overlay - 更简洁的悬浮效果 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute bottom-3 left-3 right-3">
          <div className="text-white text-xs">
            {new Date(work.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}