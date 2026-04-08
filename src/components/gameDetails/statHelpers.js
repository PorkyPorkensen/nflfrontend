const MLB_STAT_LABELS = {
  hits: 'H',
  runs: 'R',
  homeRuns: 'HR',
  runsBattedIn: 'RBI',
  strikeOuts: 'K',
  walks: 'BB',
  hitByPitch: 'HBP',
  plateAppearances: 'PA',
  battingAverage: 'AVG',
  onBasePct: 'OBP',
  sluggingPct: 'SLG',
  earnedRun: 'ER',
  wins: 'W',
  losses: 'L',
  saves: 'SV',
  inningsPitched: 'IP',
  strikeouts: 'K',
  era: 'ERA',
  pitchCount: 'PC'
};

const NBA_STAT_LABELS = {
  'fieldGoalsMade-fieldGoalsAttempted': 'FG',
  'threePointFieldGoalsMade-threePointFieldGoalsAttempted': '3PT',
  'freeThrowsMade-freeThrowsAttempted': 'FT',
  fieldGoalPct: 'FG%',
  threePointFieldGoalPct: '3P%',
  freeThrowPct: 'FT%',
  totalRebounds: 'RB',
  offensiveRebounds: 'ORB',
  defensiveRebounds: 'DRB',
  assists: 'A',
  steals: 'STL',
  blocks: 'BLK',
  turnovers: 'TO',
  pointsInPaint: 'PIP',
  fouls: 'PF',
  technicalFouls: 'TF',
  turnoverPoints: 'TO PTS',
  streak: 'Streak',
  lastTenGames: 'L10',
  avgPoints: 'PF',
  avgPointsAgainst: 'PA',
  avgRebounds: 'REB',
  avgAssists: 'A',
  avgBlocks: 'BLK',
  avgSteals: 'STL'
};

const NFL_STAT_LABELS = {
  firstDowns: 'First Downs',
  firstDownsPassing: 'Pass 1st Downs',
  firstDownsRushing: 'Rush 1st Downs',
  firstDownsPenalty: 'Pen 1st Downs',
  thirdDownEff: '3rd Down Conv',
  fourthDownEff: '4th Down Conv',
  totalOffensivePlays: 'Off Plays',
  totalYards: 'Total Yds',
  yardsPerPlay: 'Yds/Play',
  totalDrives: 'Drives',
  netPassingYards: 'Net Pass Yds',
  completionAttempts: 'Comp-Att',
  yardsPerPass: 'Yds/Pass',
  interceptions: 'INT',
  sacksYardsLost: 'Sacks-Yds Lost',
  rushingYards: 'Rush Yds',
  rushingAttempts: 'Rush Att',
  yardsPerRushAttempt: 'Yds/Rush',
  redZoneAttempts: 'Red Zone',
  totalPenaltiesYards: 'Penalties-Yds',
  turnovers: 'Turnovers',
  fumblesLost: 'Fumbles Lost',
  defensiveTouchdowns: 'Def TDs',
  possessionTime: 'Possession'
};

const NBA_PRE_GAME_STAT_KEYS = [
  'streak',
  'lastTenGames',
  'avgPoints',
  'avgPointsAgainst',
  'avgRebounds',
  'avgAssists',
  'avgBlocks',
  'avgSteals'
];

const NBA_LIVE_FINAL_LABEL_KEYS = Object.keys(NBA_STAT_LABELS).filter(
  (key) => !NBA_PRE_GAME_STAT_KEYS.includes(key)
);

const NHL_TEAM_STAT_ORDER_ALIASES = [
  ['S', 'SOG', 'SH'],
  ['HIT', 'HT'],
  ['FOW', 'FW'],
  ['FOWP', 'FO%'],
  ['PP', 'PPO'],
  ['PPG'],
  ['PPP', 'PCT'],
  ['SHG'],
  ['PEN', 'PN'],
  ['PIM'],
  ['BS'],
  ['TK'],
  ['GV']
];

const NHL_STAT_TOOLTIPS = {
  S: 'Shots',
  SH: 'Shots',
  SOG: 'Shots on Goal',
  HIT: 'Hits',
  HT: 'Hits',
  BS: 'Blocked Shots',
  FOW: 'Faceoffs Won',
  FW: 'Faceoffs Won',
  FOWP: 'Faceoff Win Percentage',
  'FO%': 'Faceoff Win Percentage',
  PP: 'Power Play Opportunities',
  PPO: 'Power Play Opportunities',
  PPG: 'Power Play Goals',
  PPP: 'Power Play Percentage',
  PCT: 'Power Play Percentage',
  SHG: 'Short Handed Goals',
  PEN: 'Total Penalties',
  PN: 'Total Penalties',
  PIM: 'Penalty Minutes',
  TK: 'Takeaways',
  GV: 'Giveaways'
};

