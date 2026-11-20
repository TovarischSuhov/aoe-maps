#!/usr/bin/env bash
# Assembles the DynamicRMS mod package and zip for upload / local install.
# Manifest: one line per dynamic map (basename without extension); each entry
# ships maps/<name>.rms plus maps/<name>.xs when the map has scripted mechanics.
set -euo pipefail

here=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
root=$(cd -- "$here/../.." && pwd)
name=DynamicRMS
out="$root/dist/$name"
# Динамические карты коллекции: FrozenLake и SilentWoods (каждая + .xs).
scripts="FrozenLake SilentWoods"

case "$out" in
	"$root"/dist/*) ;;
	*) echo "refusing to clean unexpected path: $out" >&2; exit 1 ;;
esac

rm -rf -- "$out"
mkdir -p -- "$out/resources/_common/random-map-scripts" "$out/resources/_common/xs"
for m in $scripts; do
	if [ ! -f "$root/maps/$m.rms" ]; then
		echo "missing $root/maps/$m.rms" >&2
		exit 1
	fi
	cp -- "$root/maps/$m.rms" "$out/resources/_common/random-map-scripts/$m.rms"
	if [ -f "$root/maps/$m.xs" ]; then
		# Игра грузит #includeXS только из resources/_common/xs/, не из random-map-scripts
		# (docs ugc-guide: Constants.xs живёт там же; ошибка «Failed to open *.xs» 18.11.2026).
		cp -- "$root/maps/$m.xs" "$out/resources/_common/xs/$m.xs"
	else
		echo "note: $m ships without .xs (static map)" >&2
	fi
	# Map icon: square PNG named exactly like the .rms, shown as the map picture.
	if [ -f "$here/icons/$m.png" ]; then
		cp -- "$here/icons/$m.png" "$out/resources/_common/random-map-scripts/$m.png"
	else
		echo "warning: $here/icons/$m.png отсутствует — карта без иконки" >&2
	fi
done
cp -- "$here/info.json" "$here/README.txt" "$out/"
# Модовое превью: JPEG 1280x720; генерируется tools/generate-map-icons.mjs.
if [ -f "$here/icons/thumbnail.jpg" ]; then
	cp -- "$here/icons/thumbnail.jpg" "$out/thumbnail.jpg"
elif [ -f "$here/icons/thumbnail.png" ]; then
	echo "warning: только icons/thumbnail.png — для публикации сконвертировать в JPEG 1280x720" >&2
else
	echo "warning: $here/icons/thumbnail.jpg отсутствует — пакет без превью" >&2
fi
if command -v zip >/dev/null 2>&1; then
	(cd -- "$out" && zip -qr "../$name.zip" .)
elif [ -x /c/WINDOWS/System32/tar.exe ]; then
	# Git Bash на Windows: zip нет, но есть bsdtar (-a выбирает формат по расширению).
	(cd -- "$out" && /c/WINDOWS/System32/tar.exe -a -cf "../$name.zip" .)
else
	echo "neither zip nor bsdtar available" >&2
	exit 1
fi

printf 'dir: %s\nzip: %s\n' "$out" "$root/dist/$name.zip"
