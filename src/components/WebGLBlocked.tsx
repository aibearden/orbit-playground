export default function WebGLBlocked() {
  return (
    <div className="webgl-fallback" role="alert">
      <h2>WebGL is not available</h2>
      <p>
        This view needs <strong>WebGL</strong> (GPU). Chrome is not creating a graphics context (
        <code>Sandboxed = yes</code> / <code>GL_RENDERER = Disabled</code> usually means the GPU path is
        blocked).
      </p>
      <ol>
        <li>
          Chrome → <strong>Settings</strong> → <strong>System</strong> → turn on{" "}
          <strong>Use graphics acceleration when available</strong>, then restart Chrome.
        </li>
        <li>
          Visit <code className="mono">chrome://gpu</code> and confirm WebGL is not listed as disabled.
        </li>
        <li>
          Disable extensions that force software rendering or privacy GPU blocking, or try a fresh Chrome
          profile.
        </li>
        <li>
          On macOS, quit apps that monopolize the GPU; on laptops, plug in power and retry.
        </li>
      </ol>
      <p className="hint">The in-editor Simple Browser may use different GPU rules than standalone Chrome.</p>
    </div>
  );
}
