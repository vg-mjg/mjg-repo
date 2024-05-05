#!/usr/bin/env python3
f"""
usage: python3 {__file__} <input.tsv> <output.json>

This script will convert a TSV file with transcribed problems from wwyd-chan books into JSON for repo's WWYD.
Sheet with existing WWYDs is available at https://docs.google.com/spreadsheets/d/178CFLNJJ9aCNkkkFgfX_qeywnIcBICLfzJQHRN48ICk/edit#gid=0
The script expects slightly different columns from what's on google docs: date, seat, round, turn, hand, draw, indicator, answer, comment
Date determines when a given WWYD will be displayed. It was chosen over incremental IDs to make it easier to add new ones in a stable way. 
Comments may contain mahjong tile notation, which will be converted into actual tiles.
Text between [] in the commments will be bold, but the tile notation inside it will not be converted.
To work around it, make the tiles separate, ex. `[cut 4p to keep chitoi open]` -> `[cut] 4p [to keep chitoi open]`.
"""

import csv
import json
import re
import sys
from pathlib import Path

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

def read_wwyd_tsv(path):
    with path.open("r") as f:
        reader = csv.DictReader(f, delimiter="\t")
        wwyd = {
            x["date"]: {
                "seat": x["seat"],
                "round": x["round"],
                "turn": x["turn"],
                "indicator": x["indicator"],
                "hand": parse_tile_notation(x["hand"]),
                "draw": x["draw"],
                "answer": x["answer"],
                "comment": parse_comment(x["comment"])
            }
            for x in reader
        }
        return wwyd

# 'custom' json writer that writes one row per entry
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

def main():
    if len(sys.argv) != 3:
        print(f"usage: python3 {__file__} <input.tsv> <output.json>")

    in_file = Path(sys.argv[1])
    print("input file", in_file)
    wwyd = read_wwyd_tsv(in_file)
    print(f"parsed {len(wwyd)} rows")
    out_file = Path(sys.argv[2])
    print("output file", out_file)
    write_wwyd_json(wwyd, out_file)

if __name__ == "__main__":
    main()