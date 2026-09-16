(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.SkillLabProblemClassification = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const STAGES = Object.freeze({
    Beginner: Object.freeze({ label: '初階', cssClass: 'beginner' }),
    Intermediate: Object.freeze({ label: '中階', cssClass: 'intermediate' }),
    Advanced: Object.freeze({ label: '高階', cssClass: 'advanced' }),
    Challenge: Object.freeze({ label: '挑戰', cssClass: 'challenge' })
  });

  const DIFFICULTIES = Object.freeze({
    Easy: '簡單',
    Medium: '中等',
    Hard: '困難'
  });

  const AUDIENCES = Object.freeze({
    'E-MID': '國小中年級',
    'E-UPPER': '國小高年級',
    'M-7': '國一',
    'M-8': '國二',
    'M-HS': '高中',
    'A-HS': '高中進階'
  });

  const APCS_LEVELS = Object.freeze({
    'APCS-Concept': 'APCS 觀念',
    'APCS-Implementation': 'APCS 實作',
    'APCS-Advanced': 'APCS 進階'
  });

  function stageMeta(stage) {
    return STAGES[stage] || { label: '未分級', cssClass: 'unclassified' };
  }

  function difficultyLabel(difficulty) {
    return DIFFICULTIES[difficulty] || String(difficulty || '未設定');
  }

  function audienceLabel(audienceLevel) {
    return AUDIENCES[audienceLevel] || String(audienceLevel || '未設定');
  }

  function apcsLabel(apcsLevel) {
    return apcsLevel ? (APCS_LEVELS[apcsLevel] || String(apcsLevel)) : '';
  }

  function matches(problem, filters, solved) {
    const tags = Array.isArray(problem.tags) ? problem.tags : [];
    const normalizedSearch = String(filters.search || '').trim().toLocaleLowerCase('zh-TW');
    const paddedId = String(problem.id).padStart(3, '0');
    const stage = stageMeta(problem.stage);
    const haystack = [
      paddedId,
      problem.id,
      problem.title,
      ...tags,
      problem.stage,
      stage.label,
      problem.audienceLevel,
      audienceLabel(problem.audienceLevel),
      problem.apcsLevel,
      apcsLabel(problem.apcsLevel)
    ].filter(Boolean).join(' ').toLocaleLowerCase('zh-TW');

    return (!normalizedSearch || haystack.includes(normalizedSearch))
      && (!filters.stage || problem.stage === filters.stage)
      && (!filters.difficulty || problem.difficulty === filters.difficulty)
      && (!filters.tag || tags.includes(filters.tag))
      && (!filters.status || (filters.status === 'solved' ? solved : !solved));
  }

  return Object.freeze({
    STAGES,
    DIFFICULTIES,
    AUDIENCES,
    APCS_LEVELS,
    stageMeta,
    difficultyLabel,
    audienceLabel,
    apcsLabel,
    matches
  });
});
