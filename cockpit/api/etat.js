// État déclaré des actions : Driss marque une action « fait » (Claude vérifie ensuite) ou « non pertinent » (avec sa raison).
// Stockage : Vercel Blob privé (fitmate-cockpit-etat), un fichier par action : etat/<id>.json.
// Le cockpit entier est derrière Vercel Authentication : seul le propriétaire peut lire ou écrire.
import { get, list, put } from '@vercel/blob';

const STATUTS = new Set(['déclaré fait', 'non pertinent', 'à faire']);
const key = (id) => `etat/${encodeURIComponent(id)}.json`;

async function readAll() {
  const out = {};
  const { blobs } = await list({ prefix: 'etat/' });
  await Promise.all(blobs.map(async (b) => {
    const r = await get(b.pathname, { access: 'private', useCache: false });
    if (r?.statusCode === 200) {
      const d = JSON.parse(await new Response(r.stream).text());
      out[d.id] = d;
    }
  }));
  return out;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') return res.status(200).json(await readAll());
    if (req.method === 'POST') {
      const { id, statut, note } = req.body || {};
      if (typeof id !== 'string' || !id || id.length > 120 || !STATUTS.has(statut)) {
        return res.status(400).json({ erreur: 'id ou statut invalide' });
      }
      const d = { id, statut, note: typeof note === 'string' ? note.slice(0, 500) : '', date: new Date().toISOString() };
      await put(key(id), JSON.stringify(d), { access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true });
      return res.status(200).json(d);
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ erreur: 'méthode non permise' });
  } catch (e) {
    return res.status(500).json({ erreur: String(e?.message || e).slice(0, 200) });
  }
}
