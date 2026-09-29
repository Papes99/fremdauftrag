import assert from 'node:assert/strict';
import test from 'node:test';
import de from '../i18n/de.json' with { type: 'json' };
import { SEED_TASKS, SPONSOR_TASKS, THEME_PACKS } from '../data/catalog.ts';
import { releaseDecision, ruleCheck, type ReasonKey } from './moderation.ts';

const GOOD = [
  'Frag heute jemanden nach seinem Lieblingslied und hör es dir an.',
  'Trink dein nächstes Getränk ganz bewusst, ohne Handy.',
  'Sag einem Baum guten Morgen.',
  'Leg das Handy beim nächsten Essen weg.',
  'Probier ein Obst oder Gemüse, das du lange nicht gegessen hast.',
  'Mach ein Foto von deinem Schatten.',
  'Streck dich eine Minute lang ganz bewusst.',
  'Halte jemandem die Tür auf.',
  'Schreib einer Person, an die du lange nicht gedacht hast, einen lieben Satz.',
  'Wenn du weinen musst, hol dir ein Glas Wasser.',
  'Schau eine schöne Fassade an und such ein Detail.',
  'Geh links um den Block und komm auf demselben Weg zurück.',
  'Wähle ein Lied, das du magst, und hör es an.',
  'Kauf dir ein Eis, wenn du magst.',
  'Verschenk heute einen Kaffee an jemanden.',
  'Such dir einen Moment, in dem du einfach nichts tust.',
  'Hör ein Lied, das du seit Jahren nicht mehr gehört hast.',
  'Räum genau eine Schublade auf.',
  'Lächle der nächsten Person an der Kasse zu.',
  'Finde draußen etwas in deiner Lieblingsfarbe.',
  'Schreib drei Dinge auf, die heute gut waren.',
  'Geh fünf Minuten ohne Ziel spazieren.',
  'Bedank dich bei jemandem, dem du selten dankst.',
  'Lies eine Seite in einem Buch, das du schon lange lesen wolltest.',
  'Hör eine Minute lang nur auf die Geräusche um dich herum.',
  'Schreib dir selbst einen Zettel für morgen früh.',
  'Gieß eine Pflanze oder sag ihr Hallo.',
  'Summe ein Lied aus deiner Kindheit.',
  'Such das älteste Foto auf deinem Handy und erinnere dich daran.',
  'Mal mit dem Finger ein Herz auf eine beschlagene Scheibe.',
  'Frag jemanden nach seinem Lieblingsessen.',
  'Zähl heute, wie viele Hunde du siehst.',
  'Schreib ein Kompliment auf einen Zettel und lass ihn liegen.',
  'Schau dir den Himmel an, bevor du schlafen gehst.',
  'Mach dir dein Lieblingsgetränk und genieß es im Sitzen.',
  'Erzähl jemandem einen harmlosen Witz.',
  'Fotografier etwas, das dich zum Lachen bringt.',
  'Frag jemanden, was er als Kind werden wollte.',
  'Schreib deinen Namen einmal mit der anderen Hand.',
  'Finde drei runde Dinge auf deinem Weg.',
  'Hör ein Lied in einer Sprache, die du nicht sprichst.',
  'Sag heute einmal bewusst Nein, danke.',
  'Lob heute jemanden für etwas Kleines.',
  'Nimm einen anderen Weg und schau das Schönste an.',
  'Such dir eine Wolke aus und gib ihr einen Namen.',
  'Frag jemanden, was ihn diese Woche gefreut hat.',
  'Stell eine Tasse an einen schönen Platz.',
  'Geh fünf Minuten und achte nur auf Farben.',
  'Schreib drei Dinge auf, die mit dem Morgen zu tun haben.',
  'Mach dir eine Tasse Tee und nimm dir Zeit dafür.',
];

