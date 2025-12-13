"use client";

import Balancer from "react-wrap-balancer";
import { motion } from "framer-motion";
import RotatingText from "./RotatingText";
import { PainPointSearch } from "./pain-point-search";

import { usePathname } from "next/navigation";

export const Hero = () => {
  const pathname = usePathname();
  const isZh = pathname.startsWith("/zh");

  const content = {
    title: isZh ? "发现用户痛点" : "Discover What Users Hate",
    rotatingWords: isZh ? ["Reddit", "X"] : ["Reddit", "X"],
    description: isZh 
      ? "输入任何您想问的问题或关键词,我们的 AI 将抓取 Reddit 数据,为您的下一个产品挖掘隐藏的痛点。"
      : "Enter anything what you want to ask or keyword, and our AI will scrape Reddit to find the hidden pain points for your next product.",
  };

  return (
    <div className="flex flex-col min-h-screen pt-20 md:pt-40 relative overflow-hidden pb-12">
      <motion.h1
        initial={{
          y: 40,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          ease: "easeOut",
          duration: 0.5,
        }}
        className="text-2xl md:text-4xl lg:text-6xl font-semibold max-w-6xl mx-auto text-center mt-6 relative z-10"
      >
        <Balancer>
          {isZh ? (
            <>
              发现{" "}
              <span className="inline-block w-[120px] sm:w-[150px] md:w-[200px]">
                <RotatingText
                  texts={content.rotatingWords}
                  mainClassName="inline-flex px-3 sm:px-4 md:px-6 bg-gradient-to-r from-cyan-400 to-blue-500 text-white overflow-hidden py-1 sm:py-2 md:py-3 justify-center rounded-lg w-full"
                  staggerFrom="last"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-1 sm:pb-2 md:pb-2"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2500}
                />
              </span>{" "}
              用户讨厌什么
              <br />
              借助 AI
            </>
          ) : (
            <>
              Discover What{" "}
              <span className="inline-block w-[120px] sm:w-[150px] md:w-[200px]">
                <RotatingText
                  texts={content.rotatingWords}
                  mainClassName="inline-flex px-3 sm:px-4 md:px-6 bg-gradient-to-r from-cyan-400 to-blue-500 text-white overflow-hidden py-1 sm:py-2 md:py-3 justify-center rounded-lg w-full"
                  staggerFrom="last"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-1 sm:pb-2 md:pb-2"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2500}
                />
              </span>{" "}
              Users Hate
              <br />
              with AI
            </>
          )}
        </Balancer>
      </motion.h1>
      <motion.p
        initial={{
          y: 40,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          ease: "easeOut",
          duration: 0.5,
          delay: 0.2,
        }}
        className="text-center mt-6 text-base md:text-xl text-muted dark:text-muted-dark max-w-3xl mx-auto relative z-10"
      >
        <Balancer>
          {content.description}
        </Balancer>
      </motion.p>
      
      {/* Pain Point Search Section */}
      <motion.div
        initial={{
          y: 80,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          ease: "easeOut",
          duration: 0.5,
          delay: 0.4,
        }}
      >
        <PainPointSearch />
      </motion.div>
    </div>
  );
};
