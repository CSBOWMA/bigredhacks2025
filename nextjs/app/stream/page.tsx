"use client";
import React from "react";

export default function StreamPage() {
  return (
    <div className="relative min-h-screen flex bg-[#322111]">
      {/* Left side: Large hexagon and floating small hexagons */}
      <div className="flex-1 flex items-center pl-16 relative">
        {/* Large hexagon using CSS clip-path */}
        <div
          className="hexagon bg-[#dbc48a] w-[300px] h-[300px] drop-shadow-2xl"
          style={{
            clipPath:
              "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)"
          }}
        />
      </div>
      {/* Right side: Chat box */}
      <div className="w-1/4 flex items-center justify-center">
        <div className="bg-white/80 rounded-2xl shadow-xl p-6 w-[90%] min-h-[80vh] flex flex-col space-y-4 mt-8 mb-8 ml-[-4rem]">
          <div className="font-bold text-lg text-amber-900 mb-2">Live Chat</div>
          <div className="flex-1 overflow-y-auto text-sm text-stone-800">
            {/* Chat messages go here */}
            <div className="mb-2">Welcome to the stream!</div>
          </div>
          <form className="flex">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 rounded-l-xl px-3 py-2 border border-amber-200 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-amber-400 text-white px-4 py-2 rounded-r-xl font-semibold"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

