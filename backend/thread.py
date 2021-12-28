# Copyright (c) 2021 Hecong Wang
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
from __future__ import annotations

import re
from itertools import chain, product, repeat, starmap
from queue import Queue
from threading import Lock, Thread
from uuid import uuid4

import networkx as nx
import numpy as np

from reason import generate, prompt

ASPECTS = ["causal", "emotional", "spatial", "possession", "miscellaneous"]
PATTERN = re.compile(r"^\s*(.+)\s*>\s*(.+)\s*>\s*(.+)\s*$")


# ============================= REASONING UTILITY ==============================
def search_layer(graph: nx.DiGraph, direction: str, froniter: list[str], context: list[str], branch: int) -> list[str]:
    def get_prompt(node, aspect):
        usage = "general" if node["kind"] == "source" else "premise"
        return prompt(usage, direction, aspect, context, node["text"])

    # generate all the inferences (better performance)
    nodes = [graph.nodes[id] for id in froniter]
    prompts = starmap(get_prompt, product(nodes, ASPECTS))
    results = generate(list(prompts), branch)

    # setup generators for other information (completeness)
    aspects = list(chain.from_iterable(repeat(i, branch) for i in ASPECTS))
    aspects = chain.from_iterable(repeat(aspects, len(froniter)))

    sources = chain.from_iterable(repeat(i, 5 * branch) for i in froniter)

    froniter = []
    for result, aspect, source in zip(results, aspects, sources):
        prompts, result, score = result
        if (match := re.fullmatch(PATTERN, result)) is None:
            # generated output is ill-formed
            continue

        uuid = str(uuid4())
        froniter.append(uuid)

        lhs, _, rhs = match.groups()
        if direction == "forward":
            graph.add_node(uuid, kind="middle", text=rhs)
            graph.add_edge(source, uuid, aspect=aspect,
                           prompt=prompts, result=result, score=score)
        else:
            graph.add_node(uuid, kind="middle", text=lhs)
            graph.add_edge(uuid, source, aspect=aspect,
                           prompt=prompts, result=result, score=score)

    return froniter


def connect_nodes(graph: nx.DiGraph, premises: list[str], hypotheses: list[str]):
    def get_prompt(premise, hypothesis):
        return f"mnli hypothesis: {hypothesis} premise: {premise}"

    # generate all the connections (better performance)
    premise_texts = [graph.nodes[uuid]["text"] for uuid in premises]
    hypothesis_texts = [graph.nodes[uuid]["text"] for uuid in hypotheses]
    prompts = starmap(get_prompt, product(premise_texts, hypothesis_texts))
    results = generate(list(prompts), 1)

    for result, (source, target) in zip(results, product(premises, hypotheses)):
        prompt, result, score = result
        if result != "entailment":
            # no logical connection
            continue

        graph.add_edge(source, target, aspect="entailment",
                       prompt=prompt, result=result, score=score)
# ============================= REASONING UTILITY ==============================


