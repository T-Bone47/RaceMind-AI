try:
    from pydantic_settings import NoDecode
    print(f"NoDecode available: {NoDecode}")
except ImportError:
    print("NoDecode not available in this version")
    
import pydantic_settings

print(f"pydantic-settings version: {pydantic_settings.VERSION}")
