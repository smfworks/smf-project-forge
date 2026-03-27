#!/usr/bin/env python3
"""
SMF Forge Sync Agent
Watches local queue JSON files and pushes changes to Forge's Vercel API.
Install on each agent machine (mikesai1, mikesai2, mikesai3).

Usage:
    python3 forge-sync-agent.py

Config: /etc/forge/queues.conf (machine-specific)
"""

import json
import os
import sys
import time
import threading
import hashlib
from pathlib import Path
from typing import Optional

try:
    import requests
except ImportError:
    print("ERROR: requests library not found. Install with: pip install requests")
    sys.exit(1)

try:
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler, FileModifiedEvent
except ImportError:
    print("ERROR: watchdog library not found. Install with: pip install watchdog")
    sys.exit(1)


class QueueConfig:
    def __init__(self, config_path: str = "/etc/forge/queues.conf"):
        self.config_path = Path(config_path)
        self.load()

    def load(self):
        if not self.config_path.exists():
            print(f"ERROR: Config not found at {self.config_path}")
            print("Copy queues.conf.example to /etc/forge/queues.conf and edit it.")
            sys.exit(1)
        with open(self.config_path) as f:
            self.data = json.load(f)

        self.machine = self.data["machine"]
        self.api_url = self.data["api_url"].rstrip("/")
        self.api_key = self.data["api_key"]
        self.queues = {q["name"]: q["path"] for q in self.data["queues"]}
        print(f"Loaded config for machine: {self.machine}")
        print(f"API URL: {self.api_url}")
        print(f"Watching {len(self.queues)} queues: {', '.join(self.queues.keys())}")


class QueueState:
    """Tracks the last-known state of each queue file to detect changes."""

    def __init__(self, queue_path: str):
        self.path = queue_path
        self.last_hash: Optional[str] = None
        self.last_content: Optional[dict] = None
        self.read()

    def hash_file(self, path: str) -> str:
        with open(path) as f:
            return hashlib.md5(f.read().encode()).hexdigest()

    def read(self):
        if not Path(self.path).exists():
            return
        try:
            current_hash = self.hash_file(self.path)
            if current_hash != self.last_hash:
                with open(self.path) as f:
                    content = json.load(f)
                self.last_content = content
                self.last_hash = current_hash
                return True  # changed
        except (json.JSONDecodeError, IOError) as e:
            print(f"WARN: Could not read {self.path}: {e}")
        return False

    def has_changed(self) -> bool:
        return self.read()


class QueueSyncHandler(FileSystemEventHandler):
    """Handles file system events for queue files."""

    def __init__(self, config: QueueConfig, session: requests.Session):
        self.config = config
        self.session = session
        self.states: dict[str, QueueState] = {}
        self.pending: list[tuple[str, str, dict]] = []  # queue, action, entry
        self.lock = threading.Lock()
        # Initialize states
        for name, path in config.queues.items():
            if Path(path).exists():
                self.states[name] = QueueState(path)

    def _send_delta(self, queue: str, action: str, entry: dict):
        """Send a delta to the Forge API."""
        url = f"{self.config.api_url}/api/queues/ping"
        headers = {
            "Content-Type": "application/json",
            "X-Forge-Key": self.config.api_key,
        }
        payload = {
            "machine": self.config.machine,
            "queue": queue,
            "action": action,
            "entry": entry,
        }
        try:
            resp = self.session.post(url, json=payload, timeout=10)
            if resp.status_code == 200:
                print(f"  Synced: [{queue}] {action}")
            else:
                print(f"  Sync failed ({resp.status_code}): {resp.text[:100]}")
        except requests.RequestException as e:
            print(f"  Sync error: {e}")
            # Queue for retry
            with self.lock:
                self.pending.append((queue, action, entry))

    def _find_entry_by_id(self, queue_name: str, entry_id: str) -> Optional[dict]:
        """Find an entry in the queue file by its id field."""
        path = self.config.queues.get(queue_name)
        if not path or not Path(path).exists():
            return None
        try:
            with open(path) as f:
                data = json.load(f)
            entries = data if isinstance(data, list) else data.get("entries", [])
            for entry in entries:
                if entry.get("id") == entry_id:
                    return entry
        except (json.JSONDecodeError, IOError):
            pass
        return None

    def on_modified(self, event):
        if event.is_directory:
            return
        path = event.src_path
        # Find which queue this file belongs to
        for name, queue_path in self.config.queues.items():
            if os.path.samefile(path, queue_path):
                print(f"Change detected: {name}")
                state = self.states.get(name)
                if state and state.has_changed():
                    # Determine what changed (simplified: just push current content)
                    # A more sophisticated approach would diff the JSON
                    entry = state.last_content
                    if entry:
                        self._send_delta(name, "sync", entry)
                return


class RetryThread(threading.Thread):
    """Background thread to retry failed syncs."""

    def __init__(self, handler: QueueSyncHandler, interval: int = 30):
        super().__init__(daemon=True)
        self.handler = handler
        self.interval = interval
        self.running = True

    def run(self):
        while self.running:
            time.sleep(self.interval)
            with self.handler.lock:
                pending = list(handler.pending)
                handler.pending.clear()
            for queue, action, entry in pending:
                handler._send_delta(queue, action, entry)


def initial_sync(config: QueueConfig, session: requests.Session):
    """Do a full sync of all queue files on startup."""
    print("\n=== Initial Full Sync ===")
    for name, path in config.queues.items():
        if Path(path).exists():
            try:
                with open(path) as f:
                    data = json.load(f)
                url = f"{config.api_url}/api/queues/heartbeat"
                headers = {
                    "Content-Type": "application/json",
                    "X-Forge-Key": config.api_key,
                }
                payload = {
                    "machine": config.machine,
                    "queue": name,
                    "data": data,
                }
                resp = session.post(url, json=payload, timeout=10)
                print(f"  {name}: {'OK' if resp.ok else f'FAILED {resp.status_code}'}")
            except Exception as e:
                print(f"  {name}: ERROR {e}")
        else:
            print(f"  {name}: not found (skipping)")


if __name__ == "__main__":
    print("=" * 40)
    print("  SMF Forge Sync Agent")
    print("=" * 40)

    config_path = os.environ.get("FORGE_CONFIG", "/etc/forge/queues.conf")
    config = QueueConfig(config_path)

    session = requests.Session()
    session.headers.update({"X-Forge-Key": config.api_key})

    # Initial full sync
    initial_sync(config, session)

    # Start retry thread
    handler = QueueSyncHandler(config, session)
    retry_thread = RetryThread(handler)
    retry_thread.start()

    # Watch all queue directories
    observer = Observer()
    watched = set()
    for name, path in config.queues.items():
        dir_path = str(Path(path).parent)
        if dir_path not in watched:
            observer.schedule(handler, dir_path, recursive=False)
            watched.add(dir_path)
            print(f"Watching: {dir_path}")

    observer.start()
    print("\nSync agent running. Press Ctrl+C to stop.\n")

    try:
        while True:
            time.sleep(10)
            # Periodic full check (inotify can sometimes miss changes)
            for name, path in config.queues.items():
                if Path(path).exists():
                    state = handler.states.get(name)
                    if state and state.has_changed():
                        print(f"Periodic check detected change: {name}")
                        if state.last_content:
                            handler._send_delta(name, "sync", state.last_content)
    except KeyboardInterrupt:
        print("\nStopping...")
        observer.stop()
        retry_thread.running = False
        observer.join()
        print("Done.")