const BAD: { text: string; key: ReasonKey }[] = [
  { text: 'Spring vom Dach und schau nicht nach unten.', key: 'danger' },
  { text: 'Ritz dich am Arm, nur ein bisschen.', key: 'danger' },
  { text: 'Leg dich auf die Bahngleise und hör zu.', key: 'danger' },
  { text: 'Spiel mit einem Messer in der Küche herum.', key: 'danger' },
  { text: 'Geh tauchen ohne Kurs, einfach so.', key: 'danger' },
  { text: 'Klau etwas Kleines im Laden, niemand merkt es.', key: 'illegal' },
  { text: 'Kauf dir heute Drogen und probier sie.', key: 'drugs' },
  { text: 'Rauch einen Joint im Park.', key: 'drugs' },
  { text: 'Trink zehn Bier bis zum Abend.', key: 'alcohol' },
  { text: 'Werd betrunken und ruf jemanden an.', key: 'alcohol' },
  { text: 'Trink ein Glas Wein in der Sonne.', key: 'alcohol' },
  { text: 'Rauch eine Zigarette vor der Tür.', key: 'smoke' },
  { text: 'Vape den ganzen Nachmittag.', key: 'smoke' },
  { text: 'Spiel im Casino dein Geld weg.', key: 'gambling' },
  { text: 'Kauf ein Los und spiel damit Lotto.', key: 'gambling' },
  { text: 'Schick einer fremden Person ein Nacktfoto.', key: 'sexual' },
  { text: 'Flirte mit einer fremden Person und fass sie an.', key: 'sexual' },
  { text: 'Bewerte den Körper einer fremden Person laut.', key: 'sexual' },
  { text: 'Beschimpfe jemanden als Schlampe.', key: 'hate' },
  { text: 'Schreib Hass über eine ganze Gruppe Menschen.', key: 'hate' },
  { text: 'Sag jemandem, er sei behindert.', key: 'hate' },
  { text: 'Verfolge eine Person bis nach Hause.', key: 'stalk' },
  { text: 'Film jemanden heimlich in der Bahn.', key: 'stalk' },
  { text: 'Fotografiere fremde Leute heimlich.', key: 'stalk' },
  { text: 'Fass eine fremde Person einfach an.', key: 'touch' },
  { text: 'Hungere heute den ganzen Tag.', key: 'diet' },
  { text: 'Fasten bis zum Abend ohne jede Ausnahme.', key: 'diet' },
  { text: 'Zähl Kalorien und iss so wenig wie möglich.', key: 'diet' },
  { text: 'Iss heute nichts, nur zum Abnehmen.', key: 'diet' },
  { text: 'Mach 100 Liegestütze am Stück.', key: 'exercise' },
  { text: 'Lauf einen Marathon ohne Vorbereitung.', key: 'exercise' },
  { text: 'Trainiere bis zur Erschöpfung weiter.', key: 'exercise' },
  { text: 'Schreib mir deine Telefonnummer auf einen Zettel.', key: 'contact' },
  { text: 'Folge mir auf Instagram und schreib mir.', key: 'contact' },
  { text: 'Triff den Autor dieser Aufgabe heute Abend.', key: 'contact' },
  { text: 'Klick auf http://example.com und mach mit.', key: 'pii' },
  { text: 'Ruf mich an unter 0176123456 bitte heute.', key: 'contact' },
  { text: 'Schreib deine Adresse auf und häng sie aus.', key: 'pii' },
  { text: 'Kauf Produkt SuperFit mit dem Code RABATT.', key: 'ads' },
  { text: 'Mach Werbung für meinen Laden, bitte.', key: 'ads' },
  { text: 'Fahr mit dem Auto eine Stunde weg.', key: 'car' },
  { text: 'Gib heute 100 Euro für etwas aus.', key: 'money' },
  { text: 'Wähl die Partei mit dem lautesten Plakat.', key: 'politics' },
  { text: 'Geh auf eine Demo gegen Menschen.', key: 'politics' },
  { text: 'Küss eine fremde Person auf die Wange.', key: 'touch' },
  { text: 'Bloßstelle eine Person vor anderen Leuten heute.', key: 'stalk' },
  { text: 'Nimm Kokain, nur ein kleines bisschen.', key: 'drugs' },
  { text: 'Spiel Poker um Geld mit Fremden.', key: 'gambling' },
  { text: 'Trink Schnaps mit einem Fremden.', key: 'alcohol' },
  { text: 'Bring dich auf einem Dach in Gefahr.', key: 'danger' },
];

test('50 harmlose Aufgaben bleiben erlaubt', () => {
  assert.ok(GOOD.length >= 50);
  for (const text of GOOD) {
    const result = ruleCheck(text);
    assert.equal(result.ok, true, text);
  }
});

test('50 problematische Aufgaben werden abgelehnt', () => {
  assert.equal(BAD.length, 50);
  for (const item of BAD) {
    const result = ruleCheck(item.text);
    assert.equal(result.ok, false, item.text);
    if (!result.ok) assert.equal(result.key, item.key, item.text);
  }
});

test('Gründe sind kurz und stehen in der Übersetzungsdatei', () => {
  const reasons = de.moderation.reasons as Record<string, string>;
  for (const item of BAD) {
    const text = reasons[item.key];
    assert.equal(typeof text, 'string', item.key);
    assert.ok(text.length > 0 && text.length <= 80, text);
  }
});

test('ohne KI bleibt eine harmlose Aufgabe ungeprüft', () => {
  const result = releaseDecision(GOOD[0]!, false);
  assert.equal(result.status, 'pending');
});

test('ein gefährlicher Text wird auch ohne KI abgelehnt', () => {
  const result = releaseDecision(BAD[0]!.text, false);
  assert.equal(result.status, 'rejected');
});

test('Startpool, Pakete und Sponsoren bestehen den Filter', () => {
  assert.ok(SEED_TASKS.length >= 300);
  const texts = [
    ...SEED_TASKS.map((task) => task.text),
    ...THEME_PACKS.flatMap((pack) => pack.tasks.map((task) => task.text)),
    ...SPONSOR_TASKS.map((task) => task.text),
  ];
  assert.equal(new Set(texts).size, texts.length);
  for (const text of texts) {
    const result = ruleCheck(text);
    assert.equal(result.ok, true, text);
  }
  for (const pack of THEME_PACKS) assert.ok(pack.tasks.length >= 40, pack.id);
});
