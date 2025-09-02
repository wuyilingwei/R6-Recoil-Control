import webview
import http.server
import socketserver
import threading
import os
import json
import sys
import requests # Import requests
import subprocess # Import subprocess for update
import shutil # Import shutil for file operations
import ctypes
import base64
from settings_manager import SettingsManager, CONFIG_DIR
from typing import Optional

try:
    from PIL import Image
except Exception:
    Image = None


# Import additional libraries for overlay functionality
try:
    import win32gui
    import win32con
    import win32api
except ImportError:
    win32gui = None
    win32con = None
    win32api = None

# Controller support removed

from recoil_controller import RecoilController
from pynput import keyboard, mouse
from pynput.mouse import Button

# Define o diretório de configuração em %APPDATA%\Recoil Control
settings_manager = SettingsManager()

os.makedirs(CONFIG_DIR, exist_ok=True)

# Versão da aplicação (do main.py original)
__version__ = "3.0.0"

# NGROK_BASE_URL (from main.py)
NGROK_BASE_URL = "https://api.recoilcontrol.app"

# KEY_MAP do main.py original
KEY_MAP = {
    0x04: "MIDDLE BUTTON", 0x05: "SIDE BUTTON 1", 0x06: "SIDE BUTTON 2",
    0x08: "BACKSPACE", 0x09: "TAB", 0x0D: "ENTER", 0x10: "SHIFT", 0x11: "CONTROL",
    0x12: "ALT", 0x14: "CAPSLOCK", 0x1B: "ESCAPE", 0x20: "SPACE", 0x25: "ARROWLEFT",
    0x26: "ARROWUP", 0x27: "ARROWRIGHT", 0x28: "ARROWDOWN", 0x2E: "DELETE",
    # Add mappings for L/R variants to match JS e.key logic
    0xA0: "SHIFT", 0xA1: "SHIFT",       # VK_LSHIFT, VK_RSHIFT
    0xA2: "CONTROL", 0xA3: "CONTROL",   # VK_LCONTROL, VK_RCONTROL
    0xA4: "ALT", 0xA5: "ALT",           # VK_LMENU, VK_RMENU
    **{i: chr(i) for i in range(ord('0'), ord('9') + 1)},
    **{i: chr(i) for i in range(ord('A'), ord('Z') + 1)},
    **{i + 0x6F: f"F{i}" for i in range(1, 13)},
    0x90: "NUMLOCK", 0xBA: ";", 0xBB: "=", 0xBC: ",", 0xBD: "-", 0xBE: ".", 0xBF: "/", 0xC0: "'",
    0xDB: "[", 0xDC: "\"", 0xDD: "]", 0xDE: "`",
}

# Invert KEY_MAP for faster lookup from pynput key objects
INVERTED_KEY_MAP = {v: k for k, v in KEY_MAP.items()}

def get_base_path():
    if getattr(sys, 'frozen', False):
        return sys._MEIPASS
    else:
        return os.path.dirname(os.path.abspath(__file__))

