# Copyright (c) 2021 Hecong Wang
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
from __future__ import annotations

import queue
import threading
import uuid

import reason


class Reasoner(threading.Thread):
    def __init__(self):
        super().__init__()

        self.mutex: threading.Lock = threading.Lock()
        self.queue: queue.Queue = queue.Queue()
        self.state: dict[str, str] = {}
        self.cache: dict = {}

    def run(self):
        while (item := self.queue.get()):
            id, task, args = item

            self.state[id] = "running"

            if task == "step":
                result = self.reason_step(*args)
            elif task == "path":
                result = self.reason_path(*args)
            elif task == "graph":
                result = self.reason_graph(*args)

            with self.mutex:
                self.cache[id] = result

            self.state[id] = "stopped"

    def submit_step(self, prompt: str, number: int) -> str:
        id = str(uuid.uuid4())
        self.state[id] = "waiting"
        self.queue.put((id, "step", (prompt, number)))

        return id

    def submit_path(self, source: str, target: str, context: list[str], length: int, branch: int) -> str:
        id = str(uuid.uuid4())
        self.state[id] = "waiting"
        self.queue.put((id, "path", (source, target, context, length, branch)))

        return id

    def submit_graph(self, target: str, context: list[str], length: int, branch: int) -> str:
        id = str(uuid.uuid4())
        self.state[id] = "waiting"
        self.queue.put((id, "graph", (target, context, length, branch)))

        return id

    def reason_step(self, prompt: str, number: int) -> list[tuple[str, str, float]]:
        return sorted(reason.generate(prompt, number), key=lambda x: x[2])

    def reason_path(self, source: str, target: str, context: list[str], length: int, branch: int):
        pass

    def reason_graph(self, target: str, context: list[str], length: int, branch: int):
        pass

    def obtain_result(self, id: str) -> list[tuple[str, str, float]]:
        with self.mutex:
            return self.cache.pop(id, None)


reasoner = Reasoner()
reasoner.start()
