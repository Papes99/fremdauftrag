#!/usr/bin/env python3
"""Erzeugt src/data/catalog.ts. Jede Zeile wird danach vom Wortfilter geprüft."""
from pathlib import Path

OFFICIAL = [
    "Frag heute jemanden nach seinem Lieblingslied und hör es dir an.",
    "Nimm einen anderen Weg und fotografier das Schönste, was du siehst.",
    "Sag einem Baum guten Morgen.",
    "Trink dein nächstes Getränk ganz bewusst, ohne Handy.",
    "Schreib einer Person, an die du lange nicht gedacht hast, einen lieben Satz.",
    "Such dir eine Wolke aus und gib ihr einen Namen.",
    "Lob heute jemanden für etwas, das sonst niemand bemerkt.",
    "Hör ein Lied, das du seit Jahren nicht mehr gehört hast.",
    "Räum genau eine Schublade auf.",
    "Lächle der nächsten Person an der Kasse zu.",
    "Finde draußen etwas in deiner Lieblingsfarbe.",
    "Schreib drei Dinge auf, die heute gut waren.",
    "Geh fünf Minuten ohne Ziel spazieren.",
    "Bedank dich bei jemandem, dem du selten dankst.",
    "Probier ein Obst oder Gemüse, das du lange nicht gegessen hast.",
    "Mach ein Foto von deinem Schatten.",
    "Frag jemanden, was ihn diese Woche gefreut hat.",
    "Lies eine Seite in einem Buch, das du schon lange lesen wolltest.",
    "Hör eine Minute lang nur auf die Geräusche um dich herum.",
    "Schreib dir selbst einen Zettel für morgen früh.",
    "Gieß eine Pflanze – oder sag einer Hallo.",
    "Summe ein Lied aus deiner Kindheit.",
    "Halte jemandem die Tür auf.",
    "Such das älteste Foto auf deinem Handy und erinnere dich daran.",
    "Mal mit dem Finger ein Herz auf eine beschlagene Scheibe.",
    "Frag jemanden nach seinem Lieblingsessen.",
    "Streck dich eine Minute lang ganz bewusst.",
    "Zähl heute, wie viele Hunde du siehst.",
    "Schreib ein Kompliment auf einen Zettel und lass ihn irgendwo liegen.",
    "Schau dir den Himmel an, bevor du schlafen gehst.",
    "Mach dir dein Lieblingsgetränk und genieß es im Sitzen.",
    "Erzähl jemandem einen harmlosen Witz.",
    "Leg das Handy beim nächsten Essen weg.",
    "Fotografier etwas, das dich zum Lachen bringt.",
    "Frag jemanden, was er als Kind werden wollte.",
    "Schreib deinen Namen einmal mit der anderen Hand.",
    "Finde drei runde Dinge auf deinem Weg.",
    "Hör ein Lied in einer Sprache, die du nicht sprichst.",
    "Sag heute einmal bewusst „Nein, danke“ zu etwas, das du nicht willst.",
    "Such dir einen Moment, in dem du einfach nichts tust.",
]

