# Copyright (c) 2021 Hecong Wang
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
from __future__ import annotations

from threading import Thread

import reason

threads: dict[str, Thread] = {}


class StepTask(Thread):
    def __init__(self, prompt: str, number: int):
        super().__init__()

        self.prompt = prompt
        self.number = number
        self.result = None

    def run(self):
        result = reason.generate(self.prompt, self.number)
        self.result = [(score, text) for _, text, score in result]
        self.result.sort(key=lambda x: x[0], reverse=True)  # sort by score
