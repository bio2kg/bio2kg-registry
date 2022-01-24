#!/bin/bash

# Script to deploy in docker for development
# because Windows don't support at all web development

cd /app

yarn

yarn dev
