#!/usr/bin/env bash
# .claude/push.sh — коммит и пуш изменений в origin/main
# Использование:
#   bash .claude/push.sh "сообщение коммита" path/to/file1 path/to/file2
#   git add path/to/file1 path/to/file2 && bash .claude/push.sh "сообщение коммита"

set -e

MSG="${1:-auto: update}"
shift || true

cd "$(git rev-parse --show-toplevel)"

# Если переданы пути — стейджим только их
if [ "$#" -gt 0 ]; then
  for path in "$@"; do
    if [ ! -e "$path" ] && ! git ls-files --error-unmatch "$path" >/dev/null 2>&1; then
      echo "[push.sh] Пропуск: путь не найден: $path"
      continue
    fi
    git add -- "$path"
  done
fi

# Никогда не коммитим runtime-данные
git reset -- db/game.sqlite 2>/dev/null || true
git reset -- logs/ 2>/dev/null || true

# Проверяем staged-изменения после исключений
if git diff --cached --quiet; then
  echo "[push.sh] Нет staged-изменений для коммита."
  echo "[push.sh] Передай пути файлов аргументами или предварительно сделай git add нужных файлов."
  exit 0
fi

git commit -m "$MSG"
git push origin main

echo "[push.sh] Готово: запушено в origin/main."