# --- API Bridge between Python and JavaScript ---
class Api:
    def __init__(self):
        self._window = None
        self._recoil_active = False
        self.recoil_controller = RecoilController()
        self.keyboard_listener = None
        self.mouse_listener = None
        self.overlay_window = None
        self.current_zoom_index = 0
        self.current_overlay_square_index = -1
        self.overlay_agents = []
        self.online_count_poller = None
        # Load settings on initialization
        self.load_settings()
        self.signal_online()
        self.start_online_count_poller()
        self.overlay_squares = [None] * 14

    def set_window(self, window):
        print("Setting window for API")
        self._window = window
        # Passa a referência da janela para o controlador de recoil
        self.recoil_controller._window = window
        print("Window set for API")
        # Controller bridge removed
    
    # Window control methods for custom titlebar
    def minimize(self):
        try:
            if self._window:
                self._window.minimize()
        except Exception as e:
            print(f"Minimize error: {e}")

    def toggle_maximize(self):
        try:
            if self._window:
                # Try native maximize if available, else fallback to fullscreen toggle
                if hasattr(self._window, 'maximize'):
                    self._window.maximize()
                else:
                    self._window.toggle_fullscreen()
        except Exception as e:
            print(f"Maximize error: {e}")

    def close_window(self):
        try:
            if self._window:
                self._window.destroy()
        except Exception as e:
            print(f"Close error: {e}")

    def load_settings(self):
        # Load persisted settings using SettingsManager and apply to runtime settings object
        loaded = settings_manager.read_settings_file()
        try:
            if loaded:
                # Apply persisted values to recoil_controller.settings (set attributes even if not pre-defined)
                for k, v in loaded.items():
                    try:
                        setattr(self.recoil_controller.settings, k, v)
                    except Exception:
                        pass
                print("Settings loaded successfully.")
        except Exception as e:
            print(f"Error applying loaded settings: {e}")

        # Ensure a unique identifier exists for online presence, regardless of login status.
        if not getattr(self.recoil_controller.settings, 'identificador', None):
            import uuid
            new_id = str(uuid.uuid4())
            print(f"Identifier not found. Generating new one: {new_id}")
            setattr(self.recoil_controller.settings, 'identificador', new_id)
            # Save settings immediately to persist the new ID
            self.save_settings()

    def save_settings(self):
        # Use SettingsManager.update_settings to persist only allowed keys
        try:
            if hasattr(self.recoil_controller.settings, 'to_dict'):
                data = self.recoil_controller.settings.to_dict()
            else:
                data = dict(getattr(self.recoil_controller.settings, '__dict__', {}))

            # Only send allowed keys to the manager
            to_persist = {k: v for k, v in data.items() if k in settings_manager.allowed_keys}
            updated = settings_manager.update_settings(to_persist)
            print("Settings saved successfully via SettingsManager.")
            return updated
        except Exception as e:
            print(f"Error saving settings: {e}")
            return None

    def toggle_recoil(self):
        """Toggles the recoil control on and off."""
        self._recoil_active = not self._recoil_active
        if self._recoil_active:
            print("Iniciando sistema de recoil...")
            self.recoil_controller.start()
            print("Recoil control ENABLED.")
        else:
            print("Parando sistema de recoil...")
            self.recoil_controller.stop()
            print("Recoil control DISABLED.")
        return {"isActive": self._recoil_active}

    def is_recoil_active(self):
        """Returns the current state of recoil control (exposed to JS)."""
        return self._recoil_active

    def toggle_overlay(self):
        """Toggles the overlay window."""
        if self.overlay_window:
            self.overlay_window.destroy()
            self.overlay_window = None
            self.recoil_controller.settings.overlay_enabled = False
            self.save_settings()
            if self._window:
                self._window.evaluate_js(f'updateOverlayButtonState(false)')
            return {"isActive": False}
        else:
            self.recoil_controller.settings.overlay_enabled = True
            self.save_settings()
            self.overlay_window = webview.create_window(
                'Overlay',
                'http://localhost:8077/overlay.html',
                frameless=True,
                on_top=True,
                width=500,
                height=50,
                transparent=True,  # Important for layered windows
                easy_drag=False
            )

            def on_loaded():
                def apply_styles_and_position():
                    try:
                        # Use FindWindowW to get the handle by title
                        hwnd = win32gui.FindWindow(None, 'Overlay')
                        if not hwnd:
                            # print("Could not find overlay window handle for styling.")
                            return False # Indicate failure to retry
                        
                        # Define constants
                        GWL_EXSTYLE = -20
                        WS_EX_TRANSPARENT = 0x00000020
                        WS_EX_LAYERED = 0x00080000
                        WS_EX_NOACTIVATE = 0x08000000
                        WS_EX_TOOLWINDOW = 0x00000080
                        LWA_ALPHA = 0x00000002

                        # Get current style and apply new styles
                        ex_style = win32gui.GetWindowLong(hwnd, GWL_EXSTYLE)
                        ex_style |= WS_EX_LAYERED | WS_EX_TRANSPARENT | WS_EX_NOACTIVATE | WS_EX_TOOLWINDOW
                        win32gui.SetWindowLong(hwnd, GWL_EXSTYLE, ex_style)
                        
                        # Set window as layered but fully opaque
                        win32gui.SetLayeredWindowAttributes(hwnd, 0, 255, LWA_ALPHA)

                        # Reposition the window to the bottom right
                        rect = win32gui.GetWindowRect(hwnd)
                        width = rect[2] - rect[0]
                        height = rect[3] - rect[1]
                        screen_width = win32api.GetSystemMetrics(0)
                        screen_height = win32api.GetSystemMetrics(1)
                        x = screen_width - width - 10
                        y = screen_height - height - 5
                        win32gui.MoveWindow(hwnd, x, y, width, height, True)
                        
                        print("Applied click-through styles and repositioned overlay using new method.")
                        return True # Indicate success
                    except Exception as e:
                        print(f"Error in apply_styles_and_position thread: {e}")
                        return False # Indicate failure

                # Use a loop with a delay to robustly apply styles
                def robust_apply():
                    import time
                    for _ in range(20): # Try for 1 second
                        if apply_styles_and_position():
                            break
                        time.sleep(0.05)
                
                threading.Thread(target=robust_apply).start()

            self.overlay_window.events.loaded += on_loaded

            if self._window:
                self._window.evaluate_js(f'updateOverlayButtonState(true)')
            return {"isActive": True}

    

    def is_overlay_active(self):
        """Returns the current state of the overlay window."""
        return self.overlay_window is not None

    def get_settings(self):
        """Returns the current settings as a dictionary (sanitized for UI)."""
        data = settings_manager.to_ui_dict(self.recoil_controller.settings)
        data['app_version'] = __version__
        return data

    def apply_settings(self, settings_dict):
        """Applies a dictionary of settings and saves them."""
        try:
            # Map UI keys to internal keys if needed
            resolved = dict(settings_dict)
            # Normalize DPI/Sensitivity into the settings object even if the attributes don't pre-exist
            if 'setting_dpi' in resolved:
                try:
                    dpi_val = int(resolved.get('setting_dpi'))
                except Exception:
                    dpi_val = resolved.get('setting_dpi')
                # store under multiple keys so other parts of the app can read them
                try:
                    setattr(self.recoil_controller.settings, 'dpi', dpi_val)
                except Exception:
                    pass
                try:
                    setattr(self.recoil_controller.settings, 'mouse_dpi', dpi_val)
                except Exception:
                    pass
                try:
                    setattr(self.recoil_controller.settings, 'setting_dpi', dpi_val)
                except Exception:
                    pass
                # also ensure resolved contains a canonical key
                resolved['dpi'] = dpi_val

            if 'setting_sens' in resolved:
                try:
                    sens_val = float(resolved.get('setting_sens'))
                except Exception:
                    sens_val = resolved.get('setting_sens')
                try:
                    setattr(self.recoil_controller.settings, 'sens', sens_val)
                except Exception:
                    pass
                try:
                    setattr(self.recoil_controller.settings, 'sensitivity', sens_val)
                except Exception:
                    pass
                try:
                    setattr(self.recoil_controller.settings, 'setting_sens', sens_val)
                except Exception:
                    pass
                resolved['sens'] = sens_val

            # Handle overlay/zoom settings
            if 'overlay_zoom_level' in resolved:
                try:
                    zoom_val = float(resolved.get('overlay_zoom_level'))
                    setattr(self.recoil_controller.settings, 'overlay_zoom_level', zoom_val)
                    setattr(self.recoil_controller.settings, 'zoom_level', zoom_val) # for compatibility
                except (ValueError, TypeError):
                    pass
            elif 'zoom_level' in resolved: # fallback for old key
                 try:
                    zoom_val = float(resolved.get('zoom_level'))
                    setattr(self.recoil_controller.settings, 'overlay_zoom_level', zoom_val)
                    setattr(self.recoil_controller.settings, 'zoom_level', zoom_val)
                 except (ValueError, TypeError):
                    pass

            if 'overlay_enabled' in resolved:
                setattr(self.recoil_controller.settings, 'overlay_enabled', resolved['overlay_enabled'])
                setattr(self.recoil_controller.settings, 'zoom_hack_enabled', resolved['overlay_enabled']) # for compatibility
            elif 'zoom_hack_enabled' in resolved: # fallback for old key
                setattr(self.recoil_controller.settings, 'overlay_enabled', resolved['zoom_hack_enabled'])
                setattr(self.recoil_controller.settings, 'zoom_hack_enabled', resolved['zoom_hack_enabled'])


            for key, value in resolved.items():
                if hasattr(self.recoil_controller.settings, key):
                    setattr(self.recoil_controller.settings, key, value)
            
            # After applying, update the controller with the new values
            if self.recoil_controller.settings.active_weapon == "primary":
                self.recoil_controller.set_recoil_y(self.recoil_controller.settings.primary_recoil_y)
                self.recoil_controller.set_recoil_x(self.recoil_controller.settings.primary_recoil_x)
            else:
                self.recoil_controller.set_recoil_y(self.recoil_controller.settings.secondary_recoil_y)
                self.recoil_controller.set_recoil_x(self.recoil_controller.settings.secondary_recoil_x)

            

            # Handle crosshair functionality
            if hasattr(self.recoil_controller.settings, 'crosshair_enabled'):
                if self.recoil_controller.settings.crosshair_enabled:
                    self.recoil_controller.start_crosshair()
                else:
                    self.recoil_controller.stop_crosshair()

            self.save_settings() # Save settings after applying
            print("Settings applied successfully.")
            return {"success": True}
        except Exception as e:
            print(f"Error applying settings: {e}")
            return {"success": False, "error": str(e)}

    def log_message(self, message):
        """Logs a message from the UI to the console."""
        print(f"[UI Log]: {message}")

    def start_listeners(self):
        if not self.keyboard_listener or not self.keyboard_listener.is_alive():
            self.keyboard_listener = keyboard.Listener(on_press=self._on_key_press, on_release=self._on_key_release)
            self.keyboard_listener.start()
            print("Keyboard listener started.")
        
        if not self.mouse_listener or not self.mouse_listener.is_alive():
            self.mouse_listener = mouse.Listener(on_click=self._on_mouse_click, on_scroll=self._on_scroll_event)
            self.mouse_listener.start()
            print("Mouse listener started.")

    def stop_listeners(self):
        if self.keyboard_listener and self.keyboard_listener.is_alive():
            self.keyboard_listener.stop()
            self.keyboard_listener.join()
            print("Keyboard listener stopped.")
        
        if self.mouse_listener and self.mouse_listener.is_alive():
            self.mouse_listener.stop()
            self.mouse_listener.join()
            print("Mouse listener stopped.")
        # Controller bridge removed

    def _get_hotkey_string(self, key):
        """Converts a pynput key object to a string representation used in settings."""
        try:
            # For special keys like Key.f1, Key.shift
            if hasattr(key, 'vk'):
                # Use win32api to get the key name if it's a virtual key code
                # This handles cases where pynput's name might be different from our KEY_MAP
                import win32api
                vk_code = key.vk
                if vk_code in KEY_MAP:
                    return KEY_MAP[vk_code]
                else:
                    # Fallback for other VK codes not in our map
                    return f"VK_{vk_code}"
            elif hasattr(key, 'char') and key.char is not None:
                return str(key.char).upper()
            else:
                return str(key).replace('Key.', '').upper()
        except Exception as e:
            print(f"Error getting hotkey string: {e}")
            return "UNKNOWN_KEY"

    def _on_key_press(self, key):
        hotkey_string = self._get_hotkey_string(key)
        self._process_hotkey(hotkey_string)

    def _on_key_release(self, key):
        hotkey_string = self._get_hotkey_string(key)
        if hotkey_string in self.recoil_controller.settings.t_bag_hotkey:
            if self.recoil_controller.settings.t_bag_enabled and self.recoil_controller.t_bag_active:
                self.recoil_controller.stop_t_bag()

    def _on_mouse_click(self, x, y, button, pressed):
        # This is handled by recoil_controller directly, but we can add UI updates here if needed
        pass

    def _on_scroll_event(self, x, y, dx, dy):
        hotkey_string = ""
        if dy > 0:
            hotkey_string = "SCROLL_UP"
        elif dy < 0:
            hotkey_string = "SCROLL_DOWN"
        
        if hotkey_string:
            self._process_hotkey(hotkey_string)

    def toggle_overlay_hotkey(self):
        """Handles the overlay toggle hotkey press."""
        self.recoil_controller.settings.overlay_enabled = not getattr(self.recoil_controller.settings, 'overlay_enabled', False)
        self.save_settings() # Just save, don't re-apply everything
        if self._window:
            # We still need to tell the UI about the main toggle button state
            self._window.evaluate_js(f'updateOverlayButtonState({json.dumps(self.recoil_controller.settings.overlay_enabled)});')
            # And update the settings view in case it's open
            self._window.evaluate_js(f'updateUIFromPython({json.dumps(self.get_settings())});')

    def update_overlay_agents(self, agents):
        self.overlay_agents = agents  # Store the agents
        if self.overlay_window:
            self.overlay_window.evaluate_js(f'window.update_agents({json.dumps(agents)})')

    def step_overlay_square_hotkey(self):
        """Handles the overlay step square hotkey press. Cycles through non-empty squares."""
        
        # 1. Find indices of squares with agents
        agent_indices = [i for i, agent in enumerate(self.overlay_agents) if agent and agent.get('name')]

        # 2. If no agents, do nothing
        if not agent_indices:
            print("No agents in overlay to step through.")
            return

        # 3. Find the next index
        try:
            # Find where the current index is in our list of valid agent indices
            current_list_index = agent_indices.index(self.current_overlay_square_index)
            # Move to the next index in the list, wrapping around
            next_list_index = (current_list_index + 1) % len(agent_indices)
        except ValueError:
            # If the current index isn't in the list (e.g., it's -1 or an empty square was selected before),
            # just start from the first agent in the list.
            next_list_index = 0

        # 4. Get the new actual square index
        new_square_index = agent_indices[next_list_index]
        self.current_overlay_square_index = new_square_index

        # 5. Highlight and load preset (the rest of the logic)
        if self.overlay_window:
            self.overlay_window.evaluate_js(f'window.highlight_square({self.current_overlay_square_index})')

        agent_info = self.overlay_agents[self.current_overlay_square_index]
        agent_name = agent_info['name']
        print(f"Stepped to agent: {agent_name}")

        presets = self.get_presets_for_agent(agent_name)
        if presets and len(presets) > 0:
            preset_to_load = presets[0]
            print(f"Loading preset '{preset_to_load}' for agent '{agent_name}'")
            self.load_preset(agent_name, preset_to_load)
        else:
            print(f"No presets found for agent '{agent_name}'")

    def _process_hotkey(self, hotkey_string):
        print(f"Processing hotkey: {hotkey_string}")

        # Toggle Recoil hotkey
        if hasattr(self.recoil_controller.settings, 'toggle_hotkey') and hotkey_string in self.recoil_controller.settings.toggle_hotkey:
            self.toggle_recoil()
            if self._window:
                self._window.evaluate_js(f'updateToggleButtonState({json.dumps(self.is_recoil_active())});')
            return

        # Overlay Toggle hotkey
        if hasattr(self.recoil_controller.settings, 'overlay_toggle_hotkey') and hotkey_string in self.recoil_controller.settings.overlay_toggle_hotkey:
            self.toggle_overlay_hotkey()
            return

        # Overlay Step hotkey
        if hasattr(self.recoil_controller.settings, 'overlay_step_hotkey') and hotkey_string in self.recoil_controller.settings.overlay_step_hotkey:
            self.step_overlay_square_hotkey()
            return

        # T-Bag hotkey (should work even if recoil is disabled)
        if hasattr(self.recoil_controller.settings, 't_bag_hotkey') and hotkey_string in self.recoil_controller.settings.t_bag_hotkey:
            if self.recoil_controller.settings.t_bag_enabled:
                if not self.recoil_controller.t_bag_active:
                    self.recoil_controller.start_t_bag()

        if not self._recoil_active:
            return

        # Primary Weapon hotkey
        if hasattr(self.recoil_controller.settings, 'primary_weapon_hotkey') and (hotkey_string in self.recoil_controller.settings.primary_weapon_hotkey or hotkey_string in self.recoil_controller.settings.primary_weapon_hotkey_2):
            self.recoil_controller.settings.active_weapon = "primary"
            self.recoil_controller.set_recoil_y(self.recoil_controller.settings.primary_recoil_y)
            self.recoil_controller.set_recoil_x(self.recoil_controller.settings.primary_recoil_x)
            self.save_settings()
            if self._window:
                self._window.evaluate_js(f'updateUIFromPython({json.dumps(self.get_settings())});')
            print(f"Primary weapon activated by hotkey: {hotkey_string}.")

        # Secondary Weapon hotkey
        elif hasattr(self.recoil_controller.settings, 'secondary_weapon_hotkey') and (hotkey_string in self.recoil_controller.settings.secondary_weapon_hotkey or \
             hotkey_string in self.recoil_controller.settings.secondary_weapon_hotkey_2):
            self.recoil_controller.settings.active_weapon = "secondary"
            self.recoil_controller.set_recoil_y(self.recoil_controller.settings.secondary_recoil_y)
            self.recoil_controller.set_recoil_x(self.recoil_controller.settings.secondary_recoil_x)
            self.save_settings()
            if self._window:
                self._window.evaluate_js(f'updateUIFromPython({json.dumps(self.get_settings())});')
            print(f"Secondary weapon activated by hotkey: {hotkey_string}.")

    # Controller bridge fully removed

    # --- Agents & Presets API (exposed to JS) ---
    def get_agent_list(self, agent_type):
        """Returns a list of agents (name and image path) for the given type."""
        agent_names = []
        agent_dir_type = agent_type

        if agent_type == "attackers":
            agent_names = [
                "Striker", "Sledge", "Thatcher", "Ash", "Thermite", "Twitch",
                "Montagne", "Glaz", "Fuze", "Blitz", "IQ", "Buck",
                "Blackbeard", "Capitao", "Hibana", "Jackal", "Ying", "Zofia",
                "Dokkaebi", "Finka", "Lion", "Maverick", "Nomad", "Gridlock",
                "Nokk", "Amaru", "Kali", "Iana", "Ace", "Zero",
                "Flores", "Osa", "Sens", "Grim", "Brava", "Ram",
                "Deimos", "Rauora"
            ]
        elif agent_type == "defenders":
            agent_names = [
                "Sentry", "Smoke", "Mute", "Castle", "Pulse", "Doc",
                "Rook", "Kapkan", "Tachanka", "Jager", "Bandit", "Frost",
                "Valkyrie", "Caveira", "Echo", "Mira", "Lesion", "Ela",
                "Vigil", "Maestro", "Alibi", "Clash", "Kaid", "Mozzie",
                "Warden", "Goyo", "Wamai", "Oryx", "Melusi", "Aruni",
                "Thunderbird", "Thorn", "Azami", "Solis", "Fenrir",
                "Tubarao", "Skopos"
            ]
        elif agent_type == "saved":
            presets_base_dir = os.path.join(CONFIG_DIR, "presets")
            if os.path.exists(presets_base_dir):
                for agent_folder in os.listdir(presets_base_dir):
                    agent_path = os.path.join(presets_base_dir, agent_folder)
                    if os.path.isdir(agent_path):
                        # Check if there is at least one .json file
                        has_presets = any(f.endswith('.json') for f in os.listdir(agent_path))
                        if has_presets:
                            # Convert folder name (e.g., 'the_huntress') to display name ('The Huntress')
                            agent_name = agent_folder.replace('_', ' ').title()
                            agent_names.append(agent_name)
            # For saved agents, we don't have a single type, so we'll have to find their images
            agent_dir_type = None # Will check both attackers and defenders

        agents_data = []
        # Determine search paths for images
        search_paths = []
        if agent_dir_type:
            search_paths.append(os.path.join(get_base_path(), "webview_ui", "Agents", agent_dir_type))
        else: # For 'saved', check both directories
            search_paths.append(os.path.join(get_base_path(), "webview_ui", "Agents", "attackers"))
            search_paths.append(os.path.join(get_base_path(), "webview_ui", "Agents", "defenders"))

        for name in agent_names:
            img_filename = f"{name.lower().replace(' ', '')}.png"
            found_image = False
            for path in search_paths:
                full_disk_path = os.path.join(path, img_filename)
                if os.path.exists(full_disk_path):
                    with open(full_disk_path, "rb") as image_file:
                        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                    web_path = f"data:image/png;base64,{encoded_string}"
                    agents_data.append({"name": name, "image": web_path})
                    found_image = True
                    break
            if not found_image:
                print(f"Warning: Agent image not found for saved agent: {name}")
                agents_data.append({"name": name, "image": ""}) # Fallback
        return agents_data

    def get_presets_for_agent(self, agent_name):
        agent_presets_dir = os.path.join(CONFIG_DIR, "presets", agent_name.lower().replace(" ", "_"))
        presets = []
        if os.path.exists(agent_presets_dir):
            for filename in os.listdir(agent_presets_dir):
                if filename.endswith(".json"):
                    preset_name = os.path.splitext(filename)[0]
                    presets.append(preset_name)
        return presets

    def get_all_local_presets(self):
        """Return all presets found under CONFIG_DIR/presets as a list of {agent, name} entries."""
        all_presets = []
        try:
            base = os.path.join(CONFIG_DIR, 'presets')
            if not os.path.exists(base):
                return []
            for agent_dir in os.listdir(base):
                agent_path = os.path.join(base, agent_dir)
                if not os.path.isdir(agent_path):
                    continue
                for fn in os.listdir(agent_path):
                    if not fn.lower().endswith('.json'):
                        continue
                    name = os.path.splitext(fn)[0]
                    all_presets.append({
                        'agent': agent_dir,
                        'name': name
                    })
        except Exception as e:
            print(f"Error listing local presets: {e}")
        return all_presets

    def save_preset(self, agent_name, preset_name, settings_to_save):
        agent_presets_dir = os.path.join(CONFIG_DIR, "presets", agent_name.lower().replace(" ", "_"))
        os.makedirs(agent_presets_dir, exist_ok=True)
        preset_file_path = os.path.join(agent_presets_dir, f"{preset_name}.json")
        try:
            with open(preset_file_path, 'w') as f:
                json.dump(settings_to_save, f, indent=4)
            print(f"Preset '{preset_name}' saved successfully for {agent_name}.")
            return {"success": True, "message": f"Preset '{preset_name}' saved successfully!"}
        except Exception as e:
            print(f"Error saving preset: {e}")
            return {"success": False, "message": f"Error saving preset: {e}"}

    def load_preset(self, agent_name, preset_name):
        agent_presets_dir = os.path.join(CONFIG_DIR, "presets", agent_name.lower().replace(" ", "_"))
        preset_file_path = os.path.join(agent_presets_dir, f"{preset_name}.json")
        if not os.path.exists(preset_file_path):
            return {"success": False, "message": "Preset not found."}
        try:
            with open(preset_file_path, 'r') as f:
                preset_settings = json.load(f)
            
            # Get the current full settings from the UI/app state
            current_full_settings = self.get_settings()
            
            # Update the current settings with the values from the preset
            current_full_settings.update(preset_settings)

            # Now apply this complete, merged settings object
            self.apply_settings(current_full_settings)
            
            print(f"Preset '{preset_name}' loaded successfully for {agent_name}.")

            # Trigger UI update with the final, applied settings
            if self._window:
                self._window.evaluate_js(f'updateUIFromPython({json.dumps(self.get_settings())})')

            return {"success": True, "settings": current_full_settings}
        except Exception as e:
            print(f"Error loading preset: {e}")
            return {"success": False, "message": f"Error loading preset: {e}"}

    def delete_preset(self, agent_name, preset_name):
        agent_presets_dir = os.path.join(CONFIG_DIR, "presets", agent_name.lower().replace(" ", "_"))
        preset_file_path = os.path.join(agent_presets_dir, f"{preset_name}.json")
        if not os.path.exists(preset_file_path):
            return {"success": False, "message": "Preset not found."}
        try:
            os.remove(preset_file_path)
            print(f"Preset '{preset_name}' deleted successfully for {agent_name}.")
            return {"success": True, "message": f"Preset '{preset_name}' deleted successfully!"}
        except Exception as e:
            print(f"Error deleting preset: {e}")
            return {"success": False, "message": f"Error deleting preset: {e}"}

    # --- Community Presets (HTTP to bot server) ---
    def get_community_presets(self, agent=None, query=None):
        # Community presets should come only from the community database or remote API.
        try:
            # Prefer bundled community database first (if present)
            db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database', 'community_presets.json')
            if os.path.exists(db_path) and os.path.getsize(db_path) > 0:
                with open(db_path, 'r', encoding='utf-8') as f:
                    db_list = json.load(f)
                    if isinstance(db_list, dict):
                        db_list = db_list.get('presets', [])
                    presets = []
                    for p in db_list:
                        entry = {
                            'id': p.get('id') or f"db:{p.get('name', '')}",
                            'agent': p.get('agent', ''),
                            'name': p.get('name', ''),
                            'author': p.get('author', 'anonymous'),
                            'downloads': p.get('downloads', 0),
                            'rating': p.get('rating', 0.0),
                            'created_at': p.get('created_at'),
                            'settings': p.get('settings', {})
                        }
                        presets.append(entry)
                    # Apply optional filters
                    if agent:
                        presets = [p for p in presets if str(p.get('agent', '')).lower() == str(agent).lower()]
                    if query:
                        ql = query.lower()
                        presets = [p for p in presets if ql in str(p.get('name', '')).lower() or ql in str(p.get('author', '') or '').lower()]
                    return {"success": True, "presets": presets}

            # Fallback to remote NGROK endpoint
            params = {}
            if agent:
                params['agent'] = agent
            if query:
                params['q'] = query
            r = requests.get(f"{NGROK_BASE_URL}/community-presets", params=params, timeout=4)
            r.raise_for_status()
            data = r.json()
            return {"success": True, "presets": data.get("presets", [])}
        except Exception as e:
            print(f"Error fetching community presets: {e}")
            return {"success": False, "presets": [], "error": str(e)}

    def import_community_preset(self, preset_id):
        try:
            r = requests.get(f"{NGROK_BASE_URL}/community-presets/{preset_id}")
            r.raise_for_status()
            data = r.json()
            settings = data.get('settings', {}) if isinstance(data, dict) else {}
            if not isinstance(settings, dict):
                return {"success": False, "message": "Invalid preset format."}

            # Map known fields
            s = self.recoil_controller.settings
            s.primary_recoil_y = float(settings.get("primary_recoil_y", s.primary_recoil_y)) if settings.get("primary_recoil_y") is not None else s.primary_recoil_y
            s.primary_recoil_x = float(settings.get("primary_recoil_x", s.primary_recoil_x)) if settings.get("primary_recoil_x") is not None else s.primary_recoil_x
            s.secondary_recoil_y = float(settings.get("secondary_recoil_y", s.secondary_recoil_y)) if settings.get("secondary_recoil_y") is not None else s.secondary_recoil_y
            s.secondary_recoil_x = float(settings.get("secondary_recoil_x", s.secondary_recoil_x)) if settings.get("secondary_recoil_x") is not None else s.secondary_recoil_x
            s.secondary_weapon_enabled = bool(settings.get("secondary_weapon_enabled", s.secondary_weapon_enabled))

            # Optional generic recoil_y/x support
            if "recoil_y" in settings and isinstance(settings["recoil_y"], (int, float)):
                s.primary_recoil_y = float(settings["recoil_y"])
            if "recoil_x" in settings and isinstance(settings["recoil_x"], (int, float)):
                s.primary_recoil_x = float(settings["recoil_x"])

            # Save and return
            self.save_settings()
            return {"success": True, "settings": s.to_dict()}
        except Exception as e:
            print(f"Error importing community preset: {e}")
            return {"success": False, "message": str(e)}

    def post_community_preset(self, payload):
        try:
            r = requests.post(f"{NGROK_BASE_URL}/community-presets", json=payload)
            r.raise_for_status()
            return {"success": True, "data": r.json()}
        except Exception as e:
            print(f"Error posting community preset: {e}")
            return {"success": False, "message": str(e)}

    # --- AI and Discord Integration API Methods ---
    def send_ai_message(self, prompt, chat_history, discord_user_id, model):
        payload = {
            "prompt": prompt,
            "current_settings": self.recoil_controller.settings.to_dict(),
            "chat_history": chat_history,
            "discord_user_id": discord_user_id,
            "model": model,
            "stream": True
        }
    
        def stream_worker():
            try:
                response = requests.post(f"{NGROK_BASE_URL}/ai", json=payload, stream=True)
                response.raise_for_status()
                # Use iter_content to get raw chunks
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        # Base64 encode the raw chunk and send to JS
                        encoded_chunk = base64.b64encode(chunk).decode('utf-8')
                        if self._window:
                            self._window.evaluate_js(f'window.handleAiStream("{encoded_chunk}");')
            except Exception as e:
                error_message = str(e).replace('"', '"').replace("'", "'")
                if self._window:
                    self._window.evaluate_js(f'window.handleAiStreamError("{error_message}");')

        threading.Thread(target=stream_worker).start()
        return {"success": True, "streaming": True}

    def handle_ui_action(self, action):
        if not isinstance(action, dict) or 'action' not in action:
            return {"success": False, "message": "Invalid action format"}

        action_type = action.get('action')
        payload = action.get('payload')

        if action_type == 'enable_overlay':
            if not self.is_overlay_active():
                self.toggle_overlay()
            return {"success": True}

        elif action_type == 'disable_overlay':
            if self.is_overlay_active():
                self.toggle_overlay()
            return {"success": True}

        elif action_type == 'set_overlay_agent':
            if not payload or 'square' not in payload or 'agent_name' not in payload:
                return {"success": False, "message": "Missing payload for set_overlay_agent"}
            
            square = payload.get('square')
            agent_name = payload.get('agent_name')

            if not isinstance(square, int) or not (1 <= square <= 14):
                return {"success": False, "message": "Square must be an integer between 1 and 14"}

            # Find the agent's image path
            agent_image = ""
            # This is inefficient, but it's the easiest way to reuse the existing logic
            all_agents = self.get_agent_list('attackers') + self.get_agent_list('defenders')
            for agent in all_agents:
                if agent['name'].lower() == agent_name.lower():
                    agent_image = agent['image']
                    break
            
            if not agent_image:
                return {"success": False, "message": f"Agent '{agent_name}' not found"}

            self.overlay_squares[square - 1] = {"name": agent_name, "image": agent_image}
            self.update_overlay_agents(self.overlay_squares)
            return {"success": True}

        elif action_type == 'remove_overlay_agent':
            if not payload or 'square' not in payload:
                return {"success": False, "message": "Missing payload for remove_overlay_agent"}
            
            square = payload.get('square')

            if not isinstance(square, int) or not (1 <= square <= 14):
                return {"success": False, "message": "Square must be an integer between 1 and 14"}

            self.overlay_squares[square - 1] = None
            self.update_overlay_agents(self.overlay_squares)
            return {"success": True}

        return {"success": False, "message": f"Unknown action: {action_type}"}

    def check_pin_auth(self, pin):
        print(f"check_pin_auth called with PIN: {pin}")
        try:
            response = requests.post(f"{NGROK_BASE_URL}/check-pin", json={"pin": pin})
            response.raise_for_status()
            result = response.json()
            if result.get("success"):
                # Atualiza as configurações com o ID do usuário e o token da app.
                # O 'identificador' já existe no cliente e não é mais enviado pelo servidor.
                self.recoil_controller.settings.discord_user_id = result.get("discord_user_id")
                self.recoil_controller.settings.discord_username = result.get("discord_username")
                self.recoil_controller.settings.app_id = result.get("app_id")
                
                # Salva as configurações atualizadas
                self.save_settings()

                # Sinaliza que está online após a autenticação bem-sucedida
                self.signal_online()
                
                # Retorna sucesso com os dados do usuário
                return {"success": True, "data": result}
            else:
                return {"success": False, "message": result.get("message", "Falha na autenticação")}
        except requests.exceptions.RequestException as e:
            print(f"Error checking PIN: {e}")
            return {"success": False, "message": f"Error communicating with auth server: {e}"}
        except Exception as e:
            print(f"Unexpected error checking PIN: {e}")
            return {"success": False, "message": f"Unexpected error: {e}"}

    def logout(self):
        """Clears Discord authentication details from settings."""
        try:
            # Fields to clear on logout
            fields_to_clear = ['discord_user_id', 'app_id', 'discord_username']
            for field in fields_to_clear:
                if hasattr(self.recoil_controller.settings, field):
                    setattr(self.recoil_controller.settings, field, None)
            
            self.save_settings()
            print("User logged out, settings cleared.")
            return {"success": True}
        except Exception as e:
            print(f"Error during logout: {e}")
            return {"success": False, "error": str(e)}

    def signal_online(self):
        """Sends a signal to the backend that this client is online."""
        user_id = getattr(self.recoil_controller.settings, 'identificador', None)
        if user_id:
            def do_request():
                try:
                    payload = {"identificador": user_id}
                    requests.post(f"{NGROK_BASE_URL}/online", json=payload, timeout=5)
                    print("Successfully signaled online status.")
                except requests.exceptions.RequestException as e:
                    print(f"Could not signal online status: {e}")
            threading.Thread(target=do_request, daemon=True).start()

    def signal_offline(self):
        """Sends a signal to the backend that this client is going offline."""
        user_id = getattr(self.recoil_controller.settings, 'identificador', None)
        if user_id:
            try:
                payload = {"identificador": user_id}
                requests.delete(f"{NGROK_BASE_URL}/online", json=payload, timeout=2)
                print("Successfully signaled offline status.")
            except requests.exceptions.RequestException as e:
                print(f"Could not signal offline status on exit: {e}")

    def start_online_count_poller(self):
        """Starts a background thread to periodically fetch the online user count."""
        if self.online_count_poller and self.online_count_poller.is_alive():
            return

        def poll():
            import time
            time.sleep(5) # Initial delay
            while True:
                try:
                    response = requests.get(f"{NGROK_BASE_URL}/online", timeout=5)
                    response.raise_for_status()
                    data = response.json()
                    if data.get("success"):
                        count = data.get("online_count", 0)
                        if self._window:
                            self._window.evaluate_js(f'updateOnlineCount({count})')
                except requests.exceptions.RequestException:
                    pass # Fail silently on network errors
                except Exception as e:
                    print(f"Unexpected error in online count poller: {e}")
                
                time.sleep(45) # Poll every 30 seconds

        self.online_count_poller = threading.Thread(target=poll, daemon=True)
        self.online_count_poller.start()
        print("Started online count poller.")

    def add_to_memory(self, discord_user_id, content):
        payload = {"discord_user_id": discord_user_id, "content": content}
        try:
            response = requests.post(f"{NGROK_BASE_URL}/add_to_memory", json=payload)
            response.raise_for_status()
            return {"success": True, "data": response.json()}
        except requests.exceptions.RequestException as e:
            print(f"Error adding to memory: {e}")
            return {"success": False, "message": f"Error communicating with memory server: {e}"}

    def send_report(self, chat_history, discord_user_id):
        payload = {"chat_history": chat_history, "discord_user_id": discord_user_id}
        try:
            response = requests.post(f"{NGROK_BASE_URL}/report", json=payload)
            response.raise_for_status()
            return {"success": True, "data": response.json()}
        except requests.exceptions.RequestException as e:
            print(f"Error sending report: {e}")
            return {"success": False, "message": f"Error communicating with report server: {e}"}

    def end_session_signal(self, discord_user_id):
        payload = {"discord_user_id": discord_user_id}
        try:
            response = requests.post(f"{NGROK_BASE_URL}/end_session", json=payload)
            response.raise_for_status()
            return {"success": True, "data": response.json()}
        except requests.exceptions.RequestException as e:
            print(f"Error sending end session signal: {e}")
            return {"success": False, "message": f"Error communicating with session server: {e}"}

    def send_rating(self, rating):
        """Sends the user's rating to the backend."""
        try:
            payload = {"rating": rating}
            response = requests.post(f"{NGROK_BASE_URL}/rating", json=payload, timeout=5)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error sending rating: {e}")
            return {"success": False, "message": str(e)}

    def check_for_updates(self):
        update_url = "https://raw.githubusercontent.com/K1ngPT-X/R6-Recoil-Control/refs/heads/main/Version.txt"
        try:
            response = requests.get(update_url)
            response.raise_for_status()
            latest_version = response.text.strip()
            
            if latest_version > __version__:
                return {"update_available": True, "latest_version": latest_version, "current_version": __version__}
            else:
                return {"update_available": False, "latest_version": latest_version, "current_version": __version__}
        except requests.exceptions.RequestException as e:
            print(f"Error checking for updates: {e}")
            return {"update_available": False, "error": str(e)}
        except Exception as e:
            print(f"An unexpected error occurred while checking for updates: {e}")
            return {"update_available": False, "error": str(e)}

