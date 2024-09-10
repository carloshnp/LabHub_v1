from typing import List, Dict, Any, Callable

class Equipment:
    def __init__(self):
        self.methods = {}

    def register_get_method(self, name: str, func: Callable[[], Any], description: str):
        self.methods[name] = {"method": "GET", "func": func, "description": description}

    def register_post_method(self, name: str, func: Callable[[Any], Any], description: str, params: List[str]):
        self.methods[name] = {"method": "POST", "func": func, "description": description, "params": params}

    def get_methods(self):
        return {name: {"method": info["method"], "description": info["description"], "params": info.get("params", [])} for name, info in self.methods.items()}

    def get_method_description(self, method_name):
        if method_name in self.methods:
            return self.methods[method_name]['description']
        return "execute method"  # Default description if not found
