# Unklarheiten – Fremdauftrag

Stand: 29. September 2026

Die sechs offenen Punkte sind entschieden. Es gilt jeweils die Empfehlung.
Kleinere Folgefragen werden unten unter „Selbst entschieden“ festgehalten.
Nachfragen nur noch bei Geld, neuen Konten, Schlüsseln, rechtlichen Texten oder einer Änderung am Grundkonzept.

---

## Entschieden am 29.09.2026

| # | Thema | Entscheidung |
|---|---|---|
| 1 | Tagesende | Persönliche Morgenzeit, nicht Mitternacht. Danach gelten offene Aufgaben als nicht erledigt, und es gibt neue. |
| 2 | Meldungen | Aufgabe von einem Menschen: 1 Meldung reicht, sofort durch eine Startpool-Aufgabe ersetzen. Startpool, Themenpaket und Sponsor: erst ab 2 Meldungen. |
| 3 | Strikes | Die KI antwortet zusätzlich mit „schwer“ oder „leicht“. Nur „schwer“ gibt einen Strike. „Zu teuer“ oder „braucht ein Auto“ ist nur eine Ablehnung. |
| 4 | Essen | Normales Essen und Trinken ist erlaubt. Abgelehnt werden Hungern, Fasten, Diät, Kalorien, Ess-Challenges und extremes Training. |
| 5 | Alter | Es wird nur gespeichert, dass die Person mindestens 16 ist. Das Geburtsjahr wird nicht gespeichert. Unter 16: freundliche Absage, kein Konto. |
| 6 | Supabase | Noch kein Konto anlegen. Meilenstein 1 läuft ohne echte Anmeldung und zeigt deutlich „noch nicht verbunden“. |

---

## Bestätigte Festlegungen

Diese Punkte waren vorgeschlagen und sind bestätigt.

- Die App ist für iPhone und Android. Es gibt keine öffentliche Website. Die Vorschau im Chat ist dieselbe App, nur zum Anschauen.
- Die Kontotabelle heißt `profiles`, nicht `users`, damit sie sich nicht mit der Login-Tabelle von Supabase vermischt.
- Fremde Aufgaben kommen später nur über eine Sicht ohne `author_id`.
- Schrift: Nunito. Farben: Salbeigrün `#8FAF9A`, Sand `#F3EDE2`, Orange `#E8894A`, Text `#2E2E2E`. Dazu ein Dunkelmodus.
- Admin-Ansicht erst in Meilenstein 7, nicht als normaler Screen.
- Das Startpool-Set direkt nach dem Onboarding ist das einzige Set dieses Tages.
- Melden heißt: diese Person nie wieder als Gegenüber, ohne dass ein Name sichtbar wird.
- Moderation später über Mistral. Fällt die KI aus, bleibt die Aufgabe ungeprüft und wird nicht freigegeben.
- Ein Schonungstag pro Kalenderwoche (Montag bis Sonntag, Zeitzone der Person). Der zweite verpasste Tag bricht die Streak. Pause friert sie ein und verbraucht keinen Schonungstag.

---

## Selbst entschieden

- **Altersprüfung ohne Monat.** Die Person wählt ein Geburtsjahr. Alt genug ist, wer im aktuellen Jahr mindestens 16 wird (`Jahr <= aktuelles Jahr minus 16`). Den Monat fragen wir nicht, weil wir das Datum nicht speichern. Wer unter 16 ist, sieht eine Absage und bekommt kein Konto.
- **Noch keine Aufgabenkarten in Meilenstein 1.** Leere Karten würden so tun, als gäbe es schon Aufgaben. Der Heute-Screen sagt klar, dass Aufgaben erst kommen, wenn der Server verbunden ist.
- **Speicher auf dem Gerät.** Fürs Onboarding reicht ein kleiner lokaler Speicher (AsyncStorage). Fotos und Notizen kommen in Meilenstein 5, dann mit SQLite, und bleiben auf dem Gerät.
- **Bundle-Kennung zum Vormerken:** `de.fremdauftrag.app` (iOS und Android). Lässt sich vor dem Store noch ändern.
- **Altersprüfung liegt in Meilenstein 1 auf dem Gerät.** Einen Server, der das prüfen könnte, gibt es noch nicht. Wer das Geburtsjahr falsch angibt, können wir in diesem Schritt nicht erkennen.

---

## Was du selbst tun musst

Für Meilenstein 1: **nichts.** Kein Konto, kein Schlüssel.

| Wann | Was | Geld, ungefähr |
|---|---|---|
| Vor der echten Anmeldung | Konto bei Supabase, Projekt in Frankfurt, anonyme Anmeldung einschalten | 0 € zum Start. Der nächtliche Job (Meilenstein 3) braucht sehr wahrscheinlich den bezahlten Plan, etwa 25 € im Monat |
| Meilenstein 2 | Konto bei Mistral, Schlüssel nur auf dem Server | kleiner Betrag nach Verbrauch |
| Zum Testen auf dem Handy | Kostenloses Expo-Konto und die App Expo Go | 0 € |
| Meilenstein 8 | RevenueCat plus Apple und Google für Käufe | erst mit den Themenpaketen |
| Meilenstein 10, Store | Apple Developer und Google Play Console | Apple etwa 99 € pro Jahr, Google einmalig etwa 25 € |

Nicht in den Chat schicken: geheime Schlüssel, Passwörter, `service_role`.

---

## Später, bewusst noch offen

- Ob Apple die App wegen Aufgaben von Fremden auf 17+ statt 16+ setzt. Unter 16 bleibt die App trotzdem zu.
- Texte für Datenschutz, Impressum und Nutzungsbedingungen. In der App stehen bis dahin gekennzeichnete Platzhalter.
