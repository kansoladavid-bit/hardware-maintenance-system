# Hardware Maintenance Request System

Mfumo wa kuripoti na kufuatilia ukarabati wa vifaa (computers, printers, projectors).

## Muundo wa mradi
```
hardware-maintenance-system/
├── backend/        (Express + PostgreSQL/Supabase API)
└── frontend/        (HTML/CSS/JS - inayoongea na backend)
```

## HATUA 0: Tatua tatizo la PowerShell (fanya hii kwanza)

Kama umepata error "UnauthorizedAccess / PSSecurityException" kwenye VS Code terminal:

1. Fungua terminal kwenye VS Code
2. Andika amri hii MOJA TU, kisha Enter:
   ```
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   ```
3. Ikikuuliza "Do you want to change the execution policy?" andika `Y` kisha Enter
4. Sasa PowerShell itakubali kuendesha npm. Endelea na hatua zilizo chini.

## HATUA 1: Weka faili hizi kwenye kompyuta yako

1. Pakua (download) zip niliyokutengenezea
2. Ondoa kwenye zip (extract) mahali fulani, mfano Desktop
3. Fungua hiyo folder kwenye VS Code (File → Open Folder)

## HATUA 2: Sakinisha backend

Kwenye terminal ya VS Code:
```
cd backend
npm install
```//dakika 1-2, itapakua packages zote (express, pg, bcryptjs, n.k.)

## HATUA 3: Unda Supabase project

1. Nenda https://supabase.com → login → "New Project"
2. Jaza jina (mfano: hardware-maintenance-system) na password ya database (ihifadhi mahali salama)
3. Ukishaunda, nenda **SQL Editor** (upande wa kushoto)
4. Fungua faili `backend/schema.sql` iliyoko kwenye mradi wako, copy content yake yote
5. Bandika kwenye SQL Editor ya Supabase, bofya **Run**
6. Nenda **Project Settings → Database** → copy "Connection string" (URI) — hii ndiyo `DATABASE_URL` yako

## HATUA 4: Jaza .env

1. Kwenye folder ya `backend/`, badilisha jina la faili `.env.example` kuwa `.env`
2. Fungua `.env`, jaza:
   - `DATABASE_URL` = ile uliyochukua kutoka Supabase (badilisha [YOUR-PASSWORD] na password yako halisi)
   - `JWT_SECRET` = andika neno lolote refu la siri (mfano: `msifiche_hii_2026_hms`)
   - Acha `PORT` na `ALLOWED_ORIGIN` kama zilivyo

## HATUA 5: Anzisha backend

```
npm run dev
```
Ukiona "Server running on http://localhost:5000" — backend inafanya kazi! ✅

## HATUA 6: Tengeneza akaunti ya kwanza ya admin

Backend ikiwa inaendesha, fungua terminal NYINGINE (bofya "+" kwenye terminal panel), kisha:
```
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```
(Badilisha username/password kwa utakavyo. Hii ndiyo utakavyoingia kwenye dashboard.)

## HATUA 7: Anzisha frontend

1. Kwenye VS Code, sakinisha extension ya **"Live Server"** (kama huna) kutoka Extensions tab
2. Bofya kwenye `frontend/index.html`
3. Bofya kulia (right-click) → **"Open with Live Server"**
4. Ukurasa utafunguka kwenye browser (http://127.0.0.1:5500 au 5500)

## Kutumia mfumo
- **Watumiaji wa kawaida**: `index.html` → "Report a Problem" → jaza fomu → wanapata reference code
- **Kufuatilia**: "Track My Request" → weka reference code
- **Admin**: "Admin Login" → tumia username/password ulizotengeneza Hatua 6 → dashboard inaonyesha maombi yote, unaweza kubadilisha status

## Endapo backend na frontend zinatumia port tofauti
Kama Live Server inatumia 127.0.0.1:5500 badala ya localhost:5500, hakikisha `.env` yako `ALLOWED_ORIGIN` inalingana (backend/server.js tayari inaruhusu zote mbili by default).
