/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'

import * as challengeUtils from '../lib/challengeUtils'
import { challenges } from '../data/datacache'
import * as security from '../lib/insecurity'
import * as db from '../data/mongodb'

export function updateProductReviews () {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = security.authenticatedUsers.from(req)

    db.reviewsCollection.findOne({ _id: req.body.id }).then(
      (review: { author: any }) => {
        if (!review) {
          res.status(404).json({ error: 'Review not found' })
          return
        }
        if (!user?.data || review.author !== user.data.email) {
          res.status(403).json({ error: 'You are not allowed to edit this review' })
          return
        }
        db.reviewsCollection.update(
          { _id: req.body.id },
          { $set: { message: req.body.message } }
        ).then(
          (result: { modified: number }) => {
            res.json(result)
          }, (err: unknown) => {
            res.status(500).json(err)
          })
      }, (err: unknown) => {
        res.status(500).json(err)
      })
  }
}

