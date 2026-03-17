"""
Python Service for AI DevTools Extension
=========================================

This serves as a helper service that extracts code snippets
and can be called from the extension via subprocess or HTTP.

Can be run locally or as part of a backend service.
"""

import json
import sys
from typing import Optional
from snippet_extractor import SnippetExtractor, CodeSnippet


class SnippetService:
    """Snippet extraction service with JSON I/O"""
    
    def __init__(self):
        self.extractor = SnippetExtractor()
    
    def handle_request(self, request: dict) -> dict:
        """
        Handle extraction request
        
        Request format:
        {
            "source_code": "...",
            "error_line": 10,
            "error_column": 5,
            "language": "python"
        }
        
        Response format:
        {
            "success": true,
            "data": {
                "start_line": 5,
                "end_line": 15,
                "content": "...",
                "error_line": 10,
                "error_column": 5,
                "language": "python",
                "line_count": 11
            }
        }
        """
        try:
            source_code = request.get('source_code')
            error_line = request.get('error_line')
            error_column = request.get('error_column')
            language = request.get('language', 'python')
            
            if not source_code or not error_line:
                return {
                    'success': False,
                    'error': 'Missing required fields: source_code, error_line'
                }
            
            snippet = self.extractor.extract(
                source_code=source_code,
                error_line=error_line,
                error_column=error_column,
                language=language,
            )
            
            return {
                'success': True,
                'data': snippet.to_dict(),
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
            }


# CLI Interface
def main():
    """CLI interface for testing"""
    service = SnippetService()
    
    # Read JSON from stdin
    request = json.loads(sys.stdin.read())
    response = service.handle_request(request)
    
    # Output JSON to stdout
    print(json.dumps(response, indent=2))


if __name__ == '__main__':
    main()
