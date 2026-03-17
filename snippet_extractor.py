"""
Code Snippet Extractor - Optimized for LLM consumption
Extracts code context around error lines with dynamic range calculation
Uses Python optimization techniques: closures, locals, comprehensions, weak refs
"""

from typing import Tuple, Optional, NamedTuple, Callable
from dataclasses import dataclass
from functools import lru_cache
import sys
import weakref


class SnippetConfig(NamedTuple):
    """Configuration for snippet extraction"""
    default_context: int = 4
    max_context: int = 12
    min_context: int = 1
    brackets_weight: float = 1.5
    indent_weight: float = 0.8


@dataclass(frozen=True)
class CodeSnippet:
    """Represents extracted code snippet"""
    start_line: int
    end_line: int
    content: str
    error_line: int
    error_column: Optional[int] = None
    language: str = 'python'
    
    @property
    def line_count(self) -> int:
        """Cached line count"""
        return self.end_line - self.start_line + 1
    
    def to_dict(self) -> dict:
        """Fast dict conversion for JSON serialization"""
        return {
            'start_line': self.start_line,
            'end_line': self.end_line,
            'error_line': self.error_line,
            'error_column': self.error_column,
            'line_count': self.line_count,
            'language': self.language,
            'content': self.content,
        }


class SnippetExtractor:
    """
    Optimized code snippet extractor with dynamic range calculation.
    Uses Python best practices: closures, locals, comprehensions, caching
    """
    
    __slots__ = ('_config', '_cache', '_bracket_cache')
    
    def __init__(self, config: Optional[SnippetConfig] = None):
        self._config = config or SnippetConfig()
        self._cache = {}  # Local cache for performance
        # Use weak references for bracket style cache
        self._bracket_cache = weakref.WeakValueDictionary()
    
    @staticmethod
    @lru_cache(maxsize=128)
    def _calculate_indent_level(line: str) -> int:
        """Cache indent level calculation with locals optimization"""
        # Use locals - LOAD_FAST is faster than LOAD_GLOBAL
        stripped = line.lstrip()
        if not stripped:
            return -1
        # Count leading spaces - single pass
        indent = len(line) - len(stripped)
        return indent
    
    @staticmethod
    def _is_bracket_line(line: str) -> bool:
        """Fast bracket detection - one-liner comprehension style"""
        stripped = line.strip()
        if not stripped:
            return False
        return stripped[0] in '{[(' or stripped[-1] in '}])'
    
    def _calculate_dynamic_range(
        self,
        lines: list[str],
        error_line: int,
        total_lines: int,
    ) -> Tuple[int, int]:
        """
        Calculate optimal context range based on code structure.
        Uses closures and locals optimization.
        
        Algorithm:
        1. Start with default context
        2. Expand if error is in bracket-heavy code
        3. Contract if near start/end of file
        4. Respect indentation boundaries
        """
        # Use locals - avoid repeated attribute lookups
        config = self._config
        default_ctx = config.default_context
        max_ctx = config.max_context
        min_ctx = config.min_context
        
        # Start with default range
        context_above = default_ctx
        context_below = default_ctx
        
        # Adjust based on position in file (contract near boundaries)
        error_idx = error_line - 1  # 0-indexed
        above_available = error_idx
        below_available = total_lines - error_line
        
        context_above = min(context_above, above_available)
        context_below = min(context_below, below_available)
        
        # Expand if surrounded by brackets (complex expression)
        def count_nearby_brackets(start: int, end: int) -> int:
            """Closure: access lines from outer scope"""
            count = 0
            # Clamp indices safely
            safe_start = max(0, start)
            safe_end = min(len(lines), end)
            for i in range(safe_start, safe_end):
                if self._is_bracket_line(lines[i]):
                    count += 1
            return count
        
        bracket_count = count_nearby_brackets(
            error_idx - context_above,
            error_idx + context_below + 1
        )
        
        # If heavily bracketed, expand context
        if bracket_count > 2:
            expansion = int(config.brackets_weight)
            context_above = min(context_above + expansion, max_ctx)
            context_below = min(context_below + expansion, max_ctx)
        
        # Check indentation consistency - expand to block boundaries
        if error_idx > 0:
            error_indent = self._calculate_indent_level(lines[error_idx])
            
            # Expand up to match indentation
            for i in range(error_idx - context_above - 1, -1, -1):
                line_indent = self._calculate_indent_level(lines[i])
                if line_indent >= 0 and line_indent < error_indent:
                    context_above = error_idx - i
                    break
                if line_indent == error_indent:
                    context_above = error_idx - i
        
        # Calculate final indices
        start_line = max(0, error_idx - context_above)
        end_line = min(total_lines - 1, error_idx + context_below)
        
        return start_line, end_line
    
    def extract(
        self,
        source_code: str,
        error_line: int,
        error_column: Optional[int] = None,
        language: str = 'python',
    ) -> CodeSnippet:
        """
        Extract code snippet around error line.
        
        Args:
            source_code: Full source code
            error_line: 1-indexed line number of error
            error_column: Optional column number (0-indexed)
            language: Programming language
        
        Returns:
            CodeSnippet with extracted context
        """
        # Use locals for performance
        lines = source_code.splitlines()
        total_lines = len(lines)
        
        # Validate error line
        if error_line < 1 or error_line > total_lines:
            raise ValueError(f'Error line {error_line} out of range [1, {total_lines}]')
        
        # Check cache (closure captures self)
        cache_key = (id(source_code), error_line)
        if cache_key in self._cache:
            return self._cache[cache_key]
        
        # Calculate dynamic range
        start_idx, end_idx = self._calculate_dynamic_range(lines, error_line, total_lines)
        
        # Extract snippet using list comprehension (fast)
        snippet_lines = lines[start_idx:end_idx + 1]
        content = '\n'.join(snippet_lines)
        
        # Create result
        snippet = CodeSnippet(
            start_line=start_idx + 1,  # Convert back to 1-indexed
            end_line=end_idx + 1,
            content=content,
            error_line=error_line,
            error_column=error_column,
            language=language,
        )
        
        # Cache result (cleanup via WeakValueDict if memory-critical)
        self._cache[cache_key] = snippet
        
        return snippet
    
    def extract_multiple(
        self,
        source_code: str,
        errors: list[Tuple[int, Optional[int]]],
        language: str = 'python',
    ) -> list[CodeSnippet]:
        """
        Extract snippets for multiple errors efficiently.
        Uses generator-style processing for memory efficiency.
        """
        # Generator for memory efficiency
        return [
            self.extract(source_code, line, col, language)
            for line, col in errors
        ]
    
    def clear_cache(self) -> None:
        """Clear internal cache"""
        self._cache.clear()