# --- Windows Title Bar Dark Mode ---
def enable_dark_title_bar(window_title: str) -> bool:
    """Enable dark title bar on Windows 10/11 for a given window title.

    Returns True if applied, False otherwise.
    """
    try:
        user32 = ctypes.windll.user32
        hwnd = user32.FindWindowW(None, window_title)
        if not hwnd:
            return False

        # DWM attribute for dark mode: 20 on 1903+, 19 on 1809
        DWMWA_USE_IMMERSIVE_DARK_MODE = 20
        DWMWA_USE_IMMERSIVE_DARK_MODE_BEFORE_1903 = 19

        value = ctypes.c_int(1)
        dwmapi = ctypes.windll.dwmapi

        # Try attr 20 first, then 19
        result = dwmapi.DwmSetWindowAttribute(hwnd,
                                              ctypes.c_uint(DWMWA_USE_IMMERSIVE_DARK_MODE),
                                              ctypes.byref(value),
                                              ctypes.sizeof(value))
        if result != 0:
            result = dwmapi.DwmSetWindowAttribute(hwnd,
                                                  ctypes.c_uint(DWMWA_USE_IMMERSIVE_DARK_MODE_BEFORE_1903),
                                                  ctypes.byref(value),
                                                  ctypes.sizeof(value))
        return result == 0
    except Exception:
        return False

