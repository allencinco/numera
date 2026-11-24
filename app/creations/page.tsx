"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Copy, Download, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import TopNav from "../components/TopNav";
import MathPreview from "../components/MathPreview";
import { indexedDbProjectStorage, Project } from "../features/projects/storage";
import { experiments } from "../features/experiments/registry";
import "./creations.css";

export default function CreationsPage(){
  const [projects,setProjects]=useState<Project[]>([]);
  const [query,setQuery]=useState("");
  const [sort,setSort]=useState("recent");
  const fileRef=useRef<HTMLInputElement>(null);
  const refresh=async()=>setProjects(await indexedDbProjectStorage.getAllProjects());
  useEffect(()=>{ indexedDbProjectStorage.getAllProjects().then((items)=>setProjects(items)); },[]);
  const remove=async(id:string)=>{await indexedDbProjectStorage.deleteProject(id);refresh()};
  const duplicate=async(id:string)=>{await indexedDbProjectStorage.duplicateProject(id);refresh()};
  const rename=async(project:Project)=>{const name=window.prompt("Rename project",project.name);if(name?.trim()){await indexedDbProjectStorage.updateProject({...project,name:name.trim(),updatedAt:project.updatedAt});refresh()}};
  const exportJson=(project:Project)=>{const blob=new Blob([JSON.stringify(project,null,2)],{type:"application/json"});const link=document.createElement("a");link.href=URL.createObjectURL(blob);link.download=`${project.name}.numera.json`;link.click();URL.revokeObjectURL(link.href)};
  const importJson=async(file?:File)=>{if(!file)return;try{const project=JSON.parse(await file.text()) as Project;project.id=crypto.randomUUID();project.createdAt=Date.now();project.updatedAt=Date.now();await indexedDbProjectStorage.saveProject(project);refresh()}catch{alert("This file is not a valid Numera project.")}};
  let visible=projects.filter((project)=>project.name.toLowerCase().includes(query.toLowerCase()));
  visible=[...visible].sort((a,b)=>sort==="name"?a.name.localeCompare(b.name):b.updatedAt-a.updatedAt);
  return <div className="creations-page"><TopNav/><main><header className="creations-header"><div><span className="kicker">YOUR LIBRARY</span><h1>My Creations</h1><p>Projects are saved locally on this device.</p></div><div><input ref={fileRef} type="file" accept=".json,.numera.json" hidden onChange={(e)=>importJson(e.target.files?.[0])}/><button onClick={()=>fileRef.current?.click()} className="import-button">Import project</button><Link href="/studio" className="new-button"><Plus/> New experiment</Link></div></header><div className="library-toolbar"><label><Search/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search projects"/></label><select value={sort} onChange={(e)=>setSort(e.target.value)}><option value="recent">Recently modified</option><option value="name">Name</option></select></div>{visible.length?<div className="project-grid">{visible.map((project)=>{const experiment=experiments.find((item)=>item.id===project.experimentId)||experiments[0];return <article className="project-card" key={project.id}><Link href={`/studio?experiment=${experiment.id}`} className="project-preview"><MathPreview variant={experiment.variant} compact/><span>NUMERA</span></Link><div className="project-info"><div><h2>{project.name}</h2><span>{experiment.category}</span></div><details><summary><MoreHorizontal/></summary><div className="project-menu"><button onClick={()=>rename(project)}>Rename</button><button onClick={()=>duplicate(project.id)}><Copy/> Duplicate</button><button onClick={()=>exportJson(project)}><Download/> Export JSON</button><button onClick={()=>remove(project.id)}><Trash2/> Delete</button></div></details></div></article>})}</div>:<div className="empty-library"><div><Plus/></div><h2>No creations yet</h2><p>Open the laboratory, shape an experiment, and save your first project.</p><Link href="/studio">Enter the Laboratory</Link></div>}</main></div>;
}
