#!/bin/bash

READY_DIR=~/Desktop/ready
TMP_DIR="$READY_DIR/tmp"
UPLOAD_URL="http://192.168.0.108:3000/upload"

mkdir -p "$TMP_DIR"

while true; do
    # --- Check for videos in READY_DIR ---
    for VIDEO in "$READY_DIR"/*.mp4; do
        [ -e "$VIDEO" ] || break

        BASENAME=$(basename "$VIDEO" .mp4)
        ZIPFILE="$TMP_DIR/${BASENAME}.zip"

        echo "[$(date)] Processing $VIDEO"

        # Zip
        if zip -j "$ZIPFILE" "$VIDEO"; then
            echo "[$(date)] ? Created zip: $ZIPFILE"
        else
            echo "[$(date)] ? Failed to zip $VIDEO"
            continue
        fi
    done

    # --- Check for ZIPs in TMP_DIR ---
    for ZIPFILE in "$TMP_DIR"/*.zip; do
        [ -e "$ZIPFILE" ] || break

        echo "[$(date)] Uploading $ZIPFILE ..."
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$UPLOAD_URL" -F "file=@$ZIPFILE")

        if [ "$HTTP_CODE" -eq 200 ]; then
            echo "[$(date)] ? Upload successful: $ZIPFILE"
            BASENAME=$(basename "$ZIPFILE" .zip)
            rm -f "$READY_DIR/${BASENAME}.mp4" "$ZIPFILE"
        else
            echo "[$(date)] ? Upload failed for $ZIPFILE (HTTP $HTTP_CODE)"
        fi
    done

    sleep 5
done