GROUPS = [
    (
        "Schreib drei Dinge auf, die mit {x} zu tun haben und dir guttun.",
        ["dem Morgen", "deinem Weg", "der Küche", "dem Himmel", "einem Lied", "der Stille", "einer Farbe", "dem Wasser", "einem Baum", "dem Abend"],
    ),
    (
        "Geh fünf Minuten nach draußen und achte nur auf {x}.",
        ["Geräusche", "Farben", "Licht", "den Wind", "Schatten", "Wolken", "Blätter", "den Boden unter den Füßen", "Fenster und Türen", "kleine Bewegungen"],
    ),
    (
        "Mach dir {x} und nimm dir Zeit dafür, ohne Handy.",
        ["eine Tasse Tee", "ein Glas Wasser", "dein Lieblingsgetränk", "einen Kakao", "eine Schale mit Obst", "ein einfaches Brot", "eine warme Tasse", "einen ruhigen Platz"],
    ),
    (
        "Such heute {x} und schau es eine Minute lang an.",
        ["eine Wolke", "einen Baum", "dein Spiegelbild im Fenster", "eine Pflanze", "einen Schatten", "eine Pfütze", "ein altes Foto von dir", "eine Tür", "ein Muster auf dem Boden", "das Licht an der Wand"],
    ),
    (
        "Sag, wenn es passt, {x} einen freundlichen Satz.",
        ["jemandem zu Hause", "einer Person an der Kasse", "jemandem, den du magst", "einer Nachbarin oder einem Nachbarn", "jemandem auf dem Weg", "einer Person, die dir die Tür hält"],
    ),
    (
        "Hör heute {x}.",
        ["ein Lied aus deiner Schulzeit", "ein ruhiges Lied", "ein Lied, das jemand anderes mag", "nur die Geräusche in deinem Zimmer", "ein Lied ohne die Worte mitzulesen", "drei Minuten Stille danach", "ein Lied beim Aufräumen", "ein Lied und summ mit"],
    ),
    (
        "Räum {x} auf, nur das.",
        ["eine Schublade", "die Fensterbank", "deinen Tisch", "eine Tasche", "das Waschbecken", "eine Ecke im Flur", "die Ablage neben dem Bett", "genau drei Dinge"],
    ),
    (
        "Leg das Handy weg, während du {x}.",
        ["isst", "eine Tasse Tee trinkst", "spazieren gehst", "eine Seite liest", "mit jemandem redest", "aus dem Fenster schaust", "eine Pflanze gießt", "dich eine Minute streckst"],
    ),
    (
        "Fotografiere {x}. Das Foto bleibt bei dir.",
        ["deinen Schatten", "den Himmel", "etwas, das dich zum Lachen bringt", "eine Pflanze in deiner Nähe", "das Licht auf dem Boden", "drei runde Dinge", "deine Schuhe von oben", "ein Muster, das dir gefällt"],
    ),
    (
        "Streck dich eine Minute und denk dabei an {x}.",
        ["einen guten Moment von heute", "jemanden, den du magst", "einen Ort, an dem du gern bist", "ein Lied", "den nächsten kleinen Schritt", "nichts Bestimmtes"],
    ),
    (
        "Bedank dich, falls es passt, bei {x}.",
        ["jemandem, dem du selten dankst", "der Person, die dir etwas gehalten hat", "dir selbst, leise", "jemandem zu Hause", "einer Person im Laden", "jemandem, der dir zugehört hat"],
    ),
    (
        "Lies {x}.",
        ["eine Seite in einem Buch", "drei Sätze auf einem Zettel", "die Überschrift einer Zeitung und leg sie wieder weg", "einen Satz laut", "etwas, das du schon lange aufheben wolltest", "eine Seite und schreib ein Wort ab, das dir gefällt"],
    ),
    (
        "Summe {x}.",
        ["ein Lied aus deiner Kindheit", "ein Lied, das du heute gehört hast", "eine Melodie, die du nur halb kennst", "etwas Langsames, eine Minute lang", "den Refrain, den du noch kannst", "ein Lied beim Spülen"],
    ),
    (
        "Finde auf deinem Weg {x}.",
        ["drei runde Dinge", "etwas in deiner Lieblingsfarbe", "eine Tür, die dir gefällt", "einen Baum mit einem besonderen Ast", "zwei gleiche Dinge", "etwas, das sich bewegt", "ein Licht, das schön aussieht", "eine Form, die du nachzeichnen könntest"],
    ),
    (
        "Schau heute Abend {x} an, bevor du schlafen gehst.",
        ["den Himmel", "ein Licht in der Wohnung", "ein Foto, das dir guttut", "deine Hände", "die Pflanze am Fenster", "die Straße für einen Moment"],
    ),
    (
        "Gieß {x} oder sag ihr kurz Hallo.",
        ["eine Pflanze", "die Pflanze, die du oft vergisst", "eine Pflanze bei jemandem, wenn das passt", "die Pflanze auf der Fensterbank"],
    ),
    (
        "Schreib einen lieben Satz an {x}. Nur wenn du magst.",
        ["eine Person, an die du lange nicht gedacht hast", "dich selbst", "jemanden zu Hause", "eine Person, die dir fehlt", "jemanden, dem du selten schreibst"],
    ),
    (
        "Zähl heute {x}.",
        ["wie viele Hunde du siehst", "wie viele Türen du öffnest", "wie oft du lächelst", "die Treppenstufen auf einem Weg", "wie viele Menschen du grüßt", "die Fenster in einem Haus, das dir gefällt"],
    ),
    (
        "Mach eine Minute lang nichts außer {x}.",
        ["atmen und hören", "aus dem Fenster schauen", "deine Hände anschauen", "ein Glas Wasser halten", "die Füße auf den Boden stellen", "ein Lied ausklingen lassen"],
    ),
    (
        "Probier {x}, wenn du es schon da hast.",
        ["ein Obst, das du lange nicht gegessen hast", "ein Gemüse, das liegen geblieben ist", "dein Getränk einmal ohne Ablenkung", "ein Brot mit etwas, das du selten nimmst", "einen Tee, der schon im Schrank steht", "eine Frucht und schreib auf, wie sie schmeckt"],
    ),
    (
        "Halte {x} die Tür auf, wenn es sich ergibt.",
        ["jemandem", "der nächsten Person", "jemandem mit vollen Händen", "jemandem, der hinter dir kommt"],
    ),
    (
        "Gib {x} einen Namen, nur für dich.",
        ["einer Wolke", "einer Pflanze", "einem Schatten", "einem Stein auf dem Weg", "einem Fleck Licht an der Wand", "einem Baum, an dem du oft vorbeikommst"],
    ),
    (
        "Such in deiner Wohnung {x}.",
        ["etwas Weiches", "etwas, das nach einem guten Tag riecht", "drei blaue Dinge", "etwas, das du reparieren oder nur abstauben kannst", "ein Ding, das du jemandem borgen könntest", "etwas, das du seit einem Jahr nicht angeschaut hast"],
    ),
    (
        "Erzähl, falls du magst, {x} von etwas Kleinem, das schön war.",
        ["einer Person zu Hause", "jemandem am Telefon", "dir selbst, laut", "einer Person, die du heute siehst", "jemandem, der dir selten etwas erzählt"],
    ),
    (
        "Schreib mit der anderen Hand {x}.",
        ["deinen Namen", "ein Wort, das dir gefällt", "guten Morgen", "danke", "den Wochentag", "ein kleines Herz"],
    ),
    (
        "Mach in deiner Wohnung für eine Minute {x}.",
        ["das Licht etwas wärmer oder dimmer", "ein Fenster auf und wieder zu", "einen Stuhl zurecht", "die Schuhe nebeneinander", "eine Tasse an einen schönen Platz", "die Gardine gerade"],
    ),
    (
        "Schreib auf einen Zettel {x} und leg ihn in deine Tasche.",
        ["ein Wort, das dir guttut", "den Satz: das reicht", "drei kleine Freuden", "den Namen einer Pflanze", "ein Lied, das du hören willst", "eine Uhrzeit für einen Spaziergang", "ein Danke an dich", "eine Farbe für morgen", "einen harmlosen Witz", "was du heute schon geschafft hast"],
    ),
    (
        "Geh heute einmal bewusst {x}.",
        ["langsamer die Treppe", "den längeren Weg zum Laden", "barfuß durch die Wohnung", "um den Block", "bis zur nächsten Ecke und zurück", "an einem Baum vorbei", "mit den Händen in den Taschen", "ohne Musik im Ohr", "und zähl dabei deine Schritte bis vierzig", "und bleib an einer Ecke kurz stehen"],
    ),
    (
        "Ordne {x}, mehr nicht.",
        ["die Teetassen", "die Stifte", "die Socken in einer Schublade", "die Bücher, die quer liegen", "die Gewürze, die du siehst", "drei Briefe oder Zettel", "die Jacken an der Garderobe", "das Besteck in einem Fach", "die Kissen auf dem Sofa", "die Tüten in einer Schublade"],
    ),
    (
        "Schau dir {x} genau an und such ein Detail, das dir neu ist.",
        ["deine Hände", "eine Türklinke", "eine Zimmerpflanze", "dein Lieblingsshirt", "den Himmel über dem Dach", "eine Tasse", "den Boden im Flur", "ein Fenster", "deine Schuhe", "eine Hauswand"],
    ),
    (
        "Mach jemandem den Moment leichter, indem du {x}. Nur wenn du magst.",
        ["die Tür aufhältst", "einen Platz frei machst", "freundlich schaust", "etwas aufhebst, das herunterfiel", "kurz wartest", "ein Glas Wasser hinstellst", "eine Tasche anreichst", "leise bist, wenn jemand ruht", "einen Stift zurücklegst", "danke sagst"],
    ),
    (
        "Nimm dir für {x} genau eine Minute.",
        ["ein Glas Wasser", "einen Blick aus dem Fenster", "eine Dehnung der Schultern", "ein Lied im Kopf", "das Aufräumen einer Ecke", "das Lesen eines Satzes", "das Gießen einer Pflanze", "das Schreiben deines Namens", "das Zuhören ohne Bildschirm", "das Sitzen ohne Aufgabe"],
    ),
    (
        "Merk dir heute {x} und schreib es abends auf.",
        ["ein freundliches Gesicht", "ein Geräusch, das dir gefiel", "eine Farbe an einem Haus", "ein Essen, das geschmeckt hat", "ein Lied, das irgendwo lief", "einen Satz, der nett war", "einen Baum", "ein Licht", "einen Witz", "einen Weg, den du selten gehst"],
    ),
    (
        "Leg {x} an einen Platz, an dem du es morgen siehst.",
        ["einen Zettel mit einem guten Wort", "eine Tasse", "ein Buch", "eine Frucht", "deine Schlüssel", "einen Stift", "ein Foto, das dir guttut", "eine kleine Pflanze", "einen Schal", "ein Glas"],
    ),
    (
        "Frag dich leise {x} und antworte in einem Satz.",
        ["was heute leicht war", "wem du dankbar bist", "welches Lied passen würde", "was du morgen nicht brauchst", "welche Farbe der Tag hatte", "wo du eine Minute Stille hattest", "was du gern riechst", "welcher Weg schön war", "was du jemandem gönnst", "was du behalten willst"],
    ),
]

