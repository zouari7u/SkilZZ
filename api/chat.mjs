/**
 * POST /api/chat — réponses de l'agent IA du site, rédigées par Claude.
 *
 * Même contrat que le conseiller de MM Fragrances :
 *   corps    : { message, history: [{ role: 'user'|'assistant', content }] }
 *   réponse  : { reply, suggestions: [], links: [] }
 * Le navigateur complète suggestions et liens avec son moteur local.
 *
 * Déploiement : fonction serverless (Vercel : ce fichier dans /api ;
 * Netlify ou autre : même handler). Variable d'environnement requise :
 * ANTHROPIC_API_KEY. Puis, dans index.html : data-endpoint="/api/chat"
 * sur #agentPanel. Sans ça, le site garde son moteur local.
 *
 * Garde-fous : messages raccourcis, 4 derniers échanges seulement,
 * 8 requêtes par minute et par adresse IP (mémoire de l'instance).
 */
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic(); // lit ANTHROPIC_API_KEY

const SYSTEM = `Tu es l'assistant virtuel du studio SkilZZ, un studio digital qui conçoit et développe des sites, des applications mobiles, des SaaS et des contenus pour les réseaux sociaux. Sa mascotte est un fennec bleu ; tu parles en son nom, avec chaleur et simplicité.

Ce que tu sais (n'invente rien d'autre : ni prix, ni délai chiffré, ni client, ni avis) :
- Sites vitrines et e-commerce : de la page unique à la boutique complète avec paiement ; livrés : maquettes validées, site en ligne sur le nom de domaine du client, prise en main du back-office.
- Applications et SaaS : prototype cliquable testé sur le téléphone du client avant le développement ; livrés : prototype, application publiée sur l'App Store et Google Play, tableau de bord d'usage.
- Réseaux sociaux : reels, animations et visuels pour Instagram, TikTok et LinkedIn, dans l'identité de la marque ; livrés : charte des réseaux, contenus prêts à publier, gabarits réutilisables.
- Inclus dans chaque projet : pages rapides, pensées d'abord pour le téléphone, animations sur-mesure, référencement Google préparé dès la maquette, back-office pour modifier soi-même, un seul interlocuteur.
- Méthode : Écouter (premier échange, devis détaillé), Concevoir (maquettes puis prototype animé), Faire grandir (mise en ligne, suivi, contenus, nouvelles fonctions).
- Prix : selon le projet ; premier échange gratuit, puis devis détaillé ligne par ligne, sans frais cachés.
- Délais : planning fixé ensemble au démarrage, une date pour chaque validation.
- Le code, le design et les comptes appartiennent au client. Pas de template.
- Le studio peut créer logo, couleurs et univers graphique.
- Après la mise en ligne : maintenance, évolutions, contenus ; le client est formé pour modifier l'essentiel.
- Réalisation : MM Fragrances, parfumerie de niche en ligne (catalogue animé, flacons en 3D, quiz, conseiller virtuel).
- Contact : le formulaire en bas de la page.

Règles : réponds en français, en vouvoyant, en 2 ou 3 phrases courtes, en texte simple sans mise en forme. Si tu ne sais pas, dis-le et propose le formulaire de contact. Hors sujet : décline poliment. Si l'on te demande si tu es humain, réponds honnêtement que tu es l'assistant virtuel du studio.`;

const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 8;
}

function clean(history, message) {
  const out = [];
  (Array.isArray(history) ? history : []).slice(-4).forEach((m) => {
    if (!m || (m.role !== 'user' && m.role !== 'assistant')) return;
    const content = String(m.content || '').trim().slice(0, 600);
    if (!content) return;
    const prev = out[out.length - 1];
    if (prev && prev.role === m.role) prev.content += '\n' + content;
    else out.push({ role: m.role, content });
  });
  while (out.length && out[0].role !== 'user') out.shift();
  if (out.length && out[out.length - 1].role === 'user') out[out.length - 1].content += '\n' + message;
  else out.push({ role: 'user', content: message });
  return out;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ reply: 'Méthode non autorisée.' });
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  if (limited(ip)) return res.status(429).json({ reply: 'Je reprends mon souffle : reposez votre question dans quelques secondes.', suggestions: [] });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const message = String(body.message || '').trim().slice(0, 500);
  if (!message) return res.status(400).json({ reply: "Je n'ai pas reçu votre message, pouvez-vous le reformuler ?", suggestions: [] });

  try {
    const response = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 1024,
      output_config: { effort: 'low' },
      // refus d'une politique de sécurité : relance automatique sur un autre modèle
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM,
      messages: clean(body.history, message)
    });
    if (response.stop_reason === 'refusal') {
      return res.json({ reply: "Je ne peux pas répondre à ça. Pour votre projet, le formulaire de contact reste le plus simple.", suggestions: [], links: [] });
    }
    const reply = response.content.filter((b) => b.type === 'text').map((b) => b.text).join(' ').replace(/[*_#`]+/g, '').trim();
    return res.json({ reply: reply || "Je n'ai pas de réponse claire. Le studio vous répondra via le formulaire de contact.", suggestions: [], links: [] });
  } catch (err) {
    let cause = 'service indisponible';
    if (err instanceof Anthropic.RateLimitError) cause = 'limite de débit atteinte';
    else if (err instanceof Anthropic.AuthenticationError) cause = 'clé API refusée';
    else if (err instanceof Anthropic.APIConnectionError) cause = 'réseau';
    console.error('[agent] Claude en échec (' + cause + ') :', err.message);
    // 500 : le navigateur bascule sur son moteur local
    return res.status(500).json({ error: cause });
  }
}
