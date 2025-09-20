"use client";

import dynamic from "next/dynamic";
import React from "react";

// Dynamically import Header with SSR disabled to avoid server/client
// markup mismatches caused by pathname-based conditional rendering.
const Header = dynamic(() => import("./Header"), { ssr: false });

export default function HeaderClient() {
  return <Header />;
}
