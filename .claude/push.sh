#!/usr/bin/env bash
# .claude/push.sh — коммит и пуш изменений в origin/main
# Использование: bash .claude/push.sh "сообщение коммита"

set -e

MSG="${1:-auto: update}"

cd "$(git rev-parse --show-toplevel)"

# Проверяем есть ли что коммитить
if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  echo "[push.sh] Нет изменений для коммита."
  exit 0
fi

# Стейджим всё кроме системного мусора
git add -A
git reset -- db/game.sqlite 2>/dev/null || true
git reset -- logs/ 2>/dev/null || true

# Проверяем снова после reset
if git diff --cached --quiet; then
  echo "[push.sh] После исключений нечего коммитить."
  exit 0
fi

git commit -m "$MSG"
git push origin main

echo "[push.sh] Готово: запушено в origin/main."
