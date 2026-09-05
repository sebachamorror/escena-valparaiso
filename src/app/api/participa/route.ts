import { NextResponse } from "next/server";

const KINDS = new Set(["compania", "artista", "obra", "espacio", "festival", "actividad", "documento", "fotografia", "historia"]);

/**
 * Recibe propuestas ciudadanas. Con Supabase configurado (Fase 3) las inserta en
 * `contributions` con status = 'pending'; sin configuración responde 503 con un
 * mensaje honesto. Nunca guarda datos personales sensibles.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, message: "Propuesta inválida." }, { status: 400 });
  }
  if (body.website_hp) return NextResponse.json({ ok: true, message: "Recibido." });

  const kind = String(body.kind ?? "");
  const proposal = String(body.proposal ?? "").trim();
  const name = String(body.name ?? "").trim();
  const commune = String(body.commune ?? "").trim();
  const province = String(body.province ?? "").trim();
  if (!KINDS.has(kind) || proposal.length < 20 || proposal.length > 4000 || !name || !commune || !province) {
    return NextResponse.json({ ok: false, message: "Faltan datos: tipo, nombre, provincia, comuna y una descripción de al menos 20 caracteres." }, { status: 400 });
  }
  if (/\b\d{1,2}\.\d{3}\.\d{3}-[\dkK]\b/.test(proposal)) {
    return NextResponse.json({ ok: false, message: "No incluyas RUT ni datos personales sensibles en la propuesta." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { ok: false, message: "El envío de propuestas se activa cuando conectemos la base de datos. Guarda tu texto: muy pronto podrás enviarlo." },
      { status: 503 },
    );
  }

  const record = {
    kind, name, proposal_md: proposal, commune, province,
    proposer_name: body.proposer_name ? String(body.proposer_name).slice(0, 120) : null,
    proposer_contact: body.proposer_contact ? String(body.proposer_contact).slice(0, 200) : null,
    contact_consent: body.contact_consent === "1",
    provided_source: body.provided_source ? String(body.provided_source).slice(0, 500) : null,
    attachments: [], status: "pending", note: body.ficha ? `Referida a la ficha ${String(body.ficha)}` : null,
  };
  const res = await fetch(`${url}/rest/v1/contributions`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(record),
  });
  if (!res.ok) {
    return NextResponse.json({ ok: false, message: "No pudimos guardar la propuesta. Inténtalo de nuevo más tarde." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, message: "Recibimos tu propuesta. La revisamos, buscamos fuentes y, si se confirma, la publicamos verificada." });
}
