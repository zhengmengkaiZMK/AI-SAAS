"use client";

import { Hero } from "./hero";
import { GridFeatures } from "./grid-features";
import { Testimonials } from "./testimonials";
import { CTA } from "./cta";

/**
 * 首页专用组件包装器
 * 优化了各模块之间的间距，使页面更加紧凑和优雅
 */

// Hero 组件包装 - 减少底部间距
export const HomeHero = () => {
  return (
    <div className="[&>div]:min-h-[85vh] [&>div]:pb-8 md:[&>div]:pb-12">
      <Hero />
    </div>
  );
};

// GridFeatures 组件包装 - 适度增加上下间距
export const HomeGridFeatures = () => {
  return (
    <div className="py-12 md:py-16">
      <GridFeatures />
    </div>
  );
};

// Testimonials 组件包装 - 大幅减少间距
export const HomeTestimonials = () => {
  return (
    <div className="[&>div]:py-12 [&>div]:md:py-20">
      <Testimonials />
    </div>
  );
};

// CTA 组件包装 - 大幅减少间距
export const HomeCTA = () => {
  return (
    <div className="[&>section]:py-16 [&>section]:md:py-24">
      <CTA />
    </div>
  );
};
