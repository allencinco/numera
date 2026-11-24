import { Suspense } from "react";
import StudioClient from "./StudioClient";
import "../studio.css";

export default function StudioPage() {
  return <Suspense fallback={<div className="studio-loading">Loading laboratory…</div>}><StudioClient /></Suspense>;
}
