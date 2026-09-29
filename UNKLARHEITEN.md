# Unklarheiten – Fremdauftrag

Stand: 29. September 2026

Die Spezifikation (Version 1.0) ist vollständig gelesen. **Mit dem Bau ist noch nicht begonnen.**
Meilenstein 1 startet erst, wenn die Punkte unten entschieden sind.

Jede Frage hat eine Empfehlung. Wenn du nichts anderes sagst, baue ich später nach der Empfehlung.

---

## Bitte entscheiden

### 1. Wann endet ein Aufgabentag?

In der Spezifikation stehen zwei Dinge, die sich widersprechen:

- Abschnitt 4.1: Aufgaben gelten **bis zum nächsten Morgen** (die Morgenzeit ist frei einstellbar, auch 14:00 für Nachtschicht).
- Meilenstein 4: Ablauf **um Mitternacht**.

Beides gleichzeitig geht nicht. Für Schichtarbeit ist Mitternacht falsch: Die Aufgaben wären weg, obwohl der Tag für diese Person noch läuft.

**Empfehlung:** Ein Tag endet an der persönlichen Morgenzeit. Danach gibt es neue Aufgaben. Offene Aufgaben von gestern gelten dann als nicht erledigt.

---

### 2. Ab wann fliegt eine gemeldete Aufgabe raus?

Die Spezifikation sagt: ab **2 Meldungen** wird die Aufgabe entfernt.

Problem: Eine Aufgabe von einem echten Menschen sieht nur **eine** Person (Exklusivität, Abschnitt 4.3). Diese eine Person kann die Aufgabe nur einmal melden. Zwei Meldungen kommen dann nie zusammen. Die Schutzregel greift bei echten Aufgaben praktisch nicht.

Startpool-Aufgaben sehen viele Menschen. Dort sind zwei Meldungen sinnvoll.

**Empfehlung:**

- Aufgabe von einem Menschen: **eine** Meldung reicht. Sie wird sofort durch eine harmlose Startpool-Aufgabe ersetzt. Hinweis in der App: „Diese Aufgabe wurde ausgetauscht.“ Du prüfst den Fall später in der Admin-Ansicht.
- Startpool, Themenpaket, Sponsor: erst ab **2** Meldungen entfernen.

---

### 3. Wann gibt es einen Strike?

Ab 3 Strikes in 30 Tagen: 7 Tage Schreibsperre. Ab 6: dauerhafte Sperre.

Die Spezifikation sagt: Strike bei abgelehnter Aufgabe **mit schwerem Grund** oder bei bestätigter Meldung.

Die KI-Antwort ist aber nur „ok“ oder „nicht ok plus kurzer Grund“. Sie sagt nicht, ob der Grund schwer ist. Ohne diese Unterscheidung würde jede Ablehnung zaehlen – auch „Das braucht ein Auto“ oder „Das ist zu teuer“. Nette Menschen waeren schnell gesperrt.

**Empfehlung:** Die KI muss zusätzlich sagen, ob es schwer ist.

- **Schwer (Strike):** Gefahr, Selbstverletzung, Illegales, Drogen, Alkohol, Sexuelles, Hass, Belästigung, heimliches Filmen, Kontakt zum Autor, persönliche Daten.
- **Leicht (kein Strike, nur ablehnen):** zu teuer, braucht ein Auto, dauert zu lang, Werbung, politische Agitation ohne Hass, Diät-Challenge.

---

### 4. Essen: strenge KI-Regel gegen deine eigenen Beispiele

Die KI-Anweisung sagt: nichts mit Essen oder Diät.

Mehrere Beispiele aus dem Startpool wären damit verboten:

- „Trink dein nächstes Getränk ganz bewusst, ohne Handy.“
- „Probier ein Obst oder Gemüse, das du lange nicht gegessen hast.“
- „Frag jemanden nach seinem Lieblingsessen.“
- „Mach dir dein Lieblingsgetränk und genieß es im Sitzen.“
- „Leg das Handy beim nächsten Essen weg.“

**Empfehlung:** Normales Essen und Trinken erlauben. Ablehnen nur: Hungern, Fasten, Diät, Kalorien, Ess-Challenges, extremes Training. Die KI-Anweisung wird entsprechend enger formuliert. Deine Beispiele bleiben.

---

### 5. Geburtsjahr speichern oder nicht?

Unter 16 gibt es kein Konto. Das steht fest.

Das Geburtsjahr ist ein persönliches Datum. Für den Jugendschutz reicht: „Diese Person ist mindestens 16.“ Das Jahr selbst muss man dafür nicht aufheben.

**Empfehlung:** Nur speichern, dass die Person mindestens 16 ist. Das Jahr wird nicht gespeichert. Unter 16: freundliche Absage, kein Konto.

Wer das Jahr trotzdem speichern will (wie in der Tabelle in Abschnitt 6), braucht später einen klaren Satz in der Datenschutzerklärung.

---

### 6. Supabase (die Datenbank) – hast du schon ein Konto?

Für die anonyme Anmeldung brauchst du ein Projekt bei Supabase, Server in **Frankfurt (EU)**.

