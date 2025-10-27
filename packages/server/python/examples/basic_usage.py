#!/usr/bin/env python3
"""Basic usage example for OrgaAI Python SDK.

This example demonstrates how to use the Orga AI SDK to fetch session configuration
for WebRTC connections. Make sure to set your ORGA_API_KEY and ORGA_USER_EMAIL
environment variables before running this script.

Usage:
    python examples/basic_usage.py
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the src directory to the Python path so we can import orga_ai
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from orga_ai import OrgaAI, OrgaAIConfig


async def main():
    """Main function demonstrating basic SDK usage."""
    
    # Check for required environment variables
    api_key = os.getenv("ORGA_API_KEY")
    user_email = os.getenv("ORGA_USER_EMAIL")
    
    if not api_key:
        print("Error: ORGA_API_KEY environment variable is required")
        print("Set it with: export ORGA_API_KEY=your_api_key_here")
        return
    
    if not user_email:
        print("Error: ORGA_USER_EMAIL environment variable is required")
        print("Set it with: export ORGA_USER_EMAIL=your_email@example.com")
        return
    
    # Initialize the client
    print("Initializing OrgaAI client...")
    config = OrgaAIConfig(
        api_key=api_key,
        user_email=user_email,
        debug=True  # Enable debug logging for this example
    )
    
    try:
        async with OrgaAI(config) as client:
            print("Fetching session configuration...")
            session_config = await client.get_session_config()
            
            print("\n✅ Session configuration retrieved successfully!")
            print(f"Ephemeral Token: {session_config.ephemeral_token}")
            print(f"ICE Servers ({len(session_config.ice_servers)}):")
            
            for i, server in enumerate(session_config.ice_servers, 1):
                print(f"  {i}. URLs: {server.urls}")
                if server.username:
                    print(f"     Username: {server.username}")
                if server.credential:
                    print(f"     Credential: {server.credential}")
            
            print("\n🎉 You can now use this configuration in your WebRTC application!")
            
    except Exception as error:
        print(f"\n❌ Error: {error}")
        print("Please check your API key and user email, and ensure you have internet connectivity.")


if __name__ == "__main__":
    asyncio.run(main())
