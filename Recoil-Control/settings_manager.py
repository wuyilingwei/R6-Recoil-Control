import os
import json
import shutil

APPDATA_DIR = os.getenv("APPDATA") or os.path.join(os.path.expanduser("~"), "AppData", "Roaming")
CONFIG_DIR = os.path.join(APPDATA_DIR, "Recoil Control")

os.makedirs(CONFIG_DIR, exist_ok=True)

class SettingsManager:
    _keys_to_remove = set()

    def __init__(self, config_dir: str = CONFIG_DIR) -> None:
        self.config_dir = config_dir

        self.DEFAULT_SETTINGS = {
            "language": "en",
            "discord_user_id": None,
            "app_id": None,
            "discord_username": None,
            "identificador": None,
            "primary_weapon_hotkey": [],
            "primary_weapon_hotkey_2": [],
            "secondary_weapon_hotkey": [],
            "secondary_weapon_hotkey_2": [],
            "primary_recoil_y": 0,
            "primary_recoil_x": 0,
            "secondary_recoil_y": 0,
            "secondary_recoil_x": 0,
            "show_about_on_startup": True,
            "toggle_hotkey": [],
            "t_bag_hotkey": [],
            "t_bag_enabled": False,
            "t_bag_delay": 0.05,
            "t_bag_key": [],
            "active_weapon": "primary",
            "zoom_hack_enabled": False,
            "zoom_level": 1.0,
            "crosshair_enabled": False,
            "dpi": 800,
            "sens": 12.0,
            "overlay_toggle_hotkey": [],
            "overlay_step_hotkey": [],
            "rating_feedback_given": False,

        }

        try:
            self.ensure_settings_file_exists()
        except Exception:
            pass
        self.allowed_keys = set(self.DEFAULT_SETTINGS.keys())

    @property
    def settings_path(self) -> str:
        return os.path.join(self.config_dir, "settings.cfg")

    def ensure_settings_file_exists(self) -> None:
        path = self.settings_path
        if not os.path.exists(path):
            try:
                with open(path, 'w') as f:
                    json.dump(self.DEFAULT_SETTINGS, f, indent=4)
            except Exception:
                pass

    def load_settings(self, settings_obj) -> dict:
        path = self.settings_path
        if not os.path.exists(path):
            return {}
        try:
            with open(path, 'r') as f:
                loaded = json.load(f)
        except Exception:
            return {}

        try:
            filtered = {k: v for k, v in loaded.items() if k in getattr(self, 'allowed_keys', set())}
            resolved = self.resolve_incoming_keys(filtered, settings_obj)
            if hasattr(settings_obj, 'from_dict') and callable(getattr(settings_obj, 'from_dict')):
                settings_obj = settings_obj.from_dict(resolved)
            else:
                for k, v in resolved.items():
                    if hasattr(settings_obj, k):
                        setattr(settings_obj, k, v)
        except Exception:
            pass

        return {k: v for k, v in loaded.items() if k in getattr(self, 'allowed_keys', set())}

    def save_settings(self, settings_obj) -> bool:
        path = self.settings_path
        try:
            if hasattr(settings_obj, 'to_dict') and callable(getattr(settings_obj, 'to_dict')):
                data = settings_obj.to_dict()
            else:
                data = dict(getattr(settings_obj, '__dict__', {}))

            to_save = {}
            for key in getattr(self, 'allowed_keys', set()):
                if key in data and data.get(key) is not None and data.get(key) != '':
                    to_save[key] = data.get(key)
                else:
                    if hasattr(settings_obj, key):
                        to_save[key] = getattr(settings_obj, key)
                    else:
                        to_save[key] = self.DEFAULT_SETTINGS.get(key)

            with open(path, 'w') as f:
                json.dump(to_save, f, indent=4)
            return True
        except Exception:
            return False

    def save_data(self, data: dict) -> bool:
        try:
            cleaned = dict(data or {})

            to_save = {}
            for key in getattr(self, 'allowed_keys', set()):
                if key in cleaned and cleaned.get(key) is not None and cleaned.get(key) != '':
                    to_save[key] = cleaned.get(key)
                else:
                    to_save[key] = self.DEFAULT_SETTINGS.get(key)

            with open(self.settings_path, 'w') as f:
                json.dump(to_save, f, indent=4)
            return True
        except Exception:
            return False

    def read_settings_file(self) -> dict:
        path = self.settings_path
        if not os.path.exists(path):
            try:
                self.ensure_settings_file_exists()
            except Exception:
                pass
            return dict(self.DEFAULT_SETTINGS)

        try:
            with open(path, 'r') as f:
                raw = json.load(f)
        except Exception:
            return dict(self.DEFAULT_SETTINGS)

        out = {}
        for k in self.DEFAULT_SETTINGS.keys():
            if k in raw and raw.get(k) is not None:
                out[k] = raw.get(k)
            else:
                out[k] = self.DEFAULT_SETTINGS.get(k)
        return out

    def update_settings(self, updates: dict) -> dict:
        if not isinstance(updates, dict):
            raise TypeError('updates must be a dict')

        current = self.read_settings_file()
        for k, v in updates.items():
            if k in self.allowed_keys:
                current[k] = v

        try:
            with open(self.settings_path, 'w') as f:
                json.dump(current, f, indent=4)
        except Exception:

            try:
                self.save_data(current)
            except Exception:
                pass
        return current

    def to_ui_dict(self, settings_obj) -> dict:

        ui = {}
        for key in self.DEFAULT_SETTINGS.keys():
            if hasattr(settings_obj, 'to_dict') and callable(getattr(settings_obj, 'to_dict')):
                obj_dict = settings_obj.to_dict()
            else:
                obj_dict = dict(getattr(settings_obj, '__dict__', {}))

            if key in obj_dict and obj_dict.get(key) is not None:
                ui[key] = obj_dict.get(key)
            elif hasattr(settings_obj, key):
                ui[key] = getattr(settings_obj, key)
            else:
                ui[key] = self.DEFAULT_SETTINGS.get(key)

        try:
            ui['setting_dpi'] = ui.get('dpi', self.DEFAULT_SETTINGS.get('dpi'))
        except Exception:
            ui['setting_dpi'] = self.DEFAULT_SETTINGS.get('dpi')
        try:
            ui['setting_sens'] = ui.get('sens', self.DEFAULT_SETTINGS.get('sens'))
        except Exception:
            ui['setting_sens'] = self.DEFAULT_SETTINGS.get('sens')

        return ui