def set_titlebar_appearance(
    window_title: str,
    dark_mode: bool = True,
    caption_color_rgb: tuple = (26, 26, 26),
    text_color_rgb: tuple = (234, 234, 234),
    border_color_rgb: tuple = (58, 58, 58),
    backdrop: str = "mica",  # options: 'none', 'mica', 'tabbed', 'auto'
    corner: str = "round"     # options: 'default', 'notround', 'round', 'small'
) -> bool:
    """Customize native Windows title bar colors/backdrop (Windows 11 22H2+).

    Returns True if any attribute applied successfully.
    """
    try:
        user32 = ctypes.windll.user32
        hwnd = user32.FindWindowW(None, window_title)
        if not hwnd:
            return False

        dwmapi = ctypes.windll.dwmapi
        applied_any = False

        # Helper to convert (R,G,B) to COLORREF (0x00BBGGRR)
        def to_colorref(rgb: tuple) -> ctypes.c_int:
            r, g, b = rgb
            return ctypes.c_int((b << 16) | (g << 8) | r)

        # Dark mode (keep for downlevel support)
        if dark_mode:
            enable_dark_title_bar(window_title)

        # Title bar colors (Win11 22H2+)
        DWMWA_BORDER_COLOR = 34
        DWMWA_CAPTION_COLOR = 35
        DWMWA_TEXT_COLOR = 36
        try:
            border = to_colorref(border_color_rgb)
            caption = to_colorref(caption_color_rgb)
            text = to_colorref(text_color_rgb)

            if dwmapi.DwmSetWindowAttribute(hwnd, ctypes.c_uint(DWMWA_BORDER_COLOR), ctypes.byref(border), ctypes.sizeof(border)) == 0:
                applied_any = True
            if dwmapi.DwmSetWindowAttribute(hwnd, ctypes.c_uint(DWMWA_CAPTION_COLOR), ctypes.byref(caption), ctypes.sizeof(caption)) == 0:
                applied_any = True
            if dwmapi.DwmSetWindowAttribute(hwnd, ctypes.c_uint(DWMWA_TEXT_COLOR), ctypes.byref(text), ctypes.sizeof(text)) == 0:
                applied_any = True
        except Exception:
            pass

        # Corner preference
        DWMWA_WINDOW_CORNER_PREFERENCE = 33
        corner_map = {
            "default": 0,
            "notround": 1,
            "round": 2,
            "small": 3,
        }
        try:
            corner_val = ctypes.c_int(corner_map.get(corner, 2))
            if dwmapi.DwmSetWindowAttribute(hwnd, ctypes.c_uint(DWMWA_WINDOW_CORNER_PREFERENCE), ctypes.byref(corner_val), ctypes.sizeof(corner_val)) == 0:
                applied_any = True
        except Exception:
            pass

        # Backdrop (Mica/Tabbed)
        DWMWA_SYSTEMBACKDROP_TYPE = 38
        backdrop_map = {
            "auto": 0,    # DWMSBT_AUTO
            "none": 1,    # DWMSBT_NONE
            "mica": 2,    # DWMSBT_MAINWINDOW (Mica)
            "tabbed": 4,  # DWMSBT_TABBEDWINDOW (Mica Alt)
        }
        try:
            backdrop_val = ctypes.c_int(backdrop_map.get(backdrop, 2))
            if dwmapi.DwmSetWindowAttribute(hwnd, ctypes.c_uint(DWMWA_SYSTEMBACKDROP_TYPE), ctypes.byref(backdrop_val), ctypes.sizeof(backdrop_val)) == 0:
                applied_any = True
        except Exception:
            pass

        return applied_any
    except Exception:
        return False



