// Loads the query syntax helper the way the build does: project/components/src/_query.js is plain script that runs
// inside the bundle's scope, where `HY` is the registry. Here it runs in a vm context with an empty registry and the
// functions come back off it, so the tests exercise the same file that ships and nothing is duplicated or transpiled.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const file = join(dirname(fileURLToPath(import.meta.url)), '../project/components/src/_query.js');
const context = vm.createContext({ HY: {} });
vm.runInContext(readFileSync(file, 'utf8'), context, { filename: file });

// Objects made inside the vm have their own Object.prototype; a JSON round trip gives plain data that deepEqual accepts.
const plain = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));
const wrap = (fn) => (...args) => plain(fn(...args));
const q = context.HY;

export const parseQuery = wrap(q.parseQuery);
export const suggestQuery = wrap(q.suggestQuery);
export const termText = q.termText;
export const withValue = q.withValue;
export const withoutValue = q.withoutValue;
export const withoutTerm = q.withoutTerm;
export const valuesOf = wrap(q.valuesOf);

// The menu mapping QueryBar uses. Registered on the bundle's registry but not part of the package's public exports.
export const queryMenu = wrap(q.queryMenu);
export const withQueryMenu = q.withQueryMenu;
export const querySingle = q.querySingle;
export const withQuerySingle = q.withQuerySingle;
