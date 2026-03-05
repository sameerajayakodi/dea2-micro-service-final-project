/**
 * Next.js Route Handler – proxies Eureka's /eureka/apps endpoint through the
 * API Gateway so the browser never talks to Eureka directly (avoids CORS).
 *
 * GET /api/eureka  →  returns { services: [{ name, instanceCount, status }] }
 */

export const dynamic = "force-dynamic"; // never cache

export async function GET() {
  const gatewayUrl =
    process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://131.163.97.60:8222";

  try {
    const res = await fetch(`${gatewayUrl}/eureka/apps`, {
      headers: { Accept: "application/json" },
      // 5-second timeout so the dashboard doesn't hang
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return Response.json(
        { services: [], error: `Gateway responded with ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();

    // Eureka JSON structure:
    // { applications: { application: [ { name, instance: [ { status, ... } ] } ] } }
    const apps = data?.applications?.application ?? [];

    const services = apps.map((app) => {
      const instances = Array.isArray(app.instance)
        ? app.instance
        : [app.instance];
      return {
        name: app.name, // e.g. "WORKFORCE-EQUIPMENT-SERVICE"
        instanceCount: instances.length,
        status: instances.some((i) => i.status === "UP") ? "UP" : "DOWN",
      };
    });

    return Response.json({ services });
  } catch (err) {
    console.error("Eureka proxy error:", err.message);
    return Response.json(
      { services: [], error: "Could not reach API Gateway" },
      { status: 503 }
    );
  }
}
