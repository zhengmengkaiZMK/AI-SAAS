import { Container } from "@/components/container";
import { Background } from "@/components/background";
import { Heading } from "@/components/heading";
import { Subheading } from "@/components/subheading";
import { Pricing } from "@/components/pricing";
import { PricingTable } from "../../pricing/pricing-table";
import { Companies } from "@/components/companies";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "价格 - Lingtrue",
  description:
    "Lingtrue 是一个提供各种 AI 工具和服务的平台，帮助您掌握业务动态。生成图像、文本以及启动业务所需的一切。",
  openGraph: {
    images: ["https://ai-saas-template-aceternity.vercel.app/banner.png"],
  },
};

export default function ZhPricingPage() {
  return (
    <div className="relative overflow-hidden py-20 md:py-0">
      <Background />
      <Container className="flex flex-col items-center justify-between  pb-20">
        <div className="relative z-20 py-10 md:pt-40">
          <Heading as="h1">简单易用的定价方案</Heading>
          <Subheading className="text-center">
            Lingtrue 提供多种服务选择。您可以选择最适合您需求的方案，立即开始使用。
          </Subheading>
        </div>
        <Pricing />
        <PricingTable />
        <Companies />
      </Container>
    </div>
  );
}
