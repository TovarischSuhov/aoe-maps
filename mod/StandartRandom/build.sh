#!/usr/bin/env bash
# Assembles the StandartRandom mod package and zip for upload / local install.
set -euo pipefail

here=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
root=$(cd -- "$here/../.." && pwd)
name=StandartRandom
out="$root/dist/$name"
# Семейство случайных карт: глобальная + пять специализированных подборок.
scripts="StandartRandom StandartOpenRandom StandartNomadRandom StandartCloseRandom StandartWaterRandom StandartHybridRandom"

case "$out" in
	"$root"/dist/*) ;;
	*) echo "refusing to clean unexpected path: $out" >&2; exit 1 ;;
esac

rm -rf -- "$out"
mkdir -p -- "$out/resources/_common/random-map-scripts"
for m in $scripts; do
	if [ ! -f "$root/maps/$m.rms" ]; then
		echo "missing $root/maps/$m.rms" >&2
		exit 1
	fi
	cp -- "$root/maps/$m.rms" "$out/resources/_common/random-map-scripts/$m.rms"
	# Map icon: square PNG named exactly like the .rms (icons/ готовится к следующему релизу).
	if [ -f "$here/icons/$m.png" ]; then
		cp -- "$here/icons/$m.png" "$out/resources/_common/random-map-scripts/$m.png"
	fi
done
cp -- "$here/info.json" "$here/README.txt" "$out/"
thumb="$here/thumbnail.jpg"
if [ -f "$here/thumbnail-icons.jpg" ]; then
	thumb="$here/thumbnail-icons.jpg"
fi
cp -- "$thumb" "$out/thumbnail.jpg"
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
