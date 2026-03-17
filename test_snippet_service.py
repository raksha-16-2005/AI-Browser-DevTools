#!/usr/bin/env python3
"""Test the snippet service"""

import json
from snippet_service import SnippetService

# Create service
service = SnippetService()

# Test case: Error in validation function
request = {
    "source_code": """def validate_email(email):
    if not email:
        return False
    if '@' not in email:
        raise ValueError('Invalid email')
    parts = email.split('@')
    if len(parts) != 2:
        return False
    return True""",
    "error_line": 5,
    "error_column": 8,
    "language": "python"
}

print("=" * 70)
print("TEST: Code Snippet Extraction Service")
print("=" * 70)
print("\n📥 REQUEST:")
print(json.dumps({
    k: v if k != 'source_code' else f"{v[:50]}..."
    for k, v in request.items()
}, indent=2))

response = service.handle_request(request)

print("\n✅ RESPONSE:")
print(json.dumps(response, indent=2, default=str))

if response['success']:
    data = response['data']
    print("\n" + "=" * 70)
    print("🎯 EXTRACTED CODE SNIPPET")
    print("=" * 70)
    print(f"Location: Line {data['error_line']}, Column {data['error_column']}")
    print(f"Range: Lines {data['start_line']}-{data['end_line']} ({data['line_count']} total lines)")
    print(f"Language: {data['language']}")
    print("\n📋 CODE:\n")
    
    # Format with line numbers
    lines = data['content'].split('\n')
    start = data['start_line']
    for i, line in enumerate(lines, start=start):
        marker = ">>> " if i == data['error_line'] else "    "
        print(f"{marker}{i:3d} | {line}")
else:
    print("\n❌ ERROR:", response.get('error'))
