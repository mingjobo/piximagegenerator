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
    <div className="group relative bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Main Image Area */}
      <div className="relative aspect-square bg-gray-50">
        <Image
          src={work.image_url}
          alt={`Pixelated ${work.emoji}`}
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />

        {/* Original Emoji Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
          <span className="text-lg leading-none">{work.emoji}</span>
        </div>
      </div>

      {/* Optional: Hover overlay with creation time */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-sm">
            Created {new Date(work.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}