import { google } from "googleapis";
import { generateTesseraPDF } from "./tessera-pdf.mjs";

const SHEET_ID = "1zPqCtn3eCKe-5yznRM93FJtJhRpSy8tQZsMqgS256fA";
const SHEET_ASSOCIATI  = "Schedario CASS";
const SHEET_MEDICI     = "Medici di Base";
const SHEET_ISCRIZIONI = "Iscrizioni";

const USERS = {
  admin:       { password: "cass2025", nome: "Amministratore" },
  operatrice1: { password: "cass2025", nome: "Operatrice 1" },
  operatrice2: { password: "cass2025", nome: "Operatrice 2" },
};

const H_ISC = ["id","tipo","tessera","cognome","nome","nascita","cf","tariffa","pagamento","note","email","telefono","indirizzo","stato","dataconferma"];
const H_ASS = ["id","nome","cognome","cf","tessera","iscrizione","scadenza","tel","mail","indirizzo","asl","medico","note"];
const H_MED = ["id","nome","cognome","email","cellulare","tel_studio","orari","indirizzo"];

const TARIFFE = {
  "Tessera Esterno": 25,
  "Tessera Esterno Minore": 20,
  "Tessera Iscritto Sindacato": 20,
  "Familiari Iscritti Sindacato": 20,
  "Minori Iscritti Sindacato": 15,
  "Pensionati Esterno": 20,
  "Pensionato Iscritto Sindacato": 15,
  "Pacchetto Famiglia (4+ persone)": 50,
};

const CREDS = {
  type:"service_account",project_id:"poised-shuttle-505616-g6",
  private_key_id:"71b64c402ace3171ff3af5b11cc6e360ec9bb3e8",
  private_key:"-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDU47lfdoVllNgn\nCfjbLhEGo29/a12DEYMepXCi3/RiyE8fsu2IfR9aHuMEalezHA9q4E0t7fovU4jl\nkYh7pYwgPoC+aYuFMlAiHH2ZNDeeaUoRuRL8fxZY2I9WPnGzS2E5RSFhHinAf+Qw\nGsah5amBdtPRcr/XlXB45LatDtryrt6RKP0mxdWI77VkRfZk1ThG6PO6CIu5Lk1Q\n1sulI5or+drmUV5LdtINpWGOKBdWVPNflBRvWgCJHOt8I6fC7aUSHaK3QPlwAXsg\nqjXZVfPr11hbj9PHouySCTDD3tcBCuzYWhfFn1diF/dlnWID35SDHDPV8GaOTWPo\n7/c9sjLJAgMBAAECggEAIIft1zMWvkeI4ipJb0CyVFfcHVXsM6+U4DV6qUDcqM2g\nHaFrX6xzAoPuv8l6PkHe7z94O7j+PoYeyKm899v7th+m77HUIpXmHdhJrwQGLbw8\nF8o2pwPKh+gLuyuOl03A/Q3dxGfmDGbemSU2Th34kXJ1eq90tj49MhQNABPhjCy6\nDZ7hZDyciw6ClV4dUo7Y+cSgMVC1cmttueFe/IGZUT+vm3YSeKcjQKSi9GpZWfJE\nCSBlgCBPt/ufkJ6urmsoouaNhKgfCXn3mL2aglF2EHSIMrwolO84oqUIZ1UdJXax\nru7Ixu7x0G3AG7vCH0Im8JBRA6v9BjYvNfxVHaKd6QKBgQD56el/2maCBb4riJTP\n8HpMffBtDVN0rafHVjlRol6SSaB3THVXffzquIow4HUoncmgJlUSLTgO/MHP5D5t\nz9zw7WZvcOax6SRKhaAPke/xBjqAvCsl9YTkHoFMdesGUHmJtmnYfuatqFBl1Io6\nSwlgydI6cfwOCNbt0SJfsNmrbQKBgQDaEvwUZdiDT5ShL/5VJ1EhK5cK9t4ziBjK\nbbj5ExOdor+ecXCc48BiENFS1EqNXqLrjk77fxEQLYwItXpqrsCdFYoIXLDrhfge\nWS81mxrly7B7xKeolzz2XnMr/IVvW1ujLWDy434+z91CAKKHUG5CEmURox7TjPXK\n0SVior9PTQKBgA9TY+leSFkC5yWeS5nw4l8cfgkB/zMxjw9vXzZ9YZVRBJEsVCnY\nZREz3e2fZi/mdT3n++GQelaY832/PoDXdXIk7No6rzsL1Bjp1uX9ihxayG2qnG7I\nfqzKnh1FQfNyLfHfCOCo75aIst17yjpG7b1MwyKoaM+nhR6ya4w4uTCFAoGANdh2\nMbssCNA/jMVC8Vex6pTOyMBIAUVbibAp+iZBs6yZz8+G1NZPjGdGqEMO3XU+mRcc\nXXD0j6APcZ8NyQW5PZAx8vqgHKeJqkSvKXdQ3ui6fPUDyNb/EH4lxfimIebW66Wq\nyI5vf6bnpQJvHyY2802DcyVp2SZ3EksuBfrVbgkCgYB76OeKOWbKmI43Tbc9g3is\ne6DS6VJC78IMlN0YbVcaqxfqdJ27qtVEQ4PfchXVJtzgKeVdQCcqN3J9rZHJ2qy3\n+rpQhOmHGXvf7ItJEtlBwHjHYFkF0fRGFpBQxyUunkYDgVbboK+Z1b3LmbXVA906\naQKgNiX5jwkUaAtzx5ldKg==\n-----END PRIVATE KEY-----\n",
  client_email:"cass-app@poised-shuttle-505616-g6.iam.gserviceaccount.com",
  client_id:"109491332298020214990",
  auth_uri:"https://accounts.google.com/o/oauth2/auth",
  token_uri:"https://oauth2.googleapis.com/token",
};

