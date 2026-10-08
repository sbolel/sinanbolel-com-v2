#!/bin/sh

exec "${FIRESTORE_RULES_NODE_BINARY:-node}" --test src/firebase/firestore.rules.test.mjs
