import { json } from "@sveltejs/kit";
import { p as prisma } from "../../../../chunks/stockEngine.js";
async function GET({ url }) {
  try {
    const q = url.searchParams.get("q")?.trim();
    if (!q) {
      const suppliers2 = await prisma.supplier.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, code: true }
      });
      return json({ ok: true, data: suppliers2 });
    }
    let suppliers;
    try {
      suppliers = await prisma.supplier.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { code: { contains: q, mode: "insensitive" } }
          ]
        },
        orderBy: { name: "asc" },
        select: { id: true, name: true, code: true }
      });
    } catch {
      const all = await prisma.supplier.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, code: true }
      });
      const ql = q.toLowerCase();
      suppliers = all.filter(
        (s) => s.name.toLowerCase().includes(ql) || s.code.toLowerCase().includes(ql)
      );
    }
    return json({ ok: true, data: suppliers });
  } catch (err) {
    return json({ ok: false, error: err.message }, { status: 500 });
  }
}
export {
  GET
};
