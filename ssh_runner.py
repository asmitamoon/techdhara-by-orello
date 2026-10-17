#!/usr/bin/env python3
import sys
import os
import pty
import select
import time
import fcntl
import termios

def run_cmd_with_password(cmd, password):
    master, slave = pty.openpty()
    proc = os.fork()
    if proc == 0:
        os.close(master)
        os.setsid()
        try:
            fcntl.ioctl(slave, termios.TIOCSCTTY, 0)
        except Exception:
            pass
        os.dup2(slave, 0)
        os.dup2(slave, 1)
        os.dup2(slave, 2)
        if slave > 2:
            os.close(slave)
        os.execvp(cmd[0], cmd)
    else:
        os.close(slave)
        buf = b""
        password_sent = 0
        while True:
            r, _, _ = select.select([master], [], [], 0.2)
            if master in r:
                try:
                    data = os.read(master, 1024)
                    if not data:
                        break
                    buf += data
                    sys.stdout.buffer.write(data)
                    sys.stdout.buffer.flush()

                    if b"(yes/no" in buf:
                        time.sleep(0.1)
                        os.write(master, b"yes\n")
                        buf = b""
                    elif (b"assword:" in buf or b"Password:" in buf) and password_sent < 3:
                        time.sleep(0.2)
                        os.write(master, password.encode() + b"\n")
                        password_sent += 1
                        buf = b""
                except OSError:
                    break
            else:
                pid, status = os.waitpid(proc, os.WNOHANG)
                if pid != 0:
                    break
        os.close(master)
        _, status = os.waitpid(proc, 0)
        return os.WEXITSTATUS(status)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 ssh_runner.py <password> <command...>")
        sys.exit(1)
    password = sys.argv[1]
    cmd = sys.argv[2:]
    sys.exit(run_cmd_with_password(cmd, password))
