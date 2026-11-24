export type ExperimentVariant = "mandelbrot" | "symmetry" | "curve" | "waves" | "recursive";

export type Experiment = {
  id: string;
  name: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  variant: ExperimentVariant;
  formula: string;
};

export const experiments: Experiment[] = [
  { id: "fractal", name: "Fractal Explorer", category: "Fractals", difficulty: "Advanced", description: "Navigate the boundary where order dissolves into infinite complexity.", variant: "mandelbrot", formula: "zₙ₊₁ = zₙ² + c" },
  { id: "symmetry", name: "Geometric Symmetry", category: "Geometry", difficulty: "Beginner", description: "Explore radial repetition, reflection, and rotational harmony.", variant: "symmetry", formula: "R(θ) = [cos θ, sin θ]" },
  { id: "curves", name: "Parametric Curves", category: "Curves", difficulty: "Intermediate", description: "Shape motion through paired equations and evolving parameters.", variant: "curve", formula: "x(t), y(t)" },
  { id: "waves", name: "Mathematical Waves", category: "Waves", difficulty: "Beginner", description: "Combine oscillations and reveal the structure of interference.", variant: "waves", formula: "y = A sin(kx − ωt + φ)" },
  { id: "recursive", name: "Recursive Patterns", category: "Patterns", difficulty: "Intermediate", description: "Generate branching systems through a few repeating rules.", variant: "recursive", formula: "Fₙ = Fₙ₋₁ + Fₙ₋₂" },
];
