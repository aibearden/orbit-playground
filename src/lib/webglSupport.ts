/**
 * Quick probe for WebGL — globe.gl / Three need a working GL context.
 * Some Chrome profiles disable GPU ("Disabled" vendor) and still return null or a useless context.
 */
export function canCreateWebGLContext(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ??
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: false });
    if (!gl) return false;
    return !isLikelyDisabledWebGL(gl);
  } catch {
    return false;
  }
}

/** Chrome sometimes reports literal "Disabled" for VENDOR/RENDERER when GPU access is blocked. */
export function isLikelyDisabledWebGL(gl: WebGLRenderingContext | WebGL2RenderingContext): boolean {
  try {
    const vendor = String(gl.getParameter(gl.VENDOR) ?? "");
    const renderer = String(gl.getParameter(gl.RENDERER) ?? "");
    if (vendor.includes("Disabled") || renderer.includes("Disabled")) return true;
    return false;
  } catch {
    return true;
  }
}