// Mittente email — dominio verificato su Resend
const FROM_EMAIL = "CASS <no-reply@cassitalia.it>";

function ok(b,s=200){return new Response(JSON.stringify(b),{status:s,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}});}
function er(m,s=400){return new Response(JSON.stringify({error:m}),{status:s,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}});}
function getAuth(){return new google.auth.GoogleAuth({credentials:CREDS,scopes:["https://www.googleapis.com/auth/spreadsheets"]});}
function rowToObj(row,h){const o={};h.forEach((k,i)=>{o[k]=row[i]||"";});return o;}
function objToRow(obj,h){return h.map(k=>obj[k]||"");}
function checkAuth(req){const u=req.headers.get("x-cass-user"),p=req.headers.get("x-cass-pass");return u&&USERS[u]&&USERS[u].password===p;}

async function getRows(sheets,sh){const r=await sheets.spreadsheets.values.get({spreadsheetId:SHEET_ID,range:`${sh}!A:Z`});return r.data.values||[];}
async function appendRows(sheets,sh,rows){await sheets.spreadsheets.values.append({spreadsheetId:SHEET_ID,range:`${sh}!A:Z`,valueInputOption:"USER_ENTERED",requestBody:{values:rows}});}
async function updateRow(sheets,sh,idx,row){const c=String.fromCharCode(64+row.length);await sheets.spreadsheets.values.update({spreadsheetId:SHEET_ID,range:`${sh}!A${idx}:${c}${idx}`,valueInputOption:"USER_ENTERED",requestBody:{values:[row]}});}
async function deleteRow(sheets,sh,idx){
  const meta=await sheets.spreadsheets.get({spreadsheetId:SHEET_ID});
  const sid=meta.data.sheets.find(s=>s.properties.title===sh)?.properties.sheetId??0;
  await sheets.spreadsheets.batchUpdate({spreadsheetId:SHEET_ID,requestBody:{requests:[{deleteDimension:{range:{sheetId:sid,dimension:"ROWS",startIndex:idx-1,endIndex:idx}}}]}});
}
function nextId(rows){const ids=rows.slice(1).map(r=>parseInt(r[0])).filter(n=>!isNaN(n));return ids.length>0?Math.max(...ids)+1:1;}

function nextTessera(iscRows, assRows){
  const iscNums = iscRows.slice(1).map(r=>parseInt((r[2]||"").replace(/\D/g,""))).filter(n=>!isNaN(n));
  const assNums = assRows.slice(1).map(r=>parseInt((r[4]||"").replace(/\D/g,""))).filter(n=>!isNaN(n));
  const all=[...iscNums,...assNums];
  const next = all.length>0 ? Math.max(...all)+1 : 1;
  return String(next).padStart(5,"0");
}

