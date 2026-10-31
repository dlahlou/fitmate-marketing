// État déclaré des actions : Driss marque une action « fait » (Claude vérifie ensuite) ou « non pertinent » (avec sa raison).
// Stockage : Edge Config « fitmate-cockpit-etat » (un seul élément « etat » = { id: état }). Remplace Vercel Blob, dont le
// quota du plan gratuit a été épuisé le 31/10/2026. Lecture : connexion EDGE_CONFIG (ajoutée en reliant le stockage au
// projet). Écriture : API Vercel avec le jeton VERCEL_API_TOKEN (variable du projet, jamais dans le code).
// Le cockpit entier est derrière Vercel Authentication : seul le propriétaire peut lire ou écrire.
import { get } from '@vercel/edge-config';

const STORE = 'ecfg_prcoe8irbvyxbsbe5ue2ahximr9v';
const TEAM = 'team_GuHZIYsuWwAvM3DLTs6foS7y';
const STATUTS = new Set(['déclaré fait', 'non pertinent', 'à faire']);

async function lire() {
  if (!process.env.EDGE_CONFIG) throw new Error('stockage non relié au projet (variable EDGE_CONFIG absente)');
  return (await get('etat')) || {};
}

async function ecrire(etat) {
  const tok = process.env.VERCEL_API_TOKEN;
  if (!tok) throw new Error('jeton VERCEL_API_TOKEN absent : impossible d’enregistrer');
  const r = await fetch(`https://api.vercel.com/v1/edge-config/${STORE}/items?teamId=${TEAM}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [{ operation: 'upsert', key: 'etat', value: etat }] }),
  });
  if (!r.ok) throw new Error(`écriture refusée par Vercel (${r.status})`);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') return res.status(200).json(await lire());
    if (req.method === 'POST') {
      const { id, statut, note } = req.body || {};
      if (typeof id !== 'string' || !id || id.length > 120 || !STATUTS.has(statut)) {
        return res.status(400).json({ erreur: 'id ou statut invalide' });
      }
      const d = { id, statut, note: typeof note === 'string' ? note.slice(0, 500) : '', date: new Date().toISOString() };
      const etat = { ...(await lire()), [id]: d };
      await ecrire(etat);
      return res.status(200).json(d);
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ erreur: 'méthode non permise' });
  } catch (e) {
    return res.status(503).json({ erreur: String(e?.message || e).slice(0, 200) });
  }
}
