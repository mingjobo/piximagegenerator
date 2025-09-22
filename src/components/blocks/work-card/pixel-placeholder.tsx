export default function PixelPlaceholder({ emoji }: { emoji: string }) {
  // 为每个emoji生成一个简单的像素图案
  const generatePixelPattern = (emoji: string) => {
    // 使用emoji的unicode值生成伪随机模式
    const seed = emoji.charCodeAt(0);
    const pattern = [];

    // 生成8x8的像素网格
    for (let i = 0; i < 64; i++) {
      // 使用简单的伪随机算法
      const value = (seed * (i + 1) * 997) % 100;
      pattern.push(value > 40);
    }

    return pattern;
  };

  const pattern = generatePixelPattern(emoji);

  return (
    <div className="absolute inset-0 flex items-center justify-center p-12">
      <div className="w-full h-full max-w-[150px] max-h-[150px] grid grid-cols-8 gap-0.5">
        {pattern.map((filled, index) => (
          <div
            key={index}
            className={`aspect-square ${
              filled
                ? 'bg-purple-500'  // 移除了 dark:bg-purple-400
                : 'bg-gray-200'    // 移除了 dark:bg-gray-700
            }`}
          />
        ))}
      </div>
    </div>
  );
}