const getSportLower = (sport) => (sport || 'nfl').toLowerCase();

export const getStatLabel = (statName, sport) => {
  const sportLower = getSportLower(sport);
  const labels =
    sportLower === 'mlb'
      ? MLB_STAT_LABELS
      : sportLower === 'nfl'
      ? NFL_STAT_LABELS
      : NBA_STAT_LABELS;

  return labels[statName] || statName;
};

const getStatOrder = () => [
  'streak',
  'lastTenGames',
  'avgPoints',
  'avgPointsAgainst',
  'fieldGoalPct',
  'threePointFieldGoalPct',
  'avgRebounds',
  'avgAssists',
  'avgBlocks',
  'avgSteals'
];

const isPreGameStats = (stats) => {
  if (!Array.isArray(stats) || stats.length === 0) return false;
  return stats.some(
    (stat) =>
      stat?.name &&
      [
        'streak',
        'lastTenGames',
        'avgPoints',
        'avgPointsAgainst',
        'avgRebounds',
        'avgAssists',
        'avgBlocks',
        'avgSteals'
      ].includes(stat.name)
  );
};

export const reorderStats = (stats) => {
  if (!Array.isArray(stats)) return stats;

  if (isPreGameStats(stats)) {
    const statOrder = getStatOrder();
    const statMap = {};

    stats.forEach((stat) => {
      if (stat?.name) {
        statMap[stat.name] = stat;
      }
    });

    return statOrder
      .map((statName) => statMap[statName])
      .filter((stat) => stat !== undefined);
  }

  return stats;
};

export const getDisplayedTeamStats = (stats, sport, gameState) => {
  const reorderedStats = reorderStats(stats);
  if (!Array.isArray(reorderedStats)) return [];

  const sportLower = getSportLower(sport);

  if (sportLower === 'nhl') {
    if (gameState === 'pre') {
      return reorderedStats;
    }

    const getAbbreviation = (stat) => String(stat?.abbreviation || '').toUpperCase();
    const ordered = [];

    NHL_TEAM_STAT_ORDER_ALIASES.forEach((aliases) => {
      const match = reorderedStats.find((stat) => aliases.includes(getAbbreviation(stat)));
      if (match) {
        ordered.push(match);
      }
    });

    const usedNames = new Set(ordered.map((stat) => stat?.name));
    const extras = reorderedStats.filter((stat) => !usedNames.has(stat?.name));
    return [...ordered, ...extras];
  }

  if (sportLower !== 'nba') {
    return reorderedStats;
  }

  if (gameState === 'pre') {
    return reorderedStats;
  }

  const statByName = {};
  reorderedStats.forEach((stat) => {
    if (stat?.name) {
      statByName[stat.name] = stat;
    }
  });

  return NBA_LIVE_FINAL_LABEL_KEYS.map((statName) => statByName[statName]).filter(
    (stat) => stat !== undefined
  );
};

const formatStatNameFallback = (value) =>
  String(value || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\bPct\b/gi, 'Percentage')
    .replace(/\s+/g, ' ')
    .trim();

export const getStatHeaderTooltip = (stat, sport) => {
  if (!stat) return '';

  if (getSportLower(sport) === 'nhl') {
    const byAbbreviation = NHL_STAT_TOOLTIPS[String(stat?.abbreviation || '').toUpperCase()];
    if (byAbbreviation) return byAbbreviation;
  }

  return stat?.displayName || formatStatNameFallback(stat?.name || stat?.abbreviation || 'Stat');
};

const parseStatValue = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const numeric = Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
};

const findStatLabelIndex = (labels, candidates) => {
  if (!Array.isArray(labels)) return -1;
  const normalizedCandidates = candidates.map((candidate) => candidate.toLowerCase());
  return labels.findIndex((label) =>
    normalizedCandidates.includes(String(label || '').trim().toLowerCase())
  );
};

