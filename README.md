# Zoega Nails – din booking-hjemmeside

Denne guide er skrevet til dig, der aldrig har brugt GitHub eller lignende
værktøjer før. Følg trinene i rækkefølge, og du behøver ikke forstå alt det
tekniske - bare følg vejledningen.

Du skal bruge:
- En computer
- Cirka 20-30 minutter
- To gratis konti, som du opretter undervejs (GitHub og Vercel)

---

## Trin 1: Opret en GitHub-konto

GitHub er stedet hvor koden til din hjemmeside skal ligge, så Vercel (som
viser siden til dine kunder) kan hente den.

1. Gå til [github.com](https://github.com)
2. Klik **Sign up** og opret en gratis konto (email, kodeord, brugernavn)

## Trin 2: Læg din hjemmeside op på GitHub

1. Når du er logget ind på GitHub, klik på det grønne **New** (eller **+** i
   toppen → **New repository**)
2. Giv det navnet `zoega-nails`
3. Lad resten stå som det er, og klik **Create repository**
4. På den nye, tomme side finder du en linje der siger noget i stil med
   *"uploading an existing file"* - klik på det linket (eller find knappen
   **Add file → Upload files**)
5. Åbn din projektmappe på computeren, marker **alle filer og mapper**
   (tryk Cmd+A på Mac) og træk dem ind på GitHub-siden i browseren
   - **Undtagelse:** hvis du ser en mappe der hedder `node_modules`, skal den
     **ikke** uploades (den er meget stor og ikke nødvendig)
6. Vent til alle filer er uploadet (kan tage et par minutter)
7. Scroll ned og klik **Commit changes**

Din kode ligger nu på GitHub.

## Trin 3: Opret en Vercel-konto og sæt siden live

1. Gå til [vercel.com](https://vercel.com)
2. Klik **Sign up** og vælg **Continue with GitHub** (log ind med den konto du lige oprettede)
3. Klik **Add New... → Project**
4. Find `zoega-nails` i listen og klik **Import**
5. Rør ikke ved indstillingerne - klik bare **Deploy**
6. Vent 1-2 minutter

Du får nu et link i stil med `zoega-nails.vercel.app` - det er din side!
Den virker allerede for forsiden, galleriet og "Om mig". Book tid og Admin
virker først efter Trin 4 og 5 herunder.

## Trin 4: Opret en gratis database

Databasen er der hvor bookinger og ledige tider bliver gemt.

1. Inde på dit projekt i Vercel, klik på fanen **Storage** i toppen
2. Klik **Create Database**
3. Vælg **Postgres** (den drives af "Neon" - det er bare navnet på den gratis database)
4. Vælg den gratis plan, og klik **Continue**/**Create**
5. Klik **Connect** for at koble databasen til din side

## Trin 5: Vælg et kodeord til din admin-side

Admin-siden er der hvor du selv tilføjer ledige tider og ser bookinger, så
den skal beskyttes med et kodeord.

1. Gå til fanen **Settings** på dit Vercel-projekt
2. Klik **Environment Variables** i menuen til venstre
3. Tilføj disse to, én ad gangen (skriv navnet i feltet "Key" og værdien i feltet "Value", klik **Save** efter hver):

| Key (navn) | Value (værdi) |
|---|---|
| `ADMIN_PASSWORD` | Vælg selv et kodeord, fx `sophienails2026` |
| `ADMIN_SESSION_SECRET` | Skriv en lang, tilfældig række bogstaver/tal, fx `x7Kp9mQ2vL8nR4tY6wZ1cA3sD5fG0hJ` |

## Trin 6: Åbn en terminal og kør 4 kommandoer (kun én gang)

Dette er det eneste "tekniske" trin, men du skal bare skrive det, der står -
du behøver ikke forstå det.

**Åbn Terminal-programmet:**
- Tryk Cmd+Mellemrum, skriv "Terminal", tryk Enter

**Skriv derefter (tryk Enter efter hver linje, og følg evt. instruktioner der dukker op på skærmen):**

```bash
cd "/Users/sophie/Desktop/mappe uden navn 2"
npx vercel login
```
*(Dette åbner en browser hvor du bekræfter login - gør det, og kom tilbage til Terminal)*

```bash
npx vercel link
```
*(Den spørger et par spørgsmål - tryk bare Enter for at vælge standardsvarene, og vælg `zoega-nails` når den spørger hvilket projekt)*

```bash
npx vercel env pull .env
npx prisma db push
```

Når begge kommandoer er færdige uden fejl, er databasen klar.

## Trin 7: Genudsend siden

1. Gå tilbage til dit projekt på [vercel.com](https://vercel.com)
2. Klik på fanen **Deployments**
3. Klik de tre prikker (**...**) ud for den øverste deployment → **Redeploy** → bekræft

Din side er nu helt færdig og live! Besøg `dit-navn.vercel.app/admin`, log
ind med det kodeord du valgte i Trin 5, og tilføj dine første ledige tider.

---

## Sådan retter du siden senere

- **Priser/tjenester:** åbn filen `lib/services.ts` og ret navn, varighed eller pris.
- **Galleribilleder:** læg nye billeder i mappen `public/images/gallery`, og tilføj dem i filen `lib/gallery.ts`.
- **Tekst på forsiden/om mig:** åbn `app/page.tsx` eller `app/om-mig/page.tsx` og ret teksten direkte.

Når du har rettet en fil, skal ændringen tilbage på GitHub, før den vises på
din live side:

1. Gå til dit repository på GitHub
2. Find filen du ændrede, klik på den, klik blyant-ikonet (**Edit**)
3. Ret teksten, og klik **Commit changes** nederst

Vercel opdaterer automatisk din live side inden for et minuts tid.

## Sådan bruger du admin-siden

Gå til `/admin` på din side og log ind med kodeordet fra Trin 5.

- **Tilføj ledig tid:** vælg dato samt fra/til-klokkeslæt, og klik "Tilføj". Kunder kan nu booke tider inden for dette tidsrum.
- **Slet et tidsrum:** klik "Slet" ud for tidsrummet.
- **Kommende bookinger:** se navn, telefonnummer og evt. besked. Klik "Annullér" for at fjerne en booking.

## Hjælp, noget virker ikke

- **"Kunne ikke hente ledige tider":** databasen er ikke koblet rigtigt til - tjek Trin 4.
- **Kan ikke logge ind på `/admin`:** tjek at `ADMIN_PASSWORD` er sat rigtigt i Trin 5, og at du har redeployet (Trin 7) bagefter.
- **Andre problemer:** spørg endelig igen, og beskriv hvad du ser på skærmen.
