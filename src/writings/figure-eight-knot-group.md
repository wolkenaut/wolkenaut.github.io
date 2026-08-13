---
title: "The Knot Group of the Figure-Eight Knot"
date: 2025-10-01
description: "A short note on presenting the fundamental group of the figure-eight knot complement."
tags: ["math"]
---
This is a placeholder post — a first pass at getting math rendering working
before the real writing goes here.

The figure-eight knot $K$ is the simplest hyperbolic knot, and its complement
$S^3 \setminus K$ carries a complete hyperbolic structure of finite volume.
The fundamental group $\pi_1(S^3 \setminus K)$ has a two-generator
presentation coming from a Wirtinger presentation of the knot diagram, which
can be reduced to:

$$
\pi_1(S^3 \setminus K) = \left\langle\, a, b \;\middle|\; a b^{-1} a^{-1} b \, a = b \, a b^{-1} a^{-1} b \,\right\rangle
$$

Both generators $a$ and $b$ are meridians of the knot. What makes this group
interesting is that it also embeds as a discrete subgroup of
$\mathrm{PSL}(2, \mathbb{C})$, realizing the hyperbolic structure directly —
which is where the volume conjecture picks up.
