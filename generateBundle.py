#!/usr/bin/env python3
import json, os, random

def generateBundleItem():
    ctr = 1
    while True:
        item =  {
            "resource": {
                "resourceType": "QuestionnaireResponse",
                "identifier": {
                    "value": str(ctr)
                },
                "item": [ {
                    "linkId": "1",
                    "text": "Allgemeine Fragen zu Ihrer Person:",
                    "item": [ {
                    "linkId": "1.1",
                    "text": "Geschlecht:",
                    "answer": [ {
                        "valueString": random.choice(["w", "m", "d"])
                    } ]
                    }, {
                    "linkId": "1.2",
                    "text": "Wie viele Stunden pro Woche arbeiten Sie?",
                    "answer": [ {
                        "valueString": random.choice(["39 Std./Woche", "Bis 35 Std./Woche", "Bis 20 Std./Woche", "Unter 20 Std./Woche"])
                    } ]
                    }, {
                    "linkId": "1.3",
                    "text": "In welcher Position sind Sie eingestellt?",
                    "answer": [ {
                        "valueString": random.choice(["Fachkraft", "Pflegefachhelfer", "Pflegehelfer", "Sonstige"])
                    } ]
                    }, {
                    "linkId": "1.4",
                    "text": "Angaben zu Ihrem Alter",
                    "answer": [ {
                        "valueString": random.choice(["Bis 25 Jahre", "25-40 Jahre", "40-55 Jahre", "Älter als 55 Jahre"])
                    } ]
                    }, {
                    "linkId": "1.5",
                    "text": "Wie lange haben Sie bereits Erfahrung in der Pflege?",
                    "answer": [ {
                        "valueString": random.choice(["0-2 Jahre", "2-6 Jahre", "6-12 Jahre", "Mehr als 12 Jahre"])
                    } ]
                    } ]
                }, {
                    "linkId": "2",
                    "text": "Allgemeine Fragen zu Ihrer Arbeitsausstattung Bewerten Sie bitte die unten aufgeführten Arbeitsausstattungen",
                    "item": [ {
                    "linkId": "2.1",
                    "text": "Hilfsmitteln ( z.B. Aufstehhilfe, Waage, ...)",
                    "answer": [ {
                        "valueString": random.choice(["sehr schlecht", "schlecht", "naja", "akzeptabel", "gut", "super"])
                    } ]
                    } ]
                }, {
                    "linkId": "3",
                    "text": "Arbeitsspezifische Fragen",
                    "item": [ {
                    "linkId": "3.1",
                    "text": "Bewerten Sie Ihre Work-Life-Balance",
                    "answer": [ {
                        "valueString": random.choice(["sehr schlecht", "schlecht", "naja", "akzeptabel", "gut", "super"])
                    } ]
                    }, {
                    "linkId": "3.2",
                    "text": "Bewerten Sie die Ihnen zugesprochene Wertzschätzung als Pflegekraft",
                    "answer": [ {
                        "valueString": random.choice(["sehr schlecht", "schlecht", "naja", "akzeptabel", "gut", "super"])
                    } ]
                    }, {
                    "linkId": "3.3",
                    "text": "Bewerten Sie Ihre allgemeine Arbeitszufriedenheit in der Einrichtung",
                    "answer": [ {
                        "valueString": random.choice(["sehr schlecht", "schlecht", "naja", "akzeptabel", "gut", "super"])
                    } ]
                    } ]
                } ]
            }
        }
        yield item
        ctr += 1


def main():
    items = []
    for idx, item in enumerate(generateBundleItem()):
        if idx >= 10000:
            break
        items.append(item)

    bundle = {
        "resourceType": "Bundle",
        "type": "collection",
        "entry": items
    }

    dpath = os.path.dirname(__file__)
    bundle_path = os.path.join(dpath, "src-backend", "static", "bundle.json")

    with open(bundle_path, "w", encoding="utf-8") as f:
        json.dump(bundle, f)

if __name__ == "__main__":
    main()