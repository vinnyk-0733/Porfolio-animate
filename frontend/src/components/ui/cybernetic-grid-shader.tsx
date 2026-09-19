"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { watchVisualActivity } from "@/lib/visual-activity";

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
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false, // skip AA for a background shader
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      // Keep the page usable on devices without an available WebGL context.
      return;
    }
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

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

    let active = false;
    let reducedMotion = false;
    let touch = false;
    let compact = false;
    let contextLost = false;
    let frame = 0;
    let lastTime = 0;
    let pixelRatio = 1;
    let listeningForMouse = false;

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    };

    const render = (time: number) => {
      frame = 0;
      if (!active || contextLost) return;
      if (!reducedMotion && lastTime) {
        // Do not fast-forward the animation after scrolling or a hidden tab.
        uniforms.iTime.value += Math.min((time - lastTime) / 1000, 0.05);
      }
      lastTime = time;
      renderer.render(scene, camera);
      if (!reducedMotion) frame = requestAnimationFrame(render);
    };

    const requestRender = () => {
      if (active && !contextLost && !frame) frame = requestAnimationFrame(render);
    };

    // ── Resize (CSS dimensions and drawing-buffer dimensions stay in sync) ──
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      const cap = Math.min(maxDpr, compact || touch ? 1 : 1.5);
      pixelRatio = Math.min(window.devicePixelRatio || 1, Math.max(0.5, cap));
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.getDrawingBufferSize(uniforms.iResolution.value);
      requestRender();
    };

    // Uniform updates are consumed by the existing frame, without React renders
    // or a second animation loop. Touch scrolling never installs this listener.
    const onMouseMove = (e: MouseEvent) => {
      if (!active) return;
      const bounds = container.getBoundingClientRect();
      uniforms.iMouse.value.set(
        (e.clientX - bounds.left) * pixelRatio,
        (bounds.bottom - e.clientY) * pixelRatio,
      );
    };

    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      stop();
    };
    const onContextRestored = () => {
      contextLost = false;
      onResize();
    };
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);
    renderer.domElement.addEventListener("webglcontextrestored", onContextRestored);

    const ro = new ResizeObserver(onResize);
    ro.observe(container);
    window.addEventListener("resize", onResize, { passive: true });
    const stopWatching = watchVisualActivity(container, (state) => {
      const qualityChanged = compact !== state.compact || touch !== state.touch;
      active = state.active;
      reducedMotion = state.reducedMotion;
      compact = state.compact;
      touch = state.touch;

      const shouldListen = active && !touch && !reducedMotion;
      if (shouldListen !== listeningForMouse) {
        window.removeEventListener("mousemove", onMouseMove);
        if (shouldListen) window.addEventListener("mousemove", onMouseMove, { passive: true });
        listeningForMouse = shouldListen;
      }
      stop();
      if (qualityChanged || uniforms.iResolution.value.x === 0) onResize();
      requestRender();
    }, { pauseOffscreen, pauseOnScroll: true });

    // ── Cleanup ──
    return () => {
      ro.disconnect();
      stopWatching();
      stop();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      renderer.domElement.removeEventListener("webglcontextrestored", onContextRestored);
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