HERBST = [
    "Heb ein buntes Blatt auf und leg es für einen Tag auf den Tisch.",
    "Such eine Kastanie und schau dir die Oberfläche genau an.",
    "Mach dir einen warmen Tee und trink die erste Tasse im Sitzen.",
    "Schau dir heute den Abendhimmel an, bis sich die Farbe ändert.",
    "Fotografiere eine Pfütze. Das Foto bleibt bei dir.",
    "Leg dir einen Schal um, auch wenn du nur kurz rausgehst.",
    "Zünd eine Kerze an, die du schon zu Hause hast, und schau ihr eine Minute zu.",
    "Stell dich ans Fenster und hör dem Regen zu, falls er da ist.",
    "Such draußen etwas Oranges und lass es dort liegen.",
    "Schreib drei Dinge auf, die du am Herbst magst.",
    "Geh fünf Minuten und achte nur auf Blätter.",
    "Reib eine Kastanie kurz an deiner Jacke und riech daran.",
    "Mach ein Foto vom Licht unter den Bäumen.",
    "Hol dir im Laden nur zum Anschauen einen Kürbis an, ohne ihn kaufen zu müssen.",
    "Trink etwas Warmes und leg das Handy weg.",
    "Such ein Blatt in deiner Lieblingsfarbe.",
    "Schreib einem Menschen, dass das Wetter dich an etwas Schönes erinnert.",
    "Stell eine Tasse so hin, dass du den Dampf siehst.",
    "Zähl die Schichten an einem Blatt.",
    "Summe ein Lied, das sich nach kühler Luft anfühlt.",
    "Räum die Fensterbank auf und lass ein Blatt dort liegen.",
    "Schau einer Wolke zu, bis sie die Form wechselt.",
    "Zieh die Jacke bewusst an und sag dir, wohin du gehst.",
    "Finde drei Dinge draußen, die sich im Wind bewegen.",
    "Lies eine Seite und mach dir danach einen Tee.",
    "Schreib „Herbst“ mit der anderen Hand.",
    "Gieß eine Pflanze, bevor die Heizung richtig an ist.",
    "Such einen Baum und sag ihm guten Morgen.",
    "Fotografiere deine Schuhe auf nassem Boden.",
    "Mach eine Minute lang nichts außer den Himmel anschauen.",
    "Leg eine Kastanie in die Tasche und nimm sie abends wieder raus.",
    "Schau, welche Farbe der Tee in der Tasse hat.",
    "Finde ein Muster aus Zweigen vor dem Himmel.",
    "Schreib drei warme Dinge auf, die nichts kosten.",
    "Geh einen anderen Weg und achte auf den Geruch der Luft.",
    "Halte jemandem die Tür auf, wenn du mit einem Schal hereinkommst.",
    "Such im Schrank einen Pullover, den du lange nicht anhattest, und zieh ihn an.",
    "Stell eine Tasse auf den Tisch und iss oder trink etwas Kleines dazu.",
    "Zähl heute, wie viele bunte Blätter du siehst.",
    "Schreib einen Satz über das Licht am Nachmittag.",
    "Schau dir die Tropfen an einer Scheibe an.",
    "Finde etwas Rundes, das in die Jahreszeit passt.",
]
NACHT = [
    "Mach dir in der Pause eine Tasse Tee und trink sie im Sitzen.",
    "Schau auf dem Heimweg einmal in den Nachthimmel.",
    "Leg nach der Schicht das Handy eine Minute weg.",
    "Schreib drei Dinge auf, die in der Schicht in Ordnung waren.",
    "Streck dich nach der Arbeit eine Minute lang.",
    "Gieß eine Pflanze, wenn du nach Hause kommst.",
    "Hör ein ruhiges Lied auf dem Weg, ohne nebenbei zu tippen.",
    "Sag einer Kollegin oder einem Kollegen danke, wenn es passt.",
    "Wasch dir das Gesicht bewusst mit warmem Wasser.",
    "Such dir auf dem Weg ein Licht, das schön aussieht.",
    "Iss in der Pause etwas, das du schon dabei hast, ohne Bildschirm.",
    "Schreib dir einen Zettel für den nächsten Morgen, auch wenn der mittags ist.",
    "Zähl auf dem Heimweg drei Fenster, in denen noch Licht brennt.",
    "Summe ein Lied, das dich nicht aufschreckt.",
    "Stell die Schuhe nach der Schicht nebeneinander.",
    "Trink ein Glas Wasser, bevor du ins Bett gehst, egal wie spät das ist.",
    "Schau eine Minute aus dem Fenster des Pausenraums.",
    "Schreib den Namen von jemandem auf, der dir die Schicht leichter gemacht hat.",
    "Mach die Schultern einmal kreisen, ganz langsam.",
    "Fotografiere ein Licht in der Nacht. Das Foto bleibt bei dir.",
    "Leg eine Jacke bereit, bevor du schlafen gehst.",
    "Hör eine Minute nur auf die Geräusche nach der Arbeit.",
    "Sag dir selbst einen freundlichen Satz, bevor du das Licht ausmachst.",
    "Räum nur die Tasche aus, nichts weiter.",
    "Such auf dem Weg etwas in deiner Lieblingsfarbe, auch im Dunkeln.",
    "Mach dir ein einfaches Getränk und setz dich dafür hin.",
    "Schreib drei kurze Worte, die die Schicht beschreiben, ohne Bewertung.",
    "Halte jemandem die Tür auf, auch wenn ihr beide müde seid.",
    "Schau dir die Hände an und wasch sie in Ruhe.",
    "Finde einen Moment, in dem du einfach nichts tust.",
    "Lies einen Satz und leg das Blatt weg.",
    "Stell eine Pflanze so, dass du sie beim Reinkommen siehst.",
    "Zähl die Stufen auf dem Weg nach Hause.",
    "Hör ein Lied aus einem Jahr, in dem du viel nachts wach warst.",
    "Schreib „danke“ mit der anderen Hand.",
    "Schau, ob der Himmel schon heller wird, und geh trotzdem schlafen, wenn du dran bist.",
    "Pack dir für die nächste Schicht etwas zu trinken ein.",
    "Setz dich eine Minute, bevor du die Schuhe ausziehst.",
    "Sag einem Gegenstand in der Küche guten Morgen, auch wenn es Abend für andere ist.",
    "Mach das Licht warm und schau es an, bevor du es ausmachst.",
    "Finde drei runde Dinge auf dem Weg zur Arbeit.",
    "Schreib auf, worauf du dich nach der Schicht freust, und sei klein dabei.",
]
STILL = [
    "Schreib drei gute Dinge auf, nur für dich.",
    "Hör ein Lied mit Kopfhörern und summ leise mit.",
    "Geh fünf Minuten allein spazieren, ohne mit jemandem zu reden.",
    "Räum eine Schublade auf, während niemand etwas von dir braucht.",
    "Schau eine Wolke an und gib ihr in Gedanken einen Namen.",
    "Lies eine Seite, ohne sie jemandem zu erzählen.",
    "Fotografiere nur deinen eigenen Schatten und behalte das Bild.",
    "Mach dir Tee und trink ihn allein am Tisch.",
    "Summe ein Lied so leise, dass es nur du hörst.",
    "Such drei runde Dinge, ohne sie jemandem zu zeigen.",
    "Schreib deinen Namen mit der anderen Hand.",
    "Streck dich eine Minute, wenn niemand zuschaut.",
    "Schau den Himmel an, bevor du schlafen gehst.",
    "Gieß eine Pflanze und sag ihr Hallo, nur in Gedanken.",
    "Leg das Handy beim Essen weg und schau auf den Teller.",
    "Finde in der Wohnung etwas in deiner Lieblingsfarbe.",
    "Hör eine Minute nur auf die Geräusche im Zimmer.",
    "Schreib dir selbst einen Zettel für morgen.",
    "Such das älteste Foto auf deinem Handy und schau es allein an.",
    "Mal ein Herz auf eine beschlagene Scheibe, wenn du magst.",
    "Zähl die Dinge auf dem Tisch, die du wirklich brauchst.",
    "Mach eine Minute lang nichts.",
    "Probier ein Obst, das schon da ist, und schreib ein Wort zum Geschmack.",
    "Stell eine Tasse an einen Platz, der nur für dich schön ist.",
    "Lies drei Sätze laut, aber leise genug für ein leeres Zimmer.",
    "Geh einen anderen Weg und sprich dabei mit niemandem.",
    "Schreib ein Kompliment an dich selbst und steck den Zettel weg.",
    "Schau dir deine Hände eine Minute lang an.",
    "Hör ein Lied in einer Sprache, die du nicht verstehst, ganz für dich.",
    "Räum genau drei Dinge an ihren Platz.",
    "Finde ein Muster auf dem Boden und folge ihm mit den Augen.",
    "Mach das Fenster kurz auf und atme die Luft.",
    "Schreib drei Dinge auf, die du heute nicht tun musst.",
    "Such einen Schatten und schau, wie er sich bewegt.",
    "Leg dich nicht hin, setz dich nur und hör ein Lied zu Ende.",
    "Gieß nur eine Pflanze, nicht alle.",
    "Schreib „Nein, danke“ auf einen Zettel und behalt ihn.",
    "Schau eine Pflanze an, ohne etwas daran zu ändern.",
    "Falte ein Blatt Papier und leg es in ein Buch.",
    "Zähl die Farben in deinem Zimmer.",
    "Mach dir ein Getränk und trink es am Fenster.",
    "Such ein altes Lied und hör nur die erste Minute.",
]
KINDER = [
    "Such mit einem Kind drei runde Dinge auf dem Weg.",
    "Singt zusammen ein kurzes Lied, das ihr beide kennt.",
    "Malt mit dem Finger ein Herz auf eine beschlagene Scheibe.",
    "Zählt zusammen, wie viele Hunde ihr seht.",
    "Lies eine Seite vor, langsam.",
    "Baut einen kleinen Turm aus Dingen, die schon zu Hause sind.",
    "Sucht draußen etwas in eurer Lieblingsfarbe.",
    "Erzählt euch, was heute schön war, jeder einen Satz.",
    "Hört eine Minute auf die Geräusche draußen.",
    "Macht gemeinsam eine Minute lang lange Arme.",
    "Gebt einer Wolke zusammen einen Namen.",
    "Backt oder legt ein Brot auf den Teller und esst es ohne Handy.",
    "Sucht das älteste Foto, auf dem ihr beide oder das Kind zu sehen seid, und schaut es an.",
    "Gießt zusammen eine Pflanze.",
    "Schreibt eure Namen mit der anderen Hand.",
    "Zählt die Treppenstufen und sagt die Zahlen abwechselnd.",
    "Macht ein Foto vom Schatten des Kindes, wenn es das mag. Es bleibt auf dem Gerät.",
    "Sucht drei blaue Dinge in der Wohnung.",
    "Erfindet einen harmlosen Witz, der niemanden auslacht.",
    "Legt das Handy weg, während ihr esst.",
    "Schaut zusammen in den Himmel, bevor es ins Bett geht.",
    "Summt ein Kinderlied und das Kind darf falsch mitsingen.",
    "Räumt genau eine Kiste Spielzeug auf, nicht das ganze Zimmer.",
    "Sucht einen Baum und sagt ihm gemeinsam guten Morgen.",
    "Macht eine Tasse Tee für dich und etwas Warmes für das Kind.",
    "Zeichnet mit dem Finger auf den Tisch, was ihr heute gesehen habt.",
    "Zählt die Löffel in der Schublade.",
    "Geht fünf Minuten ohne Ziel, Hand in Hand, wenn das Kind das will.",
    "Sucht ein Blatt und schaut euch die Linien an.",
    "Lest ein Wort und klatscht die Silben.",
    "Baut eine Höhle aus einer Decke und sitzt eine Minute darin.",
    "Sagt einander einen Satz, der mit „ich mag“ anfängt.",
    "Stellt die Schuhe nebeneinander, als kleines Spiel.",
    "Schaut, wer zuerst drei runde Dinge findet.",
    "Macht das Licht etwas dunkler und schaut die Schatten an der Wand.",
    "Erzählt, was ihr als ganz kleine Kinder gemocht habt.",
    "Sucht in der Küche etwas, das knuspert, und esst es im Sitzen.",
    "Gibt einer Pflanze einen gespielten Namen.",
    "Klatscht einen Rhythmus und das Kind darf ihn nachmachen.",
    "Schreibt einen Zettel „für morgen“ und legt ihn unters Kopfkissen.",
    "Zählt die Fenster in einem Haus, an dem ihr vorbeigeht.",
    "Hört ein Lied und tanzt nur mit den Händen.",
]

