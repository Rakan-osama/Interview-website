const ts=require('typescript'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');const root=path.resolve(__dirname,'..'),cache={};
function load(name){const file=path.resolve(root,'app',name+'.ts');if(cache[file])return cache[file].exports;const module={exports:{}};cache[file]=module;const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInThisContext('(function(require,module,exports){'+code+'\n})')(n=>n.startsWith('.')?load(n.slice(2)):require(n),module,module.exports);return module.exports}
const {resolveNavigation,viewHref,conceptHref,questionHref,rootViews}=load('navigation'),{concepts}=load('concepts'),{featureGuides}=load('feature-guides');
const parsed=href=>{const u=new URL(href,'https://backend.test');return resolveNavigation(u.pathname,u.search)};
for(const v of rootViews){const target=parsed(viewHref(v));assert.equal(target.view,v);assert.equal(target.conceptId,null);assert.equal(target.questionId,null)}
// Returning to the section must remove nested selection AND stale query parameters.
assert.equal(parsed(conceptHref('php-types')).conceptId,'php-types');assert.deepEqual(parsed(viewHref('concepts')),{view:'concepts',conceptId:null,questionId:null});assert.deepEqual(parsed(viewHref('dashboard')),{view:'dashboard',conceptId:null,questionId:null});
for(const c of concepts)assert.equal(parsed(conceptHref(c.id)).conceptId,c.id);
assert.deepEqual(parsed(questionHref('41-0')),{view:'training',conceptId:null,questionId:'41-0'});assert.equal(parsed(questionHref('53-4')).questionId,'53-4');assert.equal(parsed(questionHref('999-0')).view,'dashboard');
assert.deepEqual(resolveNavigation('/','?view=progress&question=999-0&concept=not-real'),{view:'progress',conceptId:null,questionId:null});assert.equal(resolveNavigation('/','?view=untrusted').view,'dashboard');
// Feature routes select the lab regardless of previous root query/view state.
assert.equal(parsed(viewHref('design')).view,'design');for(const g of featureGuides)assert.deepEqual(resolveNavigation('/features/'+g.id,'?concept=php-types&question=0-0'),{view:'design',conceptId:null,questionId:null});
// History replay deterministically restores the URL destination in either direction.
const history=['/',conceptHref(null),conceptHref('php-types'),viewHref('paths'),questionHref('41-0'),viewHref('concepts')];const forward=history.map(parsed),back=[...history].reverse().map(parsed).reverse();assert.deepEqual(forward,back);assert.equal(forward[2].conceptId,'php-types');assert.equal(forward[5].conceptId,null);
console.log(JSON.stringify({rootDestinations:rootViews.length,conceptRoutes:concepts.length,featureRoutes:featureGuides.length,staleSelectionCleared:true,historyReplay:true,invalidTargetsRejected:true,tests:'passed'}));
