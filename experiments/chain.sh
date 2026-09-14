#!/bin/bash
cd ~/Ayni2/lumabri
L=$1; M=$PWD/tiny_olmoe
pkill -f "tracker --port 7300" 2>/dev/null; pkill -f "segment_node --engine olmoe" 2>/dev/null; sleep 1
./tracker --port 7300 > "$L/tracker.log" 2>&1 & echo $! > "$L/tracker.pid"
sleep 1
LUMABRI_SEGMENT_RAM_RESERVE_MB=512 OMP_NUM_THREADS=3 ./segment_node --engine olmoe --model-dir "$M" --model tiny --range 0:8  --port 7303 --tracker 127.0.0.1:7300 --advertise 127.0.0.1:7303 --name peer-a --model-root 00000000000000000000000000000000000000000000000000000000000000bf --tokenizer-root 00000000000000000000000000000000000000000000000000000000000000c0 --context 512 --max-rows 8 --sessions 2 --threads 3 --memory-limit-mb 1024 > "$L/peer-a.log" 2>&1 & echo $! > "$L/a.pid"
LUMABRI_SEGMENT_RAM_RESERVE_MB=512 OMP_NUM_THREADS=3 ./segment_node --engine olmoe --model-dir "$M" --model tiny --range 8:16 --port 7304 --tracker 127.0.0.1:7300 --advertise 127.0.0.1:7304 --name peer-b --model-root 00000000000000000000000000000000000000000000000000000000000000bf --tokenizer-root 00000000000000000000000000000000000000000000000000000000000000c0 --context 512 --max-rows 8 --sessions 2 --threads 3 --memory-limit-mb 1024 > "$L/peer-b.log" 2>&1 & echo $! > "$L/b.pid"
for i in $(seq 1 60); do grep -q -i "ready\|registered\|advertis" "$L/peer-a.log" "$L/peer-b.log" 2>/dev/null && [ $(grep -c -i "ready\|registered\|advertis" "$L/peer-a.log" "$L/peer-b.log" | awk -F: '{s+=$2} END{print s}') -ge 2 ] && break; sleep 1; done
echo "--- peer-a log"; tail -5 "$L/peer-a.log"; echo "--- peer-b log"; tail -5 "$L/peer-b.log"
echo "--- chat over the two-peer chain"
time OMP_NUM_THREADS=3 ./segment_chat --engine olmoe --model-dir "$M" --model tiny --tracker 127.0.0.1:7300 --model-root 00000000000000000000000000000000000000000000000000000000000000bf --tokenizer-root 00000000000000000000000000000000000000000000000000000000000000c0 --prompt "The quick brown fox" --tokens 16 --context 512 --max-rows 8 --discovery-timeout-ms 20000 --json 2> "$L/chat.err" | tee "$L/chat.json" | tail -3
echo "--- chat stderr tail"; tail -6 "$L/chat.err"
kill $(cat "$L/a.pid") $(cat "$L/b.pid") $(cat "$L/tracker.pid") 2>/dev/null
