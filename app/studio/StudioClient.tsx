"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Download, Expand, Grid2X2, Layers3, Plus, Redo2, RotateCcw, Save, Settings, Undo2, X, ZoomIn, ZoomOut } from "lucide-react";
import { compile, type EvalFunction } from "mathjs";
import { experiments, ExperimentVariant } from "../features/experiments/registry";
import { indexedDbProjectStorage } from "../features/projects/storage";

type Params = { segments: number; rotation: number; scale: number; iterations: number; amplitude: number; frequency: number; phase: number; depth: number };
const defaults: Params = { segments: 12, rotation: 0, scale: 1, iterations: 80, amplitude: 44, frequency: 2, phase: 0, depth: 7 };

function StudioCanvas({ variant, params, canvasRef, xFormula, yFormula }: { variant: ExperimentVariant; params: Params; canvasRef: React.RefObject<HTMLCanvasElement | null>; xFormula: string; yFormula: string }) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frame = 0;
    const render = (time = 0) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#090b10";
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.strokeStyle = "rgba(255,255,255,.025)";
      ctx.lineWidth = 1;
      for (let x = rect.width / 2 % 32; x < rect.width; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, rect.height); ctx.stroke(); }
      for (let y = rect.height / 2 % 32; y < rect.height; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(rect.width, y); ctx.stroke(); }

      if (variant === "mandelbrot") {
        const pxSize = rect.width > 900 ? 3 : 4;
        for (let py = 0; py < rect.height; py += pxSize) {
          for (let px = 0; px < rect.width; px += pxSize) {
            const cx = (px / rect.width - 0.72) * 3.2 * params.scale;
            const cy = (py / rect.height - 0.5) * 2.4 * params.scale;
            let zx = 0, zy = 0, i = 0;
            while (zx*zx + zy*zy < 4 && i < params.iterations) {
              const x = zx*zx - zy*zy + cx;
              zy = 2*zx*zy + cy; zx = x; i++;
            }
            if (i < params.iterations) {
              const hue = 260 + i * 4;
              ctx.fillStyle = `hsl(${hue} 72% ${25 + i / params.iterations * 45}%)`;
              ctx.fillRect(px, py, pxSize, pxSize);
            }
          }
        }
      } else if (variant === "symmetry") {
        ctx.save(); ctx.translate(rect.width / 2, rect.height / 2); ctx.rotate(params.rotation * Math.PI / 180);
        for (let i = 0; i < params.segments; i++) {
          ctx.save(); ctx.rotate(i * Math.PI * 2 / params.segments);
          ctx.strokeStyle = i % 2 ? "#42d9c8" : "#9b8cff"; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(20 * params.scale, 0);
          ctx.bezierCurveTo(rect.width*.13*params.scale, -70*params.scale, rect.width*.2*params.scale, 70*params.scale, rect.width*.31*params.scale, 0); ctx.stroke(); ctx.restore();
        } ctx.restore();
      } else if (variant === "curve") {
        ctx.save(); ctx.translate(rect.width/2, rect.height/2); ctx.strokeStyle="#d4f36a"; ctx.lineWidth=1.5; ctx.beginPath();
        let xExpression: EvalFunction | undefined;
        let yExpression: EvalFunction | undefined;
        try {
          const xCompiled = compile(xFormula);
          const yCompiled = compile(yFormula);
          xExpression = Array.isArray(xCompiled) ? undefined : xCompiled;
          yExpression = Array.isArray(yCompiled) ? undefined : yCompiled;
        } catch {
          xExpression = undefined;
          yExpression = undefined;
        }
        for (let i=0;i<=1200;i++) {
          const t=i/1200*Math.PI*2;
          let x = 0;
          let y = 0;
          if (xExpression && yExpression) {
            try {
              x = Number(xExpression.evaluate({ t }));
              y = Number(yExpression.evaluate({ t }));
            } catch {
              x = 0;
              y = 0;
            }
          }
          const r=Math.min(rect.width,rect.height)*.34*params.scale;
          x *= r;
          y *= r;
          if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);
        } ctx.stroke(); ctx.restore();
      } else if (variant === "waves") {
        ctx.save(); ctx.lineWidth=1.5;
        for (let w=0;w<3;w++) { ctx.strokeStyle=["#9b8cff","#42d9c8","#d4f36a"][w]; ctx.beginPath(); for(let x=0;x<=rect.width;x+=3){const y=rect.height/2+Math.sin(x*.022*params.frequency+w*.9+time*.001*params.scale+(params.phase*Math.PI/180))*params.amplitude*(1-w*.12);if(x)ctx.lineTo(x,y);else ctx.moveTo(x,y);} ctx.stroke(); } ctx.restore();
        if (["waves","curve"].includes(variant)) frame = requestAnimationFrame(render);
      } else {
        const draw=(x:number,y:number,len:number,angle:number,depth:number)=>{if(depth===0)return;const x2=x+Math.cos(angle)*len,y2=y+Math.sin(angle)*len;ctx.strokeStyle=depth>3?"#9b8cff":"#42d9c8";ctx.lineWidth=depth*.45;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();draw(x2,y2,len*.72*params.scale,angle-.48,depth-1);draw(x2,y2,len*.72*params.scale,angle+.48,depth-1)};
        draw(rect.width/2,rect.height*.88,Math.min(rect.height*.24,110)*params.scale,-Math.PI/2,params.depth);
      }
    };
    render();
    const onResize=()=>render();
    window.addEventListener("resize",onResize);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener("resize",onResize)};
  }, [variant, params, canvasRef, xFormula, yFormula]);
  return <canvas ref={canvasRef} className="studio-canvas" />;
}

