/** biome-ignore-all lint/complexity/noForEach: Video.js players */
"use client";

import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import type { VideoJsPlayer } from "video.js";
import videojs from "video.js";

interface VideoJSPlayerProps {
  html: string;
}

export default function VideoJSPlayer({ html }: VideoJSPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playersRef = useRef<VideoJsPlayer[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    // Use requestAnimationFrame to ensure DOM is ready
    const rafId = requestAnimationFrame(() => {
      // Initialize Video.js players
      const videoNodes = Array.from(
        container.querySelectorAll<HTMLVideoElement>(
          "[data-videojs-player='true']"
        )
      );

      videoNodes.forEach((node, index) => {
        if (node.dataset.videojsHydrated === "true") {
          return;
        }

        const src = node.dataset.videoSrc;
        if (!src) {
          console.warn(
            `[VideoJS] Video element ${index} missing data-video-src attribute`
          );
          return;
        }

        const type = node.dataset.videoType ?? "video/mp4";

        try {
          node.classList.add("bg-transparent");
          node.style.backgroundColor = "transparent";

          const player = videojs(node, {
            controls: true,
            preload: "auto",
            responsive: true,
            fluid: true,
            controlBar: {
              playToggle: true,
            },
            sources: [
              {
                src,
                type,
              },
            ],
          });

          const playerEl = player.el() as HTMLElement | undefined;
          if (playerEl) {
            playerEl.style.backgroundColor = "transparent";
            playerEl.style.position = "relative";

            const tech = playerEl.querySelector<HTMLElement>(".vjs-tech");
            if (tech) {
              tech.style.backgroundColor = "transparent";
            }

            // Force center the big play button
            const bigPlayButton = playerEl.querySelector<HTMLElement>(
              ".vjs-big-play-button"
            );
            if (bigPlayButton) {
              bigPlayButton.style.position = "absolute";
              bigPlayButton.style.top = "50%";
              bigPlayButton.style.left = "50%";
              bigPlayButton.style.transform = "translate(-50%, -50%)";
              bigPlayButton.style.margin = "0";
            }
          }

          if (node.dataset.videoTitle) {
            player.el()?.setAttribute("aria-label", node.dataset.videoTitle);
          }

          if (node.dataset.videoPoster) {
            player.poster(node.dataset.videoPoster);
          }

          playersRef.current.push(player);
          node.dataset.videojsHydrated = "true";
        } catch (error) {
          // Mark as hydrated even on failure to prevent retry loops
          node.dataset.videojsHydrated = "true";
        }
      });

      // Initialize Vimeo embeds
      const vimeoContainers = Array.from(
        container.querySelectorAll<HTMLDivElement>(".vimeo-embed-container")
      );

      vimeoContainers.forEach((vimeoContainer, index) => {
        if (vimeoContainer.dataset.vimeoHydrated === "true") {
          return;
        }

        const vimeoId = vimeoContainer.dataset.vimeoId;
        const vimeoHash = vimeoContainer.dataset.vimeoHash;
        const embedUrl = vimeoContainer.dataset.vimeoEmbedUrl;

        if (!(vimeoId && embedUrl)) {
          console.warn(
            `[Vimeo] Embed ${index} missing required data attributes`
          );
          return;
        }

        try {
          // Create a wrapper div for the Vimeo player
          const wrapper = document.createElement("div");
          wrapper.className = "vimeo-player-wrapper my-6";

          // Create mount point for the embed
          const mountPoint = document.createElement("div");
          mountPoint.className =
            "aspect-video w-full overflow-hidden rounded-lg";
          wrapper.appendChild(mountPoint);

          // Replace the container with the wrapper
          vimeoContainer.replaceWith(wrapper);

          // Use iframe for private videos (with hash) or react-vimeo for public videos
          if (vimeoHash) {
            // Use iframe for private/unlisted videos with privacy hash
            const iframe = document.createElement("iframe");
            iframe.src = embedUrl;
            iframe.className = "h-full w-full";
            iframe.setAttribute("frameborder", "0");
            iframe.setAttribute(
              "allow",
              "autoplay; fullscreen; picture-in-picture"
            );
            iframe.setAttribute("allowfullscreen", "");
            mountPoint.appendChild(iframe);
          } else {
            // Lazy-load react-vimeo for public videos only
            import("@u-wave/react-vimeo")
              .then(({ default: Vimeo }) => {
                const root = createRoot(mountPoint);
                root.render(
                  <Vimeo className="h-full w-full" responsive video={vimeoId} />
                );
              })
              .catch((err) => {
                console.error(
                  "[Vimeo] Failed to load react-vimeo library for embed:",
                  err
                );
              });
          }

          vimeoContainer.dataset.vimeoHydrated = "true";
        } catch (error) {
          console.error("[Vimeo] Failed to initialize Vimeo player:", error);
          vimeoContainer.dataset.vimeoHydrated = "true";
        }
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      playersRef.current.forEach((player) => {
        try {
          player.dispose();
        } catch (error) {
          console.error("[VideoJS] Error disposing player:", error);
        }
      });
      playersRef.current = [];
    };
  }, [html]);

  return <div dangerouslySetInnerHTML={{ __html: html }} ref={containerRef} />;
}
