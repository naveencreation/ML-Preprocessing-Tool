"""
LLM Advisor
===========

Optional Gemini integration for enhanced dataset guidance.

UPDATED FOR NEW GOOGLE GENAI SDK (December 2024):
- Package: google-genai (not google-generativeai)
- Model: gemini-2.5-flash
- API: client.models.generate_content()

DESIGN PRINCIPLES:
------------------
1. OPTIONAL: System works fully without LLM
2. ADVISORY: LLM suggestions complement rule-based logic
3. SAFE: API key from environment, graceful degradation
4. EDUCATIONAL: Explains reasoning, not just answers
"""

import os
from pathlib import Path
from dataclasses import dataclass
from typing import List, Dict, Optional, Any
from enum import Enum

# Explicitly load .env file - find backend directory
_current_file = Path(__file__).resolve()
_backend_dir = _current_file.parent.parent.parent.parent  # services/intelligence -> services -> app -> backend
_env_path = _backend_dir / ".env"

# Load dotenv
from dotenv import load_dotenv
if _env_path.exists():
    load_dotenv(_env_path, override=True)  # override=True ensures env vars are updated


class LLMProvider(str, Enum):
    """Supported LLM providers."""
    GEMINI = "gemini"
    DISABLED = "disabled"


@dataclass
class LLMSuggestion:
    """A suggestion from the LLM."""
    content: str
    confidence: Optional[float] = None
    reasoning: Optional[str] = None


@dataclass
class LLMResponse:
    """Response from LLM advisor."""
    success: bool
    suggestion: Optional[LLMSuggestion] = None
    error: Optional[str] = None
    provider: str = "disabled"


