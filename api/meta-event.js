export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  const token = process.env.META_CAPI_TOKEN;
  const pixelId = "954116897261250";
  if (!token) return res.status(500).json({ ok: false, error: "META_CAPI_TOKEN is not configured" });
  const { event_name = "PageView", event_id, event_source_url } = req.body || {};
  if (!event_id) return res.status(400).json({ ok: false, error: "event_id is required" });
  const forwarded = req.headers["x-forwarded-for"];
  const clientIp = Array.isArray(forwarded) ? forwarded[0] : (forwarded ? forwarded.split(",")[0].trim() : undefined);
  const userAgent = req.headers["user-agent"];
  const event = {event_name,event_time:Math.floor(Date.now()/1000),event_id,action_source:"website",event_source_url:event_source_url||req.headers.referer||undefined,user_data:{client_ip_address:clientIp,client_user_agent:userAgent}};
  try {
    const response = await fetch(`https://graph.facebook.com/v24.0/${pixelId}/events?access_token=${encodeURIComponent(token)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({data:[event]})});
    const result = await response.json();
    if (!response.ok) return res.status(response.status).json({ok:false,meta:result});
    return res.status(200).json({ok:true,meta:result});
  } catch (error) {
    return res.status(500).json({ok:false,error:"Meta CAPI request failed"});
  }
}