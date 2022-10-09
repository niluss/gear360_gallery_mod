#!/bin/bash
cat /dev/log_main |grep -a "\[ Menu \] \[ Mode \], \[ " > /tmp/ax& (sleep 2; killall cat; cut -d ',' -f 2 /tmp/ax|tail -1|cut -d ']' -f 1|cut -d '[' -f 2)