def remove_titlebar_icon(window_title: str) -> bool:
    """Remove the small and big icons from the native title bar on Windows."""
    GWL_EXSTYLE = -20
    try:
        user32 = ctypes.windll.user32
        hwnd = user32.FindWindowW(None, window_title)
        if not hwnd:
            return False

        WM_SETICON = 0x0080
        ICON_SMALL = 0
        ICON_BIG = 1
        ICON_SMALL2 = 2

        # Clear window icons
        user32.SendMessageW(hwnd, WM_SETICON, ICON_SMALL, 0)
        user32.SendMessageW(hwnd, WM_SETICON, ICON_BIG, 0)
        user32.SendMessageW(hwnd, WM_SETICON, ICON_SMALL2, 0)

        # Also clear class icons for reliability
        GCLP_HICON = -14
        GCLP_HICONSM = -34
        try:
            ctypes.windll.user32.SetClassLongPtrW(hwnd, GCLP_HICON, 0)
            ctypes.windll.user32.SetClassLongPtrW(hwnd, GCLP_HICONSM, 0)
        except Exception:
            try:
                ctypes.windll.user32.SetClassLongW(hwnd, GCLP_HICON, 0)
                ctypes.windll.user32.SetClassLongW(hwnd, GCLP_HICONSM, 0)
            except Exception:
                pass

        # Remove icon gap by adding WS_EX_DLGMODALFRAME and forcing non-client refresh
        WS_EX_DLGMODALFRAME = 0x0001
        SWP_NOSIZE = 0x0001
        SWP_NOMOVE = 0x0002
        SWP_NOZORDER = 0x0004
        SWP_FRAMECHANGED = 0x0020
        try:
            # Prefer 64-bit aware API
            GetWindowLongPtrW = ctypes.windll.user32.GetWindowLongPtrW
            SetWindowLongPtrW = ctypes.windll.user32.SetWindowLongPtrW
            GetWindowLongPtrW.restype = ctypes.c_longlong
            ex_style = GetWindowLongPtrW(hwnd, GWL_EXSTYLE)
            ex_style |= WS_EX_DLGMODALFRAME
            SetWindowLongPtrW(hwnd, GWL_EXSTYLE, ex_style)
        except Exception:
            try:
                GetWindowLongW = ctypes.windll.user32.GetWindowLongW
                SetWindowLongW = ctypes.windll.user32.SetWindowLongW
                ex_style = GetWindowLongW(hwnd, GWL_EXSTYLE)
                ex_style |= WS_EX_DLGMODALFRAME
                SetWindowLongW(hwnd, GWL_EXSTYLE, ex_style)
            except Exception:
                pass

        # Apply style change
        ctypes.windll.user32.SetWindowPos(hwnd, 0, 0, 0, 0, 0,
                                          SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_FRAMECHANGED)
        return True
    except Exception:
        return False

