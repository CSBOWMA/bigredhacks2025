"use client";
import React, { useRef, useEffect } from "react";
import Hls from "hls.js";

export default function StreamPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const hlsUrl = "http://localhost:8081/hls/test.m3u8"; // replace with your HLS link

    if (video) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play();
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // native HLS support (Safari)
        video.src = hlsUrl;
        video.addEventListener("loadedmetadata", () => {
          video.play();
        });
      }
    }
  }, []);

  return (
    <div className="relative min-h-screen flex bg-[#322111]">
      {/* Left side: Large hexagon and floating small hexagons */}
      <div className="flex-1 flex items-center pl-24 relative">
        {/* Large hexagon container */}
        <div
          className="hexagon bg-[#c8b481] w-[800px] h-[670px] drop-shadow-2xl mt-20 flex items-center justify-center overflow-hidden"
          style={{
            clipPath:
              "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)",
          }}
        >
          {/* HLS video inside hexagon */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            controls
          />
        </div>

        {/* Small hexagons */}
        <div
          className="hexagon bg-[#c8b481] w-[119.4px] h-[100px] drop-shadow-2xl mb-20 ml-[-2rem]"
          style={{
            clipPath:
              "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)",
          }}
        />
        <div
          className="hexagon bg-[#c8b481] w-[119.4px] h-[100px] drop-shadow-2xl absolute left-10 bottom-40"
          style={{
            clipPath:
              "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)",
          }}
        />
      </div>

      {/* Right side: Chat box */}
      <div className="w-1/4 flex items-center justify-center">
        <div className="bg-[#7d664f] rounded-4xl shadow-xl p-6 w-[115%] min-h-[80vh] flex flex-col space-y-4 mt-25 mb-8 ml-[-6rem]">
          <div className="font-bold text-lg mb-2">Live Chat</div>
          <div className="flex-1 overflow-y-auto text-sm text-stone-800">
            <div className="mb-2">Welcome to the stream!</div>
          </div>
          <form className="flex">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 rounded-l-xl px-3 py-2 border border-[#bfa58b] focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#bfa58b] text-brown px-4 py-2 rounded-r-xl font-semibold"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
