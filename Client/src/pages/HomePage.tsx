import { useAuth0 } from "@auth0/auth0-react";
import { 
  Shield, 
  Palette, 
  Code, 
  Database, 
  Zap, 
  Lock, 
  Rocket,
  ArrowRight,
  Github,
  BookOpen
} from "lucide-react";
import {
  SiReact,
  SiTypescript,
  SiVite,
  SiExpress,
  SiMongodb,
  SiAuth0,
  SiRedux,
  SiReactquery,
  SiTailwindcss,
  SiDocker
} from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/Atoms/Badge";
import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { Icon } from "@/components/Atoms/Icon";
import { FeatureCard } from "@/components/Molecules/FeatureCard";
import { TechBadge } from "@/components/Molecules/TechBadge";
import { BenefitItem } from "@/components/Molecules/BenefitItem";
import { Section } from "@/components/Molecules/Section";
import { Hero } from "@/components/Molecules/Hero";

export default function HomePage() {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  const features = [
    {
      icon: Shield,
      title: "Auth0 Integration",
      description: "Complete JWT-based authentication with automatic user creation and token management",
      iconColor: "text-blue-600",
      iconBgColor: "bg-blue-50",
    },
    {
      icon: Palette,
      title: "Modern Design System",
      description: "Modern design system with Tailwind CSS, Radix UI, and Framer Motion animations",
      iconColor: "text-purple-600",
      iconBgColor: "bg-purple-50",
    },
    {
      icon: Code,
      title: "TypeScript First",
      description: "Full type safety across frontend and backend with comprehensive TypeScript support",
      iconColor: "text-indigo-600",
      iconBgColor: "bg-indigo-50",
    },
    {
      icon: Database,
      title: "MongoDB Ready",
      description: "Mongoose ODM with Zod validation, rate limiting, and comprehensive error handling",
      iconColor: "text-green-600",
      iconBgColor: "bg-green-50",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Vite-powered development with hot reload, React 19, and optimized production builds",
      iconColor: "text-yellow-600",
      iconBgColor: "bg-yellow-50",
    },
    {
      icon: Lock,
      title: "Production Ready",
      description: "Security features including rate limiting, CORS, JWT validation, and environment validation",
      iconColor: "text-red-600",
      iconBgColor: "bg-red-50",
    },
  ];

  const techStack = [
    { name: "React 19", category: "Frontend", icon: SiReact, iconColor: "#61DAFB" },
    { name: "TypeScript", category: "Language", icon: SiTypescript, iconColor: "#3178C6" },
    { name: "Vite", category: "Build Tool", icon: SiVite, iconColor: "#646CFF" },
    { name: "Express 5", category: "Backend", icon: SiExpress, iconColor: "#000000" },
    { name: "MongoDB", category: "Database", icon: SiMongodb, iconColor: "#47A248" },
    { name: "Auth0", category: "Auth", icon: SiAuth0, iconColor: "#EB5424" },
    { name: "Redux Toolkit", category: "State", icon: SiRedux, iconColor: "#764ABC" },
    { name: "TanStack Query", category: "Data", icon: SiReactquery, iconColor: "#FF4154" },
    { name: "Tailwind CSS", category: "Styling", icon: SiTailwindcss, iconColor: "#06B6D4" },
    { name: "Docker", category: "DevOps", icon: SiDocker, iconColor: "#0DB7ED" },
  ];

  const benefits = [
    "Automatic user creation on first login",
    "Protected routes with role-based access",
    "Comprehensive design system documentation",
    "Docker support for easy deployment",
    "Hot reload in development",
    "Production-ready configurations",
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero
        badge={
          <Badge variant="default" className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full">
            <Icon icon={Rocket} size="sm" className="text-blue-600" />
            <span>Production-Ready Template</span>
          </Badge>
        }
        title={
          <>
            <Heading level={1} className="mb-6">
              MERN Stack Template
            </Heading>
            <Heading level={1} gradient>
              with Auth0
            </Heading>
          </>
        }
        description="A modern, production-ready MERN (MongoDB, Express, React, Node.js) stack template with Auth0 authentication and a clean modern design system."
        actions={
          <>
            {!isAuthenticated ? (
              <Button 
                onClick={() => loginWithRedirect()}
                size="lg"
                className="text-lg px-8 py-6"
              >
                Get Started
                <Icon icon={ArrowRight} size="md" className="ml-2" />
              </Button>
            ) : (
              <Button 
                size="lg"
                className="text-lg px-8 py-6"
              >
                Explore Dashboard
                <Icon icon={ArrowRight} size="md" className="ml-2" />
              </Button>
            )}
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => window.open("https://github.com", "_blank")}
            >
              <Icon icon={Github} size="md" className="mr-2" />
              View on GitHub
            </Button>
          </>
        }
      />

      {/* Features Section */}
      <Section
        title="Everything You Need"
        subtitle="Built with modern best practices and production-ready features"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              iconColor={feature.iconColor}
              iconBgColor={feature.iconBgColor}
            />
          ))}
        </div>
      </Section>

      {/* Tech Stack Section */}
      <Section
        title="Built with Modern Technologies"
        subtitle="Leveraging the latest tools and frameworks for optimal performance"
        variant="gradient"
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {techStack.map((tech, index) => (
            <TechBadge 
              key={index} 
              name={tech.name} 
              category={tech.category} 
              icon={tech.icon}
              iconColor={tech.iconColor}
            />
          ))}
        </div>
      </Section>

      {/* Benefits Section */}
      <Section title="Why Choose This Template?">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Heading level={2} className="mb-6">
              Why Choose This Template?
            </Heading>
            <Text variant="lead" color="muted" className="mb-8">
              Start building your application immediately with a solid foundation 
              that includes authentication, state management, and a beautiful UI.
            </Text>
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <BenefitItem key={index} text={benefit} />
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
            <Heading level={3} className="mb-4 text-white">
              Quick Start
            </Heading>
            <div className="space-y-3 font-mono text-sm bg-black/20 rounded-lg p-4 backdrop-blur-sm">
              <div>
                <span className="text-blue-300">$</span> git clone https://github.com/...
              </div>
              <div>
                <span className="text-blue-300">$</span> cd mern-ts-template
              </div>
              <div>
                <span className="text-blue-300">$</span> npm install
              </div>
              <div>
                <span className="text-blue-300">$</span> npm run dev
              </div>
            </div>
            <Text variant="body" className="mt-4 text-blue-100">
              Get up and running in minutes, not hours.
            </Text>
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <Heading level={2} className="mb-4 text-white">
            Ready to Build Something Amazing?
          </Heading>
          <Text variant="lead" className="mb-8 text-blue-100">
            Start your next project with a production-ready foundation
          </Text>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <Button 
                onClick={() => loginWithRedirect()}
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100"
              >
                Get Started Now
                <Icon icon={ArrowRight} size="md" className="ml-2" />
              </Button>
            ) : (
              <Button 
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100"
              >
                Go to Dashboard
                <Icon icon={ArrowRight} size="md" className="ml-2" />
              </Button>
            )}
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white/10"
              onClick={() => window.open("#", "_blank")}
            >
              <Icon icon={BookOpen} size="md" className="mr-2" />
              Read Documentation
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export const HomePageLoader = async () => {
  return {
    message: "Welcome to MERN Stack Template",
  };
};
