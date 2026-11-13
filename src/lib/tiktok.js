import { computeStats, rankMembers } from './rankings.js';
import { formatNumber } from './format.js';

// Générateur de scripts TikTok à base de modèles : il tourne dans le navigateur,
// sans clé ni appel externe, et s'appuie sur les vraies stats du clan.

const pick = (list) => list[Math.floor(Math.random() * list.length)];

const HASHTAGS = '#clashofclans #coc #clashofclansfr #clan #gaming #pourtoi #fyp';

export const STYLES = {
  hype: { label: 'Hype', icon: '🔥' },
  clash: { label: 'Clash', icon: '😈' },
  recrutement: { label: 'Recrutement', icon: '📣' },
};

function podium(list, key, unit) {
  const medals = ['🥇', '🥈', '🥉'];
  return list
    .slice(0, 3)
    .map((m, i) => `${medals[i]} ${m.name} — ${formatNumber(m[key])} ${unit}`)
    .join('\n');
}

const builders = {
  hype({ clan, stats, byTrophies, byDonations }) {
    const hook = pick([
      `Ce clan est en train de TOUT casser 🔥`,
      `Personne ne parle de ${clan.name}… et pourtant 👀`,
      `POV : tu tombes sur le clan le plus chaud du moment 🥵`,
    ]);
    return [
      hook,
      '',
      `🏰 ${clan.name} · niveau ${clan.level}`,
      `👥 ${stats.count} membres · 🏆 ${formatNumber(stats.totalTrophies)} trophées cumulés`,
      '',
      'Le podium trophées :',
      podium(byTrophies, 'trophies', '🏆'),
      '',
      `Et côté dons, ${byDonations[0].name} a lâché ${formatNumber(byDonations[0].donations)} troupes cette saison 🎁`,
      '',
      pick([
        'Tu ferais partie du top 3 ? Dis-le en commentaire 👇',
        'Ton clan fait mieux ? Prouve-le en commentaire 👇',
        'Abonne-toi pour le classement de la semaine prochaine ⚔️',
      ]),
    ];
  },

  clash({ clan, stats, byTrophies, byDonations }) {
    const last = byDonations[byDonations.length - 1];
    const lines = [
      pick([
        `On affiche les stats de ${clan.name}, et ça va piquer 😈`,
        `Le classement que certains membres ne voulaient PAS voir sortir 💀`,
        `J'ai regardé les dons du clan… on doit parler. 😬`,
      ]),
      '',
      `👑 Le patron : ${byDonations[0].name} avec ${formatNumber(byDonations[0].donations)} dons. Respect.`,
      `🏆 Le tryharder : ${byTrophies[0].name}, ${formatNumber(byTrophies[0].trophies)} trophées.`,
      `🐌 Et tout en bas… ${last.name} : ${formatNumber(last.donations)} don${last.donations > 1 ? 's' : ''}. ${pick(['On t’a vu.', 'Explique-toi.', 'Le château de clan pleure.'])}`,
    ];
    if (stats.inactiveDonors > 1) {
      lines.push(`😴 ${stats.inactiveDonors} membres à 0 don cette saison. Zéro. Nada.`);
    }
    lines.push(
      '',
      pick([
        'Identifie le radin de ton clan 👇',
        'Tague celui qui ne donne jamais 👇',
        'Kick ou seconde chance ? Vote en commentaire 👇',
      ]),
    );
    return lines;
  },

  recrutement({ clan, stats, byTrophies, byDonations }) {
    const places = 50 - stats.count;
    return [
      pick([
        `Tu cherches un clan actif ? Arrête de scroller ✋`,
        `Marre des clans morts ? Regarde ça 👇`,
        `Ton clan ne donne jamais ? Le nôtre, si. 🎁`,
      ]),
      '',
      `🏰 ${clan.name} (${clan.tag}) · niveau ${clan.level}`,
      clan.warLeague ? `⚔️ Ligue de guerre : ${clan.warLeague}` : null,
      `🎁 ${formatNumber(stats.totalDonations)} dons cette saison (${formatNumber(stats.avgDonations)} par membre)`,
      `🏆 ${formatNumber(stats.avgTrophies)} trophées de moyenne`,
      '',
      `Nos meilleurs donateurs : ${byDonations.slice(0, 3).map((m) => m.name).join(', ')}`,
      `Notre n°1 : ${byTrophies[0].name} (${formatNumber(byTrophies[0].trophies)} 🏆)`,
      '',
      places > 0
        ? `Il reste ${places} place${places > 1 ? 's' : ''}. Cherche ${clan.tag} en jeu et rejoins-nous 🚀`
        : `Clan complet pour l'instant — abonne-toi pour savoir quand une place se libère 🔔`,
    ].filter((line) => line !== null);
  },
};

export function generateTikTokScript(clan, style) {
  if (!clan.members.length) return '';
  const context = {
    clan,
    stats: computeStats(clan.members),
    byTrophies: rankMembers(clan.members, 'trophies'),
    byDonations: rankMembers(clan.members, 'donations'),
  };
  const clanTag = '#' + clan.name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');
  const hashtags = clanTag.length > 3 ? `${HASHTAGS} ${clanTag}` : HASHTAGS;
  return [...builders[style](context), '', hashtags].join('\n');
}
