#!/usr/bin/env bash
# Assembles the StandartRandom mod package and zip for upload / local install.
set -euo pipefail

here=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
root=$(cd -- "$here/../.." && pwd)
name=StandartRandom
out="$root/dist/$name"

case "$out" in
	"$root"/dist/*) ;;
	*) echo "refusing to clean unexpected path: $out" >&2; exit 1 ;;
esac

rm -rf -- "$out"
mkdir -p -- "$out/resources/_common/random-map-scripts"
cp -- "$root/maps/$name.rms" "$out/resources/_common/random-map-scripts/$name.rms"
cp -- "$here/info.json" "$here/README.txt" "$here/thumbnail.jpg" "$out/"
(cd -- "$out" && zip -qr "../$name.zip" .)

printf 'dir: %s\nzip: %s\n' "$out" "$root/dist/$name.zip"
