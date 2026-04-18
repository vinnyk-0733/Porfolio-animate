(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/ui/cybernetic-grid-shader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.module.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const CyberneticGridShader = ({ className, maxDpr = 1, pauseOffscreen = true })=>{
    _s();
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CyberneticGridShader.useEffect": ()=>{
            const container = containerRef.current;
            if (!container) return;
            // ── Renderer (low-power GPU preference) ──
            const renderer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["WebGLRenderer"]({
                antialias: false,
                alpha: true,
                powerPreference: "low-power"
            });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
            container.appendChild(renderer.domElement);
            const scene = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Scene"]();
            const camera = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OrthographicCamera"](-1, 1, 1, -1, 0, 1);
            const clock = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Clock"]();
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
                iTime: {
                    value: 0
                },
                iResolution: {
                    value: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]()
                },
                iMouse: {
                    value: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"](0, 0)
                }
            };
            const material = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShaderMaterial"]({
                vertexShader,
                fragmentShader,
                uniforms
            });
            const geometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PlaneGeometry"](2, 2);
            const mesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Mesh"](geometry, material);
            scene.add(mesh);
            // ── Resize (fill parent container) ──
            const onResize = {
                "CyberneticGridShader.useEffect.onResize": ()=>{
                    const w = container.clientWidth;
                    const h = container.clientHeight;
                    if (w === 0 || h === 0) return;
                    renderer.setSize(w, h);
                    uniforms.iResolution.value.set(w * Math.min(window.devicePixelRatio, maxDpr), h * Math.min(window.devicePixelRatio, maxDpr));
                }
            }["CyberneticGridShader.useEffect.onResize"];
            const ro = new ResizeObserver({
                "CyberneticGridShader.useEffect": ()=>onResize()
            }["CyberneticGridShader.useEffect"]);
            ro.observe(container);
            onResize();
            // ── Mouse (throttled via rAF) ──
            let mouseRaf = 0;
            const onMouseMove = {
                "CyberneticGridShader.useEffect.onMouseMove": (e)=>{
                    if (mouseRaf) return;
                    mouseRaf = requestAnimationFrame({
                        "CyberneticGridShader.useEffect.onMouseMove": ()=>{
                            mouseRaf = 0;
                            uniforms.iMouse.value.set(e.clientX * Math.min(window.devicePixelRatio, maxDpr), (container.clientHeight - e.clientY) * Math.min(window.devicePixelRatio, maxDpr));
                        }
                    }["CyberneticGridShader.useEffect.onMouseMove"]);
                }
            }["CyberneticGridShader.useEffect.onMouseMove"];
            window.addEventListener("mousemove", onMouseMove, {
                passive: true
            });
            // ── Visibility: pause when off-screen ──
            let isVisible = true;
            let observer = null;
            if (pauseOffscreen) {
                observer = new IntersectionObserver({
                    "CyberneticGridShader.useEffect": ([entry])=>{
                        isVisible = entry.isIntersecting;
                    }
                }["CyberneticGridShader.useEffect"], {
                    threshold: 0.05
                });
                observer.observe(container);
            }
            // ── Render loop ──
            renderer.setAnimationLoop({
                "CyberneticGridShader.useEffect": ()=>{
                    if (!isVisible) return; // skip GPU work entirely when off-screen
                    uniforms.iTime.value = clock.getElapsedTime();
                    renderer.render(scene, camera);
                }
            }["CyberneticGridShader.useEffect"]);
            // ── Cleanup ──
            return ({
                "CyberneticGridShader.useEffect": ()=>{
                    ro.disconnect();
                    observer?.disconnect();
                    window.removeEventListener("mousemove", onMouseMove);
                    if (mouseRaf) cancelAnimationFrame(mouseRaf);
                    renderer.setAnimationLoop(null);
                    renderer.domElement.remove();
                    material.dispose();
                    geometry.dispose();
                    renderer.dispose();
                }
            })["CyberneticGridShader.useEffect"];
        }
    }["CyberneticGridShader.useEffect"], [
        maxDpr,
        pauseOffscreen
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: className,
        style: {
            width: "100%",
            height: "100%",
            overflow: "hidden"
        },
        "aria-label": "Cybernetic Grid animated background"
    }, void 0, false, {
        fileName: "[project]/src/components/ui/cybernetic-grid-shader.tsx",
        lineNumber: 167,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(CyberneticGridShader, "8puyVO4ts1RhCfXUmci3vLI3Njw=");
_c = CyberneticGridShader;
const __TURBOPACK__default__export__ = CyberneticGridShader;
var _c;
__turbopack_context__.k.register(_c, "CyberneticGridShader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/cybernetic-grid-shader.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/ui/cybernetic-grid-shader.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_components_ui_cybernetic-grid-shader_tsx_0ysp5um._.js.map