function crud(sheets,sh,h){
  return {
    async all(){const rows=await getRows(sheets,sh);return rows.slice(1).map(r=>rowToObj(r,h)).filter(r=>r.id);},
    async create(body){const rows=await getRows(sheets,sh);body.id=String(nextId(rows));await appendRows(sheets,sh,[objToRow(body,h)]);return body;},
    async update(id,body){const rows=await getRows(sheets,sh);const idx=rows.findIndex((r,i)=>i>0&&r[0]===id);if(idx===-1)return null;body.id=id;await updateRow(sheets,sh,idx+1,objToRow(body,h));return body;},
    async del(id){const rows=await getRows(sheets,sh);const idx=rows.findIndex((r,i)=>i>0&&r[0]===id);if(idx===-1)return false;await deleteRow(sheets,sh,idx+1);return true;}
  };
}

async function sendEmail({ to, subject, html, attachmentBase64, attachmentName, bcc }){
  const apiKey = process.env.RESEND_API_KEY;
  if(!apiKey){ console.error("RESEND_API_KEY non configurata"); return { ok:false, error:"missing_api_key" }; }

  const body = { from: FROM_EMAIL, to: [to], subject, html };
  if (bcc) body.bcc = [bcc];
  if (attachmentBase64) body.attachments = [{ filename: attachmentName || "allegato.pdf", content: attachmentBase64 }];

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) { const t = await res.text(); console.error("Resend error:", t); return { ok:false, error:t }; }
    return { ok:true };
  } catch(e) {
    console.error("Resend fetch failed:", e);
    return { ok:false, error:String(e) };
  }
}

function formatDateIT(iso){ if(!iso) return "-"; return new Date(iso).toLocaleDateString("it-IT"); }
function addOneYear(iso){ if(!iso) return ""; const d=new Date(iso); d.setFullYear(d.getFullYear()+1); return d.toISOString().split("T")[0]; }

