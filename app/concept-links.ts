import {concepts} from './concepts';
import type {Question} from './content';
const defaults:string[][]=[
 ['php-types','arrays-values'],['encapsulation','solid'],['abstraction','interfaces','abstract-class'],['lifecycle','container'],['rest-api','http'],['sql-indexes','transactions'],['idempotency','race','outbox'],['strategy-adapter','observer-decorator'],['architecture','observability'],['ai','testing'],['composer','process-lifetimes'],['validation','rest-api'],['relationships','scopes-casts'],['auth-policy','sessions'],['queues','events'],['cache','sessions'],['storage','localization'],['artisan','deploy'],['testing','errors'],['http','rest-api'],['transactions','sql-indexes'],['security','auth-policy'],['observability','deploy'],['big-o','stack-queue'],['container','architecture'],['big-o','hash-maps']
];
const rules:[RegExp,string[]][]=[
 [/strict|union|named arguments|type contract/i,['php-types','interfaces']],
 [/generators|iterables|chunking/i,['generators','arrays-values']],
 [/closures|arrow functions/i,['closures','php-types']],
 [/comparison|array|reference|value semantics/i,['arrays-values','php-types']],
 [/null handling|normalization|validation|formrequest/i,['validation','php-types']],
 [/enum|match|state transitions/i,['enums','encapsulation']],
 [/exception|finally|error boundaries/i,['errors','http']],
 [/datetime|readonly|money|value object|numeric precision/i,['immutability','php-types']],
 [/unicode|encoding|ASCII byte/i,['unicode','hash-maps']],
 [/composer|psr-4|autoload|package evaluation/i,['composer','container']],
 [/abstract class|template method|interface or abstract/i,['abstract-class','interfaces','abstraction']],
 [/what is abstraction/i,['abstraction','interfaces','abstract-class']],
 [/contract|interface|liskov|substitution/i,['interfaces','polymorphism']],
 [/encapsulation|constructor|invariants/i,['encapsulation','polymorphism']],
 [/dependency inversion|container|facade|configuration and environment/i,['container','solid']],
 [/single responsibility|open.closed|segregation|static methods/i,['solid','encapsulation']],
 [/polymorphism|composition|inheritance/i,['polymorphism','abstract-class']],
 [/scoped state|opcache|long.running|worker.*state|lifetimes/i,['process-lifetimes','container']],
 [/trace a request|middleware|pipeline/i,['lifecycle','auth-policy']],
 [/authorization|policy|idor|guard|roles|token|sanctum|jwt|oauth|membership|password reset|login/i,['auth-policy','sessions','security']],
 [/cors|csrf|cookies/i,['http','sessions','security']],
 [/resource and errors|versioning|cursor|safe updates|filtering|sort allowlists/i,['rest-api','sql-indexes']],
 [/n\+1|composite index|slow query|aggregate|window functions|left join/i,['sql-indexes','relationships']],
 [/deadlock|isolation|optimistic|last item|connection pool/i,['race','transactions']],
 [/cache|stampede|redis eviction/i,['cache','race']],
 [/concurrent sessions|session driver/i,['sessions','race']],
 [/webhook|refund|payment timeout|idempotency key|out.of.order|reservation expiry|ledger/i,['idempotency','outbox','race']],
 [/strategy|adapter|factory|repository trade|command and use cases/i,['strategy-adapter','architecture']],
 [/decorator|observer/i,['observer-decorator','events']],
 [/reliable queue|job |chains|batch|overlapping|queue deployment/i,['queues','events','process-lifetimes']],
 [/dispatch timing|aftercommit|observer and events|domain events/i,['events','outbox']],
 [/scale|partitioning|backpressure|consistency and cap|service boundaries/i,['architecture','observability']],
 [/read replicas|backup|recovery/i,['architecture','transactions']],
 [/upload|private storage|resource cleanup|file upload/i,['storage','security']],
 [/mail|blade|localization|notifications/i,['localization','events']],
 [/artisan|scheduler|command design/i,['artisan','queues']],
 [/migration|deployment|maintenance|health check/i,['deploy','transactions']],
 [/signed url|ssrf|secret|command injection|deserialization|threat model|injection/i,['security','auth-policy']],
 [/scopes|casts|mass assignment|bulk updates|collections versus/i,['scopes-casts','relationships']],
 [/relationship|pivot|cardinality|polymorphic/i,['relationships','scopes-casts']],
 [/test|regression|factories and isolation/i,['testing','observability']],
 [/debug|metrics|traces|incident|logging sensitive|code review/i,['observability','testing']],
 [/git |merge, rebase|linux/i,['deploy','composer']],
 [/browser.to.server|timeout budgets|http caching|websocket/i,['http','rest-api']],
 [/schema|foreign key|normalization versus|transactions and external/i,['transactions','outbox']],
 [/ai|prompt|untrusted repository|generated code/i,['ai','testing']],
 [/two sum|unique byte|deduplicate|prefix|subarrays/i,['hash-maps','big-o']],
 [/merge.*sorted|best single buy/i,['two-pointers','big-o']],
 [/substring|sliding.window|fixed.window/i,['sliding-window','big-o']],
 [/balanced brackets|stack versus/i,['stack-queue','big-o']],
 [/binary search|lower.bound/i,['binary-search','big-o']],
 [/graph|shortest path|dependency build|tree traversal|linked.list/i,['graphs','stack-queue','big-o']],
 [/coin|dynamic programming/i,['dynamic-programming','big-o']],
 [/complexity|heap|top k|storage structures|merge.*interval/i,['big-o','hash-maps']]
];
export function conceptsForQuestion(track:number,q:Question){
 if(q.conceptIds)return q.conceptIds.map(id=>concepts.find(c=>c.id===id)!).filter(Boolean);
 if(q.code){
   const codeRules:[RegExp,string[]][]=[[/substring|window/i,['sliding-window','big-o']],[/binary|lower.bound/i,['binary-search','big-o']],[/bracket/i,['stack-queue','big-o']],[/graph|path|dependency/i,['graphs','stack-queue','big-o']],[/coin/i,['dynamic-programming','big-o']],[/merge.*sorted|buy and sell/i,['two-pointers','big-o']],[/interval/i,['two-pointers','big-o']],[/unique.*byte/i,['hash-maps','unicode','big-o']]];
   const ids=codeRules.find(([pattern])=>pattern.test(q.title))?.[1]||['hash-maps','big-o'];
   return ids.map(id=>concepts.find(c=>c.id===id)!).filter(Boolean);
 }
 const match=rules.find(([pattern])=>pattern.test(q.title));
 const ids=match?.[1]||defaults[track]||['architecture'];
 return ids.map(id=>concepts.find(c=>c.id===id)!).filter(Boolean);
}
export function searchConcepts(search:string,group:string){const term=search.trim().toLowerCase();return concepts.filter(c=>(group==='all'||c.group===group)&&[c.title,c.intro,c.how,c.when].join(' ').toLowerCase().includes(term))}
