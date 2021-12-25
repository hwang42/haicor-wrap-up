# Copyright (c) 2021 Hecong Wang
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
import csv

from flask import Flask, jsonify
from flask_cors import CORS

# ========================= LOADING ROC STORY DATASET ==========================
with open("./rocstory.csv", "r") as file:
    reader = csv.reader(file)
    assert len(next(reader)) == 7
    STORIES = dict((uuid, content) for uuid, *content in reader)
# ========================= LOADING ROC STORY DATASET ==========================

app = Flask(__name__, static_url_path="/", static_folder="../frontend/build")
CORS(app)


@app.route("/api/story")
def query_story_list():
    stories = ((uuid, title) for uuid, (title, *_) in STORIES.items())
    return jsonify({"stories": sorted(stories, key=lambda x: x[1])})


@app.route("/api/story/<uuid>")
def query_story_text(uuid: str):
    return jsonify({"content": STORIES.get(uuid, ["", "", "", "", "", ""])[1:]})