def set_transparent_titlebar_icon(window_title: str) -> bool:
    """Assign a fully transparent 1x1 icon to avoid the generic placeholder."""
    try:
        user32 = ctypes.windll.user32
        gdi32 = ctypes.windll.gdi32
        hwnd = user32.FindWindowW(None, window_title)
        if not hwnd:
            return False

        # Create 1x1 monochrome mask bitmap filled with 1s (transparent)
        cx = cy = 1
        planes = 1
        bpp = 1
        # one byte with all bits set -> transparent
        bits = (ctypes.c_ubyte * 1)(0xFF)
        hbmMask = gdi32.CreateBitmap(cx, cy, planes, bpp, ctypes.byref(bits))
        if not hbmMask:
            return False

        class ICONINFO(ctypes.Structure):
            _fields_ = [
                ("fIcon", ctypes.c_bool),
                ("xHotspot", ctypes.c_ulong),
                ("yHotspot", ctypes.c_ulong),
                ("hbmMask", ctypes.c_void_p),
                ("hbmColor", ctypes.c_void_p),
            ]

        iconinfo = ICONINFO()
        iconinfo.fIcon = True
        iconinfo.xHotspot = 0
        iconinfo.yHotspot = 0
        iconinfo.hbmMask = hbmMask
        iconinfo.hbmColor = 0

        hIcon = ctypes.windll.user32.CreateIconIndirect(ctypes.byref(iconinfo))
        # release mask bitmap
        gdi32.DeleteObject(hbmMask)

        if not hIcon:
            return False

        WM_SETICON = 0x0080
        ICON_SMALL = 0
        ICON_BIG = 1
        ICON_SMALL2 = 2

        user32.SendMessageW(hwnd, WM_SETICON, ICON_SMALL, hIcon)
        user32.SendMessageW(hwnd, WM_SETICON, ICON_BIG, hIcon)
        user32.SendMessageW(hwnd, WM_SETICON, ICON_SMALL2, hIcon)
        return True
    except Exception:
        return False

