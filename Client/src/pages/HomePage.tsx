import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router";
import {
  GraduationCap,
  ClipboardCheck,
  Terminal,
  Cloud,
  GitBranch,
  Activity,
  Users,
  Trophy,
  ArrowRight,
  PlayCircle,
  BookOpen,
  Rocket,
  ShieldCheck,
  LineChart,
} from "lucide-react";
import {
  SiDocker,
  SiKubernetes,
  SiTerraform,
  SiAmazon,
  SiLinux,
  SiGithubactions,
  SiAnsible,
  SiPrometheus,
  SiGrafana,
  SiJenkins,
  SiHelm,
  SiNginx,
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
      icon: Terminal,
      title: "Hands-On Labs",
      description:
        "Practice on real Linux shells, Kubernetes clusters, and cloud sandboxes — not slides. Every lesson ends with an executable challenge.",
      iconColor: "text-blue-600",
      iconBgColor: "bg-blue-50",
    },
    {
      icon: ClipboardCheck,
      title: "Graded Exams & Code Reviews",
      description:
        "Local in-app exams, code-review assessments, and auto-imported Google Form quizzes — all scored and tracked per student.",
      iconColor: "text-purple-600",
      iconBgColor: "bg-purple-50",
    },
    {
      icon: GitBranch,
      title: "Real CI/CD Pipelines",
      description:
        "Ship to staging from day one. Students build GitHub Actions, Jenkins, and GitOps workflows against live repositories.",
      iconColor: "text-indigo-600",
      iconBgColor: "bg-indigo-50",
    },
    {
      icon: Cloud,
      title: "Cloud-Native Curriculum",
      description:
        "Docker, Kubernetes, Helm, Terraform, and AWS — sequenced the way real platform teams build them, with weekly checkpoints.",
      iconColor: "text-sky-600",
      iconBgColor: "bg-sky-50",
    },
    {
      icon: Activity,
      title: "Observability & SRE",
      description:
        "Prometheus, Grafana, structured logging, SLOs, and incident response drills. Learn to run systems, not just deploy them.",
      iconColor: "text-amber-600",
      iconBgColor: "bg-amber-50",
    },
    {
      icon: LineChart,
      title: "Instructor Analytics",
      description:
        "Cohort dashboards show who's stuck, who's accelerating, and which lab modules have the highest drop-off — at a glance.",
      iconColor: "text-emerald-600",
      iconBgColor: "bg-emerald-50",
    },
  ];

  const techStack = [
    { name: "Docker", category: "Containers", icon: SiDocker, iconColor: "#0DB7ED" },
    { name: "Kubernetes", category: "Orchestration", icon: SiKubernetes, iconColor: "#326CE5" },
    { name: "Terraform", category: "IaC", icon: SiTerraform, iconColor: "#7B42BC" },
    { name: "AWS", category: "Cloud", icon: SiAmazon, iconColor: "#FF9900" },
    { name: "Linux", category: "Systems", icon: SiLinux, iconColor: "#000000" },
    { name: "GitHub Actions", category: "CI/CD", icon: SiGithubactions, iconColor: "#2088FF" },
    { name: "Jenkins", category: "CI/CD", icon: SiJenkins, iconColor: "#D24939" },
    { name: "Ansible", category: "Config Mgmt", icon: SiAnsible, iconColor: "#EE0000" },
    { name: "Helm", category: "K8s Packaging", icon: SiHelm, iconColor: "#0F1689" },
    { name: "Prometheus", category: "Monitoring", icon: SiPrometheus, iconColor: "#E6522C" },
    { name: "Grafana", category: "Dashboards", icon: SiGrafana, iconColor: "#F46800" },
    { name: "NGINX", category: "Networking", icon: SiNginx, iconColor: "#009639" },
  ];

  const learningTracks = [
    {
      title: "Foundations",
      duration: "3 weeks",
      modules: ["Linux & Bash", "Networking essentials", "Git workflows", "Containers with Docker"],
    },
    {
      title: "Orchestration & IaC",
      duration: "5 weeks",
      modules: ["Kubernetes deep-dive", "Helm & operators", "Terraform on AWS", "GitOps with ArgoCD"],
    },
    {
      title: "Delivery & Reliability",
      duration: "4 weeks",
      modules: ["CI/CD pipelines", "Observability (Prometheus/Grafana)", "SLOs & incident response", "Capstone project"],
    },
  ];

  const benefits = [
    "Career-aligned DevOps curriculum, updated every cohort",
    "Real cloud labs — no theory-only modules",
    "Auto-graded exams plus instructor code reviews",
    "Per-student progress tracking and analytics",
    "Built-in role-based access for students and admins",
    "Capstone project that ships to a live environment",
  ];

  const stats = [
    { value: "12+", label: "Weeks of content" },
    { value: "80+", label: "Hands-on labs" },
    { value: "30+", label: "Graded assessments" },
    { value: "100%", label: "Cloud-native" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <Hero
        badge={
          <Badge
            variant="default"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full"
          >
            <Icon icon={Rocket} size="sm" className="text-blue-600" />
            <span>Learning Management System for DevOps Engineers</span>
          </Badge>
        }
        title={
          <>
            <Heading level={1} className="mb-6">
              Train the next generation of
            </Heading>
            <Heading level={1} gradient>
              DevOps engineers
            </Heading>
          </>
        }
        description="DevOps Results is a Learning Management System built for hands-on DevOps training. Run cohorts, assign labs, grade exams, and track every student's progress through Docker, Kubernetes, CI/CD, Terraform, AWS, and SRE — in one place."
        actions={
          <>
            {!isAuthenticated ? (
              <Button
                onClick={() => loginWithRedirect()}
                size="lg"
                className="text-lg px-8 py-6"
                aria-label="Start learning DevOps"
              >
                Start Learning Free
                <Icon icon={ArrowRight} size="md" className="ml-2" />
              </Button>
            ) : (
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link to="/student-dashboard" aria-label="Open your DevOps dashboard">
                  Go to Dashboard
                  <Icon icon={ArrowRight} size="md" className="ml-2" />
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() =>
                document.getElementById("curriculum")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Icon icon={PlayCircle} size="md" className="mr-2" />
              See the Curriculum
            </Button>
          </>
        }
      />

      {/* Stats strip */}
      <section
        aria-label="Program highlights"
        className="border-y border-border bg-background py-10 px-6"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-3xl md:text-4xl font-bold text-blue-600">{s.value}</div>
              <Text variant="body" color="muted" className="mt-1">
                {s.label}
              </Text>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <Section
        title="Everything a DevOps cohort needs"
        subtitle="Built from the ground up for teaching infrastructure, automation, and reliability — not generic coursework."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="list">
          {features.map((feature, index) => (
            <div role="listitem" key={index}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                iconColor={feature.iconColor}
                iconBgColor={feature.iconBgColor}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Curriculum / Tracks */}
      <Section
        title="The DevOps engineer learning path"
        subtitle="A 12-week sequence that mirrors how real platform teams onboard new hires."
        variant="gradient"
        titleClassName=""
      >
        <div id="curriculum" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {learningTracks.map((track, idx) => (
            <article
              key={track.title}
              className="bg-white rounded-2xl p-8 shadow-sm border border-blue-100"
              aria-labelledby={`track-${idx}`}
            >
              <div className="flex items-center justify-between mb-4">
                <Badge variant="default" className="bg-blue-100 text-blue-700">
                  Phase {idx + 1}
                </Badge>
                <Text variant="body" color="muted">
                  {track.duration}
                </Text>
              </div>
              <Heading level={3} id={`track-${idx}`} className="mb-4">
                {track.title}
              </Heading>
              <ul className="space-y-2">
                {track.modules.map((m) => (
                  <li key={m} className="flex items-start gap-2 text-sm">
                    <Icon icon={BookOpen} size="sm" className="text-blue-600 mt-0.5" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      {/* Tech Stack */}
      <Section
        title="Tools you'll actually use on the job"
        subtitle="Every track is anchored to the tools hiring managers list in DevOps and SRE job descriptions."
      >
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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

      {/* Benefits + Instructor CTA */}
      <Section title="Why teams choose DevOps Results">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Heading level={2} className="mb-6">
              An LMS that speaks DevOps
            </Heading>
            <Text variant="lead" color="muted" className="mb-8">
              Generic learning platforms weren't built for clusters, pipelines, or production
              incidents. DevOps Results was — so instructors spend time teaching, not wrestling
              with tooling.
            </Text>
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <BenefitItem key={index} text={benefit} />
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-8 text-white">
            <Heading level={3} className="mb-4 text-white">
              For instructors
            </Heading>
            <Text variant="body" className="mb-6 text-blue-100">
              Spin up a cohort, assign a lab, and watch results land in real time.
            </Text>
            <div className="space-y-3 font-mono text-sm bg-black/30 rounded-lg p-4 backdrop-blur-sm">
              <div>
                <span className="text-blue-300">$</span> create-cohort &quot;devops-2026-q2&quot;
              </div>
              <div>
                <span className="text-blue-300">$</span> assign-lab kubernetes/rbac --due 7d
              </div>
              <div>
                <span className="text-blue-300">$</span> grade-exam --auto --review code
              </div>
              <div>
                <span className="text-blue-300">$</span> export-results --format csv
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm text-blue-100">
              <Icon icon={ShieldCheck} size="sm" className="text-emerald-300" />
              Role-based access for students, instructors, and admins.
            </div>
          </div>
        </div>
      </Section>

      {/* Social proof / personas */}
      <Section
        title="Built for the people who run production"
        subtitle="Whether you're upskilling a platform team or running a public bootcamp, the workflow is the same."
        variant="gradient"
      >
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: GraduationCap,
              title: "Bootcamps",
              copy: "Run cohort after cohort with reusable curriculum, automated grading, and per-student analytics.",
            },
            {
              icon: Users,
              title: "Enterprise platform teams",
              copy: "Onboard new SREs and platform engineers with a standardized, measurable training track.",
            },
            {
              icon: Trophy,
              title: "Independent learners",
              copy: "Follow a structured DevOps path with real labs and graded checkpoints — not a YouTube playlist.",
            },
          ].map((p) => (
            <article
              key={p.title}
              className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                <Icon icon={p.icon} size="lg" className="text-blue-600" />
              </div>
              <Heading level={3} className="mb-2">
                {p.title}
              </Heading>
              <Text variant="body" color="muted">
                {p.copy}
              </Text>
            </article>
          ))}
        </div>
      </Section>

      {/* FAQ — great for SEO long-tail */}
      <Section
        title="Frequently asked questions"
        subtitle="Common questions from students and instructors evaluating DevOps Results."
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {[
            {
              q: "Who is this DevOps LMS for?",
              a: "Bootcamps, enterprise platform teams onboarding SREs, and independent learners pursuing a DevOps or cloud engineering career. The platform supports both instructor-led cohorts and self-paced study.",
            },
            {
              q: "Which technologies does the curriculum cover?",
              a: "Linux, Git, Docker, Kubernetes, Helm, Terraform, AWS, GitHub Actions, Jenkins, Ansible, Prometheus, Grafana, and NGINX — sequenced into a 12-week DevOps engineer path.",
            },
            {
              q: "How are students assessed?",
              a: "Three assessment types: local in-app exams with auto-grading, instructor-led code reviews, and imported Google Form quizzes. Every result is tracked per student and exportable.",
            },
            {
              q: "Do students get real cloud environments?",
              a: "Yes. Labs run against real Docker daemons, Kubernetes clusters, and AWS sandboxes — no toy simulators.",
            },
          ].map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-border bg-background p-5"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold">
                <span>{item.q}</span>
                <span className="text-blue-600 group-open:rotate-45 transition-transform text-2xl leading-none">
                  +
                </span>
              </summary>
              <Text variant="body" color="muted" className="mt-3">
                {item.a}
              </Text>
            </details>
          ))}
        </div>

        {/* FAQ structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "Who is this DevOps LMS for?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Bootcamps, enterprise platform teams onboarding SREs, and independent learners pursuing a DevOps or cloud engineering career.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Which technologies does the curriculum cover?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Linux, Git, Docker, Kubernetes, Helm, Terraform, AWS, GitHub Actions, Jenkins, Ansible, Prometheus, Grafana, and NGINX.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How are students assessed?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Local in-app exams with auto-grading, instructor-led code reviews, and imported Google Form quizzes — all tracked per student.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Do students get real cloud environments?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. Labs run against real Docker daemons, Kubernetes clusters, and AWS sandboxes.",
                  },
                },
              ],
            }),
          }}
        />
      </Section>

      {/* CTA */}
      <section
        aria-label="Get started with DevOps Results"
        className="py-20 px-6 bg-gradient-to-r from-blue-600 to-blue-700"
      >
        <div className="max-w-4xl mx-auto text-center">
          <Heading level={2} className="mb-4 text-white">
            Ready to train DevOps engineers who ship?
          </Heading>
          <Text variant="lead" className="mb-8 text-blue-100">
            Join the platform built for hands-on DevOps learning.
          </Text>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <Button
                onClick={() => loginWithRedirect()}
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100"
              >
                Start Learning Free
                <Icon icon={ArrowRight} size="md" className="ml-2" />
              </Button>
            ) : (
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100"
                asChild
              >
                <Link to="/student-dashboard">
                  Go to Dashboard
                  <Icon icon={ArrowRight} size="md" className="ml-2" />
                </Link>
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white/10"
              onClick={() =>
                document.getElementById("curriculum")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Icon icon={BookOpen} size="md" className="mr-2" />
              Browse the Curriculum
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export const HomePageLoader = async () => {
  return {
    message: "Welcome to DevOps Results — Learning Management System for DevOps Engineers",
  };
};
