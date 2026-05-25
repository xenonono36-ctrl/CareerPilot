"""CV parsing service - extracts text and sections from PDF/DOCX."""
import re
from typing import Dict, List, Optional
from pathlib import Path

import fitz  # PyMuPDF
from docx import Document


class CVParser:
    """Parser for extracting content from CV/Resume files."""

    def __init__(self):
        """Initialize the CV parser."""
        self.skills_keywords = [
            # Programming languages
            "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "go", "rust",
            "php", "swift", "kotlin", "scala", "r", "matlab",
            # Web
            "html", "css", "react", "angular", "vue", "node.js", "express", "django", "flask",
            "spring", "next.js", "nuxt", "svelte",
            # Data/ML
            "sql", "mongodb", "postgresql", "mysql", "redis", "elasticsearch",
            "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "keras",
            "jupyter", "tableau", "power bi", "spark", "hadoop", "kafka",
            # Cloud/DevOps
            "aws", "azure", "gcp", "docker", "kubernetes", "terraform",
            "jenkins", "github actions", "gitlab ci", "ansible",
            # Tools
            "git", "jira", "confluence", "figma", "sketch",
            # Soft skills
            "leadership", "communication", "teamwork", "problem-solving",
        ]

    async def parse_file(self, file_path: str, file_type: str) -> Dict:
        """Parse a CV file and extract structured content."""
        if file_type == "pdf":
            return await self._parse_pdf(file_path)
        elif file_type == "docx":
            return await self._parse_docx(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")

    async def _parse_pdf(self, file_path: str) -> Dict:
        """Extract text from PDF file."""
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return self._extract_sections(text)

    async def _parse_docx(self, file_path: str) -> Dict:
        """Extract text from DOCX file."""
        doc = Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs])
        return self._extract_sections(text)

    def _extract_sections(self, text: str) -> Dict:
        """Extract structured sections from CV text."""
        # Normalize text
        text = self._normalize_text(text)
        
        # Extract sections
        sections = {
            "raw_text": text,
            "skills": self._extract_skills(text),
            "education": self._extract_education(text),
            "experience": self._extract_experience(text),
            "projects": self._extract_projects(text),
            "summary": self._extract_summary(text),
        }
        
        # Calculate experience years
        sections["experience_years"] = self._calculate_experience_years(
            sections.get("experience", [])
        )
        
        return sections

    def _normalize_text(self, text: str) -> str:
        """Normalize text for processing."""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep essential punctuation
        text = re.sub(r'[^\w\s.,;:\-\(\)\/]', '', text)
        return text.strip()

    def _extract_skills(self, text: str) -> List[str]:
        """Extract technical skills from text."""
        text_lower = text.lower()
        found_skills = []
        
        for skill in self.skills_keywords:
            # Match whole words only
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                # Normalize skill name
                skill_name = skill.replace("-", " ").title()
                if skill_name not in found_skills:
                    found_skills.append(skill_name)
        
        return found_skills

    def _extract_education(self, text: str) -> List[Dict]:
        """Extract education entries."""
        education = []
        
        # Common education patterns
        patterns = [
            r'(?i)(bachelor|bsc|b\.s\.|b\.a\.|b\.eng)\s*(?:of|in)?\s*([^\n,]+)',
            r'(?i)(master|msc|m\.s\.|m\.a\.|m\.eng)\s*(?:of|in)?\s*([^\n,]+)',
            r'(?i)(phd|ph\.d|doctorate)\s*(?:of|in)?\s*([^\n,]+)',
            r'(?i)(diploma)\s*(?:in)?\s*([^\n,]+)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                if isinstance(match, tuple):
                    degree_type = match[0].strip()
                    field = match[1].strip() if len(match) > 1 else ""
                    if field and not any(e.get("degree") == degree_type for e in education):
                        education.append({
                            "degree": degree_type,
                            "field": field,
                            "raw": f"{degree_type} in {field}" if field else degree_type
                        })
        
        return education

    def _extract_experience(self, text: str) -> List[Dict]:
        """Extract work experience entries."""
        experience = []
        
        # Pattern for job entries with dates
        pattern = r'(?i)((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*[\d\-]+\s*[-–]\s*(?:'
        pattern += r'(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|present|current))\s*[\d\-]*'
        pattern += r'|[\d\-]+\s*[-–]\s*(?:[\d\-]+|present|current))\s*[-–\n]\s*([^\n]+)'
        
        matches = re.findall(pattern, text)
        for match in matches:
            if isinstance(match, tuple) and len(match) >= 1:
                role = match[-1].strip() if match[-1] else ""
                if role and len(role) > 3:
                    experience.append({
                        "role": role,
                        "raw": match[0] if len(match) > 0 else ""
                    })
        
        return experience

    def _extract_projects(self, text: str) -> List[Dict]:
        """Extract project entries."""
        projects = []
        
        # Pattern for projects section
        section_pattern = r'(?i)projects?[:\s]*\n([\s\S]*?)(?=\n(?:education|experience|skills|\Z))'
        match = re.search(section_pattern, text)
        
        if match:
            project_text = match.group(1)
            # Extract individual projects (bullet points or numbered)
            bullet_pattern = r'[•\-\*]\s*([^\n]+)'
            project_matches = re.findall(bullet_pattern, project_text)
            for pm in project_matches:
                if len(pm) > 10:  # Filter short entries
                    projects.append({
                        "name": pm[:100],  # First 100 chars as name
                        "raw": pm
                    })
        
        return projects

    def _extract_summary(self, text: str) -> str:
        """Extract professional summary."""
        patterns = [
            r'(?i)summary[:\s]*\n([\s\S]{100,500}?)(?=\n(?:education|experience|skills|\Z))',
            r'(?i)profile[:\s]*\n([\s\S]{100,500}?)(?=\n(?:education|experience|skills|\Z))',
            r'(?i)about[:\s]*\n([\s\S]{100,500}?)(?=\n(?:education|experience|skills|\Z))',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1).strip()
        
        return ""

    def _calculate_experience_years(self, experience: List[Dict]) -> Optional[float]:
        """Calculate total years of experience."""
        if not experience:
            return None
        
        # Simple heuristic: count entries * 1.5 years avg
        return min(len(experience) * 1.5, 10.0)  # Cap at 10 years


# Singleton instance
cv_parser = CVParser()
