import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SkillCard from "@/components/SkillCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, MessageCircle, Users, Zap } from "lucide-react";
import { api } from "@/lib/api";

export default function LandingPage() {
  const [featuredSkills, setFeaturedSkills] = useState<any[]>([]);

  useEffect(() => {
    api.listSkills().then(({ skills }) => {
      setFeaturedSkills(skills.slice(0, 6));
    });
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero py-24 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="animate-fade-in font-heading text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
            Share Skills,
            <br />
            Grow Together
          </h1>
          <p className="mx-auto mt-6 max-w-2xl animate-slide-up text-lg text-primary-foreground/80">
            SkillHub is the campus platform where students list skills they
            offer, discover peers to learn from, and collaborate in real time.
          </p>
          <div className="mt-10 flex justify-center gap-4 animate-slide-up">
            <Link to="/signup">
              <Button
                size="lg"
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-black hover:bg-primary-foreground/10"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center font-heading text-3xl font-bold">
            Why SkillHub?
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: BookOpen,
                title: "List Skills",
                desc: "Showcase what you can teach or share with peers.",
              },
              {
                icon: Users,
                title: "Find Peers",
                desc: "Browse skills from students across campus.",
              },
              {
                icon: MessageCircle,
                title: "Chat Live",
                desc: "Connect instantly with private real-time messaging.",
              },
              {
                icon: Zap,
                title: "Stay Updated",
                desc: "Get admin notifications about workshops & events.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-card p-6 shadow-card text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Skills */}
      {featuredSkills.length > 0 && (
        <section className="border-t border-border bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-center font-heading text-3xl font-bold">
              Recent Skills
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredSkills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  id={skill.id}
                  title={skill.title}
                  description={skill.description}
                  category={skill.category}
                  username={skill.username || "Unknown"}
                  userId={skill.user_id}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SkillHub. Built for campus collaboration.
        </div>
      </footer>
    </div>
  );
}
