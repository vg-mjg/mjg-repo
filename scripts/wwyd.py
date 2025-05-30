#!/usr/bin/env python3
f"""
usage: wwyd.py [-h] [--input-csv INPUT_CSV | --input-url INPUT_URL] [--date DATE] [--output OUTPUT]

This script converts a CSV of WWYD mahjong puzzles into JSON format.
You can now optionally specify a date (YYYY-MM-DD) to extract a single puzzle.
"""

import argparse
import csv
import json
import re
import urllib.request
from pathlib import Path

DEFAULT_SHEET_URL = "https://docs.google.com/spreadsheets/u/1/d/178CFLNJJ9aCNkkkFgfX_qeywnIcBICLfzJQHRN48ICk/export?format=csv&id=178CFLNJJ9aCNkkkFgfX_qeywnIcBICLfzJQHRN48ICk&gid=0"

tile_notation_pattern = re.compile(r'([0-9]+[mpsz])+')
tile_notation_pattern_exact = re.compile(f"^{tile_notation_pattern.pattern}$")
bold_text_pattern = re.compile(r'(\[.+?\])')
bold_text_pattern_exact = re.compile(f"^{bold_text_pattern.pattern}$")
split_pattern = re.compile("|".join([bold_text_pattern.pattern, tile_notation_pattern.pattern]))

def parse_tile_notation(text):
    result = []
    suit = None
    for char in reversed(text):
        if char.isnumeric():
            result.append(f"{char}{suit}")
        else:
            suit = char
    result.reverse()
    return result

def parse_bold_text(text):
    if text.startswith("[") and text.endswith("]"):
        return ["<b>", text.lstrip("[").rstrip("]")]
    else:
        return text

def parse_chunk(text):
    if bold_text_pattern_exact.match(text):
        return parse_bold_text(text)
    elif tile_notation_pattern_exact.match(text):
        return parse_tile_notation(text)
    else:
        return text

def parse_comment(text):
    chunks = split_pattern.split(text)
    return [parse_chunk(chunk) for chunk in chunks if chunk not in ["", None]]

def parse_wwyd_csv(data):
    reader = csv.DictReader(data, delimiter=",")
    wwyd = {
        row["DATE"]: {
            "seat": row["SEAT"],
            "round": row["ROUND"],
            "turn": row["TURN"],
            "indicator": row["DORA INDICATOR"],
            "hand": parse_tile_notation(row["HAND"]),
            "draw": row["DRAW"],
            "answer": row["ANSWER"],
            "comment": parse_comment(row["COMMENT"])
        }
        for row in reader
    }
    return wwyd

def write_wwyd_json(wwyd, path):
    with path.open("w") as f:
        f.write("{\n")

        for i, (k, v) in enumerate(wwyd.items()):
            l = len(v["hand"])
            loc = f"at row {i+1}"
            if l % 3 != 1:
                print(f"invalid hand length {l} {loc}")

            if v["answer"] not in v["hand"] and v["answer"] != v["draw"]:
                print(f"answer not found in hand {loc}")

            f.write(f'"{k}": {json.dumps(v)}')
            if i == len(wwyd) - 1:
                f.write("\n")
            else:
                f.write(",\n")

        f.write("}\n")

def download_csv(url=DEFAULT_SHEET_URL):
    response = urllib.request.urlopen(url)
    lines = [l.decode("utf-8") for l in response.readlines()]
    return lines

def main():
    parser = argparse.ArgumentParser()
    input_group = parser.add_mutually_exclusive_group()
    input_group.add_argument("--input-csv", type=Path, help="CSV file with WWYDs")
    input_group.add_argument("--input-url", default=DEFAULT_SHEET_URL, help="URL to CSV file with WWYDs")
    parser.add_argument("--date", help="Specific date (YYYY-MM-DD) to extract a single WWYD")
    parser.add_argument("--output", type=Path, default=Path("wwyd.json"), help="Where to write the resulting JSON file")
    args = parser.parse_args()

    if args.input_csv:
        print("input file:", args.input_csv)
        with args.input_csv.open("r") as f:
            wwyd = parse_wwyd_csv(f)
    else:
        print("input url:", args.input_url)
        csv_contents = download_csv(args.input_url)
        wwyd = parse_wwyd_csv(csv_contents)

    if args.date:
        if args.date in wwyd:
            wwyd = {args.date: wwyd[args.date]}
        else:
            print(f"No WWYD found for date {args.date}")
            return

    print(f"parsed {len(wwyd)} row(s)")
    print("output file:", args.output)
    write_wwyd_json(wwyd, args.output)

if __name__ == "__main__":
    main()