def ensure_blank_icon_file() -> Optional[str]:
    """Create a transparent .ico file and return its path. Returns None on failure."""
    try:
        icons_dir = os.path.join(CONFIG_DIR, "_runtime")
        os.makedirs(icons_dir, exist_ok=True)
        icon_path = os.path.join(icons_dir, "blank.ico")
        if os.path.exists(icon_path):
            return icon_path
        if Image is None:
            return None
        img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
        img.save(icon_path, format='ICO')
        return icon_path
    except Exception:
        return None

def set_titlebar_icon_from_file(window_title: str, ico_path: str) -> bool:
    """Load an .ico file from disk and assign it to the window (small/big)."""
    try:
        user32 = ctypes.windll.user32
        hwnd = user32.FindWindowW(None, window_title)
        if not hwnd:
            return False

        # Load icon from file
        LR_DEFAULTSIZE = 0x0040
        LR_LOADFROMFILE = 0x0010
        hIcon = ctypes.windll.user32.LoadImageW(0, ico_path, 1, 0, 0, LR_LOADFROMFILE | LR_DEFAULTSIZE)
        if not hIcon:
            return False

        WM_SETICON = 0x0080
        ICON_SMALL = 0
        ICON_BIG = 1
        ICON_SMALL2 = 2

        user32.SendMessageW(hwnd, WM_SETICON, ICON_SMALL, hIcon)
        user32.SendMessageW(hwnd, WM_SETICON, ICON_BIG, hIcon)
        user32.SendMessageW(hwnd, WM_SETICON, ICON_SMALL2, hIcon)
        return True
    except Exception:
        return False