class LLMAdvisor:
    """
    Optional LLM integration for enhanced dataset guidance.
    
    USES NEW GOOGLE GENAI SDK (December 2024):
    - Install: pip install google-genai
    - Model: gemini-2.5-flash
    - Reads GEMINI_API_KEY from environment
    
    HOW TO USE:
    -----------
    advisor = LLMAdvisor()
    
    if advisor.is_available():
        response = advisor.suggest_targets(schema_report, sample_rows)
        print(response.suggestion.content)
    else:
        print("LLM not available - using rule-based logic only")
    """
    
    # Updated model name
    MODEL_NAME = "gemini-2.5-flash"
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the LLM Advisor.
        
        Args:
            api_key: Gemini API key (or read from GEMINI_API_KEY env var)
        """
        # Dynamically load .env each time to ensure fresh values
        from dotenv import load_dotenv
        backend_dir = Path(__file__).resolve().parent.parent.parent.parent
        env_file = backend_dir / ".env"
        
        print(f"[LLMAdvisor DEBUG] Backend dir: {backend_dir}")
        print(f"[LLMAdvisor DEBUG] Env file exists: {env_file.exists()}")
        
        if env_file.exists():
            load_dotenv(env_file, override=True)
        
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        print(f"[LLMAdvisor DEBUG] API key loaded: {self.api_key[:20] + '...' if self.api_key else 'NONE'}")
        
        self.provider = LLMProvider.GEMINI if self.api_key else LLMProvider.DISABLED
        self._client = None
        self._use_old_sdk = False
        
        if self.api_key:
            self._initialize_client()
        
        print(f"[LLMAdvisor DEBUG] Final provider: {self.provider}, client: {self._client is not None}")
    
    def _initialize_client(self) -> None:
        """Initialize the Gemini client using new google-genai SDK."""
        try:
            print("[LLMAdvisor DEBUG] Attempting to import google.genai...")
            from google import genai
            print("[LLMAdvisor DEBUG] Import successful, creating client with api_key...")
            
            # IMPORTANT: Must pass api_key explicitly to Client()
            self._client = genai.Client(api_key=self.api_key)
            self.provider = LLMProvider.GEMINI
            print("[LLMAdvisor DEBUG] Client created successfully!")
            
        except ImportError as e:
            print(f"[LLMAdvisor DEBUG] ImportError: {e}")
            # Fallback: Try old SDK if new one not installed
            try:
                import google.generativeai as genai_old
                genai_old.configure(api_key=self.api_key)
                self._client = genai_old.GenerativeModel('gemini-1.5-flash')
                self._use_old_sdk = True
                self.provider = LLMProvider.GEMINI
            except ImportError:
                self.provider = LLMProvider.DISABLED
                self._use_old_sdk = False
        except Exception as e:
            print(f"[LLMAdvisor DEBUG] Exception in _initialize_client: {type(e).__name__}: {e}")
            self.provider = LLMProvider.DISABLED
    
    def is_available(self) -> bool:
        """Check if LLM is available."""
        return self.provider != LLMProvider.DISABLED and self._client is not None
    
    def suggest_targets(
        self, 
        column_info: List[Dict[str, Any]], 
        sample_rows: Optional[List[Dict]] = None,
        project_description: Optional[str] = None
    ) -> LLMResponse:
        """
        Ask LLM to suggest target columns.
        
        Args:
            column_info: List of column profiles (name, type, stats)
            sample_rows: Optional sample data (first few rows)
            project_description: Optional context about the project
            
        Returns:
            LLMResponse with suggestions
        """
        if not self.is_available():
            return LLMResponse(
                success=False,
                error="LLM not available. Install google-genai: pip install google-genai",
                provider=self.provider.value
            )
        
        prompt = self._build_target_prompt(column_info, sample_rows, project_description)
        return self._query_llm(prompt)
    
    def explain_problem_type(self, problem_info: Dict[str, Any]) -> LLMResponse:
        """
        Ask LLM to explain the detected problem type.
        """
        if not self.is_available():
            return self._fallback_explanation(problem_info)
        
        prompt = f"""
        Explain this machine learning problem type for a data scientist learning ML:
        
        Problem Type: {problem_info.get('problem_type', 'unknown')}
        Target Column: {problem_info.get('target_column', 'unknown')}
        Number of Classes: {problem_info.get('num_classes', 'N/A')}
        
        Provide:
        1. A clear definition of this problem type
        2. Real-world examples where this is used
        3. Common algorithms for this problem
        4. Key metrics to evaluate performance
        
        Keep it educational but concise (3-4 paragraphs).
        """
        
        return self._query_llm(prompt)
    
    def generate_insights(self, analysis_context: Dict[str, Any]) -> LLMResponse:
        """
        Generate human-readable insights from analysis.
        """
        if not self.is_available():
            return LLMResponse(
                success=False,
                error="LLM not available",
                provider=self.provider.value
            )
        
        prompt = f"""
        Analyze this dataset summary and provide key insights:
        
        Rows: {analysis_context.get('row_count', 'unknown')}
        Columns: {analysis_context.get('column_count', 'unknown')}
        Target: {analysis_context.get('target_column', 'not specified')}
        
        Top Correlations with Target:
        {analysis_context.get('top_correlations', 'Not computed')}
        
        Quality Issues:
        {analysis_context.get('quality_issues', 'None detected')}
        
        Provide:
        1. 3-5 key observations about this dataset
        2. Potential challenges for modeling
        3. Recommended next steps
        
        Be specific and actionable.
        """
        
        return self._query_llm(prompt)
    
    def answer_question(self, question: str, context: Dict[str, Any]) -> LLMResponse:
        """
        Answer a user question about the dataset.
        """
        if not self.is_available():
            return LLMResponse(
                success=False,
                error="LLM not available. Install: pip install google-genai",
                provider=self.provider.value
            )
        
        prompt = f"""
        A data scientist is analyzing a dataset and asks:
        
        "{question}"
        
        Dataset Context:
        - Rows: {context.get('row_count', 'unknown')}
        - Columns: {context.get('columns', 'unknown')}
        - Target: {context.get('target', 'not specified')}
        - Problem Type: {context.get('problem_type', 'unknown')}
        
        Provide a helpful, educational answer. If the question can't be answered
        with the given context, explain what additional information would be needed.
        """
        
        return self._query_llm(prompt)
    
    def _query_llm(self, prompt: str) -> LLMResponse:
        """Send a query to the LLM using new google-genai SDK."""
        try:
            # Check if using new or old SDK
            if hasattr(self, '_use_old_sdk') and self._use_old_sdk:
                # Old SDK (google-generativeai)
                response = self._client.generate_content(prompt)
                text = response.text
            else:
                # New SDK (google-genai)
                response = self._client.models.generate_content(
                    model=self.MODEL_NAME,
                    contents=prompt
                )
                text = response.text
            
            return LLMResponse(
                success=True,
                suggestion=LLMSuggestion(
                    content=text,
                    reasoning=f"Generated by {self.MODEL_NAME}"
                ),
                provider=self.provider.value
            )
        except Exception as e:
            return LLMResponse(
                success=False,
                error=str(e),
                provider=self.provider.value
            )
    
    def _build_target_prompt(
        self, 
        column_info: List[Dict], 
        sample_rows: Optional[List[Dict]],
        project_description: Optional[str]
    ) -> str:
        """Build prompt for target column suggestion."""
        columns_summary = "\n".join([
            f"- {c.get('name')}: {c.get('dtype')} (unique: {c.get('unique_count', '?')}, missing: {c.get('missing_ratio', 0)*100:.1f}%)"
            for c in column_info[:20]
        ])
        
        prompt = f"""
        Analyze this dataset schema and suggest the most likely target column for ML:
        
        Columns:
        {columns_summary}
        
        {"Project Context: " + project_description if project_description else ""}
        
        For each potential target:
        1. Name the column
        2. Explain WHY it's likely a target
        3. What type of ML problem it would be (classification/regression)
        4. Any concerns or alternatives
        
        If there's no clear target, suggest unsupervised learning approaches.
        """
        
        return prompt
    
    def _fallback_explanation(self, problem_info: Dict) -> LLMResponse:
        """Provide a basic explanation when LLM is not available."""
        problem_type = problem_info.get('problem_type', 'unknown')
        
        explanations = {
            'binary_classification': (
                "Binary classification predicts one of two possible outcomes "
                "(e.g., spam/not spam, fraud/legitimate). Use metrics like "
                "accuracy, precision, recall, and ROC-AUC."
            ),
            'multiclass_classification': (
                "Multiclass classification predicts one of multiple categories "
                "(e.g., image labels, document types). Use weighted or macro F1-score."
            ),
            'regression': (
                "Regression predicts a continuous numeric value "
                "(e.g., price, temperature). Use metrics like RMSE, MAE, and R²."
            ),
        }
        
        content = explanations.get(problem_type, f"Problem type: {problem_type}")
        
        return LLMResponse(
            success=True,
            suggestion=LLMSuggestion(
                content=content,
                reasoning="Rule-based explanation (LLM not available)"
            ),
            provider="fallback"
        )
