"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface CyberneticGridShaderProps {
  className?: string;
  /** Max device pixel ratio — lower = less GPU work. Default 1 for backgrounds. */
  maxDpr?: number;
  /** Whether to pause rendering when element is off-screen. Default true. */
  pauseOffscreen?: boolean;
}

const CyberneticGridShader: React.FC<CyberneticGridShaderProps> = ({
  className,
  maxDpr = 1,
  pauseOffscreen = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Renderer (low-power GPU preference) ──
    const renderer = new THREE.WebGLRenderer({
      antialias: false, // skip AA for a background shader
      alpha: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const clock = new THREE.Clock();

    // ── GLSL ──
    const vertexShader = /* glsl */ `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = /* glsl */ `
      precision mediump float;
      uniform vec2  iResolution;
      uniform float iTime;
      uniform vec2  iMouse;

      float random(vec2 st) {
        return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        vec2 uv    = (gl_FragCoord.xy - 0.5 * iResolution) / iResolution.y;
        vec2 mouse = (iMouse        - 0.5 * iResolution) / iResolution.y;

        float t         = iTime * 0.2;
        float mouseDist = length(uv - mouse);

        // warp near cursor
        float warp = sin(mouseDist * 20.0 - t * 4.0) * 0.1;
        warp *= smoothstep(0.4, 0.0, mouseDist);
        uv += warp;

        // grid
        vec2  gridUv = abs(fract(uv * 10.0) - 0.5);
        float line   = pow(1.0 - min(gridUv.x, gridUv.y), 50.0);

        // base colour
        vec3 color = vec3(0.1, 0.5, 1.0) * line * (0.5 + sin(t * 2.0) * 0.2);

        // energy pulses
        float energy = sin(uv.x * 20.0 + t * 5.0)
                     * sin(uv.y * 20.0 + t * 3.0);
        energy = smoothstep(0.8, 1.0, energy);
        color += vec3(1.0, 0.2, 0.8) * energy * line;

        // cursor glow
        color += vec3(1.0) * smoothstep(0.1, 0.0, mouseDist) * 0.5;

        // subtle noise
        color += random(uv + t * 0.1) * 0.05;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // ── Uniforms ──
    const uniforms = {
      iTime:       { value: 0 },
      iResolution: { value: new THREE.Vector2() },
      iMouse:      { value: new THREE.Vector2(0, 0) },
    };

    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh     = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // ── Resize (fill parent container) ──
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h);
      uniforms.iResolution.value.set(
        w * Math.min(window.devicePixelRatio, maxDpr),
        h * Math.min(window.devicePixelRatio, maxDpr),
      );
    };

    const ro = new ResizeObserver(() => onResize());
    ro.observe(container);
    onResize();

    // ── Mouse (throttled via rAF) ──
    let mouseRaf = 0;
    const onMouseMove = (e: MouseEvent) => {
      if (mouseRaf) return;
      mouseRaf = requestAnimationFrame(() => {
        mouseRaf = 0;
        uniforms.iMouse.value.set(
          e.clientX * Math.min(window.devicePixelRatio, maxDpr),
          (container.clientHeight - e.clientY) * Math.min(window.devicePixelRatio, maxDpr),
        );
      });
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // ── Visibility: pause when off-screen ──
    let isVisible = true;
    let observer: IntersectionObserver | null = null;

    if (pauseOffscreen) {
      observer = new IntersectionObserver(
        ([entry]) => { isVisible = entry.isIntersecting; },
        { threshold: 0.05 },
      );
      observer.observe(container);
    }

    // ── Render loop ──
    renderer.setAnimationLoop(() => {
      if (!isVisible) return; // skip GPU work entirely when off-screen
      uniforms.iTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    });

    // ── Cleanup ──
    return () => {
      ro.disconnect();
      observer?.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      if (mouseRaf) cancelAnimationFrame(mouseRaf);

      renderer.setAnimationLoop(null);
      renderer.domElement.remove();
      material.dispose();
      geometry.dispose();
      renderer.dispose();
    };
  }, [maxDpr, pauseOffscreen]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
      aria-label="Cybernetic Grid animated background"
    />
  );
};

export default CyberneticGridShader;