export default function StudioClient() {
  const searchParams = useSearchParams();
  const requested = searchParams.get("experiment");
  const initial = experiments.find((item)=>item.id===requested) || experiments[0];
  const [experimentId,setExperimentId]=useState(initial.id);
  const [params,setParams]=useState(defaults);
  const [history,setHistory]=useState<Params[]>([defaults]);
  const [historyIndex,setHistoryIndex]=useState(0);
  const [saved,setSaved]=useState(false);
  const [bottomOpen,setBottomOpen]=useState(true);
  const [xFormula,setXFormula]=useState("sin(3*t)");
  const [yFormula,setYFormula]=useState("sin(4*t)");
  const [explanationOpen,setExplanationOpen]=useState(false);
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const experiment=experiments.find((item)=>item.id===experimentId)||experiments[0];

  const validateFormula=(formula:string)=>{
    try {
      const compiled = compile(formula);
      if (Array.isArray(compiled)) return "Enter one expression only";
      compiled.evaluate({ t: 0 });
      return "";
    } catch (error) {
      return error instanceof Error ? error.message : "Invalid expression";
    }
  };
  const formulaError=[validateFormula(xFormula),validateFormula(yFormula)].find(Boolean);

  const setPreset=(preset:"circle"|"lissajous"|"rose")=>{
    if(preset==="circle"){setXFormula("cos(t)");setYFormula("sin(t)");}
    if(preset==="lissajous"){setXFormula("sin(3*t)");setYFormula("sin(4*t)");}
    if(preset==="rose"){setXFormula("cos(5*t)*cos(t)");setYFormula("cos(5*t)*sin(t)");}
  };

  const explanationMap: Record<ExperimentVariant,{principle:string;how:string;change:string;try:string}>={
    mandelbrot:{principle:"Complex numbers extend real numbers into a plane with real and imaginary axes.",how:"Each pixel represents a complex number c. Repeatedly squaring and adding c reveals whether the point escapes toward infinity.",change:"Increase iterations to resolve finer boundaries. Zoom toward the edges to reveal new detail.",try:"Move toward -0.745 + 0.113i and compare the shape you see."},
    symmetry:{principle:"A radial pattern is created by rotating a base shape around a common center.",how:"The generator repeats and reflects geometry at evenly spaced angles.",change:"Changing segments increases or decreases rotational repetition. Rotation offsets the entire system.",try:"Try 12 segments, then mirror or rotate the pattern by 15 degrees."},
    curve:{principle:"Parametric curves place x and y under one shared parameter, t.",how:"At each value of t, mathjs evaluates x(t) and y(t), and the canvas connects those points.",change:"Changing the frequencies in x(t) or y(t) changes how many loops appear.",try:"Set x(t) = sin(3*t) and y(t) = sin(4*t), then try cos(t) and sin(t)."},
    waves:{principle:"Waves describe repeated oscillation through amplitude, frequency, and phase.",how:"The curve combines a sine function with position and time to create interference.",change:"Amplitude changes height, frequency changes density, and phase shifts the curve horizontally.",try:"Set two frequencies close together and watch their interference."},
    recursive:{principle:"Recursive systems apply a rule repeatedly to smaller or transformed copies.",how:"A branch creates two smaller branches until the selected depth is reached.",change:"Depth adds detail but grows the number of segments exponentially.",try:"Increase depth slowly, then reduce scale to keep the pattern contained."},
  };

  const update=(key:keyof Params,value:number)=>{
    const next={...params,[key]:value}; setParams(next);
    const newHistory=[...history.slice(0,historyIndex+1),next]; setHistory(newHistory.slice(-30)); setHistoryIndex(newHistory.slice(-30).length-1);
  };
  const undo=()=>{if(historyIndex>0){const i=historyIndex-1;setHistoryIndex(i);setParams(history[i]);}};
  const redo=()=>{if(historyIndex<history.length-1){const i=historyIndex+1;setHistoryIndex(i);setParams(history[i]);}};
  const save=async()=>{
    await indexedDbProjectStorage.saveProject({id:crypto.randomUUID(),name:experiment.name,experimentId,parameters:{...params,xFormula,yFormula} as unknown as Record<string,number|string>,createdAt:Date.now(),updatedAt:Date.now()});
    setSaved(true); setTimeout(()=>setSaved(false),1800);
  };
  const exportPng=()=>{const canvas=canvasRef.current;if(!canvas)return;const link=document.createElement("a");link.download=`numera-${experimentId}.png`;link.href=canvas.toDataURL("image/png");link.click()};
  const full=()=>canvasRef.current?.parentElement?.requestFullscreen();

  const range=(key:keyof Params,label:string,min:number,max:number,step=1)=>(
    <label className="range-control" key={key}><div><span>{label}</span><output>{params[key]}</output></div><input type="range" min={min} max={max} step={step} value={params[key]} onChange={(event)=>update(key,Number(event.target.value))}/></label>
  );

  return (
    <div className="studio-shell">
      <header className="studio-topbar">
        <div className="studio-brand"><span className="brand-mark"><Grid2X2 size={15}/></span><strong>NUMERA</strong></div>
        <div className="experiment-title"><span>WORKSPACE</span><ChevronDown size={13}/><b>{experiment.name}</b></div>
        <div className="studio-actions"><button onClick={undo} title="Undo" disabled={historyIndex===0}><Undo2/></button><button onClick={redo} title="Redo" disabled={historyIndex===history.length-1}><Redo2/></button><button onClick={save} className={saved?"saved":""}><Save/> {saved?"Saved":"Save"}</button><button onClick={exportPng}><Download/> Export</button></div>
      </header>
      <aside className="experiment-sidebar">
        <div className="sidebar-heading"><span>EXPERIMENTS</span><button title="New experiment"><Plus/></button></div>
        <div className="experiment-list">{experiments.map((item)=><button key={item.id} onClick={()=>setExperimentId(item.id)} className={experimentId===item.id?"active":""}><span><Layers3/></span><div><b>{item.name}</b><small>{item.category}</small></div></button>)}</div>
        <div className="saved-area"><span>SAVED ON THIS DEVICE</span><button onClick={save}><span>+</span> Save current project</button></div>
      </aside>
      <main className="studio-main">
        <div className="canvas-toolbar"><div><span className="status-dot"/> LIVE PREVIEW</div><div><button title="Zoom out"><ZoomOut/></button><span>100%</span><button title="Zoom in"><ZoomIn/></button><button onClick={()=>setParams(defaults)} title="Reset"><RotateCcw/></button><button onClick={full} title="Fullscreen"><Expand/></button></div></div>
        <div className="canvas-stage"><StudioCanvas variant={experiment.variant} params={params} canvasRef={canvasRef} xFormula={xFormula} yFormula={yFormula}/></div>
        {bottomOpen&&<section className="formula-panel"><button onClick={()=>setBottomOpen(false)} className="panel-close">−</button><span>FORMULA</span><div>{experiment.variant==="curve"?`x(t) = ${xFormula}  ·  y(t) = ${yFormula}`:experiment.formula}</div><p><b>{experiment.name}</b> — <span>{experiment.description}</span></p></section>}
        {!bottomOpen&&<button className="panel-reopen" onClick={()=>setBottomOpen(true)}>Formula + explanation</button>}
      </main>
      <aside className="properties-panel">
        <div className="properties-heading"><span>PROPERTIES</span><Settings/></div>
        {experiment.variant==="curve"&&<div className="property-section formula-editor">
          <h4>Equation editor</h4>
          <label><span>x(t)</span><input value={xFormula} onChange={(event)=>setXFormula(event.target.value)} spellCheck={false}/></label>
          <label><span>y(t)</span><input value={yFormula} onChange={(event)=>setYFormula(event.target.value)} spellCheck={false}/></label>
          {formulaError&&<p className="formula-error">{formulaError}</p>}
          <div className="formula-presets">
            <button onClick={()=>setPreset("circle")}>Circle</button>
            <button onClick={()=>setPreset("lissajous")}>Lissajous</button>
            <button onClick={()=>setPreset("rose")}>Rose</button>
          </div>
          <p className="formula-reference">Try: sin(t), cos(t), pi, abs(t), sqrt(t)</p>
        </div>}
        <div className="property-section"><h4>Parameters</h4>
          {(experiment.variant==="symmetry"||experiment.variant==="recursive")&&range("segments","Segments",3,24)}
          {experiment.variant==="symmetry"&&range("rotation","Rotation",0,360)}
          {(experiment.variant==="symmetry"||experiment.variant==="curve"||experiment.variant==="recursive")&&range("scale","Scale",.4,2,.1)}
          {experiment.variant==="mandelbrot"&&range("iterations","Iterations",20,180,1)}
          {experiment.variant==="mandelbrot"&&range("scale","Zoom",.6,3,.1)}
          {experiment.variant==="waves"&&range("amplitude","Amplitude",10,100)}
          {experiment.variant==="waves"&&range("frequency","Frequency",.5,5,.1)}
          {(experiment.variant==="waves"||experiment.variant==="curve")&&range("phase","Phase",0,360,1)}
          {experiment.variant==="recursive"&&range("depth","Depth",2,10)}
        </div>
        <div className="property-section"><h4>Appearance</h4><div className="color-row"><label>Primary</label><input type="color" defaultValue="#9b8cff"/></div><div className="color-row"><label>Secondary</label><input type="color" defaultValue="#42d9c8"/></div></div>
        <div className="property-section learn"><h4>Learning note</h4><p>{experiment.variant==="mandelbrot"?"Each point is tested under repeated iteration; surviving points reveal the set.":"Change a parameter and watch the mathematical relationship produce a new structure."}</p><button onClick={()=>setExplanationOpen(true)}>Open explanation</button></div>
      </aside>
      {explanationOpen&&<div className="explanation-backdrop" role="dialog" aria-modal="true" aria-label={`${experiment.name} explanation`} onMouseDown={(event)=>{if(event.target===event.currentTarget)setExplanationOpen(false)}}><section className="explanation-modal">
        <button className="explanation-close" onClick={()=>setExplanationOpen(false)} aria-label="Close explanation"><X/></button>
        <span className="kicker">LEARNING NOTE · {experiment.difficulty}</span>
        <h2>{experiment.name}</h2>
        <div className="explanation-grid">
          <article><span>01</span><h3>What am I looking at?</h3><p>{explanationMap[experiment.variant].principle}</p></article>
          <article><span>02</span><h3>How does it work?</h3><p>{explanationMap[experiment.variant].how}</p></article>
          <article><span>03</span><h3>What happens if I change it?</h3><p>{explanationMap[experiment.variant].change}</p></article>
          <article><span>04</span><h3>Try this</h3><p>{explanationMap[experiment.variant].try}</p></article>
        </div>
        {experiment.variant==="curve"&&<div className="explanation-example"><span>EXAMPLE FORMULAS</span><code>x(t) = cos(3*t)</code><code>y(t) = sin(4*t)</code></div>}
      </section></div>}
    </div>
  );
}