def strip_system_menu_and_caption(window_title: str) -> bool:
    """Remove system menu and caption, eliminating icon area entirely (frameless title)."""
    try:
        user32 = ctypes.windll.user32
        hwnd = user32.FindWindowW(None, window_title)
        if not hwnd:
            return False
        GWL_STYLE = -16
        WS_SYSMENU = 0x00080000
        WS_CAPTION = 0x00C00000
        SWP_NOSIZE = 0x0001
        SWP_NOMOVE = 0x0002
        SWP_NOZORDER = 0x0004
        SWP_FRAMECHANGED = 0x0020
        try:
            GetWindowLongPtrW = ctypes.windll.user32.GetWindowLongPtrW
            SetWindowLongPtrW = ctypes.windll.user32.SetWindowLongPtrW
            GetWindowLongPtrW.restype = ctypes.c_longlong
            style = GetWindowLongPtrW(hwnd, GWL_STYLE)
            style &= ~(WS_SYSMENU | WS_CAPTION)
            SetWindowLongPtrW(hwnd, GWL_STYLE, style)
        except Exception:
            style = ctypes.windll.user32.GetWindowLongW(hwnd, GWL_STYLE)
            style &= ~(WS_SYSMENU | WS_CAPTION)
            ctypes.windll.user32.SetWindowLongW(hwnd, GWL_STYLE, style)
        ctypes.windll.user32.SetWindowPos(hwnd, 0, 0, 0, 0, 0,
                                          SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_FRAMECHANGED)
        return True
    except Exception:
        return False


# --- Simple Web Server ---
def start_server(directory, port):
    """Starts an HTTP server to serve the UI files."""
    # Ensure the server serves from the project root to access 'Agents' folder
    original_cwd = os.getcwd()
    os.chdir(os.path.join(get_base_path(), 'webview_ui'))
    
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"Local server started at http://localhost:{port}")
        print(f"Serving files from: {get_base_path()}")
        httpd.serve_forever()
    os.chdir(original_cwd) # Restore original working directory

# --- Main Application Function ---
def main():
    """Creates and manages the application window."""
    print("Creating API instance")
    api = Api()
    print("API instance created")
    print("API methods:", [method for method in dir(api) if not method.startswith('_')])
    print("check_pin_auth in API:", hasattr(api, 'check_pin_auth'))
    port = 8077  # A different port to avoid conflicts

    # Start the server in a separate thread
    server_thread = threading.Thread(target=start_server, args=('webview_ui', port))
    server_thread.daemon = True
    server_thread.start()

    # Create the webview window
    print("Creating webview window with API")
    print("API object:", api)
    print("API methods before window creation:", [method for method in dir(api) if not method.startswith('_')])
    window = webview.create_window(
        'Recoil Control v3 - Beta',
        f'http://localhost:{port}/index.html', # Serve index.html from webview_ui subfolder
        js_api=api,
        width=910,
        height=512,
        resizable=True
    )
    print("Webview window created")
    api.set_window(window) # Pass window object to API for JS communication

    def on_closed():
        api.signal_offline()
        api.stop_listeners()

    # Start pynput listeners after the window is created
    window.events.closed += on_closed
    window.events.loaded += api.start_listeners

    # On first load, push settings to the UI explicitly from Python (source of truth)
    def _push_settings_to_ui():
        try:
            payload = json.dumps(api.get_settings())
            js = f"""
            window.__initialSettings = {payload};
            if (typeof window.updateUIFromPython === 'function') {{
                try {{ window.updateUIFromPython(window.__initialSettings); }} catch (e) {{ console.error(e); }}
                delete window.__initialSettings;
            }} else {{
                window.addEventListener('pywebviewready', function() {{
                    try {{
                        if (window.__initialSettings && typeof window.updateUIFromPython === 'function') {{
                            window.updateUIFromPython(window.__initialSettings);
                            delete window.__initialSettings;
                        }}
                    }} catch (e) {{ console.error(e); }}
                }});
            }}
            """
            window.evaluate_js(js)
        except Exception as e:
            print(f"Failed to push settings to UI: {e}")
    window.events.loaded += _push_settings_to_ui
    
    # Apply dark title bar once the window is shown/loaded
    def _apply_titlebar_style():
        # Keep native caption, customize appearance and hide only the icon frame
        applied = set_titlebar_appearance('Recoil Control v3 - Beta', True, (15, 15, 16), (234, 234, 234), (58, 58, 58), 'mica', 'round')
        if not applied:
            print('Titlebar customization not applied (OS/version may not support).')
        # Set custom icon from webview_ui/icon.ico and re-apply shortly after to ensure it sticks
        def _apply_icon():
            icon_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'webview_ui', 'icon.ico')
            if not os.path.exists(icon_path):
                print(f"Icon not found at {icon_path}")
                return
            if not set_titlebar_icon_from_file('Recoil Control v3 - Beta', icon_path):
                print('Failed to set titlebar icon from file.')

        _apply_icon()
        try:
            threading.Timer(0.3, _apply_icon).start()
        except Exception:
            pass
    window.events.loaded += _apply_titlebar_style

    # Check for updates on startup if enabled
    if api.recoil_controller.settings.show_about_on_startup:
        def _check_for_updates_on_load():
            try:
                update_info = api.check_for_updates()
                if update_info.get("update_available"):
                    updater_path = os.path.join(get_base_path(), "update.exe")
                    if os.path.exists(updater_path):
                        current_exe = sys.executable
                        subprocess.Popen([updater_path, current_exe])
                        window.destroy()
                        sys.exit()
                    else:
                        print("update.exe not found. Providing download link.")
                        if api._window:
                            latest_version = update_info["latest_version"]
                            download_link = f"https://github.com/K1ngPT-X/R6-Recoil-Control/releases/download/v{latest_version}/R6-Recoil-Control.exe"
                            message = f"Update available, but update.exe is missing. Please download it from: {download_link}"
                            js_message = message.replace('"', '\"').replace("'", "\'" )
                            api._window.evaluate_js(f'showMessage("{js_message}", "info");')

                elif update_info.get("error"):
                    if api._window:
                        error_message = str(update_info.get("error")).replace('"', '"').replace("'", "'\'")
                        api._window.evaluate_js(f'showMessage("Error checking for updates: {error_message}", "error");')
            except Exception as e:
                print(f"An error occurred during the update check: {e}")

        window.events.loaded += _check_for_updates_on_load

    # Start the GUI event loop with Edge (Chromium) backend for frameless + drag support
    try:
        webview.start(gui='edgechromium', debug=False)
    except Exception as e:
        print(f"Could not start the application. Please ensure the WebView2 runtime is installed. Error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
