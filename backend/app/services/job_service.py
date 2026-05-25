"""Job search service using JSearch API."""
import httpx
from typing import List, Dict, Optional
from datetime import datetime

from app.core.config import settings
from app.schemas import JobCard, FitScoreResponse


class JobSearchService:
    """Service for searching jobs via JSearch API."""

    BASE_URL = "https://google-search-api1.p.rapidapi.com"

    def __init__(self):
        """Initialize the job search service."""
        self._client = None

    @property
    def client(self) -> httpx.AsyncClient:
        """Get or create HTTP client."""
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=30.0)
        return self._client

    async def search_jobs(
        self,
        query: str,
        location: Optional[str] = None,
        job_type: Optional[str] = None,
        limit: int = 10
    ) -> List[JobCard]:
        """Search for jobs using natural language query."""
        # Build search query for JSearch
        search_query = self._build_search_query(query, location, job_type)
        
        headers = {
            "x-rapidapi-key": settings.jsearch_api_key,
            "x-rapidapi-host": settings.jsearch_host,
        }
        
        params = {
            "query": search_query,
            "gl": "us",  # Geography (can be customized)
            "hl": "en",
            "num": min(limit, 20),  # JSearch max is 20
        }
        
        try:
            response = await self.client.get(
                f"{self.BASE_URL}/search",
                headers=headers,
                params=params
            )
            response.raise_for_status()
            data = response.json()
            
            return self._parse_results(data)
            
        except httpx.HTTPError as e:
            print(f"Job search API error: {e}")
            return []

    def _build_search_query(
        self, 
        query: str, 
        location: Optional[str],
        job_type: Optional[str]
    ) -> str:
        """Build optimized search query."""
        parts = [query]
        
        if location:
            parts.append(location)
        
        if job_type:
            type_map = {
                "full-time": "full time",
                "internship": "internship",
                "contract": "contract",
                "part-time": "part time",
                "remote": "remote"
            }
            job_type_normalized = type_map.get(job_type.lower(), job_type)
            parts.append(job_type_normalized)
        
        return " ".join(parts) + " jobs"

    def _parse_results(self, data: Dict) -> List[JobCard]:
        """Parse JSearch API response into JobCard objects."""
        jobs = []
        
        # Handle JSearch response structure
        results = data.get("results", [])
        
        for item in results:
            try:
                job = JobCard(
                    job_id=self._generate_job_id(item),
                    title=item.get("title", "Unknown Position"),
                    company=item.get("company_name", item.get("publisher", ["Unknown"])[0] if item.get("publisher") else "Unknown"),
                    location=item.get("location", "Not specified"),
                    salary=self._extract_salary(item),
                    deadline=None,
                    description=self._clean_description(item.get("description", "")),
                    requirements=self._extract_requirements(item),
                    source="jsearch",
                    url=item.get("link"),
                    posted_date=item.get("posted_date", item.get("date_posted"))
                )
                jobs.append(job)
            except Exception as e:
                print(f"Error parsing job result: {e}")
                continue
        
        return jobs

    def _generate_job_id(self, item: Dict) -> str:
        """Generate consistent job ID from item data."""
        import hashlib
        identifier = f"{item.get('title', '')}{item.get('company_name', '')}{item.get('location', '')}"
        return hashlib.md5(identifier.encode()).hexdigest()[:12]

    def _extract_salary(self, item: Dict) -> Optional[str]:
        """Extract salary information from job item."""
        # JSearch may have salary in related_links or specific fields
        if "salary" in item:
            return item["salary"]
        
        related = item.get("related_onet_job_titles", [])
        if related and len(related) > 0:
            return None  # Salary not available in this format
        
        return None

    def _clean_description(self, description: str) -> str:
        """Clean and truncate job description."""
        # Remove HTML tags if any
        import re
        clean = re.sub(r'<[^>]+>', '', description)
        # Truncate to reasonable length
        if len(clean) > 1000:
            clean = clean[:1000] + "..."
        return clean.strip()

    def _extract_requirements(self, item: Dict) -> List[str]:
        """Extract requirements as a list from job item."""
        requirements = []
        
        # Check various fields for requirements
        snippet = item.get("snippet", item.get("description", ""))
        
        # Look for common requirement patterns
        patterns = [
            r'(\d+\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp))',
            r'(bachelor|master|phd|degree)',
            r'(python|java|javascript|sql|aws|react|node)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, snippet, re.IGNORECASE)
            requirements.extend([m.strip() for m in matches[:3]])
        
        return list(set(requirements))[:5]  # Dedupe and limit


# Singleton instance
job_search_service = JobSearchService()


# ============ Fit Score Algorithm ============

class FitScoreCalculator:
    """Calculate compatibility score between CV and job posting."""

    # Weights from PRD
    WEIGHTS = {
        "skills": 0.4,
        "experience": 0.25,
        "education": 0.15,
        "projects": 0.10,
        "keywords": 0.10,
    }

    def __init__(self):
        """Initialize the fit score calculator."""
        pass

    def calculate_fit_score(
        self,
        cv_skills: List[str],
        cv_experience_years: Optional[float],
        cv_education: List[Dict],
        cv_projects: List[Dict],
        job_requirements: List[str],
        job_title: str,
        job_description: str
    ) -> FitScoreResponse:
        """Calculate fit score between CV and job."""
        # Normalize inputs
        cv_skills_lower = [s.lower() for s in cv_skills]
        job_requirements_lower = [r.lower() for r in job_requirements]
        
        # Calculate component scores
        skill_score = self._calculate_skill_match(cv_skills_lower, job_requirements_lower, job_description)
        experience_score = self._calculate_experience_match(cv_experience_years, job_description)
        education_score = self._calculate_education_match(cv_education, job_description)
        project_score = self._calculate_project_relevance(cv_projects, job_title, job_description)
        keyword_score = self._calculate_keyword_similarity(cv_skills_lower, job_description, job_requirements_lower)
        
        # Apply weights
        final_score = (
            self.WEIGHTS["skills"] * skill_score +
            self.WEIGHTS["experience"] * experience_score +
            self.WEIGHTS["education"] * education_score +
            self.WEIGHTS["projects"] * project_score +
            self.WEIGHTS["keywords"] * keyword_score
        )
        
        # Calculate missing skills
        missing_skills = self._find_missing_skills(cv_skills_lower, job_requirements_lower, job_description)
        
        # Generate reasoning and actions
        match_reasoning = self._generate_reasoning(
            skill_score, experience_score, education_score, 
            project_score, keyword_score, missing_skills
        )
        
        recommended_actions = self._generate_actions(missing_skills, skill_score)
        
        return FitScoreResponse(
            job_id="",  # Will be set by caller
            fit_score=round(final_score * 100, 1),
            breakdown={
                "skill_match": round(skill_score * 100, 1),
                "experience_match": round(experience_score * 100, 1),
                "education_match": round(education_score * 100, 1),
                "project_relevance": round(project_score * 100, 1),
                "keyword_similarity": round(keyword_score * 100, 1),
            },
            match_reasoning=match_reasoning,
            missing_skills=missing_skills,
            recommended_actions=recommended_actions
        )

    def _calculate_skill_match(self, cv_skills: List[str], requirements: List[str], description: str) -> float:
        """Calculate skill match score (0-1)."""
        if not requirements:
            return 0.5  # Neutral if no specific requirements
        
        # Extract skills from description
        desc_skills = self._extract_skills_from_text(description)
        all_requirements = set(requirements + desc_skills)
        
        matches = sum(1 for req in all_requirements if any(req in skill for skill in cv_skills))
        return min(matches / max(len(all_requirements), 1), 1.0)

    def _calculate_experience_match(self, years: Optional[float], description: str) -> float:
        """Calculate experience match score (0-1)."""
        # Extract required years from description
        import re
        year_pattern = r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)'
        matches = re.findall(year_pattern, description, re.IGNORECASE)
        
        if not years:
            return 0.3  # No experience info
        
        if not matches:
            return 0.7  # No specific requirement, assume reasonable
        
        required_years = int(matches[0])
        if years >= required_years:
            return 1.0
        elif years >= required_years - 1:
            return 0.7
        elif years >= required_years - 2:
            return 0.4
        else:
            return 0.2

    def _calculate_education_match(self, education: List[Dict], description: str) -> float:
        """Calculate education match score (0-1)."""
        if not education:
            return 0.3  # No education info
        
        desc_upper = description.upper()
        education_keywords = {
            "bachelor": ["bachelor", "bsc", "b.s.", "b.a.", "b.eng", "undergraduate"],
            "master": ["master", "msc", "m.s.", "m.a.", "m.eng", "graduate"],
            "phd": ["phd", "ph.d", "doctorate", "phd"],
        }
        
        # Check what's required
        for level, keywords in education_keywords.items():
            if any(keyword.upper() in desc_upper for keyword in keywords):
                # Check if CV has it
                for edu in education:
                    edu_text = edu.get("raw", "").upper()
                    if any(keyword.upper() in edu_text for keyword in keywords):
                        return 1.0
                return 0.0  # Requirement not met
        
        return 0.7  # No specific education requirement

    def _calculate_project_relevance(self, projects: List[Dict], title: str, description: str) -> float:
        """Calculate project relevance score (0-1)."""
        if not projects:
            return 0.3
        
        # Extract keywords from job
        job_keywords = set(
            title.lower().split() + description.lower().split()
        )
        
        relevant_count = 0
        for project in projects:
            project_text = project.get("raw", project.get("name", "")).lower()
            if any(keyword in project_text for keyword in job_keywords):
                relevant_count += 1
        
        return min(relevant_count / max(len(projects), 1), 1.0)

    def _calculate_keyword_similarity(self, skills: List[str], description: str, requirements: List[str]) -> float:
        """Calculate keyword similarity score (0-1)."""
        desc_lower = description.lower()
        
        matching_keywords = sum(
            1 for skill in skills 
            if skill in desc_lower or any(skill in req for req in requirements)
        )
        
        return min(matching_keywords / max(len(skills), 1), 1.0)

    def _extract_skills_from_text(self, text: str) -> List[str]:
        """Extract skill keywords from job description."""
        common_skills = [
            "python", "java", "javascript", "typescript", "sql", "aws", "docker",
            "kubernetes", "react", "vue", "angular", "node", "django", "flask",
            "machine learning", "deep learning", "data science", "git", "linux",
            "pandas", "numpy", "tensorflow", "pytorch", "scikit-learn"
        ]
        
        text_lower = text.lower()
        found = [s for s in common_skills if s in text_lower]
        return found

    def _find_missing_skills(self, cv_skills: List[str], requirements: List[str], description: str) -> List[str]:
        """Find skills in job but not in CV."""
        desc_skills = set(self._extract_skills_from_text(description))
        all_required = set(requirements + list(desc_skills))
        
        missing = [
            skill for skill in all_required
            if not any(skill in cv_skill for cv_skill in cv_skills)
        ]
        
        return missing[:5]  # Return top 5 missing skills

    def _generate_reasoning(
        self,
        skill_score: float,
        experience_score: float,
        education_score: float,
        project_score: float,
        keyword_score: float,
        missing_skills: List[str]
    ) -> str:
        """Generate natural language reasoning for the fit score."""
        scores = [
            ("skill match", skill_score),
            ("experience level", experience_score),
            ("education background", education_score),
            ("project experience", project_score),
            ("keyword alignment", keyword_score),
        ]
        
        # Sort by score to identify strengths/weaknesses
        sorted_scores = sorted(scores, key=lambda x: x[1], reverse=True)
        
        reasoning_parts = []
        
        # Strengths (top 2)
        if sorted_scores[0][1] >= 0.7:
            reasoning_parts.append(f"Strong {sorted_scores[0][0]}")
        if sorted_scores[1][1] >= 0.7:
            reasoning_parts.append(f"good {sorted_scores[1][0]}")
        
        # Weaknesses (bottom 2)
        if sorted_scores[-1][1] < 0.5:
            reasoning_parts.append(f"weak {sorted_scores[-1][0]}")
        if sorted_scores[-2][1] < 0.5:
            reasoning_parts.append(f"limited {sorted_scores[-2][0]}")
        
        # Add missing skills mention
        if missing_skills:
            reasoning_parts.append(f"missing key skills: {', '.join(missing_skills[:2])}")
        
        return ". ".join(reasoning_parts).capitalize() + "."

    def _generate_actions(self, missing_skills: List[str], skill_score: float) -> List[str]:
        """Generate recommended actions."""
        actions = []
        
        if missing_skills:
            actions.append(f"Learn: {', '.join(missing_skills[:2])}")
        
        if skill_score < 0.5:
            actions.append("Tailor your CV to highlight relevant skills")
            actions.append("Consider gaining more experience in the domain")
        
        if skill_score >= 0.7:
            actions.append("Strong match - apply confidently")
        
        return actions


# Singleton instance
fit_score_calculator = FitScoreCalculator()