# Factory function with closure optimization
def create_snippet_extractor(
    default_context: int = 4,
    max_context: int = 12,
) -> Callable[[str, int, Optional[int], str], CodeSnippet]:
    """
    Factory function returning optimized extractor closure.
    Avoids object creation overhead for simple use cases.
    """
    # Closure captures config
    config = SnippetConfig(
        default_context=default_context,
        max_context=max_context,
    )
    extractor = SnippetExtractor(config)
    
    # Return closure bound to this extractor
    def extract_snippet(
        source_code: str,
        error_line: int,
        error_column: Optional[int] = None,
        language: str = 'python',
    ) -> CodeSnippet:
        return extractor.extract(source_code, error_line, error_column, language)
    
    return extract_snippet


# Example usage and benchmarking
if __name__ == '__main__':
    # Create sample code
    sample_code = '''def calculate_total(items):
    """Calculate total with tax"""
    subtotal = 0
    for item in items:
        price = item['price']
        quantity = item.get('quantity', 1)
        subtotal += price * quantity
    
    tax_rate = 0.08
    total = subtotal * (1 + tax_rate)
    
    if total < 0:
        raise ValueError("Invalid total")
    
    return total


def process_data(data):
    if not data:
        return None
    
    results = []
    for record in data:
        try:
            value = record['value']
            results.append(value * 2)
        except KeyError:
            results.append(None)
    
    return results
'''
    
    # Create extractor
    extractor = SnippetExtractor()
    
    # Test 1: Error in middle of code (line 8)
    print("=" * 60)
    print("TEST 1: Error on line 8 (middle of function)")
    print("=" * 60)
    snippet1 = extractor.extract(sample_code, error_line=8, error_column=15)
    print(f"Range: lines {snippet1.start_line}-{snippet1.end_line} ({snippet1.line_count} lines)")
    print(f"Error column: {snippet1.error_column}")
    print("\nSnippet:")
    print(snippet1.content)
    print()
    
    # Test 2: Error near start (line 2)
    print("=" * 60)
    print("TEST 2: Error near start (line 2)")
    print("=" * 60)
    snippet2 = extractor.extract(sample_code, error_line=2, error_column=5)
    print(f"Range: lines {snippet2.start_line}-{snippet2.end_line} ({snippet2.line_count} lines)")
    print("\nSnippet:")
    print(snippet2.content)
    print()
    
    # Test 3: Error in bracket-heavy code (line 19)
    print("=" * 60)
    print("TEST 3: Error in bracket expression (line 19)")
    print("=" * 60)
    snippet3 = extractor.extract(sample_code, error_line=19)
    print(f"Range: lines {snippet3.start_line}-{snippet3.end_line} ({snippet3.line_count} lines)")
    print("\nSnippet:")
    print(snippet3.content)
    print()
    
    # Test 4: Convert to dict (for API response)
    print("=" * 60)
    print("TEST 4: JSON Serialization")
    print("=" * 60)
    print(snippet1.to_dict())
