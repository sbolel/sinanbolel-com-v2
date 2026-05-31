#!/bin/sh

exec mise exec node@22 -- node --test src/firebase/firestore.rules.test.mjs
