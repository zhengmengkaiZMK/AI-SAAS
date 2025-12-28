import { Container } from "@/components/container";
import { Background } from "@/components/background";
import { 
  HomeHero, 
  HomeGridFeatures, 
  HomeTestimonials, 
  HomeCTA 
} from "@/components/home-sections";

export default function ZhHome() {
  return (
    <div className="relative">
      <div className="absolute inset-0 h-full w-full overflow-hidden ">
        <Background />
      </div>
      <Container className="flex flex-col items-center">
        <HomeHero />
        <HomeGridFeatures />
        <HomeTestimonials />
      </Container>
      <div className="relative">
        <div className="absolute inset-0 h-full w-full overflow-hidden">
          <Background />
        </div>
        <HomeCTA />
      </div>
    </div>
  );
}
