"""AI Chat service using Gemini and LangChain with RAG."""
import json
from typing import List, Dict, Optional, Any
from datetime import datetime
import uuid

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.documents import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from app.core.config import settings
from app.services.embedding_service import embedding_service
from app.services.job_service import job_search_service, fit_score_calculator


class ChatService:
    """Service for AI-powered conversational responses with RAG."""

    def __init__(self):
        """Initialize the chat service."""
        self._llm = None

    @property
    def llm(self) -> ChatGoogleGenerativeAI:
        """Get or create Gemini LLM."""
        if self._llm is None:
            self._llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                google_api_key=settings.gemini_api_key,
                temperature=0.7,
                convert_system_message_to_human=True,
            )
        return self._llm

    async def generate_response(
        self,
        message: str,
        session_history: List[Dict],
        user_cv_data: Optional[Dict],
        collection_id: Optional[str],
        context_job_id: Optional[str] = None,
        context_job_data: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """Generate AI response with RAG context."""
        
        # Build context from CV and retrieved chunks
        context_parts = []
        sources = []
        
        if collection_id and user_cv_data:
            # Retrieve relevant CV chunks
            retrieved = await embedding_service.similarity_search(
                collection_id=collection_id,
                query=message,
                k=3
            )
            
            for chunk in retrieved:
                context_parts.append(chunk["content"])
                sources.append(chunk["content"][:100])
        
        # Add job context if available
        if context_job_data:
            job_context = f"""
Current Job Context:
- Position: {context_job_data.get('title', 'N/A')}
- Company: {context_job_data.get('company', 'N/A')}
- Requirements: {', '.join(context_job_data.get('requirements', []))}
"""
            context_parts.append(job_context)
        
        # Build prompt with context
        system_prompt = self._build_system_prompt(context_parts, user_cv_data)
        
        # Build messages with history
        messages = self._build_messages(system_prompt, session_history, message)
        
        # Generate response
        try:
            response = await self.llm.ainvoke(messages)
            response_text = response.content if hasattr(response, 'content') else str(response)
        except Exception as e:
            response_text = f"I apologize, but I encountered an issue processing your request. Please try again. Error: {str(e)}"
        
        return {
            "response": response_text,
            "session_id": str(uuid.uuid4()),
            "sources": sources,
            "suggested_actions": self._generate_suggested_actions(message, response_text)
        }

    def _build_system_prompt(self, context_parts: List[str], cv_data: Optional[Dict]) -> str:
        """Build system prompt with CV context and RAG data."""
        prompt_parts = [
            "You are CareerPilot, an AI-powered career assistant.",
            "Your goal is to help users with their job search, career development, and professional growth.",
            "",
        ]
        
        # Add CV context
        if cv_data:
            prompt_parts.append("User's CV Profile:")
            if cv_data.get("skills"):
                prompt_parts.append(f"- Skills: {', '.join(cv_data['skills'][:15])}")
            if cv_data.get("experience_years"):
                prompt_parts.append(f"- Experience: {cv_data['experience_years']} years")
            if cv_data.get("education"):
                education = cv_data["education"]
                if education and len(education) > 0:
                    prompt_parts.append(f"- Education: {education[0].get('raw', 'Not specified')}")
            if cv_data.get("summary"):
                prompt_parts.append(f"- Summary: {cv_data['summary'][:200]}")
            prompt_parts.append("")
        
        # Add RAG context
        if context_parts:
            prompt_parts.append("Relevant Information from User's CV:")
            for i, context in enumerate(context_parts[:3], 1):
                prompt_parts.append(f"[{i}] {context[:300]}...")
            prompt_parts.append("")
        
        # Add behavior guidelines
        prompt_parts.extend([
            "Guidelines:",
            "- Be supportive, professional, and actionable in your responses",
            "- Provide specific, concrete advice when possible",
            "- If you're unsure, say so honestly",
            "- Always try to ground recommendations in the user's actual CV",
            "- Suggest relevant actions or next steps when appropriate",
            "",
            "Capabilities you can help with:",
            "- Skill gap analysis and learning recommendations",
            "- Cover letter and application drafting assistance",
            "- Interview preparation tips",
            "- Career roadmap planning",
            "- Job search strategy",
            "- CV/resume improvement suggestions",
        ])
        
        return "\n".join(prompt_parts)

    def _build_messages(
        self,
        system_prompt: str,
        session_history: List[Dict],
        current_message: str
    ) -> List:
        """Build message list with history."""
        messages = [SystemMessage(content=system_prompt)]
        
        # Add session history
        for msg in session_history[-10:]:  # Keep last 10 messages
            if msg.get("role") == "user":
                messages.append(HumanMessage(content=msg.get("content", "message")))
            elif msg.get("role") == "assistant":
                messages.append(AIMessage(content=msg.get("content", "")))
        
        # Add current message
        messages.append(HumanMessage(content=current_message))
        
        return messages

    def _generate_suggested_actions(self, message: str, response: str) -> List[str]:
        """Generate suggested follow-up actions based on context."""
        message_lower = message.lower()
        actions = []
        
        if any(word in message_lower for word in ["cover letter", "cover", "letter"]):
            actions.append("Generate cover letter for this job")
            actions.append("Review cover letter tips")
        elif any(word in message_lower for word in ["skill", "gap", "missing"]):
            actions.append("Create learning roadmap")
            actions.append("Find courses for missing skills")
        elif any(word in message_lower for word in ["interview", "prepare"]):
            actions.append("Generate interview questions")
            actions.append("Schedule practice session")
        elif any(word in message_lower for word in ["roadmap", "plan", "learning"]):
            actions.append("Create 3-month roadmap")
            actions.append("Find learning resources")
        elif any(word in message_lower for word in ["ready", "qualify", "fit"]):
            actions.append("View detailed fit score")
            actions.append("Apply for this job")
        
        if not actions:
            actions = [
                "Search for matching jobs",
                "Upload or update CV",
                "View application tracker"
            ]
        
        return actions[:3]

    async def generate_cover_letter(
        self,
        user_cv_data: Dict,
        job_data: Dict,
        tone: str = "professional"
    ) -> str:
        """Generate a personalized cover letter."""
        # Build prompt for cover letter generation
        prompt = f"""
Generate a professional cover letter for the following job application:

JOB DETAILS:
- Position: {job_data.get('title', 'N/A')}
- Company: {job_data.get('company', 'N/A')}
- Requirements: {', '.join(job_data.get('requirements', []))}
- Description: {job_data.get('description', 'N/A')[:500]}

CANDIDATE PROFILE:
- Skills: {', '.join(user_cv_data.get('skills', [])[:10])}
- Experience: {user_cv_data.get('experience_years', 'Not specified')} years
- Education: {user_cv_data.get('education', [{}])[0].get('raw', 'Not specified') if user_cv_data.get('education') else 'Not specified'}
- Projects: {', '.join([p.get('name', p.get('raw', '')) for p in user_cv_data.get('projects', [])[:3]])}

REQUIREMENTS:
- Tone: {tone}
- Length: 300-400 words
- Structure: Introduction, Body (qualifications), Conclusion
- Customized to the specific job requirements
- Highlight relevant skills and experiences
- End with a call to action

Please generate the complete cover letter:
"""
        
        try:
            response = await self.llm.ainvoke([
                SystemMessage(content="You are a professional career coach helping craft compelling cover letters."),
                HumanMessage(content=prompt)
            ])
            return response.content if hasattr(response, 'content') else str(response)
        except Exception as e:
            return f"Error generating cover letter: {str(e)}"

    async def analyze_skill_gap(
        self,
        user_skills: List[str],
        target_role: str,
        job_requirements: List[str]
    ) -> Dict[str, Any]:
        """Analyze skill gap between user and target role."""
        user_skills_lower = [s.lower() for s in user_skills]
        requirements_lower = [r.lower() for r in job_requirements]
        
        # Find matching and missing skills
        matching = []
        missing = []
        
        for req in requirements_lower:
req in skill
                for skill in user_skills_lower
                if any(req in skill for skill in user_skills_lower)
            ]
            
            if matches:
                matching.append({"requirement": req, "matched_skills": matches})
            else:
                missing.append(req)
        
        # Generate recommendations
        prompt = f"""
Analyze the skill gap and provide learning recommendations:

Current Skills: {', '.join(user_skills)}
Target Role: {target_role}
Required Skills: {', '.join(requirements_lower)}
Missing Skills: {', '.join(missing)}

Provide:
1. Priority ranking of skills to learn first
2. Suggested learning resources for each skill
3. Estimated time to learn each skill
4. Suggested projects to build experience

Be specific and actionable.
"""
        
        try:
            response = await self.llm.ainvoke([
                SystemMessage(content="You are an expert career advisor providing actionable skill development plans."),
                HumanMessage(content=prompt)
            ])
            
            return {
                "matching_skills": matching,
                "missing_skills": missing,
                "analysis": response.content if hasattr(response, 'content') else str(response)
            }
        except Exception as e:
            return {
                "matching_skills": matching,
                "missing_skills": missing,
                "analysis": f"Error generating analysis: {str(e)}"
            }

    async def create_learning_roadmap(
        self,
        user_skills: List[str],
        target_skills: List[str],
        timeline_months: int = 3
    ) -> str:
        """Create a personalized learning roadmap."""
        prompt = f"""
Create a {timeline_months}-month learning roadmap for transitioning to a new role:

Current Skills: {', '.join(user_skills)}
Skills to Learn: {', '.join(target_skills)}
Timeline: {timeline_months} months

Structure your response as:
1. Weekly breakdown of topics to learn
2. Recommended resources (courses, books, tutorials)
3. Practice projects for each skill
4. Milestones to track progress

Make it realistic and achievable for someone working part-time.
"""
        
        try:
            response = await self.llm.ainvoke([
                SystemMessage(content="You are an expert learning coach creating personalized educational roadmaps."),
                HumanMessage(content=prompt)
            ])
            return response.content if hasattr(response, 'content') else str(response)
        except Exception as e:
            return f"Error generating roadmap: {str(e)}"


# Singleton instance
chat_service = ChatService()