**Empfehlung für jetzt:** Noch nichts anlegen. Zuerst die Oberfläche von Meilenstein 1. Die Anmeldung ist dann deutlich als „noch nicht verbunden“ markiert. Die Klick-Anleitung kommt von mir, bevor es echt sein muss.

Wenn du schon ein Projekt hast: Projekt-Adresse und den **öffentlichen** Schlüssel (anon key) schicken. Den geheimen Schlüssel (`service_role`) **nicht** in den Chat schicken. Der bleibt nur auf dem Server.

---

## So baue ich es, außer du sagst nein

Das sind keine offenen Fragen mehr, sondern Festlegungen. Sag Bescheid, wenn eine davon falsch ist.

### Vorschau ist kein zweites Produkt

Die App bleibt für **iPhone und Android**. Es gibt keine öffentliche Website.

Damit du beim Bauen trotzdem sehen kannst, wie es aussieht, gibt es hier im Chat eine Vorschau. Die sieht aus wie das Handy. Es ist dieselbe App, nur zum Anschauen. Installieren auf dem echten Handy kommt später (Expo Go, dann TestFlight und Google Play intern).

### Name der Kontotabelle

In der Spezifikation heißt die Tabelle `users`. Bei Supabase heißt die Login-Tabelle aber schon `users`. Deshalb heißt dein Profil `profiles`, mit denselben Feldern. Sonst vermischen sich Login und App-Daten.

### Autor darf nicht durchsickern

Nutzer dürfen nie die `author_id` einer fremden Aufgabe sehen. Ein normales „hol die Aufgabe“ würde die ID mitschicken, wenn man nicht aufpasst.

Deshalb gibt es eine extra Sicht nur mit dem Aufgabentext, ohne Autor. Die App liest fremde Aufgaben nur darüber.

### Schrift und Aussehen

Schrift: **Nunito** (rund und freundlich). Farben wie in der Spezifikation: Salbeigrün, Sand, warmes Orange, Dunkelgrau. Dazu ein Dunkelmodus.

### Admin-Ansicht kommt erst in Meilenstein 7

Kein normaler Screen in der App. Nur für dich, mit eigener Rolle in der Datenbank. Normale Nutzer kommen da nicht hin.

### Neue Nutzer am ersten Tag

Direkt nach dem Onboarding gibt es 3 Aufgaben aus dem Startpool. Das **ist** das Set für diesen Tag. Der nächtliche Job gibt am selben Kalendertag kein zweites Set.

### Meldung ohne Identität

Es gibt keine Profile und keine Namen. „Diesen Menschen sperren“ heißt deshalb nur: diese Autorin oder diesen Autor nie wieder als Gegenüber bekommen, und die Aufgabe ist weg. Die App sagt nicht, wer das war.

### KI für die Moderation (erst Meilenstein 2)

Empfehlung: **Mistral** (Firma in Frankreich, eher EU) statt eines US-Dienstes. Aufgabentexte verlassen dafür kurz das eigene System. Das muss später in der Datenschutzerklärung stehen. Den Schlüssel legst du nur auf dem Server ab, nie in der App.

Wenn die KI ausfällt oder zu lange braucht: Aufgabe bleibt „wird noch geprüft“ und wird nicht freigegeben. Es gibt einen Knopf zum erneuten Prüfen, damit niemand festhängt.

### Schonungstag

Ein verpasster Tag pro Kalenderwoche (Montag bis Sonntag, in der Zeitzone der Person) bricht die Streak nicht. Der zweite verpasste Tag in derselben Woche bricht sie. Pause friert die Streak ein und verbraucht keinen Schonungstag.

---

## Was du selbst tun musst – und wann

Jetzt: **nichts.** Erst die Entscheidungen oben.

| Wann | Was | Geld, ungefähr |
|---|---|---|
| Vor der echten Anmeldung | Konto bei Supabase, Projekt in Frankfurt, anonyme Anmeldung einschalten | 0 € zum Start. Der nächtliche Job (Meilenstein 3) braucht sehr wahrscheinlich den bezahlten Plan, etwa 25 € im Monat |
| Meilenstein 2 | Konto beim KI-Dienst (voraussichtlich Mistral), Schlüssel nur auf dem Server | kleiner Betrag nach Verbrauch |
| Zum Testen auf dem Handy | Kostenloses Expo-Konto und die App **Expo Go** | 0 € |
| Meilenstein 8 | RevenueCat plus Apple und Google für Käufe | kommt erst mit den Themenpaketen |
| Meilenstein 10, Store | Apple Developer und Google Play Console | Apple etwa 99 € pro Jahr, Google einmalig etwa 25 € |

Nicht an mich schicken: geheime Schlüssel, Passwörter, `service_role`.

---

## Bewusst noch nicht geklärt, weil es später drankommt

- Konkreter KI-Anbieter, sobald Meilenstein 2 startet.
- Ob Apple die App wegen Aufgaben von Fremden auf 17+ statt 16+ setzt. Die App selbst lässt unter 16 trotzdem nicht rein. Das klärt sich bei der Store-Einreichung.
- Texte für Datenschutz, Impressum und Nutzungsbedingungen bleiben Platzhalter, bis du sie juristisch ersetzt hast.
