export default function BackendHome() {
  return (
    <main style={{ fontFamily: "sans-serif", padding: 24 }}>
      <h1>StatIQ AI backend</h1>
      <p>API process for the Next.js frontend (port 4000).</p>
      <ul>
        <li>
          <a href="/api/health">/api/health</a>
        </li>
        <li>POST /api/auth/login</li>
        <li>GET /api/courses</li>
        <li>GET /api/sources</li>
        <li>GET /api/skill-gap</li>
      </ul>
    </main>
  );
}
