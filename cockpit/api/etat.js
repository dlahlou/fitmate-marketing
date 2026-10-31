// État déclaré des actions : Driss marque une action « fait » (Claude vérifie ensuite) ou « non pertinent » (avec sa raison).
// Stockage : Vercel Blob privé (fitmate-cockpit-etat), un seul fichier etat.json { id: état }.
// Un seul fichier = une opération de lecture par chargement du cockpit (l'ancien format, un fichier par action plus
// un list() à chaque lecture, a épuisé le quota du plan gratuit le 31/10/2026). L'ancien format est relu une fois puis migré.
// Le cockpit entier est derrière Vercel Authentication : seul le propriétaire peut lire ou écrire.
import { get, list, put } from '@vercel/blob';

const STATUTS = new Set(['déclaré fait', 'non pertinent', 'à faire']);
const FICHIER = 'etat.json';

async function lire(pathname) {
  const r = await get(pathname, { access: 'private' });
  return r?.statusCode === 200 ? JSON.parse(await new Response(r.stream).text()) : null;
}

async function ecrire(etat) {
  await put(FICHIER, JSON.stringify(etat), { access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true });
}

async function readAll() {
  const etat = await lire(FICHIER).catch(() => null);
  if (etat) return etat;
  // Migration depuis l'ancien format (etat/<id>.json)
  const out = {};
  const { blobs } = await list({ prefix: 'etat/' });
  for (const b of blobs) {
    const d = await lire(b.pathname);
    if (d?.id) out[d.id] = d;
  }
  await ecrire(out);
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
      const etat = await readAll();
      etat[id] = d;
      await ecrire(etat);
      return res.status(200).json(d);
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ erreur: 'méthode non permise' });
  } catch (e) {
    return res.status(503).json({ erreur: String(e?.message || e).slice(0, 200) });
  }
}
