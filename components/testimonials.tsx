"use client";

import { useState } from "react";
import { Heading } from "./heading";
import { Subheading } from "./subheading";
import { cn } from "@/lib/utils";
import { InViewDiv } from "./in-view-div";
import { useMemo } from "react";
import { TestimonialColumnContainer } from "./testimonial-column-container";
import Image from "next/image";
import { usePathname } from "next/navigation";

export const Testimonials = () => {
  const pathname = usePathname();
  const isZh = pathname.startsWith("/zh");

  return (
    <div className="relative z-20 py-10 md:py-40">
      <Heading as="h2">
        {isZh 
          ? "全球创业者和产品经理的信赖之选" 
          : "Trusted by Entrepreneurs and Product Managers Worldwide"}
      </Heading>
      <Subheading className="text-center max-w-lg mx-auto">
        {isZh
          ? "每天帮助数千名创业者和产品经理发现真实的用户痛点,验证产品想法,找到市场机会。"
          : "Helping thousands of entrepreneurs and product managers daily discover real user pain points, validate product ideas, and identify market opportunities."}
      </Subheading>
      <TestimonialGrid />
    </div>
  );
};

interface Testimonial {
  name: string;
  quote: string;
  src: string;
  designation?: string;
}

const testimonials = [
  {
    name: "Sarah Chen",
    quote:
      "Found 3 major pain points in the productivity app market within minutes. Launched my SaaS 2 months later with paying customers. This tool is a goldmine!",
    src: "https://i.pravatar.cc/150?img=1",
    designation: "SaaS Founder",
  },
  {
    name: "Marcus Rodriguez",
    quote:
      "The frustration score helped me prioritize which problem to solve first. Saved me from building a product nobody wanted. Best $10/month I've ever spent.",
    src: "https://i.pravatar.cc/150?img=2",
    designation: "Indie Hacker",
  },
  {
    name: "Emily Watson",
    quote:
      "We used the Reddit insights to pivot our product roadmap. The real user quotes are incredibly valuable for investor pitches and validation.",
    src: "https://i.pravatar.cc/150?img=3",
    designation: "Product Manager at Tech Startup",
  },
  {
    name: "David Kim",
    quote:
      "Discovered an underserved niche in the fitness tech space. The AI analysis revealed patterns I would have never found manually. Game-changer for market research!",
    src: "https://i.pravatar.cc/150?img=4",
    designation: "Entrepreneur & Fitness Tech Founder",
  },
  {
    name: "Jennifer Lee",
    quote:
      "Before building anything, I now search pain points here first. It's like having a crystal ball that shows you what people actually need.",
    src: "https://i.pravatar.cc/150?img=5",
    designation: "Solo Founder",
  },
  {
    name: "Alex Thompson",
    quote:
      "The multi-platform search is brilliant. Being able to cross-reference Reddit and X insights gave us a complete picture of user sentiment.",
    src: "https://i.pravatar.cc/150?img=6",
    designation: "Market Research Analyst",
  },
  {
    name: "Rachel Green",
    quote:
      "Used this to validate 5 different ideas in one afternoon. Saved months of development on wrong products. The export feature is perfect for team alignment.",
    src: "https://i.pravatar.cc/150?img=7",
    designation: "Head of Product",
  },
  {
    name: "Michael Brown",
    quote:
      "The structured insights format is exactly what our investment committee needed. Helped us secure $500K in seed funding with data-backed validation.",
    src: "https://i.pravatar.cc/150?img=8",
    designation: "Tech Startup CEO",
  },
  {
    name: "Lisa Anderson",
    quote:
      "As a non-technical founder, this tool empowered me to do professional market research without hiring expensive consultants. Absolutely worth it!",
    src: "https://i.pravatar.cc/150?img=9",
    designation: "E-commerce Entrepreneur",
  },
  {
    name: "James Wilson",
    quote:
      "The real-time AI analysis is surprisingly accurate. It caught pain points our user interviews missed. Now it's part of our weekly product discovery process.",
    src: "https://i.pravatar.cc/150?img=10",
    designation: "Product Lead",
  },
  {
    name: "Sophia Martinez",
    quote:
      "Found our entire product positioning strategy from one search. The direct links to Reddit posts helped us understand context deeply. Incredible tool!",
    src: "https://i.pravatar.cc/150?img=11",
    designation: "Marketing Strategist",
  },
  {
    name: "Daniel Park",
    quote:
      "Went from idea to MVP in 3 weeks because the pain point analysis was so clear. Users love our solution because we built exactly what they needed.",
    src: "https://i.pravatar.cc/150?img=12",
    designation: "Technical Founder",
  },
  {
    name: "Olivia Taylor",
    quote:
      "The search history feature is underrated. Being able to track how pain points evolve over time gives us competitive advantage in product strategy.",
    src: "https://i.pravatar.cc/150?img=13",
    designation: "Chief Product Officer",
  },
  {
    name: "Ryan Cooper",
    quote:
      "Better than hiring a market research agency and 100x cheaper. The AI summaries are concise and actionable. This should be every founder's first stop.",
    src: "https://i.pravatar.cc/150?img=14",
    designation: "Serial Entrepreneur",
  },
  {
    name: "Emma Davis",
    quote:
      "Discovered a massive pain point in remote work tools that big companies are ignoring. Building the solution now. This tool literally changed my life.",
    src: "https://i.pravatar.cc/150?img=15",
    designation: "Aspiring Founder",
  },
  {
    name: "Chris Johnson",
    quote:
      "The professional plan pays for itself instantly. Unlimited searches mean we can explore dozens of niches quickly. Essential for our product studio.",
    src: "https://i.pravatar.cc/150?img=16",
    designation: "Product Studio Owner",
  },
  {
    name: "Amanda White",
    quote:
      "Used it to double-check our product-market fit. The frustration scores validated we were solving a real problem. Now we have confident direction.",
    src: "https://i.pravatar.cc/150?img=17",
    designation: "Co-Founder",
  },
  {
    name: "Kevin Zhang",
    quote:
      "The bilingual support is perfect for our global product. We can analyze pain points in both English and Chinese communities. Truly international tool!",
    src: "https://i.pravatar.cc/150?img=18",
    designation: "International Product Manager",
  },
  {
    name: "Jessica Miller",
    quote:
      "Every product manager should use this before writing PRDs. The real user quotes give context that surveys never capture. Absolutely indispensable.",
    src: "https://i.pravatar.cc/150?img=19",
    designation: "Senior PM at Fortune 500",
  },
  {
    name: "Tom Harrison",
    quote:
      "Helped us pivot from a failing product to a successful one in 6 weeks. The pain point insights showed us what users really wanted vs what we thought.",
    src: "https://i.pravatar.cc/150?img=20",
    designation: "Startup Founder",
  },
  {
    name: "Nicole Adams",
    quote:
      "The CSV export is perfect for stakeholder presentations. Being able to show data-backed pain points makes every product decision easier to justify.",
    src: "https://i.pravatar.cc/150?img=21",
    designation: "Product Strategy Director",
  },
  {
    name: "Brian Foster",
    quote:
      "From zero to validated idea in under an hour. The AI does in minutes what used to take me weeks of manual Reddit scrolling. Pure efficiency!",
    src: "https://i.pravatar.cc/150?img=22",
    designation: "Micro-SaaS Builder",
  },
];

