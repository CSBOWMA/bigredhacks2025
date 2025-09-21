"use client";

import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!username || !first_name || !last_name || !email || !password || !confirm) {
      setMessage("Please fill out all fields.");
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, first_name, last_name, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Account created successfully!");
        router.push('/login');
      } else {
        setMessage(data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Network error. Try again later.");
    }
  }

  // Moving hexagon background
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const width = 1400;
    const height = 900;
    const centerX = width / 2;
    const centerY = height / 2;

    svg.selectAll("*").remove();

    const hexagons: any[] = [];
    const screenQuadrants = [
      { baseX: centerX, baseY: centerY, density: "high" },
      { baseX: centerX - 300, baseY: centerY - 300, density: "medium" },
      { baseX: centerX, baseY: centerY - 350, density: "medium" },
      { baseX: centerX + 300, baseY: centerY - 300, density: "medium" },
      { baseX: centerX - 450, baseY: centerY, density: "low" },
      { baseX: centerX + 450, baseY: centerY, density: "low" },
      { baseX: centerX - 300, baseY: centerY + 300, density: "medium" },
      { baseX: centerX, baseY: centerY + 350, density: "medium" },
      { baseX: centerX + 300, baseY: centerY + 300, density: "medium" },
      { baseX: centerX - 500, baseY: centerY - 250, density: "sparse" },
      { baseX: centerX + 500, baseY: centerY - 250, density: "sparse" },
      { baseX: centerX - 500, baseY: centerY + 250, density: "sparse" },
      { baseX: centerX + 500, baseY: centerY + 250, density: "sparse" },
    ];

    screenQuadrants.forEach((section, sectionIndex) => {
      let spreadRadius = 120;
      let hexCount = 4;
      let baseRadius = 34;

      switch (section.density) {
        case "high":
          hexCount = 6;
          spreadRadius = 180;
          baseRadius = 46;
          break;
        case "medium":
          hexCount = 4;
          spreadRadius = 150;
          baseRadius = 40;
          break;
        case "low":
          hexCount = 3;
          spreadRadius = 120;
          baseRadius = 34;
          break;
        case "sparse":
          hexCount = 1;
          spreadRadius = 90;
          baseRadius = 28;
          break;
      }

      for (let i = 0; i < hexCount; i++) {
        const angle = (Math.PI * 2 * i) / hexCount + sectionIndex * 0.3;
        const distance = Math.random() * spreadRadius;
        const x = section.baseX + distance * Math.cos(angle) + (Math.random() - 0.5) * 40;
        const y = section.baseY + distance * Math.sin(angle) + (Math.random() - 0.5) * 40;
        const radius = baseRadius + (Math.random() - 0.5) * 12;

        hexagons.push({
          x,
          y,
          radius: Math.max(20, radius),
          dx: (Math.random() - 0.5) * 0.5,
          dy: (Math.random() - 0.5) * 0.5,
          id: `section-${sectionIndex}-${i}`,
        });
      }
    });

    const createHexPath = (radius: number) => {
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        points.push(`${x},${y}`);
      }
      return `M${points.join("L")}Z`;
    };

    const hexElements = svg
      .selectAll(".hexagon")
      .data(hexagons)
      .enter()
      .append("g")
      .attr("class", "hexagon")
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

    hexElements
      .append("path")
      .attr("d", (d) => createHexPath(d.radius))
      .attr("fill", "none")
      .attr("stroke", "#4b2a16")
      .attr("stroke-width", 3)
      .attr("stroke-opacity", 0.95);

    const animate = () => {
      hexagons.forEach((d) => {
        d.x += d.dx;
        d.y += d.dy;
        if (d.x < 0 || d.x > width) d.dx *= -1;
        if (d.y < 0 || d.y > height) d.dy *= -1;
      });
      hexElements.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 spotlight-wrap">
      <div className="honeycomb-svg-wrap" aria-hidden="true">
        <svg
          ref={svgRef}
          className="honeycomb-svg"
          width="1400"
          height="900"
          viewBox="0 0 1400 900"
          preserveAspectRatio="xMidYMid slice"
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full max-w-md bg-white/95 rounded-xl p-8 items-center shadow-2xl pop-in reflective backdrop-blur-sm border border-white/20"
      >
        <img className="w-14 m-4 floaty" src="/hivelogo2.png" alt="Hive logo" />
        <h2 className="text-2xl font-semibold mb-4">Create account</h2>

        <label className="block text-md mb-1 font-bold">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="form-input w-full mb-4 p-3 bg-stone-200 rounded-xl"
        />

        <label className="block text-md mb-1 font-bold">First name</label>
        <input
          type="text"
          value={first_name}
          onChange={(e) => setFirstName(e.target.value)}
          className="form-input w-full mb-4 p-3 bg-stone-200 rounded-xl"
        />

        <label className="block text-md mb-1 font-bold">Last name</label>
        <input
          type="text"
          value={last_name}
          onChange={(e) => setLastName(e.target.value)}
          className="form-input w-full mb-4 p-3 bg-stone-200 rounded-xl"
        />

        <label className="block text-md mb-1 font-bold">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-input w-full mb-4 p-3 bg-stone-200 rounded-xl"
        />

        <label className="block text-md mb-1 font-bold">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input w-full mb-4 p-3 bg-stone-200 rounded-xl"
        />

        <label className="block text-md mb-1 font-bold">Confirm password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="form-input w-full mb-4 p-3 bg-stone-200 rounded-xl"
        />

        <button className="w-full py-3 rounded-xl btn-brown">Create account</button>

        {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}

        <p className="mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <span
            className="text-[#3f230f] cursor-pointer font-bold hover:underline"
            onClick={() => router.push("/login")}
          >
            Log in
          </span>
        </p>
      </form>
    </div>
  );
}
