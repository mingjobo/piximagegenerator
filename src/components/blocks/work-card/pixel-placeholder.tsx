import { useState, useEffect } from "react";

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
  const [currentPixelIndex, setCurrentPixelIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  // 渐进式填充动画
  useEffect(() => {
    if (!isAnimating) return;

    const timer = setTimeout(() => {
      setCurrentPixelIndex(prev => {
        const nextIndex = prev + 1;
        // 循环动画：完成一轮后重置
        if (nextIndex >= 64) {
          return 0;
        }
        return nextIndex;
      });
    }, 80); // 每80ms填充下一个像素，整个循环约5秒

    return () => clearTimeout(timer);
  }, [currentPixelIndex, isAnimating]);

  // 组件卸载时清理动画
  useEffect(() => {
    return () => {
      setIsAnimating(false);
    };
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center p-12">
      <div className="w-full h-full max-w-[150px] max-h-[150px] grid grid-cols-8 gap-0.5">
        {pattern.map((shouldFill, index) => {
          // 决定当前像素的显示状态
          const isActive = index <= currentPixelIndex;
          const isCurrentPixel = index === currentPixelIndex;

          return (
            <div
              key={index}
              className={`aspect-square transition-all duration-200 ${
                shouldFill
                  ? isActive
                    ? isCurrentPixel
                      ? 'bg-purple-400 scale-110 shadow-sm' // 当前像素：高亮 + 缩放效果
                      : 'bg-purple-500'                     // 已填充像素：正常紫色
                    : 'bg-gray-200'                         // 未填充像素：灰色
                  : 'bg-gray-200'                           // 不应该填充的像素：始终灰色
              }`}
            />
          );
        })}
      </div>

      {/* 生成中提示文字 */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="text-xs text-purple-600 font-medium bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
          Generating...
        </div>
      </div>
    </div>
  );
}