export const sortPlayersForSport = (players, labels, sport) => {
  if (!Array.isArray(players)) return [];
  const sportLower = getSportLower(sport);
  const playersCopy = [...players];

  if (sportLower === 'nba') {
    const pointsIdx = findStatLabelIndex(labels, ['pts', 'points']);
    if (pointsIdx === -1) return playersCopy;

    return playersCopy.sort((a, b) => {
      const pointsDiff = parseStatValue(b?.stats?.[pointsIdx]) - parseStatValue(a?.stats?.[pointsIdx]);
      if (pointsDiff !== 0) return pointsDiff;
      return String(a?.athlete?.displayName || '').localeCompare(String(b?.athlete?.displayName || ''));
    });
  }

  if (sportLower === 'nhl') {
    const goalsIdx = findStatLabelIndex(labels, ['g', 'goals']);
    const assistsIdx = findStatLabelIndex(labels, ['a', 'ast', 'assists']);
    const pointsIdx = findStatLabelIndex(labels, ['p', 'pts', 'points']);

    const getGoals = (player) => parseStatValue(player?.stats?.[goalsIdx]);
    const getAssists = (player) => parseStatValue(player?.stats?.[assistsIdx]);
    const getPoints = (player) => {
      if (pointsIdx !== -1) return parseStatValue(player?.stats?.[pointsIdx]);
      return getGoals(player) + getAssists(player);
    };

    const getCategory = (player) => {
      const goals = getGoals(player);
      const assists = getAssists(player);
      if (goals > 0 && assists > 0) return 0;
      if (goals > 0) return 1;
      if (assists > 0) return 2;
      return 3;
    };

    return playersCopy.sort((a, b) => {
      const categoryDiff = getCategory(a) - getCategory(b);
      if (categoryDiff !== 0) return categoryDiff;

      const pointsDiff = getPoints(b) - getPoints(a);
      if (pointsDiff !== 0) return pointsDiff;

      const goalsDiff = getGoals(b) - getGoals(a);
      if (goalsDiff !== 0) return goalsDiff;

      const assistsDiff = getAssists(b) - getAssists(a);
      if (assistsDiff !== 0) return assistsDiff;

      return String(a?.athlete?.displayName || '').localeCompare(String(b?.athlete?.displayName || ''));
    });
  }

  return playersCopy;
};

const buildLabelSignature = (labels) => {
  if (!Array.isArray(labels)) return '';
  return labels.map((label) => String(label || '').trim().toLowerCase()).join('|');
};

export const getMergedPlayerStatsForGroup = (playerGroup) => {
  const statGroups = Array.isArray(playerGroup?.statistics)
    ? playerGroup.statistics.filter((group) => Array.isArray(group?.athletes) && group.athletes.length > 0)
    : [];

  if (statGroups.length === 0) {
    return { labels: [], players: [] };
  }

  const baseGroup =
    statGroups.find((group) => Array.isArray(group?.labels) && group.labels.length > 0) || statGroups[0];
  const baseLabels = Array.isArray(baseGroup?.labels) ? baseGroup.labels : [];
  const baseSignature = buildLabelSignature(baseLabels);

  const mergedPlayers = [];
  const seenPlayerIds = new Set();

  statGroups.forEach((group) => {
    const groupSignature = buildLabelSignature(group?.labels);
    const labelsMatch = baseSignature ? groupSignature === baseSignature : true;
    if (!labelsMatch) return;

    group.athletes.forEach((player) => {
      const athleteId = player?.athlete?.id;
      const uniqueKey = athleteId || `${player?.athlete?.displayName || 'unknown'}-${mergedPlayers.length}`;
      if (seenPlayerIds.has(uniqueKey)) return;
      seenPlayerIds.add(uniqueKey);
      mergedPlayers.push(player);
    });
  });

  return {
    labels: baseLabels,
    players: mergedPlayers
  };
};

export const getDisplayColumnConfig = (labels, sport) => {
  if (!Array.isArray(labels)) return [];

  if (getSportLower(sport) === 'nhl') {
    const nhlColumns = [
      { heading: 'G', candidates: ['g', 'goals'] },
      { heading: 'A', candidates: ['a', 'ast', 'assists'] },
      { heading: '+/-', candidates: ['+/-', 'plus/minus', 'plusminus'] },
      { heading: 'S', candidates: ['s', 'sog', 'shots', 'shots on goal'] },
      { heading: 'PIM', candidates: ['pim', 'penalty minutes'] },
      { heading: 'TOI', candidates: ['toi', 'time on ice'] }
    ];

    return nhlColumns
      .map((column) => ({
        ...column,
        index: findStatLabelIndex(labels, column.candidates)
      }))
      .filter((column) => column.index !== -1);
  }

  return labels.map((label, index) => ({
    heading: label,
    index
  }));
};
