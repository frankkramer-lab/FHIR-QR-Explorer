#!/usr/bin/env python3
import json, os, random

def generateBundleItem():
    ctr = 1
    while True:
        item =  {
            "resource": {
                "resourceType": "QuestionnaireResponse",
                "identifier": [{
                    "value": str(ctr)
                }],
                "item": [ {
                    "linkId": "1",
                    "text": "General questions about your person",
                    "item": [ {
                    "linkId": "1.1",
                    "text": "Gender",
                    "answer": [ {
                        "valueString": random.choice(["m", "f", "d"])
                    } ]
                    }, {
                    "linkId": "1.2",
                    "text": "How many hours per week do you work?",
                    "answer": [ {
                        "valueString": random.choice(["39 hours/week", "< 35 hours/week", "< 20 hours/week", "< 10 hours/week"])
                    } ]
                    }, {
                    "linkId": "1.3",
                    "text": "What is your current job position?",
                    "answer": [ {
                        "valueString": random.choice(["Nursing specialist", "Nursing assistant", "Other"])
                    } ]
                    }, {
                    "linkId": "1.4",
                    "text": "Information about your age",
                    "answer": [ {
                        "valueString": random.choice(["< 25 years", "25-40 years", "40-55 years", "> 55 years"])
                    } ]
                    }, {
                    "linkId": "1.5",
                    "text": "How long have you had experience in nursing?",
                    "answer": [ {
                        "valueString": random.choice(["0-2 years", "2-6 years", "6-12 years", "> 12 years"])
                    } ]
                    } ]
                }, {
                    "linkId": "2",
                    "text": "General questions about your work equipment: Please rate the work equipment listed below.",
                    "item": [ {
                    "linkId": "2.1",
                    "text": "Rate the situation on nursing aids. (e.g. stand-up aid, scales, ...)",
                    "answer": [ {
                        "valueString": random.choice(["very bad", "bad", "moderate", "acceptable", "good", "very good"])
                    } ]
                    } ]
                }, {
                    "linkId": "3",
                    "text": "Work-specific issues",
                    "item": [ {
                    "linkId": "3.1",
                    "text": "Rate your work-life balance.",
                    "answer": [ {
                        "valueString": random.choice(["very bad", "bad", "moderate", "acceptable", "good", "very good"])
                    } ]
                    }, {
                    "linkId": "3.2",
                    "text": "Rate the esteem in which you are held as a caregiver.",
                    "answer": [ {
                        "valueString": random.choice(["very bad", "bad", "moderate", "acceptable", "good", "very good"])
                    } ]
                    }, {
                    "linkId": "3.3",
                    "text": "Rate your overall job satisfaction at the site.",
                    "answer": [ {
                        "valueString": random.choice(["very bad", "bad", "moderate", "acceptable", "good", "very good"])
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