function Testimonial({
  name,
  quote,
  src,
  designation,
  className,
  ...props
}: Omit<React.ComponentPropsWithoutRef<"figure">, keyof Testimonial> &
  Testimonial) {
  let animationDelay = useMemo(() => {
    let possibleAnimationDelays = [
      "0s",
      "0.1s",
      "0.2s",
      "0.3s",
      "0.4s",
      "0.5s",
    ];
    return possibleAnimationDelays[
      Math.floor(Math.random() * possibleAnimationDelays.length)
    ];
  }, []);

  const boxStyle = {};
  return (
    <figure
      className={cn(
        "animate-fade-in rounded-3xl bg-transparent p-8 opacity-0 shadow-derek dark:bg-neutral-900",
        className
      )}
      style={{
        animationDelay,
      }}
      {...props}
    >
      <div className="flex flex-col items-start">
        <div className="flex gap-2">
          <Image
            src={src}
            width={150}
            height={150}
            className="h-10 w-10 rounded-full"
            alt={name}
          />
          <div>
            <h3 className="text-sm  font-medium text-neutral-500 dark:text-neutral-300">
              {name}
            </h3>
            <p className="text-sm font-normal text-neutral-500 dark:text-neutral-300">
              {designation}
            </p>
          </div>
        </div>
        <p className="text-base text-muted mt-4 dark:text-muted-dark">
          {quote}
        </p>
      </div>
    </figure>
  );
}

function TestimonialColumn({
  testimonials,
  className,
  containerClassName,
  shift = 0,
}: {
  testimonials: Testimonial[];
  className?: string;
  containerClassName?: (reviewIndex: number) => string;
  shift?: number;
}) {
  return (
    <TestimonialColumnContainer className={cn(className)} shift={shift}>
      {testimonials
        .concat(testimonials)
        .map((testimonial, testimonialIndex) => (
          <Testimonial
            name={testimonial.name}
            quote={testimonial.quote}
            src={testimonial.src}
            designation={testimonial.designation}
            key={testimonialIndex}
            className={containerClassName?.(
              testimonialIndex % testimonials.length
            )}
          />
        ))}
    </TestimonialColumnContainer>
  );
}

function splitArray<T>(array: Array<T>, numParts: number) {
  let result: Array<Array<T>> = [];
  for (let i = 0; i < array.length; i++) {
    let index = i % numParts;
    if (!result[index]) {
      result[index] = [];
    }
    result[index].push(array[i]);
  }
  return result;
}

function TestimonialGrid() {
  let columns = splitArray(testimonials, 3);
  let column1 = columns[0];
  let column2 = columns[1];
  let column3 = splitArray(columns[2], 2);
  return (
    <InViewDiv className="relative -mx-4 mt-16 grid h-[49rem] max-h-[150vh] grid-cols-1 items-start gap-8 overflow-hidden px-4 sm:mt-20 md:grid-cols-2 lg:grid-cols-3">
      <TestimonialColumn
        testimonials={[...column1, ...column3.flat(), ...column2]}
        containerClassName={(tIndex) =>
          cn(
            tIndex >= column1.length + column3[0].length && "md:hidden",
            tIndex >= column1.length && "lg:hidden"
          )
        }
        shift={10}
      />
      <TestimonialColumn
        testimonials={[...column2, ...column3[1]]}
        className="hidden md:block"
        containerClassName={(tIndex) =>
          tIndex >= column2.length ? "lg:hidden" : ""
        }
        shift={15}
      />
      <TestimonialColumn
        testimonials={column3.flat()}
        className="hidden lg:block"
        shift={10}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white dark:from-black" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white dark:from-black" />
    </InViewDiv>
  );
}
