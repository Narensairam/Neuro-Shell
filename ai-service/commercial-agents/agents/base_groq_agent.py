# agents/base_groq_agent.py
import os
import json
from typing import Dict, Any
from datetime import datetime

DEFAULT_GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

try:
    from langchain_groq import ChatGroq
    LANGCHAIN_GROQ_AVAILABLE = True
except ImportError:
    LANGCHAIN_GROQ_AVAILABLE = False
    print("WARNING: langchain_groq not installed. Install with: pip install langchain_groq")

try:
    from tools.tools_manager import ToolsManager
    TOOLS_AVAILABLE = True
except ImportError:
    TOOLS_AVAILABLE = False
    print("WARNING: Tools not available. Install required dependencies.")


class BaseGroqAgent:
    """Base class for all AI agents using Groq via langchain_groq"""

    def __init__(self, agent_name: str, model: str = "qwen/qwen3-32b"):
        self.agent_name = agent_name
        self.model = model
        self.chat = None
        self.groq_available = False
        self.tools_manager = None
        self.tools_enabled = False

        if LANGCHAIN_GROQ_AVAILABLE:
            api_key = DEFAULT_GROQ_API_KEY

            if api_key:
                try:
                    self.chat = ChatGroq(
                        model=self.model,
                        api_key=api_key,
                        temperature=0,
                        max_tokens=1024,
                        reasoning_format="parsed",
                        timeout=60,
                        max_retries=2,
                    )
                    self.groq_available = True
                except Exception as e:
                    print(f"WARNING: Could not initialize ChatGroq for {agent_name}: {e}")
            else:
                print(f"WARNING: GROQ_API_KEY missing. {agent_name} will use mock responses.")
        else:
            print(f"WARNING: langchain_groq not installed. {agent_name} will use mock responses.")
        
        # Initialize tools
        if TOOLS_AVAILABLE:
            try:
                self.tools_manager = ToolsManager()
                self.tools_enabled = True
            except Exception as e:
                print(f"WARNING: Could not initialize ToolsManager for {agent_name}: {e}")
    
    def _call_groq(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        """Call Groq via ChatGroq with system and user prompts."""
        if not self.groq_available or self.chat is None:
            return self._mock_response()

        try:
            messages = [
                ("system", system_prompt),
                ("human", user_prompt),
            ]
            ai_msg = self.chat.invoke(messages)
            content = getattr(ai_msg, "content", ai_msg)

            if isinstance(content, str):
                try:
                    return json.loads(content)
                except json.JSONDecodeError:
                    return {"raw_response": content}
            if isinstance(content, dict):
                return content

            return self._mock_response()
        except Exception as e:
            print(f"Error calling Groq: {e}")
            return self._mock_response()
    
    def _mock_response(self) -> Dict[str, Any]:
        """Return mock response when Groq is not available."""
        return {
            "status": "mock_response",
            "message": "Groq API not configured or failed. Set GROQ_API_KEY for real responses.",
            "recommendation": "Install langchain_groq and set GROQ_API_KEY for AI-powered responses."
        }
    
    def get_tools(self):
        """Get the tools manager instance"""
        return self.tools_manager
    
    def health_check(self) -> Dict[str, Any]:
        health = {
            "agent": self.agent_name,
            "model": self.model,
            "groq_available": self.groq_available,
            "tools_enabled": self.tools_enabled,
            "status": "operational" if self.groq_available else "limited_mock_mode",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if self.tools_enabled and self.tools_manager:
            health["tools_health"] = self.tools_manager.health_check()
        
        return health