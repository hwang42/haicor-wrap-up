# Copyright (c) 2021 Hecong Wang
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
from __future__ import annotations

from functools import singledispatch
from itertools import chain, repeat

import numpy as np
import torch
from transformers import T5ForConditionalGeneration, T5Tokenizer

MAX_LENGTH = 128
BEAM_FACTOR = 2
BATCH_LIMIT = 64

# =================================== MODEL ====================================
token = T5Tokenizer.from_pretrained("./checkpoint")
model = T5ForConditionalGeneration.from_pretrained("./checkpoint")
model.to("cuda")  # transform model to GPU for faster inference
# =================================== MODEL ====================================


# ================================== UTILITY ===================================
def prompt(usage: str, order: str, aspect: str, context: list[str], question: str) -> str:
    """Generate the language model prompt based on the given parameters.

    Parameters
    ----------
    usage : str
        The inference task intended by the prompt: `general` or `premise`. The
        `general` usage expects a story sentence (or somthing similar in style)
        to be used as `question`; the `premise` usage expects a inferred result
        (or something similar in style) to be used as `question`.
    order : str
        The inference direction intended by the prompt: `forward` or `backward`.
        The `forward` direction will deduce additional information based on the
        `question`; the `backward` direction will hypothesis additional
        information based on the `question`.
    aspect : str
        The inference aspect intended by the prompt: `causal`, `emotional`,
        `spatial`, `possession`, or `miscellaneous`. These aspects corresponds
        to the dimensions outlined in the GLUCOSE Dataset.
    context : list[str]
        The story context that the inference is based upon.
    question : str
        The question that the inference intends to answer.

    Returns
    -------
    str
        A prompt for the language model.
    """
    return (f"glucose: {usage} {order} {aspect} "
            f"context: {' '.join(map(str.strip, context))} "
            f"premise: {question.strip()}")
# ================================== UTILITY ===================================


# ================================ MODEL QUERY =================================
@singledispatch
def generate(input, branch):
    raise NotImplementedError()


@generate.register
def _(input: str, branch: int) -> list[tuple[str, str, float]]:
    """Generate `branch` number of inferences for `input` prompt.

    Parameters
    ----------
    input : str
        The input prompt for the language model.
    branch : int
        The total number of results to be inferred.

    Returns
    -------
    list[tuple[str, str, float]]
        A list of `(prompt, result, score)` tuples.
    """
    # query language model, obtain tensor results
    input_ids = token([input], return_tensors="pt").input_ids.to("cuda")
    outputs = model.generate(input_ids=input_ids,
                             max_length=MAX_LENGTH,
                             num_beams=round(BEAM_FACTOR * branch),
                             num_return_sequences=branch,
                             output_scores=True,
                             return_dict_in_generate=True)

    # convert tensor results into usable formats
    results = token.batch_decode(outputs.sequences, skip_special_tokens=True)
    scores = [score.item() for score in np.exp(outputs.sequences_scores.cpu())]

    return [(prompt, result, score) for prompt, result, score
            in zip(repeat(input, branch), results, scores)]


@generate.register
def _(input: list, branch: int) -> list[tuple[str, str, float]]:
    """Generate `branch` number of inferences for each `input` prompt.

    Parameters
    ----------
    input : list
        The input prompts for the language model.
    branch : int
        The total number of results to be inferred for each prompt.

    Returns
    -------
    list[tuple[str, str, float]]
        A list of `(prompt, result, score)` tuples.
    """
    if len(input) > BATCH_LIMIT:  # breaks into multiple batches
        inputs = [input[i:i + BATCH_LIMIT] for i in
                  range(0, len(input), BATCH_LIMIT)]
        return list(chain.from_iterable(generate(i, branch) for i in inputs))

    # query language model, obtain tensor results
    input_ids = token(input, return_tensors="pt").input_ids.to("cuda")
    outputs = model.generate(input_ids=input_ids,
                             max_length=MAX_LENGTH,
                             num_beams=round(BEAM_FACTOR * branch),
                             num_return_sequences=branch,
                             output_scores=True,
                             return_dict_in_generate=True)

    # convert tensor results into usable formats
    results = token.batch_decode(outputs.sequences, skip_special_tokens=True)
    scores = [score.item() for score in np.exp(outputs.sequences_scores.cpu())]
    temp = chain.from_iterable(repeat(i, branch) for i in input)

    torch.cuda.empty_cache()

    return [(prompt, result, score) for prompt, result, score
            in zip(temp, results, scores)]
# ================================ MODEL QUERY =================================