export default async(req)=>{
  if(req.method==="OPTIONS") return new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"*","Access-Control-Allow-Methods":"*"}});
  const path=new URL(req.url).pathname.replace(/.*\/api/,"");

  if(path==="/login"&&req.method==="POST"){
    const{user,pass}=await req.json();
    if(USERS[user]&&USERS[user].password===pass) return ok({ok:true,nome:USERS[user].nome});
    return er("Credenziali non valide",401);
  }

  if(path==="/iscrizioni/public"&&req.method==="POST"){
    const body=await req.json();
    const { tipo, nome, cognome, nascita, cf, indirizzo, telefono, email, pagamento } = body;
    if(!tipo || !nome || !cognome || !email) return er("Dati mancanti",400);

    const tariffa = TARIFFE[tipo] ?? "";
    const sheets=google.sheets({version:"v4",auth:getAuth()});
    const rows=await getRows(sheets,SHEET_ISCRIZIONI);
    const id=String(nextId(rows));
    const record={ id, tipo, tessera:"", cognome, nome, nascita, cf:(cf||"").toUpperCase(), tariffa:String(tariffa), pagamento:pagamento||"", note:"", email, telefono, indirizzo, stato:"In attesa di pagamento", dataconferma:"" };
    await appendRows(sheets,SHEET_ISCRIZIONI,[objToRow(record,H_ISC)]);

    const emailIscritto = await sendEmail({
      to: email,
      subject: "CASS – Richiesta di iscrizione ricevuta",
      html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
        <div style="background:#0D2B5E;padding:20px 24px;border-radius:8px 8px 0 0;"><span style="color:#fff;font-size:18px;font-weight:800;">CASS</span><span style="color:rgba(255,255,255,.6);font-size:11px;margin-left:8px;">S.A.L.P.A.S.</span></div>
        <div style="background:#F4F7FB;padding:24px;border-radius:0 0 8px 8px;">
          <p style="font-size:14px;color:#1A2B3C;">Ciao <strong>${nome}</strong>,</p>
          <p style="font-size:14px;color:#3A5070;line-height:1.6;">Abbiamo ricevuto la tua richiesta di iscrizione al CASS come <strong>${tipo}</strong>.</p>
          <div style="background:#fff;border-left:3px solid #028090;padding:14px 18px;margin:16px 0;border-radius:0 6px 6px 0;"><p style="margin:0;font-size:13px;color:#3A5070;">Importo da versare: <strong style="color:#0D2B5E;">€ ${tariffa},00</strong></p></div>
          <div style="background:#fff;border:1px solid #D7E1EC;padding:14px 18px;margin:16px 0;border-radius:6px;">
            <p style="margin:0 0 8px;font-size:13px;color:#0D2B5E;font-weight:700;">Coordinate bancarie per il versamento</p>
            <p style="margin:0;font-size:13px;color:#3A5070;line-height:1.7;">IBAN: <strong style="color:#0D2B5E;">IT88K0306909606100000124995</strong><br>Intestatario: <strong style="color:#0D2B5E;">SALPAS FISAFS</strong><br>Causale: <strong style="color:#0D2B5E;">Quota associativa C.A.S.S.</strong></p>
          </div>
          <p style="font-size:13px;color:#3A5070;line-height:1.6;">Una volta ricevuto il pagamento, ti invieremo via email la tessera associativa con il numero definitivo. Per informazioni: <a href="mailto:info@cassitalia.it">info@cassitalia.it</a>.</p>
          <p style="font-size:12px;color:#6B85A0;margin-top:20px;">CASS – Centro Assistenza Socio Sanitario | S.A.L.P.A.S.</p>
        </div></div>`,
    });

    const emailOperatori = await sendEmail({
      to: "info@cassitalia.it",
      subject: `Nuova iscrizione in attesa: ${cognome} ${nome}`,
      html: `<p>Nuova richiesta di iscrizione ricevuta dal sito.</p><p><strong>${cognome} ${nome}</strong> — ${tipo} — € ${tariffa}</p><p>Verifica il pagamento e conferma dalla dashboard Iscrizioni.</p>`,
    });

    return ok({ ok:true, id, emailIscritto:emailIscritto.ok, emailOperatori:emailOperatori.ok }, 201);
  }

  if(!checkAuth(req)) return er("Non autorizzato",401);
  const sheets=google.sheets({version:"v4",auth:getAuth()});

  if(path==="/associati"&&req.method==="GET")    return ok(await crud(sheets,SHEET_ASSOCIATI,H_ASS).all());
  if(path==="/associati"&&req.method==="POST")   return ok(await crud(sheets,SHEET_ASSOCIATI,H_ASS).create(await req.json()),201);
  if(path==="/associati/import"&&req.method==="POST"){
    const{records}=await req.json();
    const rows=await getRows(sheets,SHEET_ASSOCIATI);
    let nid=nextId(rows);
    const newRows=records.map(r=>{r.id=String(nid++);return objToRow(r,H_ASS);});
    await appendRows(sheets,SHEET_ASSOCIATI,newRows);
    return ok({imported:newRows.length});
  }
  const mA=path.match(/^\/associati\/(\d+)$/);
  if(mA&&req.method==="PUT"){const r=await crud(sheets,SHEET_ASSOCIATI,H_ASS).update(mA[1],await req.json());return r?ok(r):er("Non trovato",404);}
  if(mA&&req.method==="DELETE"){const r=await crud(sheets,SHEET_ASSOCIATI,H_ASS).del(mA[1]);return r?ok({ok:true}):er("Non trovato",404);}

  if(path==="/medici"&&req.method==="GET")  return ok(await crud(sheets,SHEET_MEDICI,H_MED).all());
  if(path==="/medici"&&req.method==="POST") return ok(await crud(sheets,SHEET_MEDICI,H_MED).create(await req.json()),201);
  const mM=path.match(/^\/medici\/(\d+)$/);
  if(mM&&req.method==="PUT"){const r=await crud(sheets,SHEET_MEDICI,H_MED).update(mM[1],await req.json());return r?ok(r):er("Non trovato",404);}
  if(mM&&req.method==="DELETE"){const r=await crud(sheets,SHEET_MEDICI,H_MED).del(mM[1]);return r?ok({ok:true}):er("Non trovato",404);}

  if(path==="/iscrizioni"&&req.method==="GET")  return ok(await crud(sheets,SHEET_ISCRIZIONI,H_ISC).all());
  if(path==="/iscrizioni"&&req.method==="POST"){
    const body=await req.json();
    body.stato = body.stato || "Confermata";
    if(!body.tessera){
      const iscRows=await getRows(sheets,SHEET_ISCRIZIONI);
      const assRows=await getRows(sheets,SHEET_ASSOCIATI);
      body.tessera = nextTessera(iscRows, assRows);
    }
    return ok(await crud(sheets,SHEET_ISCRIZIONI,H_ISC).create(body),201);
  }
  const mI=path.match(/^\/iscrizioni\/(\d+)$/);
  if(mI&&req.method==="PUT"){const r=await crud(sheets,SHEET_ISCRIZIONI,H_ISC).update(mI[1],await req.json());return r?ok(r):er("Non trovato",404);}
  if(mI&&req.method==="DELETE"){const r=await crud(sheets,SHEET_ISCRIZIONI,H_ISC).del(mI[1]);return r?ok({ok:true}):er("Non trovato",404);}

  const mConfirm=path.match(/^\/iscrizioni\/(\d+)\/confirm$/);
  if(mConfirm&&req.method==="POST"){
    const id=mConfirm[1];
    const iscRows=await getRows(sheets,SHEET_ISCRIZIONI);
    const idx=iscRows.findIndex((r,i)=>i>0&&r[0]===id);
    if(idx===-1) return er("Iscrizione non trovata",404);

    const record=rowToObj(iscRows[idx],H_ISC);
    if(record.stato==="Confermata") return er("Iscrizione già confermata",400);

    const assRows=await getRows(sheets,SHEET_ASSOCIATI);
    const tessera = nextTessera(iscRows, assRows);
    const oggi = new Date().toISOString().split("T")[0];
    const scadenza = addOneYear(oggi);

    record.tessera = tessera;
    record.stato = "Confermata";
    record.dataconferma = oggi;
    await updateRow(sheets,SHEET_ISCRIZIONI,idx+1,objToRow(record,H_ISC));

    const pdfBytes = await generateTesseraPDF({
      nome: record.nome, cognome: record.cognome,
      tessera, dataIscrizione: formatDateIT(oggi), dataScadenza: formatDateIT(scadenza),
    });
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

    const emailResult = await sendEmail({
      to: record.email,
      bcc: "info@cassitalia.it",
      subject: "La tua tessera CASS è pronta! 🎉",
      html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
        <div style="background:#0D2B5E;padding:20px 24px;border-radius:8px 8px 0 0;"><span style="color:#fff;font-size:18px;font-weight:800;">CASS</span><span style="color:rgba(255,255,255,.6);font-size:11px;margin-left:8px;">S.A.L.P.A.S.</span></div>
        <div style="background:#F4F7FB;padding:24px;border-radius:0 0 8px 8px;">
          <p style="font-size:14px;color:#1A2B3C;">Ciao <strong>${record.nome}</strong>,</p>
          <p style="font-size:14px;color:#3A5070;line-height:1.6;">Il tuo pagamento è stato confermato! In allegato trovi la tua tessera associativa CASS.</p>
          <div style="background:#fff;border-left:3px solid #028090;padding:14px 18px;margin:16px 0;border-radius:0 6px 6px 0;">
            <p style="margin:0;font-size:13px;color:#3A5070;">N° Tessera: <strong style="color:#0D2B5E;">${tessera}</strong></p>
            <p style="margin:4px 0 0;font-size:13px;color:#3A5070;">Valida fino al: <strong style="color:#0D2B5E;">${formatDateIT(scadenza)}</strong></p>
          </div>
          <p style="font-size:12px;color:#6B85A0;margin-top:20px;">CASS – Centro Assistenza Socio Sanitario | S.A.L.P.A.S.</p>
        </div></div>`,
      attachmentBase64: pdfBase64,
      attachmentName: `Tessera_CASS_${tessera}.pdf`,
    });

    return ok({ ok:true, tessera, scadenza, emailSent: emailResult.ok, emailError: emailResult.error });
  }

  return er("Route non trovata",404);
};
export const config={path:"/api/*"};
