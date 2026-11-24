"use client";

import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { useState } from "react";
import TopNav from "../components/TopNav";
import MathPreview from "../components/MathPreview";
import { experiments } from "../features/experiments/registry";
import "./explore.css";

const categories=["All","Fractals","Geometry","Patterns","Curves","Waves","Symmetry","Probability","3D"];

export default function ExplorePage(){
  const [category,setCategory]=useState("All");
  const [query,setQuery]=useState("");
  const visible=experiments.filter((item)=>(category==="All"||item.category===category)&&item.name.toLowerCase().includes(query.toLowerCase()));
  return <div className="explore-page"><TopNav/><main><header className="explore-header"><div><span className="kicker">EXPERIMENT INDEX</span><h1>Discover a system.</h1></div><label><Search/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search experiments"/></label></header><div className="category-tabs">{categories.map((item)=><button key={item} onClick={()=>setCategory(item)} className={category===item?"active":""}>{item}</button>)}</div><div className="explore-grid">{visible.map((item,index)=><Link href={`/studio?experiment=${item.id}`} className="explore-card" key={item.id}><div className="explore-preview"><MathPreview variant={item.variant} compact/><span>0{index+1}</span></div><div className="explore-card-body"><div><span>{item.category}</span><span>{item.difficulty}</span></div><h2>{item.name}</h2><p>{item.description}</p><b>Open experiment <ArrowUpRight/></b></div></Link>)}</div></main></div>;
}
