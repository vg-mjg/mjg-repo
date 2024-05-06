#!/usr/bin/env python3
import dataclasses
import hashlib
import json
import time
import sys
import urllib.request
import urllib.parse

BASE_URL = "https://api-launcher-en.yo-star.com"
GAME_DOWNLOAD_PATH = "/api/launcher/game/download"

GAME_TAG = "MajSoul_EN"
SIGNATURE_DATA = "DE7108E9B2842FD460F4777702727869"

@dataclasses.dataclass
class YoStarResp:
    code: int
    msg: str
    data: dict[str, object]

@dataclasses.dataclass
class GameDownload:
    file_url: str
    crc64: str
    size: str
    version: str
    decompression_size: str
    game_start_exe_name: str

def get_time() -> int:
    return round(time.time() * 1000)

def json_stringify(obj: object) -> str:
    return json.dumps(obj, separators=(",", ":"))

def mk_signature() -> str:
    head = { "game_tag": GAME_TAG, "time": get_time() }

    sign = hashlib.md5(
        "{}{}".format(json_stringify(head), SIGNATURE_DATA).encode()
    ).hexdigest()

    return json_stringify({ "head": head, "sign": sign })

def mk_request(endpoint: str) -> dict[str, object]:
    url = "{}{}".format(BASE_URL, endpoint)
    request = urllib.request.Request(url, headers = {"Authorization": mk_signature()})
    response = urllib.request.urlopen(request)
    body = response.read()

    if response.status != 200:
        print("warn: unexpected status code {} ({})".format(response.status, body))
        sys.exit(1)

    data = YoStarResp(**json.loads(body))

    if data.code != 200:
        print("warn: request failed: {} ({})".format(data.msg, data.code))
        sys.exit(1)

    return data.data

if __name__ == "__main__":
    dl = GameDownload(**mk_request(GAME_DOWNLOAD_PATH))
    print("download: {}".format(urllib.parse.unquote(dl.file_url)))
