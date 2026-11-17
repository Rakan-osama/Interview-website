import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {tracks} from '../app/content';
import {concepts} from '../app/concepts';
import {featureGuides} from '../app/feature-guides';
import {plainExplanations} from '../app/plain-explanations';
import {capstones, learningStages, readingResources} from '../app/engineering-plan';

const target = resolve(process.argv[2] ?? 'platform/api2/database/seeders/data/legacy-content.json');
const payload = {
  schemaVersion: 1,
  exportedAt: new Date().toISOString(),
  expected: {tracks: 54, exercises: 350, concepts: 102, guides: 16},
  tracks,
  concepts,
  guides: featureGuides,
  plainExplanations,
  resources: readingResources,
  projects: capstones,
  learningStages,
};

await mkdir(dirname(target), {recursive: true});
await writeFile(target, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

const actual = {
  tracks: tracks.length,
  exercises: tracks.reduce((count, track) => count + track.questions.length, 0),
  concepts: concepts.length,
  guides: featureGuides.length,
};

console.log(JSON.stringify({target, actual}, null, 2));
