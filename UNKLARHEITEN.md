# Unklarheiten – Fremdauftrag

Stand: 29. September 2026

Die sechs offenen Punkte sind entschieden. Es gilt jeweils die Empfehlung.
Kleinere Folgefragen stehen unter „Selbst entschieden“.
Nachfragen nur noch bei Geld, neuen Konten, Schlüsseln, rechtlichen Texten oder einer Änderung am Grundkonzept.

---

## Entschieden am 29.09.2026

| # | Thema | Entscheidung |
|---|---|---|
| 1 | Tagesende | Persönliche Morgenzeit, nicht Mitternacht. Danach gelten offene Aufgaben als nicht erledigt, und es gibt neue. |
| 2 | Meldungen | Aufgabe von einem Menschen: 1 Meldung reicht, sofort durch eine Startpool-Aufgabe ersetzen. Startpool, Themenpaket und Sponsor: erst ab 2 Meldungen. |
| 3 | Strikes | Die KI antwortet zusätzlich mit „schwer“ oder „leicht“. Nur „schwer“ gibt einen Strike. „Zu teuer“ oder „braucht ein Auto“ ist nur eine Ablehnung. |
| 4 | Essen | Normales Essen und Trinken ist erlaubt. Abgelehnt werden Hungern, Fasten, Diät, Kalorien, Ess-Challenges und extremes Training. |
| 5 | Alter | Es wird nur gespeichert, dass die Person mindestens 16 ist. Das Geburtsjahr wird nicht gespeichert. Wer genau im Grenzjahr geboren ist (aktuelles Jahr minus 16), bekommt die Frage „Hattest du dieses Jahr schon Geburtstag?“. Bei Nein: freundliche Absage. Auch diese Antwort wird nicht gespeichert. Jünger als das Grenzjahr: freundliche Absage, kein Konto. Geändert am 29.09.2026. |
| 6 | Supabase | Noch kein Konto anlegen. Meilenstein 1 läuft ohne echte Anmeldung und zeigt deutlich „noch nicht verbunden“. |

---

## Bestätigte Festlegungen

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

- **Altersprüfung im Grenzjahr.** Die Person wählt ein Geburtsjahr. Liegt das Jahr vor dem Grenzjahr (aktuelles Jahr minus 16), ist sie alt genug. Liegt es genau im Grenzjahr, kommt die Frage „Hattest du dieses Jahr schon Geburtstag?“. Nur Ja geht weiter. Nein führt zur Absage. Jüngere Jahre führen ohne diese Frage zur Absage. Jahr und Antwort werden nicht gespeichert. Wer die App schon vor dieser Änderung durchlaufen hat, wird nicht noch einmal gefragt, weil das Jahr nie gespeichert wurde.
- **Altersprüfung liegt auf dem Gerät.** Einen Server, der das prüfen könnte, gibt es noch nicht.
- **Speicher auf dem Gerät.** Fürs Onboarding reicht AsyncStorage. Fotos und Notizen bleiben auf dem Gerät.
- **Bundle-Kennung:** `de.fremdauftrag.app`. Lässt sich vor dem Store noch ändern.
- **Kontrast.** Auf dem orangen Knopf steht dunkle Schrift. Weiße Schrift auf diesem Orange wäre zu hell und schwer lesbar.
- **Datenbankdateien liegen bereit, sind aber nicht ausgeführt.** `supabase/migrations/0001_profiles.sql` und `0002_tasks.sql`. Strikes, Sperre und Push-Token kann die App selbst nicht ändern. In der Empfänger-Sicht gibt es kein `author_id`.

### Nach dem Bau, 29.09.2026

- **Die App läuft vollständig auf dem Gerät**, solange es keinen Server gibt. Morgens kommen 3 Aufgaben aus dem geprüften Startpool. Es wird kein fremder Mensch erfunden.
- **Meilenstein 2, Server-Prüfung liegt nur als Datei bereit.** `supabase/functions/moderate-task` prüft zuerst den Wortfilter und fragt danach Mistral. Fällt die KI aus oder fehlt der Schlüssel, bleibt die Aufgabe ungeprüft. Die Datei ist nicht veröffentlicht, weil es noch kein Supabase-Projekt gibt. Auf dem Gerät prüft weiter der Wortfilter. Zusätzliche Sperrwörter können später in `moderation_terms` gepflegt werden. Diese Tabelle ist ebenfalls noch nicht angelegt.
- **Meilenstein 3, Zuteilung liegt nur als Datei bereit.** `supabase/functions/match-hour` soll stündlich laufen und nur Leute nehmen, deren persönliche Morgenzeit in 1 bis 3 Stunden liegt. Niemand bekommt eigene Aufgaben, niemand bleibt leer, ein Set geht nur an eine Person. Fehlen fremde Aufgaben, kommt der Startpool, und dieselbe Startpool-Aufgabe nicht noch einmal innerhalb von 60 Tagen. Gesperrte Autoren und gemeldete Aufgaben fallen raus. Die Datei ist nicht veröffentlicht, weil es noch kein Supabase-Projekt gibt. Auf dem Gerät kommen die 3 Aufgaben weiter aus dem Startpool.
- **Meilenstein 4 bleibt beim Morgen, nicht bei Mitternacht.** Offene Aufgaben verfallen zur persönlichen Morgenzeit. Auf dem Heute-Screen gibt es Erledigt, Heute nicht und Melden. Notiz und Foto bleiben auf dem Gerät. Die Rückmeldung an die schreibende Person nennt später nur eine Zahl, zum Beispiel 2 von 3, nie den Text, nie ein Foto, nie einen Namen. Solange der Server fehlt, steht dort ehrlich, dass es keine Rückmeldung gibt. Es wird kein fremder Mensch erfunden.
- **Dieselbe schwere Aufgabe am selben Tag** zählt nur einen Hinweis, auch wenn du zweimal auf Prüfen tippst. Drei verschiedene schwere Aufgaben zählen drei.
- **Erledigt und Heute nicht** lassen sich bis zum Tagesende noch umschalten, falls der falsche Knopf getroffen wurde.
- **Pause** beginnt am nächsten Morgen, wenn heute schon Aufgaben da sind. Sonst sofort.
- **Zeitzone** kommt vom Gerät. Wechselt sie mitten am Tag, gibt es kein zweites Aufgabenset an demselben Kalendertag.
- **Fotos** nur aus der Galerie, nicht mit der Kamera. Sie bleiben auf dem Gerät und fehlen im Export.
- **Shop** zeigt die Pakete und Preise, bucht aber nichts ab. Sponsor-Aufgaben sind aus. Die Wahl „selten“ wird nur gemerkt.
- **Käufe, TestFlight und Store-Builds** sind vorbereitet, aber nicht gestartet. Dafür brauchst du später Konten.

