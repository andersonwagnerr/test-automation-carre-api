import { appendFileSync, readFileSync } from 'node:fs';

const report = JSON.parse(readFileSync('test-results.json', 'utf8'));
const summaryPath = process.env.GITHUB_STEP_SUMMARY;

if (!summaryPath) {
  throw new Error('A variável GITHUB_STEP_SUMMARY não está definida.');
}

const { stats } = report;
const escapeCell = (value) => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
const tests = [
  ...(report.passes ?? []).map((test) => ({ ...test, result: 'Aprovado' })),
  ...(report.pending ?? []).map((test) => ({ ...test, result: 'Ignorado' })),
  ...(report.failures ?? []).map((test) => ({ ...test, result: 'Falhou' })),
];
const rows = tests.map((test) => {

  return `| ${test.result} | ${escapeCell(test.fullTitle)} | ${test.duration ?? 0} ms |`;
});

const summary = [
  '## Relatório dos testes de API',
  '',
  `**Resultado:** ${stats.passes} aprovados, ${stats.failures} falharam e ${stats.pending} ignorados (${stats.duration} ms).`,
  '',
  '| Resultado | Teste | Duração |',
  '|---|---|---:|',
  ...rows,
  '',
  'O relatório JSON completo está disponível no artefato `mocha-test-report` desta execução.',
  '',
].join('\n');

appendFileSync(summaryPath, summary);
