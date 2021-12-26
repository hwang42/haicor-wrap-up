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
BRANCHING_FACTOR = 1.5
GENERATION_LENGTH = 128
MAXIMUM_BATCH_SIZE = 512


@singledispatch
def generate(input, number):
    raise NotImplementedError(f"Unsupported input type: {type(input)}")


@generate.register(str)
def _(input: str, number: int) -> list[tuple[str, str, float]]:
    """Generate `number` number of inferences for `input` prompt.

    Parameters
    ----------
    input : str
        The prompt for the language model, can be generated using `prompt`.
    number : int
        The total number of inferences to be made based on `input` prompt.

    Returns
    -------
    list[tuple[str, str, float]]
        A list of `(prompt, result, score)` tuples.
    """
    # query language model
    input_ids = token([input], return_tensors="pt").input_ids.to("cuda")
    generated = model.generate(
        input_ids=input_ids,
        max_length=GENERATION_LENGTH,
        num_beams=int(np.ceil(BRANCHING_FACTOR * number)),
        num_return_sequences=number,
        output_scores=True,
        return_dict_in_generate=True
    )

    # convert and cleanup
    texts = token.batch_decode(generated.sequences, skip_special_tokens=True)
    scores = [i.item() for i in np.exp(generated.sequences_scores.cpu())]
    results = list(map(tuple, zip(repeat(input, number), texts, scores)))

    del input_ids
    del generated
    torch.cuda.empty_cache()

    return results


@generate.register(list)
def _(input: list[str], number: int) -> list[tuple[str, str, float]]:
    """Generate `number` number of inferences for each `input` prompt.

    Parameters
    ----------
    input : list[str]
        The prompts for the language model, can be generated using `prompt`.
    number : int
        The total number of inferences to be made based on each `input` prompt.

    Returns
    -------
    list[tuple[str, str, float]]
        A list of `(prompt, result, score)` tuples.
    """
    if len(input) > MAXIMUM_BATCH_SIZE:  # breaks large query into batches
        BATCH_SIZE = int(np.floor(MAXIMUM_BATCH_SIZE / number)) or 1

        inputs = range(0, len(input), BATCH_SIZE)
        inputs = (input[i:i + BATCH_SIZE] for i in inputs)

        return list(chain.from_iterable(generate(i, number) for i in inputs))

    # query language model
    input_ids = token(input, return_tensors="pt").input_ids.to("cuda")
    generated = model.generate(
        input_ids=input_ids,
        max_length=GENERATION_LENGTH,
        num_beams=int(np.ceil(BRANCHING_FACTOR * number)),
        num_return_sequences=number,
        output_scores=True,
        return_dict_in_generate=True
    )

    # convert and cleanup
    texts = token.batch_decode(generated.sequences, skip_special_tokens=True)
    scores = [i.item() for i in np.exp(generated.sequences_scores.cpu())]
    prompts = chain.from_iterable(repeat(i, number) for i in input)
    results = list(map(tuple, zip(prompts, texts, scores)))

    del input_ids
    del generated
    torch.cuda.empty_cache()

    return results
# ================================ MODEL QUERY =================================