class Reasoner(Thread):
    def __init__(self):
        super().__init__()

        self.access: Lock = Lock()

        self.tasks: Queue = Queue()
        self.state: dict[str, str] = {}
        self.cache: dict[str, list] = {}

    def run(self):
        while (task := self.tasks.get()):
            if task == None:  # termination task
                break

            uuid, task, args = task
            if task == "step":
                result = self.reason_step(*args)
            elif task == "path":
                result = self.reason_path(*args)
            elif task == "graph":
                result = self.reason_graph(*args)

            with self.access:
                self.cache[uuid] = result
                self.state[uuid] = "stopped"

    def submit_step(self, usage: str, order: str, aspect: str, context: list[str], question: str, total: int) -> str:
        with self.access:
            uuid = str(uuid4())
            self.state[uuid] = "waiting"
            self.tasks.put(
                (uuid, "step", (usage, order, aspect, context, question, total)))

        return uuid

    def submit_path(self, source: str, target: str, context: list[str], length: int, branch: int, total: int) -> str:
        with self.access:
            uuid = str(uuid4())
            self.state[uuid] = "waiting"
            self.tasks.put(
                (uuid, "path", (uuid, source, target, context, length, branch, total)))

        return uuid

    def submit_graph(self, target: str, context: list[str], length: int, branch: int, total: int) -> str:
        with self.access:
            uuid = str(uuid4())
            self.state[uuid] = "waiting"
            self.tasks.put(
                (uuid, "graph", (uuid, target, context, length, branch, total)))

        return uuid

    def reason_step(self, usage: str, order: str, aspect: str, context: list[str], question: str, total: int) -> list[tuple[float, str]]:
        temp = prompt(usage, order, aspect, context, question)
        return [(score, result) for _, result, score in generate(temp, total)]

    def reason_path(self, uuid: str, source: str, target: str, context: list[str], length: int, branch: int, total: int) -> list[list[str]]:
        # setup reasoning graph
        reasoning = nx.DiGraph(source=source, target=target, context=context)

        def get_path(path):
            score, result = 1, [reasoning.nodes[path[0]]["text"]]
            for source, target in zip(path, path[1:]):
                score *= reasoning.edges[source, target]["score"]

                result.append(reasoning.edges[source, target]["result"])
                result.append(reasoning.nodes[target]["text"])

            return score, result

        # forward and backward search
        source_uuid = str(uuid4())
        reasoning.add_node(source_uuid, kind="source", text=source)

        forward_froniter = [source_uuid]
        for step in range(length):
            with self.access:
                self.state[uuid] = f"f{step + 1}"
            forward_froniter = search_layer(
                reasoning, "forward", forward_froniter, context, branch)

        target_uuid = str(uuid4())
        reasoning.add_node(target_uuid, kind="target", text=target)

        backward_froniter = [target_uuid]
        for step in range(length):
            with self.access:
                self.state[uuid] = f"b{step + 1}"
            backward_froniter = search_layer(
                reasoning, "backward", backward_froniter, context, branch)

        # forward and backward search connection
        with self.access:
            self.state[uuid] = "c"
        connect_nodes(reasoning, forward_froniter, backward_froniter)

        # find most likely (largest product) reasoning paths
        with self.access:
            self.state[uuid] = "s"
        try:
            paths = nx.all_shortest_paths(
                reasoning, source_uuid, target_uuid, lambda u, v, e: -np.log(e["score"]))
            return [get_path(path) for path, _ in zip(paths, range(total))]
        except nx.NetworkXNoPath:
            return []

    def reason_graph(self, uuid: str, target: str, context: list[str], length: int, branch: int, total: int) -> list[list[str]]:
        # setup reasoning graph
        reasoning = nx.DiGraph(target=target, context=context)

        def get_path(path):
            score, result = 1, [reasoning.nodes[path[0]]["text"]]
            for source, target in zip(path, path[1:]):
                score *= reasoning.edges[source, target]["score"]

                result.append(reasoning.edges[source, target]["result"])
                result.append(reasoning.nodes[target]["text"])

            return score, result

        # forward and backward search
        source_uuids = [str(uuid4()) for _ in context]
        reasoning.add_nodes_from(
            [(uuid, {"kind": "source", "text": text}) for uuid, text in zip(source_uuids, context)])

        forward_froniter = source_uuids[:]
        for step in range(length):
            with self.access:
                self.state[uuid] = f"f{step + 1}"
            forward_froniter = search_layer(
                reasoning, "forward", forward_froniter, context, branch)

        target_uuid = str(uuid4())
        reasoning.add_node(target_uuid, kind="target", text=target)

        backward_froniter = [target_uuid]
        for step in range(length):
            with self.access:
                self.state[uuid] = f"b{step + 1}"
            backward_froniter = search_layer(
                reasoning, "backward", backward_froniter, context, branch)

        # forward and backward search connection
        with self.access:
            self.state[uuid] = "c"
        connect_nodes(reasoning, forward_froniter, backward_froniter)

        # find most likely (largest product) reasoning paths
        with self.access:
            self.state[uuid] = "s"
        paths = []
        for source_uuid in source_uuids:
            try:
                path = nx.all_shortest_paths(
                    reasoning, source_uuid, target_uuid, lambda u, v, e: -np.log(e["score"]))
                paths.extend(get_path(p) for p, _ in zip(path, range(total)))
            except nx.NetworkXNoPath:
                return []

        return sorted(paths, key=lambda x: x[0], reverse=True)[:total]

    def obtain_result(self, uuid: str) -> list:
        with self.access:
            return self.cache.pop(uuid, [])


reasoner = Reasoner()
reasoner.start()
