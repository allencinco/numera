import Link from "next/link";
import { ArrowRight, ArrowUpRight, Layers3, Play, Shapes } from "lucide-react";
import TopNav from "./components/TopNav";
import MathPreview from "./components/MathPreview";
import { experiments } from "./features/experiments/registry";

export default function Home() {
  return (
    <div className="landing-page">
      <TopNav />
      <main>
        <section className="hero">
          <div className="hero-art" aria-hidden="true"><MathPreview variant="curve" /></div>
          <div className="hero-content">
            <div className="eyebrow"><span /> A CREATIVE MATHEMATICS LABORATORY</div>
            <h1>Where mathematics<br /><em>becomes art.</em></h1>
            <p>Explore, shape, and create with the invisible logic of mathematics. Every equation is a starting point for discovery.</p>
            <div className="hero-actions">
              <Link className="primary-button" href="/studio">Enter the Laboratory <ArrowRight size={17} /></Link>
              <Link className="secondary-button" href="/explore"><Play size={15} fill="currentColor" /> Explore Experiments</Link>
            </div>
          </div>
          <div className="hero-stat stat-left"><span>01</span><strong>Complexity</strong><small>Infinite by nature</small></div>
          <div className="hero-stat stat-right"><span>∞</span><strong>Possibilities</strong><small>Ready to unfold</small></div>
        </section>

        <section className="featured-section">
          <div className="section-heading">
            <div><span className="kicker">THE COLLECTION</span><h2>Start with a question.</h2></div>
            <Link href="/explore">View all experiments <ArrowUpRight size={15} /></Link>
          </div>
          <div className="experiment-grid">
            {experiments.map((experiment, index) => (
              <Link className="experiment-card" href={`/studio?experiment=${experiment.id}`} key={experiment.id}>
                <div className="card-preview"><MathPreview variant={experiment.variant} compact /><span className="card-index">0{index + 1}</span></div>
                <div className="card-body">
                  <div className="card-meta"><span>{experiment.category}</span><span>{experiment.difficulty}</span></div>
                  <h3>{experiment.name}</h3><p>{experiment.description}</p><div className="card-formula">{experiment.formula}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="process-section">
          <div className="process-intro"><span className="kicker">HOW IT WORKS</span><h2>From equation<br />to experience.</h2></div>
          <div className="process-list">
            <article><span>01</span><Shapes /><div><h3>Choose a system</h3><p>Begin with a fractal, curve, wave, or generative pattern.</p></div></article>
            <article><span>02</span><Layers3 /><div><h3>Shape the variables</h3><p>Change parameters and see every relationship respond.</p></div></article>
            <article><span>03</span><ArrowUpRight /><div><h3>Create & preserve</h3><p>Save your discoveries locally and export them as artwork.</p></div></article>
          </div>
        </section>
      </main>
      <footer className="footer"><div className="brand"><span className="brand-mark"><Shapes size={15} /></span><span>NUMERA</span></div><p>Where Mathematics Becomes Art.</p><span>© 2026 Numera Laboratory</span></footer>
    </div>
  );
}
