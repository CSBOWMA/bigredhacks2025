"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import HiveMap  from "./components/HiveMap";

export default function Streams() {
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <HiveMap />
    </div>
  );
}


