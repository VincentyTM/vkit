#!/usr/bin/env node

import {CLI} from "../vkit-cli/index.js";

new CLI().start().catch(console.error);
