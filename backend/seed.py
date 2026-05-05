"""Seed script to populate the database with sample data."""

import asyncio
import uuid
from datetime import date, datetime, timezone

from app.database import async_session, init_db
from app.models.profile import Profile
from app.models.experience import Experience
from app.models.project import Project
from app.models.blog import BlogPost
from app.models.skill import Skill
from app.models.testimonial import Testimonial
from app.models.site_settings import SiteSettings
from app.models.birthday import BirthdayEvent, MenuItem
from app.services.auth_service import create_admin_user
from app.config import settings


async def seed():
    """Seed the database with sample data."""
    await init_db()

    async with async_session() as db:
        # Admin user
        await create_admin_user(db, settings.ADMIN_EMAIL, settings.ADMIN_PASSWORD)
        print("✅ Admin user created")        # Profile
        profile = Profile(
            id=uuid.uuid4(),
            name="Milan Khanal",
            bio="Results-driven Software Engineer with strong experience in FinTech and InsurTech systems, specializing in backend-heavy, distributed, and transaction-critical platforms. Currently working at FoneInsure, contributing to large-scale insurance and corporate financial solutions, including Corporate eSewa. Experienced in building high-throughput Kafka-based systems, secure financial APIs, and policy-centric insurance platforms.",
            avatar_url="/uploads/portfolio/avatar.jpg",
            tagline="Software Engineer | FinTech & InsurTech Specialist",
            social_links={
                "github": "https://github.com/milankhanal29",
                "linkedin": "https://linkedin.com/in/milankhanal",
                "email": "milankhanal2057@gmail.com",
                "phone": "9868691479"
            },
            resume_url="/uploads/portfolio/resume.pdf",
            location="Kathmandu, Nepal 🇳🇵",
            email="milankhanal2057@gmail.com",
            dob=date(2000, 5, 11),
        )
        db.add(profile)

        # Experiences
        experiences = [
            Experience(
                id=uuid.uuid4(),
                company="FoneInsure (InsurTech)",
                role="Software Engineer",
                start_date=date(2025, 6, 15),
                description="Working on large-scale InsurTech platforms handling insurance policies, renewals, premium payments, policy loans, and loan repayment workflows. Implemented insurance loan adjustment calculations, renewal payment flows, and policy loan repayment logic.",
                tech_stack=["C#", ".NET Core", "ASP.NET Core", "MS SQL Server", "Kafka", "Hangfire"],
                is_current=True,
                order=1,
            ),
            Experience(
                id=uuid.uuid4(),
                company="Corporate eSewa (FinTech Project)",
                role="Backend / Distributed Systems Engineer",
                start_date=date(2024, 4, 1),
                end_date=date(2025, 6, 14),
                description="Contributed to Corporate eSewa, an enterprise fintech solution. Designed and implemented Kafka-based event-driven architecture with multiple producers and idempotent consumers. Implemented retry mechanisms, transaction validation, and distributed consistency patterns.",
                tech_stack=["Java", "Spring Boot", "Kafka", "PostgreSQL", "Microservices", "Docker"],
                is_current=False,
                order=2,
            ),
            Experience(
                id=uuid.uuid4(),
                company="eSewa",
                role="Java Intern",
                start_date=date(2023, 12, 24),
                end_date=date(2024, 3, 26),
                description="Developed applications using Spring Boot and Angular. Built RESTful APIs, controllers, and service layers. Gained hands-on experience with database design and unit testing.",
                tech_stack=["Java", "Spring Boot", "Angular", "PostgreSQL"],
                is_current=False,
                order=3,
            ),
        ]
        for exp in experiences:
            db.add(exp)

        # Projects
        projects = [
            Project(
                id=uuid.uuid4(),
                title="Code Change Presentation Generator",
                description="Spring Boot-based system that analyzes GitHub code changes using the Myers Diff Algorithm and automatically generates presentation slides per commit. Features a subscription-based architecture with automated email delivery.",
                tech_stack=["Java", "Spring Boot", "GitHub API", "Myers Diff", "PostgreSQL"],
                github_url="https://github.com/milankhanal29/code-change-generator",
                featured=True,
                order=1,
            ),
            Project(
                id=uuid.uuid4(),
                title="Multi-Blog Platform",
                description="Scalable multi-tenant blogging platform with a single Angular frontend and Spring Boot backend serving multiple domains. Features complex REST APIs and reusable components.",
                tech_stack=["Java", "Spring Boot", "Angular", "Multi-tenancy", "PostgreSQL"],
                github_url="https://github.com/milankhanal29/multi-blog",
                featured=True,
                order=2,
            ),
            Project(
                id=uuid.uuid4(),
                title="HealTogether",
                description="Mental health support platform featuring surveys, community interaction, and admin dashboards. Implemented clustering algorithms for personalized event recommendations.",
                tech_stack=["PHP", "Laravel", "Python", "Flask", "Machine Learning", "MySQL"],
                github_url="https://github.com/milankhanal29/healtogether",
                featured=True,
                order=3,
            ),
            Project(
                id=uuid.uuid4(),
                title="HRIS System",
                description="Self-initiated full Human Resource Information System including employee management, internal tools, and a multi-blog module. Built during a personal startup venture.",
                tech_stack=["Java", "Spring Boot", "Angular", "PostgreSQL", "Docker"],
                featured=False,
                order=4,
            ),
            Project(
                id=uuid.uuid4(),
                title="Insurance Chatbot (chat2qurry)",
                description="An intelligent chatbot designed for insurance queries and policy information retrieval.",
                tech_stack=["Python", "FastAPI", "NLP", "OpenAI"],
                featured=True,
                order=5,
            ),
        ]
        for proj in projects:
            db.add(proj)

        # Skills
        skills_data = [
            ("Java", "backend", 5), ("C#", "backend", 5), ("Python", "backend", 4),
            (".NET / ASP.NET Core", "backend", 5), ("Spring Boot", "backend", 5),
            ("Microservices", "backend", 5), ("Apache Kafka", "backend", 5),
            ("PostgreSQL", "backend", 5), ("MS SQL Server", "backend", 5),
            ("Elasticsearch", "backend", 4), ("PHP", "backend", 4),
            ("Angular", "frontend", 4), ("TypeScript", "frontend", 4),
            ("JavaScript", "frontend", 4), ("React", "frontend", 4),
            ("Tailwind CSS", "frontend", 5), ("Docker", "devops", 5),
            ("Kubernetes", "devops", 4), ("CI/CD", "devops", 4),
            ("Burp Suite", "security", 4), ("VAPT Testing", "security", 4),
        ]
        for i, (name, cat, prof) in enumerate(skills_data):
            db.add(Skill(id=uuid.uuid4(), name=name, category=cat, proficiency=prof, order=i))

        # Testimonials
        testimonials = [
            Testimonial(
                id=uuid.uuid4(),
                author_name="Rajesh Sharma",
                author_role="CTO",
                company="Tech Innovations",
                text="Milan is an exceptional developer who consistently delivers high-quality code. His expertise in Kafka and distributed systems was instrumental in our project's success.",
                is_featured=True,
                order=1,
            ),
        ]
        for t in testimonials:
            db.add(t)

        # Site Settings
        site_settings = SiteSettings(
            id=uuid.uuid4(),
            meta_title="Milan Khanal — Software Engineer",
            meta_description="Professional portfolio of Milan Khanal — FinTech & InsurTech specialist.",
            accent_color="#2563eb",
        )
        db.add(site_settings)

        # Birthday Event
        birthday_event = BirthdayEvent(
            id=uuid.uuid4(),
            year=2025,
            birthday_date=date(2025, 5, 11),
            title="Milan's Birthday Celebration 🎉",
            message_from_milan="Celebrating another year of life and code! Join me for a fun evening.",
            restaurant_info="Kathmandu, Nepal",
            is_active=True,
        )
        db.add(birthday_event)

        # Menu Items
        menu_items = [
            MenuItem(id=uuid.uuid4(), name="Nepali Khaja Set", category="food", description="Traditional Nepali snack platter", is_veg=False, order=1),
        ]
        for item in menu_items:
            db.add(item)

        await db.commit()
        print("✅ All seed data inserted successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