SPONSORS = [
    ("sponsor-kaffee", "Café an der Ecke", "Verschenk heute einen Kaffee an jemanden, wenn du ohnehin einen trinkst."),
    ("sponsor-bibliothek", "Die Bibliothek um die Ecke", "Leih ein Buch aus, das du jemandem zeigen kannst, ohne es kaufen zu müssen."),
    ("sponsor-park", "Der Stadtpark", "Setz dich fünf Minuten auf eine Bank im Park und schau den Bäumen zu."),
]


def take(template: str, values: list[str]) -> list[str]:
    lines = []
    for value in values:
        line = template.format(x=value)
        line = " ".join(line.split())
        lines.append(line)
    return lines


def main() -> None:
    seeds: list[str] = []
    seen: set[str] = set()

    def add(line: str) -> None:
        line = " ".join(line.split())
        if line in seen:
            return
        if not (10 <= len(line) <= 140):
            raise SystemExit(f"Länge {len(line)}: {line}")
        seen.add(line)
        seeds.append(line)

    for line in OFFICIAL:
        add(line)
    for template, values in GROUPS:
        for line in take(template, values):
            add(line)

    if len(seeds) < 300:
        raise SystemExit(f"nur {len(seeds)} Aufgaben")

    packs = {
        "herbst": ("Herbst", "Laub, Tee, Abendlicht und kleine warme Dinge.", "2,49 €", HERBST),
        "nachtschicht": ("Nachtschicht", "Kleine Dinge, wenn andere schlafen und du arbeitest.", "2,49 €", NACHT),
        "introvertiert": ("Introvertiert", "Aufgaben ganz ohne Gespräch.", "1,99 €", STILL),
        "kinder": ("Mit Kindern", "Aufgaben, die man gemeinsam mit Kindern machen kann.", "2,99 €", KINDER),
    }

    for name, items in packs.items():
        title, desc, price, lines = items
        if len(lines) < 40:
            raise SystemExit(f"{name} hat nur {len(lines)}")
        for line in lines:
            if not (10 <= len(line) <= 140):
                raise SystemExit(f"{name} Länge {len(line)}: {line}")

    out = []
    out.append("/** Geprüfter Startpool, Themenpakete und inaktive Sponsor-Aufgaben. */")
    out.append("export type CatalogTask = { id: string; text: string };")
    out.append("export type ThemePack = {")
    out.append("  id: string;")
    out.append("  name: string;")
    out.append("  description: string;")
    out.append("  priceLabel: string;")
    out.append("  tasks: CatalogTask[];")
    out.append("};")
    out.append("export type SponsorTask = { id: string; name: string; text: string };")
    out.append("")
    out.append("export const SEED_TASKS: CatalogTask[] = [")
    for i, line in enumerate(seeds, start=1):
        out.append(f"  {{ id: 'seed-{i:03d}', text: {line!r} }},")
    out.append("];")
    out.append("")
    out.append("export const THEME_PACKS: ThemePack[] = [")
    for key, (title, desc, price, lines) in packs.items():
        out.append("  {")
        out.append(f"    id: {key!r},")
        out.append(f"    name: {title!r},")
        out.append(f"    description: {desc!r},")
        out.append(f"    priceLabel: {price!r},")
        out.append("    tasks: [")
        for i, line in enumerate(lines, start=1):
            out.append(f"      {{ id: 'pack-{key}-{i:02d}', text: {line!r} }},")
        out.append("    ],")
        out.append("  },")
    out.append("];")
    out.append("")
    out.append("export const SPONSOR_TASKS: SponsorTask[] = [")
    for sid, name, text in SPONSORS:
        out.append(f"  {{ id: {sid!r}, name: {name!r}, text: {text!r} }},")
    out.append("];")
    out.append("")
    path = Path("/workspace/fremdauftrag/src/data/catalog.ts")
    path.write_text("\n".join(out) + "\n", encoding="utf-8")
    print(f"seeds {len(seeds)} packs {sum(len(p[3]) for p in packs.values())}")


if __name__ == "__main__":
    main()