---

## Was du selbst tun musst

Für den jetzigen Stand: **nichts.** Kein Konto, kein Schlüssel.

| Wann | Was | Geld, ungefähr |
|---|---|---|
| Vor der echten Anmeldung | Konto bei Supabase, Projekt in Frankfurt, anonyme Anmeldung einschalten | 0 € zum Start. Der nächtliche Job braucht sehr wahrscheinlich den bezahlten Plan, etwa 25 € im Monat |
| Vor der echten KI-Prüfung | Konto bei Mistral, Schlüssel nur auf dem Server | kleiner Betrag nach Verbrauch |
| Zum Testen auf dem Handy | Kostenloses Expo-Konto und die App Expo Go | 0 € |
| Wenn der Shop verkaufen soll | RevenueCat plus Apple und Google für Käufe | erst mit den Themenpaketen |
| Store | Apple Developer und Google Play Console | Apple etwa 99 € pro Jahr, Google einmalig etwa 25 € |

Nicht in den Chat schicken: geheime Schlüssel, Passwörter, `service_role`.

---

## Später, bewusst noch offen

- Texte für Datenschutz, Impressum und Nutzungsbedingungen. In der App stehen bis dahin gekennzeichnete Platzhalter.

---

## Für Meilenstein 10, festgehalten am 29.09.2026

Nicht jetzt bauen. Die App selbst bleibt unter 16 zu, egal was die Stores später anzeigen.

### 1. Kamera bei privaten Fotos

Zusätzlich zur Galerie gibt es „Foto aufnehmen“ und „Aus Galerie wählen“. Das Foto bleibt nur auf dem Gerät und wird nie hochgeladen. Die Kamera-Erlaubnis wird erst beim ersten Tippen auf „Foto aufnehmen“ abgefragt, davor steht eine kurze Erklärung.

### 2. Altersfreigabe in den Stores

Geprüft am 29.09.2026. Die genaue Zahl vergibt nicht die App, sondern ein Fragebogen im Entwicklerkonto. Den füllen wir erst aus, wenn die Store-Konten da sind. Eine Behörde kann die Zahl danach noch ändern.

**Apple.** Seit dem 24.07.2025 gibt es die Stufen 4+, 9+, 13+, 16+ und 18+. Die alten Stufen 12+ und 17+ gibt es so nicht mehr. Apple rechnet die Stufe aus den Antworten. Liegt unsere eigene Grenze höher, dürfen wir die Store-Stufe anheben. Nutzeraufgaben allein zwingen nicht automatisch auf 18+; sie stehen bei Apple sogar bei den Möglichkeiten von 4+. Eine Social-Media-Funktion (ein Feed, in dem Aufgaben vieler Leute auftauchen, mit Liken oder Weiterverbreiten) wäre mindestens 13+ und bekäme den Hinweis „Social Media“. Fremdauftrag hat keinen solchen Feed. Für die Einreichung antworten wir ehrlich. Danach setzen wir die Store-Stufe mindestens auf 16+, passend zur Sperre in der App. 18+ wäre nur dran, wenn sexuelle Inhalte, reale Gewalt oder Ähnliches zum normalen Erlebnis gehörten. Das soll die Moderation verhindern. Ob Apple das genauso sieht, wissen wir erst bei der Prüfung.

**Google.** Auch hier kommt die Stufe aus einem Fragebogen (IARC), nicht aus einer freien Wahl. In Deutschland ist 16+ der naheliegende Kandidat, in den USA kann dieselbe App als „Teen“ oder „Mature 17+“ stehen. Seit dem 26.08.2026 müssen Apps, deren Kern anonyme oder zufällige Chats sind, Minderjährige ganz aussperren, also unter 18. Fremdauftrag ist kein Chat: kein Schreiben hin und her, kein Kontakt zur anderen Person. Die strenge Chat-Regel greift deshalb nach dem Wortlaut nicht automatisch. Ein Prüfer kann die App trotzdem danebenlegen. Wenn das passiert, entscheiden wir dann, nicht jetzt.

Quellen: [Apple, 24.07.2025](https://developer.apple.com/news/?id=ks775ehf), [Apple, 09.07.2026](https://developer.apple.com/news/?id=tlur8uvi), [Google Play zu Altersfreigaben](https://support.google.com/googleplay/android-developer/answer/9859655).

