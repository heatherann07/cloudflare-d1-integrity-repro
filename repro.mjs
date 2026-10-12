import {Miniflare} from 'miniflare';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
// No accounts, production bindings or Cloudflare API access.
process.env.CLOUDFLARE_CF_FETCH_ENABLED='false';
process.env.WRANGLER_SEND_METRICS='false';
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'d1-integrity-repro-'));
const worker=`export default { async fetch(request,env) {
 await env.DB.batch([
  env.DB.prepare('CREATE TABLE parent (id INTEGER PRIMARY KEY)'),
  env.DB.prepare('CREATE TABLE child (id INTEGER PRIMARY KEY, parent_id INTEGER REFERENCES parent(id))'),
  env.DB.prepare('INSERT INTO parent VALUES (1)'),
  env.DB.prepare('INSERT INTO child VALUES (1,1)')
 ]);
 const results=[];
 for(const sql of ['PRAGMA foreign_key_check','PRAGMA integrity_check']) {
  try { const r=await env.DB.prepare(sql).all();results.push({sql,status:'executed',results:r.results}); }
  catch(e) { results.push({sql,status:'failed',sqliteAuth:String(e.message).includes('SQLITE_AUTH')||String(e.cause?.message).includes('SQLITE_AUTH'),message:String(e.message),cause:e.cause?String(e.cause.message):null}); }
 }
 return Response.json({results});
} };`;
let mf;
try{
 mf=new Miniflare({modules:true,script:worker,compatibilityDate:'2026-05-15',host:'127.0.0.1',cf:false,d1Databases:{DB:'synthetic-d1-integrity'},d1Persist:directory,outboundService:()=>new Response('Outbound disabled',{status:503})});
 const response=await mf.dispatchFetch('http://localhost/');
 const result=await response.json();
 result.environment={node:process.version,platform:process.platform,architecture:process.arch,miniflare:'4.20260515.0'};
 result.reproduced=response.status===200&&result.results?.[0]?.status==='executed'&&result.results?.[1]?.sqliteAuth===true;
 console.log(JSON.stringify(result,null,2));
 if(!result.reproduced)process.exitCode=1;
}finally{await mf?.dispose();fs.rmSync(directory,{recursive:true,force:true});}
