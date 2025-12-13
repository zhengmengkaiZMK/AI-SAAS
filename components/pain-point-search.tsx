"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "./button";
import { PainPointResults } from "./pain-point-results";

// 镐头图标组件
const PickaxeIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M14.531 12.469l6.238-6.238a2 2 0 0 0 0-2.828l-1.172-1.172a2 2 0 0 0-2.828 0l-6.238 6.238" />
    <path d="M14.531 12.469l-9.9 9.9a2 2 0 0 1-2.828 0l-1.172-1.172a2 2 0 0 1 0-2.828l9.9-9.9" />
    <path d="M7.5 15.5l2 2" />
  </svg>
);

export const PainPointSearch = () => {
  const pathname = usePathname();
  const isZh = pathname.startsWith("/zh");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["reddit"]);
  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  const content = {
    placeholder: isZh 
      ? "试试 'Notion'、'邮件营销' 或 '备餐'..." 
      : "Try 'Notion', 'Email Marketing', or 'Meal Prep'...",
    buttonText: isZh ? "查找痛点" : "Find Pain Points",
    searchingText: isZh ? "正在搜索..." : "Searching...",
    quickChips: isZh 
      ? ["SaaS", "健身", "远程工作", "生产力"]
      : ["SaaS", "Fitness", "Remote Work", "Productivity"],
    platforms: [
      { id: "reddit", label: "Reddit" },
      { id: "x", label: "X" },
    ],
  };

  // 当结果显示时，自动滚动到结果区域 - 模拟自然滚动
  useEffect(() => {
    if (showResults && resultsRef.current) {
      // 延迟一小段时间让结果完全渲染
      setTimeout(() => {
        const element = resultsRef.current;
        if (!element) return;

        // 获取元素位置
        const elementRect = element.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;
        
        // 计算目标位置 - 留出一些顶部空间（80px），让布局更舒适
        const offset = 80;
        const targetPosition = absoluteElementTop - offset;
        
        // 当前位置
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        
        // 滚动持续时间（毫秒）
        const duration = 1200;
        let startTime: number | null = null;
        
        // 缓动函数 - easeInOutCubic，模拟自然滚动
        const easeInOutCubic = (t: number): number => {
          return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };
        
        // 动画函数
        const animation = (currentTime: number) => {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);
          
          // 应用缓动函数
          const ease = easeInOutCubic(progress);
          
          // 计算当前位置
          const currentPosition = startPosition + distance * ease;
          
          // 滚动到当前位置
          window.scrollTo(0, currentPosition);
          
          // 如果动画未完成，继续
          if (progress < 1) {
            requestAnimationFrame(animation);
          }
        };
        
        // 启动动画
        requestAnimationFrame(animation);
      }, 150);
    }
  }, [showResults]);

  const handleChipClick = (chip: string) => {
    setSearchQuery(chip);
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSearch = () => {
    if (isSearching) return;
    
    console.log("Search:", searchQuery, "Platforms:", selectedPlatforms);
    
    // 开始搜索动画
    setIsSearching(true);
    setProgress(0);
    setShowResults(false);
    
    // 模拟进度增长
    const duration = 3000; // 3秒完成
    const interval = 50; // 每50ms更新一次
    const steps = duration / interval;
    const increment = 100 / steps;
    
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(progressInterval);
        // 完成后延迟0.5秒再隐藏进度条并显示结果
        setTimeout(() => {
          setIsSearching(false);
          setProgress(0);
          setShowResults(true);
        }, 500);
      }
      setProgress(currentProgress);
    }, interval);
  };

  return (
    <>
      <div className="w-full max-w-3xl mx-auto mt-12 px-4 relative z-10">
        {/* 搜索输入框 */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={content.placeholder}
            className="w-full h-14 px-6 text-base rounded-2xl border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </div>

        {/* 执行按钮 */}
        <div className="flex justify-center mt-4">
          <Button 
            onClick={handleSearch}
            disabled={isSearching}
            className="px-8 h-12 text-base"
          >
            <PickaxeIcon className="h-5 w-5" />
            <span>{isSearching ? content.searchingText : content.buttonText}</span>
          </Button>
        </div>

        {/* 推荐搜索 Quick Chips */}
        <div className="flex flex-wrap gap-2 justify-center mt-6">
          {content.quickChips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className="px-4 py-2 rounded-full text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* 平台选择 */}
        <div className="flex gap-4 justify-center mt-6">
          {content.platforms.map((platform) => (
            <label
              key={platform.id}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={selectedPlatforms.includes(platform.id)}
                  onChange={() => togglePlatform(platform.id)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    selectedPlatforms.includes(platform.id)
                      ? "bg-cyan-400 border-cyan-400"
                      : "border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900"
                  }`}
                >
                  {selectedPlatforms.includes(platform.id) && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white transition-colors">
                {platform.label}
              </span>
            </label>
          ))}
        </div>

        {/* 进度条 */}
        {isSearching && (
          <div className="mt-6 w-full max-w-md mx-auto">
            <div className="h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-200 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-center mt-2 text-neutral-500 dark:text-neutral-400">
              {Math.round(progress)}%
            </p>
          </div>
        )}
      </div>

      {/* 结果展示区 */}
      {showResults && (
        <div ref={resultsRef}>
          <PainPointResults />
        </div>
      )}
    </>
  );
};
