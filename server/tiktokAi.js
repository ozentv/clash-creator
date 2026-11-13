import Anthropic from '@anthropic-ai/sdk';
import { computeStats, rankMembers } from '../src/lib/rankings.js';

// Génération du texte TikTok par Claude. Actif seulement si ANTHROPIC_API_KEY est défini.

const STYLE_BRIEFS = {
  hype: 'Ton hype et enthousiaste : mets en valeur le clan et ses meilleurs joueurs.',
  clash: 'Ton taquin et moqueur mais bon enfant : chambre gentiment les mauvais donateurs, sans insulte.',
  recrutement: 'Objectif recrutement : donne envie de rejoindre le clan et rappelle son tag.',
};

const SYSTEM = `Tu écris des textes TikTok en français pour des créateurs de contenu Clash of Clans.
Le texte sert de voix off ou de description : une accroche forte dès la première ligne, des lignes courtes, quelques emojis, un appel à commenter à la fin, puis une ligne de 5 à 8 hashtags.
N'utilise que les chiffres et les pseudos fournis, sans rien inventer. Entre 80 et 140 mots.
Réponds uniquement avec le texte prêt à copier, sans introduction ni commentaire.`;

export const aiEnabled = Boolean(process.env.ANTHROPIC_API_KEY?.trim());
const client = aiEnabled ? new Anthropic() : null;

export class AiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function buildPrompt(clan, style) {
  const stats = computeStats(clan.members);
  const line = (key) => (m) => `${m.rank}. ${m.name} : ${m[key]}`;
  const byDonations = rankMembers(clan.members, 'donations');
  return [
    `Style demandé : ${STYLE_BRIEFS[style]}`,
    '',
    `Clan : ${clan.name} (${clan.tag}), niveau ${clan.level}`,
    clan.warLeague ? `Ligue de guerre : ${clan.warLeague}` : null,
    `Membres : ${stats.count}/50`,
    `Trophées cumulés : ${stats.totalTrophies} (moyenne ${stats.avgTrophies})`,
    `Dons de la saison : ${stats.totalDonations} (moyenne ${stats.avgDonations})`,
    `Membres à 0 don : ${stats.inactiveDonors}`,
    '',
    'Top 5 trophées :',
    ...rankMembers(clan.members, 'trophies').slice(0, 5).map(line('trophies')),
    '',
    'Top 5 dons :',
    ...byDonations.slice(0, 5).map(line('donations')),
    '',
    'Les 3 plus petits donateurs :',
    ...byDonations.slice(-3).map(line('donations')),
  ]
    .filter((l) => l !== null)
    .join('\n');
}

export function isValidStyle(style) {
  return Object.hasOwn(STYLE_BRIEFS, style);
}

export async function generateWithAi(clan, style) {
  let response;
  try {
    response = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      output_config: { effort: 'low' },
      // Si le modèle décline la demande, l'API la rejoue sur un modèle de secours.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM,
      messages: [{ role: 'user', content: buildPrompt(clan, style) }],
    });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      throw new AiError(502, 'Clé ANTHROPIC_API_KEY invalide.');
    }
    if (err instanceof Anthropic.RateLimitError) {
      throw new AiError(429, "Limite de requêtes de l'IA atteinte. Réessaie dans un instant.");
    }
    if (err instanceof Anthropic.APIError) {
      console.error('Erreur API Claude :', err.status, err.message);
      throw new AiError(502, "Le service d'IA a renvoyé une erreur.");
    }
    throw err;
  }
  if (response.stop_reason === 'refusal') {
    throw new AiError(422, "L'IA a refusé de générer ce texte.");
  }
  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();
  if (!text) throw new AiError(502, "L'IA n'a renvoyé aucun texte.");
  return text;
}
