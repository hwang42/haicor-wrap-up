# Copyright (c) 2021 Hecong Wang
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
import csv
import uuid

from flask import Flask, Response, jsonify, request, send_from_directory
from flask_cors import CORS

from reason import prompt
from thread import reasoner

# ========================= LOADING ROCSTORIES DATASET =========================
with open("./rocstory.csv", "r") as file:
    reader = csv.reader(file)
    assert len(next(reader)) == 7
    STORIES = dict((uuid, content) for uuid, *content in reader)
# ========================= LOADING ROCSTORIES DATASET =========================

app = Flask(__name__, static_url_path="/", static_folder="../frontend/build")
CORS(app)


@app.route("/")
def index() -> Response:
    return send_from_directory(app.static_folder, "index.html")


@app.route("/api/story")
def query_story_list() -> Response:
    """Returns a sorted list, by title, of `(uuid, title)` pairs.

    This view returns a list of `(uuid, title)` pairs each representing a story
    in the ROCStories Dataset that is accessible by the backend. The list is
    potentially huge, and it is the caller's responsibility to break it up, if
    necessary, due to performance concerns.

    Returns
    -------
    Response
        JSON response with field `stories` which is a sorted list, by title, of
        `(uuid, title)` pairs.
    """
    stories = ((uuid, title) for uuid, (title, *_) in STORIES.items())

    return jsonify({"stories": sorted(stories, key=lambda x: x[1])})


@app.route("/api/story/<uuid>")
def query_story_text(uuid: str) -> Response:
    """Returns a story instance given its `uuid` within the ROCStories Dataset.

    This view returns the story within the ROCStories Dataset, designited by the
    query's `uuid` parameter. If a story with the specified `uuid` cannot be
    found, the `title` and `lines` of the story are set to `None`.

    Parameters
    ----------
    uuid : str
        The story's `uuid`, as a string, within the ROCStories Dataset.

    Returns
    -------
    Response
        JSON response with the following fields:
        * `uuid`: `str`                  - The uuid parameter of the query.
        * `title`: `Optional[str]        - The title of the story, if found.
        * `lines`: `Optional[list[str]]` - The lines of the story, if found.
    """
    title, *lines = STORIES.get(uuid, (None, None))
    lines = lines if len(lines) == 5 else None  # turn [None] to None

    return jsonify({"uuid": uuid, "title": title, "lines": lines})


@app.route("/api/step", methods=["POST"])
def setup_step_task() -> Response:
    query = request.json
    number = query.pop("number")

    return jsonify({"uuid": reasoner.submit_step(prompt(**query), number)})


@app.route("/api/step/<uuid>")
def query_step_task(uuid: str) -> Response:
    if (state := reasoner.state.get(uuid, "")) != "stopped":
        return jsonify({"state": state})

    return jsonify({"state": state, "result": reasoner.obtain_result(uuid)})
